import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  getAllConversations() {
    return this.chatService.getAllConversations();
  }

  @Get('conversations/:id')
  getConversation(@Param('id') id: string) {
    return this.chatService.getConversation(id);
  }

  @Post('conversations')
  createConversation(@Body() body: { name: string; participants: string[] }) {
    return this.chatService.createConversation(body.name, body.participants);
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') id: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.chatService.getMessages(id, limitNum);
  }

  @Post('messages')
  addMessage(
    @Body() body: { conversationId: string; sender: string; content: string },
  ) {
    return this.chatService.addMessage(body);
  }

  @Get('users/search')
  searchUsers(@Query('q') query: string) {
    return this.chatService.searchUsers(query || '');
  }
}
