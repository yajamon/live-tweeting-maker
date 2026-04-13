export interface Post {
  id: string;
  timestamp: number; // elapsed seconds from timer
  text: string;
  createdAt: string; // ISO 8601
}

export interface SessionData {
  authorName: string;
  suffix: string;
  posts: Post[];
  version: 3;
}
