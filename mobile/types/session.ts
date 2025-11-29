// Session and Message types for conversation history

export interface Message {
  id: string;
  type: 'user' | 'ai';
  timestamp: number;
  text: string;
  images?: string[]; // URIs for user messages
  isExpanded?: boolean; // For AI responses with expandable details
}

export interface Session {
  id: string;
  title: string; // Auto-generated or user-provided
  createdAt: number;
  lastActivityAt: number;
  messages: Message[];
  promptCount: number; // Track prompts for rate limiting
  firstPromptInWindow?: number; // Timestamp of first prompt in 5-hour window
}

export interface SessionMetadata {
  id: string;
  title: string;
  createdAt: number;
  lastActivityAt: number;
  messageCount: number;
  promptCount: number;
}

// Constants
export const MAX_SESSIONS = 5;
export const MAX_PROMPTS_PER_WINDOW = 15;
export const RATE_LIMIT_WINDOW_MS = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
