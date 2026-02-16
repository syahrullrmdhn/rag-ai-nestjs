import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RagService } from '../rag/rag.service';
import type { ChatDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private rag: RagService) {}

  @Post()
  chat(@Body() dto: ChatDto) {
    return this.rag.answer(dto.message);
  }
}
