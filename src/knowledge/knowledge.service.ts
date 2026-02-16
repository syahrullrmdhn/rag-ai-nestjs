import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RagService } from '../rag/rag.service';
import * as fs from 'fs';
import * as path from 'path';
import * as pdfParse from 'pdf-parse';

type DocStatus = 'pending' | 'indexing' | 'indexed' | 'failed';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService, private rag: RagService) {}

  async list(userId: string) {
    if (!userId) throw new BadRequestException('userId missing');
    try {
      // sekarang aman karena DB sudah dipaksa punya kolom progress via migration
      return await this.prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e: any) {
      // jangan lempar 500 mentah tanpa konteks
      throw new InternalServerErrorException(e?.message || 'Failed to load documents');
    }
  }

  async createFromText(userId: string, text: string, title?: string) {
    if (!userId) throw new BadRequestException('userId missing');

    const doc = await this.prisma.document.create({
      data: {
        title: title || 'Text Knowledge',
        type: 'text',
        sourcePath: null,
        status: 'indexing',
        progress: 5,
        errorMessage: null,
        user: { connect: { id: userId } },
      },
    });

    try {
      await this.prisma.document.update({ where: { id: doc.id }, data: { progress: 35 } });

      await this.rag.ingestRawText(doc.id, (text || '').trim(), doc.title);

      return await this.prisma.document.update({
        where: { id: doc.id },
        data: { status: 'indexed', progress: 100, errorMessage: null },
      });
    } catch (e: any) {
      return await this.prisma.document.update({
        where: { id: doc.id },
        data: { status: 'failed', progress: 0, errorMessage: String(e?.message || e) },
      });
    }
  }

  async createFromFile(userId: string, file: any) {
    if (!userId) throw new BadRequestException('userId missing');

    let storedPath: string | null = file?.path || null;

    // fallback: memory storage
    if (!storedPath && file?.buffer && file?.originalname) {
      const uploadDir = path.join(process.cwd(), 'uploads');
      fs.mkdirSync(uploadDir, { recursive: true });
      const safeName = `${Date.now()}_${String(file.originalname).replace(/[^\w.\-]+/g, '_')}`;
      const abs = path.join(uploadDir, safeName);
      fs.writeFileSync(abs, file.buffer);
      storedPath = path.join('uploads', safeName);
    }

    if (!storedPath) throw new BadRequestException('Invalid upload file');

    const original = file.originalname || path.basename(storedPath);

    return await this.prisma.document.create({
      data: {
        title: original,
        type: 'file',
        sourcePath: storedPath,
        status: 'pending',
        progress: 0,
        errorMessage: null,
        user: { connect: { id: userId } },
      },
    });
  }

  async indexFile(userId: string, documentId: string) {
    if (!userId) throw new BadRequestException('userId missing');

    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!doc) throw new BadRequestException('Document not found');
    if (doc.type !== 'file') throw new BadRequestException('Only file documents can be indexed');
    if (!doc.sourcePath) throw new BadRequestException('sourcePath missing');

    // hindari indexing dobel
    if (doc.status === 'indexing' || doc.status === 'indexed') return doc;

    const abs = path.isAbsolute(doc.sourcePath)
      ? doc.sourcePath
      : path.join(process.cwd(), doc.sourcePath);

    if (!fs.existsSync(abs)) throw new BadRequestException('File not found on disk');

    await this.prisma.document.update({
      where: { id: doc.id },
      data: { status: 'indexing' as DocStatus, progress: 5, errorMessage: null },
    });

    try {
      const buf = fs.readFileSync(abs);
      await this.prisma.document.update({ where: { id: doc.id }, data: { progress: 20 } });

      let text = '';
      const lower = (doc.title || '').toLowerCase();

      if (lower.endsWith('.pdf')) {
        const parsed = await pdfParse(buf);
        text = (parsed.text || '').trim();
      } else {
        text = buf.toString('utf8').trim();
      }

      if (!text) throw new Error('No text extracted from file');

      await this.prisma.document.update({ where: { id: doc.id }, data: { progress: 45 } });

      await this.rag.ingestRawText(doc.id, text, doc.title);

      return await this.prisma.document.update({
        where: { id: doc.id },
        data: { status: 'indexed' as DocStatus, progress: 100, errorMessage: null },
      });
    } catch (e: any) {
      return await this.prisma.document.update({
        where: { id: doc.id },
        data: { status: 'failed' as DocStatus, progress: 0, errorMessage: String(e?.message || e) },
      });
    }
  }
}
