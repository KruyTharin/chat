'use client';

import { useState, useEffect } from 'react';
import { Conversation } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedId?: string;
}

export function ConversationList({ onSelectConversation, selectedId }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/chat/conversations')
      .then((res) => res.json())
      .then((data) => {
        setConversations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch conversations:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        <div className="animate-pulse">Loading Messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r border-zinc-800">
      <div className="p-4 sticky top-0 bg-black/80 backdrop-blur-md z-10">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="pb-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={cn(
                "w-full flex items-center gap-3 p-4 transition-all text-left relative",
                "hover:bg-zinc-900/50",
                selectedId === conv.id && "bg-zinc-900/80"
              )}
            >
              {selectedId === conv.id && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />
              )}
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarFallback className="bg-zinc-800 text-foreground font-bold text-lg">
                  {conv.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-1">
                  <span className="font-bold truncate text-[15px]">{conv.name}</span>
                  <span className="text-zinc-500 text-xs shrink-0">
                    {conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                  </span>
                </div>
                {conv.lastMessage && (
                  <div className="text-[15px] text-zinc-500 truncate leading-relaxed">
                    {conv.lastMessage.content}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
