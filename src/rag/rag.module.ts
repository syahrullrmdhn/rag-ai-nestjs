import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';
import { RagService } from './rag.service';

@Module({
  imports: [SettingsModule, PrismaModule], // IMPORTANT: SettingsModule provides SettingsService
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}
