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

    // IMPORTANT: use process.cwd() so path is correct in Docker runtime (/app)
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public', 'app'),
      serveRoot: '/',
      exclude: ['/auth*', '/settings*', '/knowledge*', '/chat*', '/telegram*'],
    }),

    PrismaModule,
    AuthModule,
    SettingsModule,
    KnowledgeModule,
    RagModule,
    ChatModule,
    TelegramModule,
  ],
})
export class AppModule {}
