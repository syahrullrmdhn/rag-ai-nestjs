import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateSettingsDto } from './dto';

function isMasked(v?: string | null) {
  if (!v) return false;
  return v.includes('•') || v.includes('…');
}

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    const row = await this.prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        chatModel: 'gpt-4.1-mini',
        embeddingModel: 'text-embedding-3-large',
      },
    });
    return row;
  }

  async update(dto: UpdateSettingsDto) {
    const patch: any = {
      chatModel: dto.chatModel ?? undefined,
      embeddingModel: dto.embeddingModel ?? undefined,
      telegramBotUsername: dto.telegramBotUsername ?? undefined,
    };

    if (dto.openaiApiKey !== undefined && !isMasked(dto.openaiApiKey)) {
      patch.openaiApiKey = dto.openaiApiKey || null;
    }
    if (dto.telegramBotToken !== undefined && !isMasked(dto.telegramBotToken)) {
      patch.telegramBotToken = dto.telegramBotToken || null;
    }

    const row = await this.prisma.settings.upsert({
      where: { id: 1 },
      update: patch,
      create: {
        id: 1,
        openaiApiKey: dto.openaiApiKey && !isMasked(dto.openaiApiKey) ? dto.openaiApiKey : null,
        chatModel: dto.chatModel ?? 'gpt-4.1-mini',
        embeddingModel: dto.embeddingModel ?? 'text-embedding-3-large',
        telegramBotToken: dto.telegramBotToken && !isMasked(dto.telegramBotToken) ? dto.telegramBotToken : null,
        telegramBotUsername: dto.telegramBotUsername ?? null,
      },
    });

    return row;
  }
}
