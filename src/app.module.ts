import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SettingsModule } from './settings/settings.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { RagModule } from './rag/rag.module';
import { ChatModule } from './chat/chat.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Serve file statis dari folder public
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/', 
      // Penting: Exclude /api agar tidak bentrok
      exclude: ['/api/(.*)'], 
    }),

    PrismaModule,
    AuthModule,
    SettingsModule,
    KnowledgeModule,
    RagModule,
    ChatModule,
    TelegramModule,
  ],
  controllers: [], // Pastikan AppController DIHAPUS dari sini
  providers: [],
})
export class AppModule {}
