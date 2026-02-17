import {
  Controller,
  Get,
  Post,
  Delete,
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

// Definisikan path upload secara global di file ini
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Konfigurasi Multer yang lebih Robust dengan Logging
const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Cek apakah folder ada
      if (!fs.existsSync(UPLOAD_DIR)) {
        console.log(`[Multer] Directory missing. Creating: ${UPLOAD_DIR}`);
        try {
          fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        } catch (e) {
          console.error('[Multer] Failed to create directory:', e);
          return cb(e as Error, '');
        }
      }
      cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
      // Sanitasi nama file agar aman
      const safeName = String(file.originalname || 'upload.bin')
        .replace(/\s+/g, '_') // Ganti spasi dengan underscore
        .replace(/[^\w.\-]+/g, ''); // Hapus karakter aneh
      const finalName = `${Date.now()}_${safeName}`;
      cb(null, finalName);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit 50MB
};

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
   * Upload file => auto-index
   * Menggunakan konfigurasi multerOptions yang sudah diperbaiki
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async upload(@Req() req: any, @UploadedFile() file: any) {
    const userId = getUserId(req);
    
    // --- DEBUG LOGGING ---
    console.log('[Upload Controller] File object received:', file);
    // ---------------------

    if (!file) {
      console.error('[Upload Controller] Error: File is undefined/null');
      throw new BadRequestException('File wajib dipilih. Cek permission folder uploads.');
    }

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

  // --- DELETE ENDPOINT ---
  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    const userId = getUserId(req);
    return this.knowledge.delete(userId, id);
  }
}
