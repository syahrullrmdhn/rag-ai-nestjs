import { Injectable } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { PrismaService } from '../prisma/prisma.service';

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { Document as LCDocument } from 'langchain/document';

type AnswerResult = {
  answer: string;
  sources?: Array<{ documentId?: string; title?: string; snippet?: string }>;
};

@Injectable()
export class RagService {
  private vectorStore: MemoryVectorStore | null = null;
  private embeddingModelName: string | null = null;
  private openaiApiKeyLoaded: string | null = null;

  constructor(
    private settings: SettingsService,
    private prisma: PrismaService,
  ) {}

  private async initVectorStoreIfNeeded() {
    const cfg = await this.settings.get();
    const apiKey = cfg.openaiApiKey || '';
    const embeddingModel = cfg.embeddingModel || 'text-embedding-3-large';

    if (!apiKey) {
      throw new Error('OpenAI API key belum diset di /settings');
    }

    const mustReinit =
      !this.vectorStore ||
      this.embeddingModelName !== embeddingModel ||
      this.openaiApiKeyLoaded !== apiKey;

    if (!mustReinit) return;

    const embeddings = new OpenAIEmbeddings({
      apiKey,
      model: embeddingModel,
    });

    this.vectorStore = new MemoryVectorStore(embeddings);
    this.embeddingModelName = embeddingModel;
    this.openaiApiKeyLoaded = apiKey;
  }

  async hasAnyKnowledge(): Promise<boolean> {
    const cnt = await this.prisma.document.count({ where: { status: 'indexed' } });
    return cnt > 0;
  }

  async ingestRawText(documentId: string, text: string, title?: string) {
    await this.initVectorStoreIfNeeded();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitText(text);
    const docs = chunks.map(
      (chunk, idx) =>
        new LCDocument({
          pageContent: chunk,
          metadata: { documentId, title: title || undefined, chunkIndex: idx },
        }),
    );

    await this.vectorStore!.addDocuments(docs);

    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: 'indexed' },
    });
  }

  async answer(question: string): Promise<AnswerResult> {
    const trimmed = (question || '').trim();
    if (!trimmed) return { answer: 'Pertanyaan kosong.' };

    if (!this.vectorStore) {
      const any = await this.hasAnyKnowledge();
      if (!any) return { answer: 'Knowledge kosong. Upload dulu dokumen/teks.' };
      return {
        answer:
          'Knowledge di DB ada, tapi vector store in-memory belum terisi (server baru restart). Re-ingest dokumen untuk MVP ini.',
      };
    }

    const cfg = await this.settings.get();
    const apiKey = cfg.openaiApiKey || '';
    const chatModel = cfg.chatModel || 'gpt-4.1-mini';
    if (!apiKey) return { answer: 'OpenAI API key belum diset di /settings' };

    const retriever = this.vectorStore.asRetriever({ k: 4 });
    const relevantDocs = await retriever.getRelevantDocuments(trimmed);

    const context = relevantDocs
      .map((d, i) => `[#${i + 1}] ${d.pageContent}`)
      .join('\n\n');

    const llm = new ChatOpenAI({
      apiKey,
      model: chatModel,
      temperature: 0.2,
    });

    const system = [
      'Kamu adalah asisten yang menjawab berbasis konteks yang diberikan.',
      'Kalau konteks tidak cukup, bilang tidak tahu dan minta user menambah knowledge.',
      'Jawaban harus singkat, jelas, tidak mengarang.',
    ].join(' ');

    const prompt = [
      `SYSTEM: ${system}`,
      '',
      'KONTEKS:',
      context || '(kosong)',
      '',
      `PERTANYAAN: ${trimmed}`,
      '',
      'JAWAB:',
    ].join('\n');

    const res = await llm.invoke(prompt);
    const answerText = typeof res.content === 'string' ? res.content : JSON.stringify(res.content);

    const sources = relevantDocs.map((d) => {
      const snippet = (d.pageContent || '').slice(0, 240);
      return {
        documentId: d.metadata?.documentId,
        title: d.metadata?.title,
        snippet,
      };
    });

    return { answer: answerText, sources };
  }
}
