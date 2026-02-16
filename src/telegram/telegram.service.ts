import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { SettingsService } from '../settings/settings.service';
import { RagService } from '../rag/rag.service';

@Injectable()
export class TelegramService {
  private bot: Telegraf | null = null;
  private botTokenLoaded: string | null = null;

  constructor(
    private settings: SettingsService,
    private rag: RagService,
  ) {}

  private async ensureBot() {
    const cfg = await this.settings.get();
    const token = cfg.telegramBotToken || '';
    if (!token) throw new Error('Telegram bot token belum diset di /settings');

    if (this.bot && this.botTokenLoaded === token) return;

    this.bot = new Telegraf(token);
    this.botTokenLoaded = token;
  }

  async reply(chatId: number | string, text: string) {
    await this.ensureBot();
    await this.bot!.telegram.sendMessage(chatId, text);
  }

  async answerAndReply(chatId: number | string, messageText: string) {
    const res = await this.rag.answer(messageText);
    const answer = (res.answer || '').trim();
    await this.reply(chatId, answer || '(no answer)');
  }
}
