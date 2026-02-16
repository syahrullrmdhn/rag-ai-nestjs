import { Module } from '@nestjs/common';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { RagModule } from '../rag/rag.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [RagModule, SettingsModule],
  controllers: [TelegramController],
  providers: [TelegramService],
})
export class TelegramModule {}
