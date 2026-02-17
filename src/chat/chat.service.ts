import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RagService } from '../rag/rag.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService, private rag: RagService) {}

  // 1. Ambil History Chat user tertentu
  async getHistory(userId: string) {
    return this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }, // Urut dari lama ke baru
      select: { role: true, text: true },
    });
  }

  // 2. Proses Chat: Simpan User Msg -> Tanya AI -> Simpan Bot Msg
  async chat(userId: string, message: string) {
    // A. Simpan pesan User
    await this.prisma.chatMessage.create({
      data: { userId, role: 'user', text: message },
    });

    // B. Tanya RAG
    const response = await this.rag.answer(message);
    
    // Pastikan kita dapat string jawabannya
    const answerText = typeof response === 'string' ? response : response?.answer || 'No answer generated.';

    // C. Simpan pesan Bot
    await this.prisma.chatMessage.create({
      data: { userId, role: 'assistant', text: answerText },
    });

    return { answer: answerText };
  }

  // 3. Hapus History
  async clearHistory(userId: string) {
    return this.prisma.chatMessage.deleteMany({ where: { userId } });
  }
}
