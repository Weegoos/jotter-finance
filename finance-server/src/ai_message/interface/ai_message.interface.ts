export type AIMessageRole = 'user' | 'assistant' | 'system';

export interface IAIMessage {
  conversationId: string;
  role: AIMessageRole;
  content: string;
}
