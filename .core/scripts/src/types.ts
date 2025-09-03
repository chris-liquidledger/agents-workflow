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