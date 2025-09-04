// Notion Configuration  
export interface NotionConfig {
  rootPageId: string;
  pageTitle: string;
  sessionType: string;
  classificationPath?: string;
}

// Session Index
export interface SessionIndex {
  sessions: SessionEntry[];
  metadata?: {
    created: string;
    lastUpdated: string;
    version: string;
  };
}

export interface SessionEntry {
  id: string;
  date: string;
  type: string;
  topic: string;
  notionPageId?: string;
  classificationPath?: string;
}

// Knowledge Index Types
export interface KnowledgeEntry {
  id: string;
  title: string;
  url: string;
  content_preview: string;
  keywords: string[];
  agent_creator: string;
  project_context: string;
  content_type: string;
  created_date: string;
  classification_path: string;
  embeddings?: number[];
}

export interface KnowledgeIndex {
  entries: KnowledgeEntry[];
  metadata: {
    last_updated: string;
    total_entries: number;
    version: string;
  };
}