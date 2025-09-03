import { Client } from '@notionhq/client';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import { NotionConfig, SessionIndex } from './types';

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Parse markdown content to Notion blocks
function parseMarkdownToBlocks(markdown: string): any[] {
  const lines = markdown.split('\n');
  const blocks: any[] = [];
  
  for (const line of lines) {
    if (line.startsWith('# ')) {
      blocks.push({
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: line.substring(2) } }]
        }
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        type: 'heading_2', 
        heading_2: {
          rich_text: [{ type: 'text', text: { content: line.substring(3) } }]
        }
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: line.substring(4) } }]
        }
      });
    } else if (line.trim() && !line.startsWith('---') && line.trim() !== '') {
      blocks.push({
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: line } }]
        }
      });
    }
  }
  
  return blocks;
}

// Create Notion page
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
      await notion.blocks.children.append({
        block_id: response.id,
        children: blocks
      });
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
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--markdown' && args[i + 1]) {
      markdownPath = args[i + 1];
      i++;
    } else if (args[i] === '--title' && args[i + 1]) {
      pageTitle = args[i + 1];
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
      sessionType: 'markdown-export'
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