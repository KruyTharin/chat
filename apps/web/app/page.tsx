'use client';

import { useState } from 'react';
import { SocketProvider } from '@/lib/socket-context';
import { ConversationList } from '@/components/conversation-list';
import { ChatWindow } from '@/components/chat-window';
import { UserSelector } from '@/components/user-selector';
import { Conversation } from '@/lib/types';
import { MessageCircle, Mail } from 'lucide-react';
import './globals.css';

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentUser, setCurrentUser] = useState('Alice');

  return (
    <SocketProvider currentUser={currentUser}>
      <div className="flex h-screen bg-black text-foreground">
        {/* Main Navigation Sidebar (X Style) */}
        <div className="w-20 md:w-64 border-r border-zinc-900 flex flex-col justify-between py-2 px-3">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <div className="p-3 mb-2 hover:bg-zinc-900 rounded-full transition-colors cursor-pointer inline-flex">
              <MessageCircle className="h-7 w-7 text-primary" />
            </div>
            
            <SidebarItem icon={<Mail />} label="Messages" active />
          </div>
          
          <div className="mb-4">
            <UserSelector 
              currentUser={currentUser}
              onSelectUser={setCurrentUser}
            />
          </div>
        </div>

        {/* DM List Content */}
        <div className="w-full md:w-[400px] shrink-0">
          <ConversationList
            onSelectConversation={setSelectedConversation}
            selectedId={selectedConversation?.id}
          />
        </div>

        {/* Chat Window / Detail View */}
        <div className="flex flex-1 flex-col h-full overflow-hidden">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUser={currentUser}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-zinc-500 bg-black">
              <div className="max-w-md px-8 text-center">
                <h2 className="text-3xl font-extrabold text-foreground mb-2">Select a message</h2>
                <p className="text-[15px] leading-relaxed">
                  Choose from your existing conversations to start chatting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SocketProvider>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className="w-full">
      <div className={`
        flex items-center gap-4 p-3 rounded-full transition-all cursor-pointer md:flex w-auto md:w-full
        hover:bg-zinc-900
        ${active ? 'font-bold' : ''}
      `}>
        <div className="h-7 w-7 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <span className="text-xl hidden md:block leading-none">{label}</span>
      </div>
    </div>
  );
}
