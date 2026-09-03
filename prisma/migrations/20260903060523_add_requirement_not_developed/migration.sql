-- AlterTable
ALTER TABLE "requirements" ADD COLUMN     "not_developed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "not_developed_reason" TEXT;
