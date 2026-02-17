import { Controller, Post, Get, Delete, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';

function getUserId(req: any) {
  return req.user?.userId || req.user?.sub || req.user?.id;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  // Inject ChatService, bukan RagService langsung
  constructor(private chatService: ChatService) {}

  // Load History
  @Get()
  async getHistory(@Req() req: any) {
    const userId = getUserId(req);
    return this.chatService.getHistory(userId);
  }

  // Chat Baru
  @Post()
  async chat(@Req() req: any, @Body() body: any) {
    const userId = getUserId(req);
    const msg = body.message;
    
    if (!msg) throw new BadRequestException('Message is empty');
    
    return this.chatService.chat(userId, msg);
  }

  // Hapus History
  @Delete()
  async clearHistory(@Req() req: any) {
    const userId = getUserId(req);
    return this.chatService.clearHistory(userId);
  }
}
