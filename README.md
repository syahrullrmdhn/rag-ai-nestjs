# RAG NestJS + LangChain.js + Telegram (Webhook) — MVP (PostgreSQL)

MVP end-to-end:
- NestJS monolith
- Auth JWT (register/login/me)
- Settings (single row): OpenAI key + models + Telegram token
- Knowledge: upload PDF/TXT/MD & input text
- RAG: LangChain.js + OpenAI embeddings + MemoryVectorStore (in-memory)
- Chat endpoint: POST /chat
- Telegram webhook: POST /telegram/webhook (Telegraf)
- Simple web UI: `public/index.html`
- DB: PostgreSQL (Prisma)

## Keterbatasan penting
- `MemoryVectorStore` = RAM per process:
  - Restart server => vector store kosong lagi.
  - Multi-instance => knowledge tiap instance beda.
- DB hanya simpan metadata documents/settings; embeddings tidak dipersist.

Upgrade: ganti vector store ke pgvector/Qdrant, lalu embeddings persist dan restart aman.

## Setup cepat pakai Docker
```bash
docker compose up -d --build
```

Buka:
- http://localhost:3000

## Setup lokal (tanpa Docker)
```bash
npm install
cp .env.example .env
# edit DATABASE_URL, JWT_SECRET, dll
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

## Alur pakai
1) Register: `POST /auth/register`
2) Login: `POST /auth/login` -> `{accessToken}`
3) Set OpenAI & Telegram token: `PUT /settings` (Bearer)
4) Ingest knowledge:
   - `POST /knowledge/text`
   - `POST /knowledge/upload` (multipart file)
5) Chat:
   - `POST /chat` (Bearer)
6) Telegram:
   - Public URL: `https://domain/telegram/webhook`
   - Set webhook:
```bash
curl -s "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook"   -d "url=https://your-domain.example/telegram/webhook"
```

## Endpoint ringkas
- POST /auth/register
- POST /auth/login
- GET  /auth/me
- GET  /settings
- PUT  /settings
- GET  /knowledge
- POST /knowledge/text
- POST /knowledge/upload
- POST /chat
- POST /telegram/webhook
