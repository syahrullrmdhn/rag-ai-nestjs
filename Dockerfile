# ---- build stage
FROM node:20-bookworm-slim AS build
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# frontend deps
COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd frontend && npm install

COPY tsconfig.json nest-cli.json ./
COPY prisma ./prisma
COPY src ./src
COPY public ./public
COPY frontend ./frontend

# build frontend -> public/app
RUN npm run fe:build

# build nest
RUN npx prisma generate
RUN npm run build

# ---- runtime stage
FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/package.json /app/package-lock.json* ./
RUN npm install --omit=dev --legacy-peer-deps

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/public ./public

RUN mkdir -p /app/uploads

EXPOSE 3000
CMD ["sh", "-lc", "npx prisma@5.22.0 migrate deploy && node dist/main.js"]
