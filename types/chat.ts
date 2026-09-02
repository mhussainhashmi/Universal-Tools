export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  error?: boolean;
}

export interface ConversationContext {
  messages: ChatMessage[];
  documentText: string;
}
