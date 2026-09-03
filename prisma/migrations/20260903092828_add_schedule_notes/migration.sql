-- AlterTable
ALTER TABLE "releases" ADD COLUMN     "next_step_note" TEXT;

-- CreateTable
CREATE TABLE "schedule_notes" (
    "release_version" TEXT NOT NULL,
    "milestone_kind" TEXT NOT NULL,
    "note" TEXT,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_notes_pkey" PRIMARY KEY ("release_version","milestone_kind")
);

-- AddForeignKey
ALTER TABLE "schedule_notes" ADD CONSTRAINT "schedule_notes_release_version_fkey" FOREIGN KEY ("release_version") REFERENCES "releases"("version") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_notes" ADD CONSTRAINT "schedule_notes_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
