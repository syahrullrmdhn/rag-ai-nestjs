import { Module } from '@nestjs/common';
import { RagModule } from '../rag/rag.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service'; // <--- Import ini

@Module({
  imports: [RagModule],
  controllers: [ChatController],
  providers: [ChatService], // <--- Masukkan ini
})
export class ChatModule {}
