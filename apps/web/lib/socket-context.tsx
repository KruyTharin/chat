'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface TypingStatus {
  conversationId: string;
  username: string;
  isTyping: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  joinRoom: (conversationId: string, username: string) => void;
  leaveRoom: (conversationId: string, username: string) => void;
  setTyping: (conversationId: string, username: string, isTyping: boolean) => void;
  onMessage: (callback: (message: Message) => void) => () => void;
  onTyping: (callback: (status: TypingStatus) => void) => () => void;
  onUserStatus: (callback: (status: { username: string; online: boolean }) => void) => () => void;
  onUserJoined: (callback: (status: { username: string; conversationId: string; timestamp: Date }) => void) => () => void;
  onUserLeft: (callback: (status: { username: string; conversationId: string; timestamp: Date }) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children, currentUser }: { children: React.ReactNode; currentUser: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io('http://localhost:3001', {
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      // Register user with the server
      socketInstance.emit('register', { username: currentUser });
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [currentUser]);

  const sendMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    if (socket) {
      const fullMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };
      socket.emit('sendMessage', fullMessage);
    }
  }, [socket]);

  const joinRoom = useCallback((conversationId: string, username: string) => {
    if (socket) {
      socket.emit('joinRoom', { conversationId, username });
    }
  }, [socket]);

  const leaveRoom = useCallback((conversationId: string, username: string) => {
    if (socket) {
      socket.emit('leaveRoom', { conversationId, username });
    }
  }, [socket]);

  const setTyping = useCallback((conversationId: string, username: string, isTyping: boolean) => {
    if (socket) {
      socket.emit('typing', { conversationId, username, isTyping });
    }
  }, [socket]);

  const onMessage = useCallback((callback: (message: Message) => void) => {
    if (socket) {
      socket.on('receiveMessage', callback);
      return () => {
        socket.off('receiveMessage', callback);
      };
    }
    return () => {};
  }, [socket]);

  const onTyping = useCallback((callback: (status: TypingStatus) => void) => {
    if (socket) {
      socket.on('userTyping', callback);
      return () => {
        socket.off('userTyping', callback);
      };
    }
    return () => {};
  }, [socket]);

  const onUserStatus = useCallback((callback: (status: { username: string; online: boolean }) => void) => {
    if (socket) {
      socket.on('userStatus', callback);
      return () => {
        socket.off('userStatus', callback);
      };
    }
    return () => {};
  }, [socket]);

  const onUserJoined = useCallback((callback: (status: { username: string; conversationId: string; timestamp: Date }) => void) => {
    if (socket) {
      socket.on('userJoined', callback);
      return () => {
        socket.off('userJoined', callback);
      };
    }
    return () => {};
  }, [socket]);

  const onUserLeft = useCallback((callback: (status: { username: string; conversationId: string; timestamp: Date }) => void) => {
    if (socket) {
      socket.on('userLeft', callback);
      return () => {
        socket.off('userLeft', callback);
      };
    }
    return () => {};
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        sendMessage,
        joinRoom,
        leaveRoom,
        setTyping,
        onMessage,
        onTyping,
        onUserStatus,
        onUserJoined,
        onUserLeft,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
