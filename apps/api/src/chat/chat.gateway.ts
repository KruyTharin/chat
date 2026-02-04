import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Socket>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove from user sockets
    for (const [username, socket] of this.userSockets.entries()) {
      if (socket.id === client.id) {
        this.userSockets.delete(username);
        // Notify others that user went offline
        this.server.emit('userStatus', { username, online: false });
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { username: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.userSockets.set(data.username, client);
    this.server.emit('userStatus', { username: data.username, online: true });
    return { success: true };
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { conversationId: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.conversationId);
    console.log(`User ${data.username} joined room ${data.conversationId}`);

    // Notify others in the room that a user has joined
    client.to(data.conversationId).emit('userJoined', {
      username: data.username,
      conversationId: data.conversationId,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { conversationId: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.conversationId);

    // Notify others in the room that a user has left
    client.to(data.conversationId).emit('userLeft', {
      username: data.username,
      conversationId: data.conversationId,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() message: Message,
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast to all clients in the conversation room
    this.server.to(message.conversationId).emit('receiveMessage', message);
    return { success: true };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: TypingStatus,
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast typing status to others in the room
    client.to(data.conversationId).emit('userTyping', data);
    return { success: true };
  }
}
