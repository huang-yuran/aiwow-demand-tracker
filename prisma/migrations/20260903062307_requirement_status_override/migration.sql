-- CreateEnum
CREATE TYPE "ReqStatusOverride" AS ENUM ('規劃中', '開發中', '測試中', '已完成', '不開發');

-- AlterTable: replace the one-off not_developed flag with a general status override
ALTER TABLE "requirements" ADD COLUMN "status_override" "ReqStatusOverride";

UPDATE "requirements" SET "status_override" = '不開發' WHERE "not_developed" = true;

ALTER TABLE "requirements" DROP COLUMN "not_developed";
