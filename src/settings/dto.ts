export type UpdateSettingsDto = {
  openaiApiKey?: string | null;
  chatModel?: string | null;
  embeddingModel?: string | null;
  telegramBotToken?: string | null;
  telegramBotUsername?: string | null;
};
