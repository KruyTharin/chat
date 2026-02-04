'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserSelectorProps {
  onSelectUser: (username: string) => void;
  currentUser: string;
}

const AVAILABLE_USERS = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank'];

export function UserSelector({ onSelectUser, currentUser }: UserSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full flex items-center gap-3 p-3 rounded-full hover:bg-zinc-900 transition-all outline-none text-left">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-zinc-800 text-foreground font-bold">
            {currentUser.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 hidden md:block overflow-hidden">
          <div className="font-bold truncate">{currentUser}</div>
          <div className="text-zinc-500 text-sm truncate">@{currentUser.toLowerCase()}</div>
        </div>
        <MoreHorizontal className="h-5 w-5 text-zinc-500 hidden md:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-black border-zinc-800 p-3 rounded-2xl shadow-zinc-800/20 shadow-xl mb-2">
        <div className="px-2 py-1.5 text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">
          Switch accounts
        </div>
        {AVAILABLE_USERS.map((user) => (
          <DropdownMenuItem
            key={user}
            onClick={() => onSelectUser(user)}
            className={cn(
              "flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-zinc-900 focus:bg-zinc-900 transition-colors mb-1",
              user === currentUser && "bg-zinc-900/50"
            )}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-zinc-800 text-foreground font-bold">
                {user.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-bold">{user}</div>
              <div className="text-zinc-500 text-sm">@{user.toLowerCase()}</div>
            </div>
            {user === currentUser && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
