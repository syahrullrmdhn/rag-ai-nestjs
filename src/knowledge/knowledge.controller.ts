import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KnowledgeService } from './knowledge.service';

function getUserId(req: any): string {
  const id = req?.user?.sub ?? req?.user?.id ?? req?.user?.userId;
  if (!id) throw new BadRequestException('Missing user context. Send Authorization: Bearer <token>.');
  return id;
}

function ensureUploadsDir() {
  const dir = path.join(process.cwd(), 'uploads');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private knowledge: KnowledgeService) {}

  @Get()
  async list(@Req() req: any) {
    const userId = getUserId(req);
    return this.knowledge.list(userId);
  }

  @Post('text')
  async ingestText(@Req() req: any, @Body() body: any) {
    const userId = getUserId(req);
    const text = (body?.text || '').toString();
    const title = body?.title ? String(body.title) : undefined;
    if (!text.trim()) throw new BadRequestException('Text wajib diisi');
    return this.knowledge.createFromText(userId, text, title);
  }

  /**
   * Upload file => auto-index (langsung proses)
   * Jika mau behavior lama (pending), ubah return ke `return doc;`
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, ensureUploadsDir()),
        filename: (_req, file, cb) => {
          const safe = String(file.originalname || 'upload.bin').replace(/[^\w.\-]+/g, '_');
          cb(null, `${Date.now()}_${safe}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  async upload(@Req() req: any, @UploadedFile() file: any) {
    const userId = getUserId(req);
    if (!file) throw new BadRequestException('File wajib dipilih');

    // create doc (pending)
    const doc = await this.knowledge.createFromFile(userId, file);

    // auto-index (blocking)
    return this.knowledge.indexFile(userId, doc.id);
  }

  // Manual indexing / retry endpoint
  @Post(':id/index')
  async indexOne(@Req() req: any, @Param('id') id: string) {
    const userId = getUserId(req);
    return this.knowledge.indexFile(userId, id);
  }
}
