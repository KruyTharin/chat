'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/lib/socket-context';
import { Message, Conversation } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  conversation: Conversation;
  currentUser: string;
}

export function ChatWindow({ conversation, currentUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { sendMessage, joinRoom, leaveRoom, setTyping, onMessage, onTyping, onUserJoined, onUserLeft } = useSocket();

  useEffect(() => {
    fetch(`http://localhost:3001/chat/conversations/${conversation.id}/messages`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
      })
      .catch((err) => console.error('Failed to fetch messages:', err));

    joinRoom(conversation.id, currentUser);

    // Listen for new messages
    const cleanupMessage = onMessage((message: Message) => {
      if (message.conversationId === conversation.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    // Listen for typing indicators
    const cleanupTyping = onTyping((status) => {
      if (status.conversationId === conversation.id) {
        if (status.isTyping && status.username !== currentUser) {
          setTypingUsers((prev) => 
            prev.includes(status.username) ? prev : [...prev, status.username]
          );
        } else {
          setTypingUsers((prev) => prev.filter((u) => u !== status.username));
        }
      }
    });

    // Listen for user joined
    const cleanupJoined = onUserJoined((status) => {
      if (status.conversationId === conversation.id && status.username !== currentUser) {
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}-${Math.random()}`,
            conversationId: status.conversationId,
            sender: 'system',
            content: `${status.username} joined the chat`,
            timestamp: new Date(status.timestamp),
          } as Message,
        ]);
      }
    });

    // Listen for user left
    const cleanupLeft = onUserLeft((status) => {
      if (status.conversationId === conversation.id && status.username !== currentUser) {
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}-${Math.random()}`,
            conversationId: status.conversationId,
            sender: 'system',
            content: `${status.username} left the chat`,
            timestamp: new Date(status.timestamp),
          } as Message,
        ]);
      }
    });

    return () => {
      leaveRoom(conversation.id, currentUser);
      cleanupMessage();
      cleanupTyping();
      cleanupJoined();
      cleanupLeft();
    };
  }, [conversation.id, currentUser, joinRoom, leaveRoom, onMessage, onTyping, onUserJoined, onUserLeft]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage({
        conversationId: conversation.id,
        sender: currentUser,
        content: inputValue.trim(),
      });
      setInputValue('');
      setTyping(conversation.id, currentUser, false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setTyping(conversation.id, currentUser, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(conversation.id, currentUser, false);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-black/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-zinc-800 text-foreground font-bold text-xs">
              {conversation.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-[15px] leading-tight">{conversation.name}</span>
            <span className="text-zinc-500 text-[13px]">{conversation.participants.length} participants</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-500">
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-8 space-y-6">
          <div className="flex flex-col items-center mb-12 py-8 border-b border-zinc-900">
            <Avatar className="h-16 w-16 mb-4">
              <AvatarFallback className="bg-zinc-800 text-foreground font-bold text-2xl">
                {conversation.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{conversation.name}</h2>
            <p className="text-zinc-500 text-sm mt-1">Chat started {new Date(conversation.id).toLocaleDateString([], { month: 'long', year: 'numeric' })}</p>
          </div>

          {messages.map((message) => {
            if (message.sender === 'system') {
              return (
                <div key={message.id} className="flex justify-center">
                  <span className="text-zinc-500 text-[13px]">{message.content}</span>
                </div>
              );
            }
            
            const isMe = message.sender === currentUser;
            return (
              <div key={message.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                <div className={cn("flex max-w-[85%] sm:max-w-[70%] group gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                  {!isMe && (
                    <Avatar className="h-8 w-8 mt-auto mb-1 shrink-0">
                      <AvatarFallback className="bg-zinc-800 text-xs">
                        {message.sender.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col">
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-[15px] leading-normal wrap-break-word",
                      isMe 
                        ? "bg-primary text-white rounded-br-none" 
                        : "bg-zinc-800 text-foreground rounded-bl-none"
                    )}>
                      {message.content}
                    </div>
                  </div>
                </div>
                <span className="text-zinc-500 text-[11px] mt-1.5 px-0.5">
                  {formatTime(message.timestamp)}
                  {!isMe && <span className="ml-2">· {message.sender}</span>}
                </span>
              </div>
            );
          })}
          
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-zinc-500 text-[13px] animate-pulse">
              <span className="font-medium">{typingUsers.join(', ')} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 pt-1">
        <form onSubmit={handleSendMessage} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-1 flex items-center shadow-lg group focus-within:ring-1 focus-within:ring-primary transition-all">
          <input
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Start a new message"
            className="flex-1 bg-transparent border-none outline-none py-3 px-4 text-[15px] placeholder:text-zinc-500"
          />
          <button 
            disabled={!inputValue.trim()}
            className={cn(
              "p-2 mr-1 rounded-full transition-all flex items-center justify-center",
              inputValue.trim() ? "bg-primary text-white" : "text-primary opacity-50"
            )}
          >
            <Send className="h-5 w-5 fill-current" />
          </button>
        </form>
      </div>
    </div>
  );
}
