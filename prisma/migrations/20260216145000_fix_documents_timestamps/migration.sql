-- documents.created_at / updated_at must exist because Prisma maps to them
ALTER TABLE "documents"
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE "documents"
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- backfill if previously had camelCase columns (best-effort, harmless if not exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='documents' AND column_name='createdAt'
  ) THEN
    EXECUTE 'UPDATE "documents" SET "created_at" = COALESCE("created_at","createdAt")';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='documents' AND column_name='updatedAt'
  ) THEN
    EXECUTE 'UPDATE "documents" SET "updated_at" = COALESCE("updated_at","updatedAt")';
  END IF;
END $$;
