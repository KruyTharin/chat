import { Injectable } from '@nestjs/common';

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

@Injectable()
export class ChatService {
  // In-memory storage (replace with Prisma later)
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private messageCounter = 0;

  constructor() {
    // Initialize with some mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    const conv1: Conversation = {
      id: 'conv-1',
      name: 'General Chat',
      participants: ['Alice', 'Bob', 'Charlie'],
      unreadCount: 0,
    };

    const conv2: Conversation = {
      id: 'conv-2',
      name: 'Project Discussion',
      participants: ['Alice', 'David'],
      unreadCount: 0,
    };

    this.conversations.set('conv-1', conv1);
    this.conversations.set('conv-2', conv2);

    // Add some initial messages
    const messages1: Message[] = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        sender: 'Bob',
        content: 'Hey everyone! 👋',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        sender: 'Alice',
        content: 'Hi Bob! How are you?',
        timestamp: new Date(Date.now() - 3000000),
      },
    ];

    this.messages.set('conv-1', messages1);
    this.messages.set('conv-2', []);
  }

  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values());
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  createConversation(name: string, participants: string[]): Conversation {
    const id = `conv-${Date.now()}`;
    const conversation: Conversation = {
      id,
      name,
      participants,
      unreadCount: 0,
    };
    this.conversations.set(id, conversation);
    this.messages.set(id, []);
    return conversation;
  }

  getMessages(conversationId: string, limit = 50): Message[] {
    const messages = this.messages.get(conversationId) || [];
    return messages.slice(-limit);
  }

  addMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
    this.messageCounter++;
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${this.messageCounter}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    const conversationMessages =
      this.messages.get(message.conversationId) || [];
    conversationMessages.push(newMessage);
    this.messages.set(message.conversationId, conversationMessages);

    // Update last message in conversation
    const conversation = this.conversations.get(message.conversationId);
    if (conversation) {
      conversation.lastMessage = newMessage;
    }

    return newMessage;
  }

  searchUsers(query: string): string[] {
    // Mock user search - replace with real database query
    const allUsers = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank'];
    return allUsers.filter((user) =>
      user.toLowerCase().includes(query.toLowerCase()),
    );
  }
}
