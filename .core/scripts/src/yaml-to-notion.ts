import { Client } from '@notionhq/client';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import { NotionConfig, SessionIndex } from './types';

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Process rich text formatting (bold/italic) in content
function processRichText(content: string): any[] {
  const richTextArray: any[] = [];
  let currentIndex = 0;
  
  // Simple regex approach for **bold** and *italic*
  const boldItalicRegex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)/g;
  let match;
  
  while ((match = boldItalicRegex.exec(content)) !== null) {
    // Add text before the match as plain text
    if (match.index > currentIndex) {
      const plainText = content.substring(currentIndex, match.index);
      if (plainText) {
        richTextArray.push({
          type: 'text',
          text: { content: plainText }
        });
      }
    }
    
    // Add formatted text
    if (match[1]) {
      // **bold** pattern
      richTextArray.push({
        type: 'text',
        text: { content: match[2] },
        annotations: { bold: true }
      });
    } else if (match[3]) {
      // *italic* pattern  
      richTextArray.push({
        type: 'text',
        text: { content: match[4] },
        annotations: { italic: true }
      });
    }
    
    currentIndex = match.index + match[0].length;
  }
  
  // Add remaining text as plain text
  if (currentIndex < content.length) {
    const remainingText = content.substring(currentIndex);
    if (remainingText) {
      richTextArray.push({
        type: 'text',
        text: { content: remainingText }
      });
    }
  }
  
  // If no formatting found, return simple text block
  if (richTextArray.length === 0) {
    return [{ type: 'text', text: { content: content } }];
  }
  
  return richTextArray;
}

// Map language identifiers to Notion supported languages
function mapToNotionLanguage(language: string): string {
  const languageMap: { [key: string]: string } = {
    'env': 'bash',
    'sh': 'shell', 
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'yml': 'yaml',
    'json5': 'json',
    'dockerfile': 'docker',
    'makefile': 'makefile',
    'md': 'markdown',
    'txt': 'plain text',
    '': 'plain text'
  };
  
  const lowerLanguage = language.toLowerCase();
  return languageMap[lowerLanguage] || lowerLanguage;
}

// Parse markdown content to Notion blocks
function parseMarkdownToBlocks(markdown: string): any[] {
  const lines = markdown.split('\n');
  const blocks: any[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Handle code blocks
    if (line.startsWith('```')) {
      const rawLanguage = line.substring(3).trim() || 'plain text';
      const language = mapToNotionLanguage(rawLanguage);
      const codeLines: string[] = [];
      i++; // Move past opening ```
      
      // Collect code block content
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      
      // Create code block
      blocks.push({
        type: 'code',
        code: {
          caption: [],
          rich_text: [{
            type: 'text',
            text: { content: codeLines.join('\n') }
          }],
          language: language
        }
      });
      
      i++; // Move past closing ```
      continue;
    }
    
    // Handle headings
    if (line.startsWith('# ')) {
      blocks.push({
        type: 'heading_1',
        heading_1: {
          rich_text: processRichText(line.substring(2))
        }
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        type: 'heading_2', 
        heading_2: {
          rich_text: processRichText(line.substring(3))
        }
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        type: 'heading_3',
        heading_3: {
          rich_text: processRichText(line.substring(4))
        }
      });
    } else if (line.startsWith('#### ') || line.startsWith('##### ') || line.startsWith('###### ')) {
      // H4+ converted to bold paragraphs (Notion only supports H1-H3)
      const level = line.match(/^#+/)?.[0].length || 4;
      const content = line.substring(level + 1);
      blocks.push({
        type: 'paragraph',
        paragraph: {
          rich_text: [{ 
            type: 'text', 
            text: { content: content },
            annotations: { bold: true }
          }]
        }
      });
    } else if (line.trim() && !line.startsWith('---') && line.trim() !== '') {
      blocks.push({
        type: 'paragraph',
        paragraph: {
          rich_text: processRichText(line)
        }
      });
    }
    
    i++;
  }
  
  return blocks;
}

// Create Notion page with chunked blocks to handle API limit
async function createNotionPage(config: NotionConfig, blocks: any[]) {
  try {
    const response = await notion.pages.create({
      parent: {
        type: 'page_id',
        page_id: config.rootPageId
      },
      properties: {
        title: {
          title: [{ type: 'text', text: { content: config.pageTitle } }]
        }
      }
    });

    if (blocks.length > 0) {
      // Chunk blocks to respect 100-block limit per API call
      const CHUNK_SIZE = 100;
      for (let i = 0; i < blocks.length; i += CHUNK_SIZE) {
        const chunk = blocks.slice(i, i + CHUNK_SIZE);
        await notion.blocks.children.append({
          block_id: response.id,
          children: chunk
        });
        console.log(`📝 Added chunk ${Math.floor(i/CHUNK_SIZE) + 1}/${Math.ceil(blocks.length/CHUNK_SIZE)} (${chunk.length} blocks)`);
      }
    }

    return response.id;
  } catch (error) {
    console.error('Failed to create Notion page:', error);
    throw error;
  }
}

// Update session index
function updateSessionIndex(sessionEntry: any) {
  try {
    const indexPath = '../data/session-index.json';
    
    let sessionIndex: SessionIndex;
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      sessionIndex = JSON.parse(indexContent);
    } else {
      sessionIndex = { sessions: [] };
    }
    
    sessionIndex.sessions.push(sessionEntry);
    
    if (!sessionIndex.metadata) {
      sessionIndex.metadata = { created: '', lastUpdated: '', version: '1.0.0' };
    }
    sessionIndex.metadata.lastUpdated = new Date().toISOString().split('T')[0];
    
    fs.writeFileSync(indexPath, JSON.stringify(sessionIndex, null, 2));
    console.log(`📝 Updated session index: ${sessionEntry.id}`);
  } catch (error) {
    console.error('Failed to update session index:', error);
    throw error;
  }
}

// Main export function
async function exportMarkdownToNotion(markdownPath: string, config: NotionConfig) {
  try {
    const markdownContent = fs.readFileSync(markdownPath, 'utf8');
    const blocks = parseMarkdownToBlocks(markdownContent);
    const pageId = await createNotionPage(config, blocks);
    
    updateSessionIndex({
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      type: 'markdown-export',
      topic: config.pageTitle,
      notionPageId: pageId
    });

    console.log(`✅ Exported to Notion: ${pageId}`);
    return pageId;
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  let markdownPath = '';
  let pageTitle = 'Agent Session';
  let classificationPath = '';
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--markdown' && args[i + 1]) {
      markdownPath = args[i + 1];
      i++;
    } else if (args[i] === '--title' && args[i + 1]) {
      pageTitle = args[i + 1];
      i++;
    } else if (args[i] === '--path' && args[i + 1]) {
      classificationPath = args[i + 1];
      i++;
    }
  }
  
  if (!markdownPath) {
    console.error('Usage: node yaml-to-notion.js --markdown <markdown-file-path> [--title <page-title>]');
    process.exit(1);
  }
  
  if (!process.env.NOTION_ROOT_PAGE_ID) {
    console.error('❌ NOTION_ROOT_PAGE_ID not found in environment');
    process.exit(1);
  }
  
  try {
    const config: NotionConfig = {
      rootPageId: process.env.NOTION_ROOT_PAGE_ID,
      pageTitle: pageTitle,
      sessionType: 'markdown-export',
      classificationPath: classificationPath
    };
    
    const pageId = await exportMarkdownToNotion(markdownPath, config);
    console.log(`🎉 Successfully exported to Notion: https://notion.so/${pageId.replace(/-/g, '')}`);
    
    try {
      fs.unlinkSync(markdownPath);
      console.log(`🗑️  Cleaned up temporary file: ${markdownPath}`);
    } catch (cleanupError) {
      console.warn(`⚠️  Could not clean up file ${markdownPath}:`, cleanupError);
    }
    
  } catch (error) {
    console.error('❌ CLI execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}