export interface Message {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount?: number;
}
