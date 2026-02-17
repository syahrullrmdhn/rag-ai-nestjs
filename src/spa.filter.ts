import { ExceptionFilter, Catch, NotFoundException, ArgumentsHost } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';
import * as fs from 'fs';

@Catch(NotFoundException)
export class SpaFallbackFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. Jika URL diawali /api, berarti ini murni error API -> Return 404 JSON
    if (request.url.startsWith('/api')) {
      return response.status(404).json({
        statusCode: 404,
        message: `Cannot ${request.method} ${request.url}`,
        error: 'Not Found',
      });
    }

    // 2. Jika bukan API (Frontend Route), cari index.html
    const indexFile = join(process.cwd(), 'public', 'index.html');

    if (fs.existsSync(indexFile)) {
      return response.sendFile(indexFile);
    }

    // 3. Jika index.html tidak ada (belum build)
    return response.status(404).send('Frontend build not found (public/index.html missing). Please run build.');
  }
}
