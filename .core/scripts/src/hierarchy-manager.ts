import { Client } from '@notionhq/client';
import * as fs from 'fs';
import * as yaml from 'yaml';
import 'dotenv/config';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

interface HierarchyConfig {
  version: string;
  last_updated: string;
  updated_by: string;
  projects: { [key: string]: ProjectStructure };
  cross_references: { [key: string]: CrossRefStructure };
  meta: { [key: string]: MetaStructure };
  thresholds: ThresholdConfig;
  tagging_rules: { [key: string]: TaggingRule };
  path_templates: PathTemplates;
}

interface ProjectStructure {
  domains: { [key: string]: DomainInfo };
  total_pages: number;
  status: string;
}

interface DomainInfo {
  subdomains: string[];
  page_count: number;
  owner_agent: string;
}

interface CrossRefStructure {
  subdomains: string[];
  page_count: number;
  owner_agent: string;
}

interface MetaStructure {
  page_count: number;
  owner_agent: string;
}

interface ThresholdConfig {
  expand_project_domains: number;
  expand_domain_subdomains: number;
  create_cross_references: number;
  reorganize_workspace: number;
  consolidate_similar: number;
}

interface TaggingRule {
  primary_tags: string[];
  project_indicators: string[];
}

interface PathTemplates {
  project_specific: string;
  cross_reference: string;
  meta_content: string;
}

class HierarchyManager {
  private config!: HierarchyConfig;
  private configPath: string = '../data/hierarchy-config.yaml';

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const yamlContent = fs.readFileSync(this.configPath, 'utf8');
      this.config = yaml.parse(yamlContent);
      console.log(`📋 Loaded hierarchy config v${this.config.version}`);
    } catch (error) {
      console.error('❌ Failed to load hierarchy config:', error);
      throw error;
    }
  }

  private saveConfig(): void {
    try {
      const yamlContent = yaml.stringify(this.config, { indent: 2 });
      fs.writeFileSync(this.configPath, yamlContent);
      console.log('💾 Updated hierarchy config');
    } catch (error) {
      console.error('❌ Failed to save hierarchy config:', error);
      throw error;
    }
  }

  async updatePageCounts(): Promise<void> {
    console.log('🔢 Updating page counts from Notion...');
    
    try {
      const pages = await this.scanProjectPages();
      
      // Reset all counts
      this.resetPageCounts();
      
      // Count pages by classification
      for (const page of pages) {
        const classification = this.classifyPage(page);
        this.incrementPageCount(classification);
      }
      
      // Update config timestamp
      this.config.last_updated = new Date().toISOString().split('T')[0];
      this.saveConfig();
      
      console.log('✅ Page counts updated');
      
    } catch (error) {
      console.error('❌ Failed to update page counts:', error);
      throw error;
    }
  }

  private async scanProjectPages(): Promise<any[]> {
    const rootPageId = process.env.NOTION_ROOT_PAGE_ID;
    if (!rootPageId) throw new Error('NOTION_ROOT_PAGE_ID not found');

    try {
      const response = await notion.blocks.children.list({
        block_id: rootPageId,
        page_size: 100
      });

      return response.results.filter(block => 'type' in block && block.type === 'child_page');
    } catch (error) {
      console.error('❌ Failed to scan pages:', error);
      throw error;
    }
  }

  private classifyPage(page: any): { project?: string; domain?: string; type: 'project' | 'cross_ref' | 'meta' } {
    // This would analyze page title/content to determine classification
    // For now, simplified classification based on title
    const title = page.child_page?.title || 'Unknown';
    
    if (title.toLowerCase().includes('agent') && title.toLowerCase().includes('architecture')) {
      return { type: 'cross_ref' };
    }
    
    if (title.toLowerCase().includes('aimi')) {
      return { project: 'AIMI', domain: 'Business', type: 'project' };
    }
    
    if (title.toLowerCase().includes('watch')) {
      return { project: 'My-Watch-Club', domain: 'Business', type: 'project' };
    }
    
    return { type: 'meta' };
  }

  private resetPageCounts(): void {
    // Reset project page counts
    Object.keys(this.config.projects).forEach(project => {
      this.config.projects[project].total_pages = 0;
      Object.keys(this.config.projects[project].domains).forEach(domain => {
        this.config.projects[project].domains[domain].page_count = 0;
      });
    });

    // Reset cross-reference counts
    Object.keys(this.config.cross_references).forEach(ref => {
      this.config.cross_references[ref].page_count = 0;
    });

    // Reset meta counts
    Object.keys(this.config.meta).forEach(meta => {
      this.config.meta[meta].page_count = 0;
    });
  }

  private incrementPageCount(classification: { project?: string; domain?: string; type: 'project' | 'cross_ref' | 'meta' }): void {
    switch (classification.type) {
      case 'project':
        if (classification.project && classification.domain) {
          this.config.projects[classification.project].total_pages++;
          this.config.projects[classification.project].domains[classification.domain].page_count++;
        }
        break;
      case 'cross_ref':
        this.config.cross_references['Agent-Architecture'].page_count++;
        break;
      case 'meta':
        this.config.meta['Agent-Guidelines'].page_count++;
        break;
    }
  }

  checkThresholds(): { triggered: boolean; recommendations: string[] } {
    const recommendations: string[] = [];
    let triggered = false;

    // Check project expansion thresholds
    Object.entries(this.config.projects).forEach(([project, structure]) => {
      if (structure.total_pages >= this.config.thresholds.expand_project_domains) {
        recommendations.push(`📁 ${project} has ${structure.total_pages} pages - suggest domain organization`);
        triggered = true;
      }
      
      Object.entries(structure.domains).forEach(([domain, info]) => {
        if (info.page_count >= this.config.thresholds.expand_domain_subdomains) {
          recommendations.push(`📂 ${project}/${domain} has ${info.page_count} pages - suggest subdomain creation`);
          triggered = true;
        }
      });
    });

    // Check workspace-wide threshold
    const totalPages = this.getTotalPageCount();
    if (totalPages >= this.config.thresholds.reorganize_workspace) {
      recommendations.push(`🏗️ Workspace has ${totalPages} total pages - suggest major reorganization`);
      triggered = true;
    }

    return { triggered, recommendations };
  }

  private getTotalPageCount(): number {
    let total = 0;
    
    Object.values(this.config.projects).forEach(project => {
      total += project.total_pages;
    });
    
    Object.values(this.config.cross_references).forEach(ref => {
      total += ref.page_count;
    });
    
    Object.values(this.config.meta).forEach(meta => {
      total += meta.page_count;
    });
    
    return total;
  }

  generateClassificationPath(agentRole: string, sessionTitle: string, sessionContent: string): {
    path: string;
    tags: string[];
    reasoning: string;
  } {
    // Detect project context
    const project = this.detectProject(sessionContent);
    const contentType = this.detectContentType(sessionContent);
    const isCrossAgent = this.detectCrossAgent(sessionContent);
    
    // Get agent tagging rules
    const agentRules = this.config.tagging_rules[agentRole] || { primary_tags: [], project_indicators: [] };
    
    // Generate tags
    const tags = [
      agentRole,
      ...agentRules.primary_tags.filter(tag => sessionContent.toLowerCase().includes(tag)),
      ...(project !== 'General' ? [project.toLowerCase()] : []),
      contentType.toLowerCase()
    ];
    
    // Generate path
    let path: string;
    let reasoning: string;
    
    if (isCrossAgent) {
      path = `/Cross-References/Agent-Architecture/${contentType}/${this.slugify(sessionTitle)}`;
      reasoning = "Multi-agent content detected → Cross-References";
    } else if (project !== 'General') {
      const domain = this.getAgentDomain(agentRole);
      path = `/${project}/${domain}/${contentType}/${this.slugify(sessionTitle)}`;
      reasoning = `Project-specific content → ${project}/${domain}`;
    } else {
      const domain = this.getAgentDomain(agentRole);
      path = `/Meta/${domain}/${contentType}/${this.slugify(sessionTitle)}`;
      reasoning = `General content → Meta/${domain}`;
    }
    
    return { path, tags, reasoning };
  }

  private detectProject(content: string): string {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('aimi')) return 'AIMI';
    if (lowerContent.includes('watch') && lowerContent.includes('club')) return 'My-Watch-Club';
    return 'General';
  }

  private detectContentType(content: string): string {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('brainstorm') || lowerContent.includes('ideation')) return 'Brainstorming';
    if (lowerContent.includes('architecture') || lowerContent.includes('system')) return 'Architecture';
    if (lowerContent.includes('analysis') || lowerContent.includes('research')) return 'Analysis';
    if (lowerContent.includes('implementation') || lowerContent.includes('code')) return 'Implementation';
    return 'Documentation';
  }

  private detectCrossAgent(content: string): boolean {
    const agentMentions = ['ll-ba', 'll-cto', 'll-pm', 'll-po'].filter(agent => 
      content.toLowerCase().includes(agent)
    ).length;
    
    return agentMentions > 1 || content.toLowerCase().includes('cross-reference');
  }

  private getAgentDomain(agent: string): string {
    switch (agent) {
      case 'll-ba': return 'Business';
      case 'll-cto': return 'Technical';
      case 'll-pm':
      case 'll-po': return 'Product';
      default: return 'General';
    }
  }

  private slugify(text: string): string {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
      .trim();
  }
}

// CLI interface for testing
async function main() {
  try {
    const manager = new HierarchyManager();
    await manager.updatePageCounts();
    
    const thresholdCheck = manager.checkThresholds();
    if (thresholdCheck.triggered) {
      console.log('\n⚠️ THRESHOLDS TRIGGERED:');
      thresholdCheck.recommendations.forEach(rec => console.log(`  ${rec}`));
    } else {
      console.log('\n✅ All thresholds within limits');
    }
    
  } catch (error) {
    console.error('❌ Hierarchy management failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { HierarchyManager };