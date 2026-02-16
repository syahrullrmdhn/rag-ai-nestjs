-- Add progress column for document indexing/upload progress
ALTER TABLE "documents"
ADD COLUMN IF NOT EXISTS "progress" INTEGER NOT NULL DEFAULT 0;
