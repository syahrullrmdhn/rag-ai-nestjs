import { Body, Controller, Post } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private tg: TelegramService) {}

  @Post('webhook')
  async webhook(@Body() update: any) {
    const msg = update?.message;
    const chatId = msg?.chat?.id;
    const text = msg?.text;

    if (chatId && typeof text === 'string' && text.trim()) {
      try {
        await this.tg.answerAndReply(chatId, text.trim());
      } catch (e: any) {
        try {
          await this.tg.reply(chatId, `Error: ${e?.message || 'unknown'}`);
        } catch {
          // ignore
        }
      }
    }

    return { ok: true };
  }
}
