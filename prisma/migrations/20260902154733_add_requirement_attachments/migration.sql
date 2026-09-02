-- CreateTable
CREATE TABLE "requirement_attachments" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requirement_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "requirement_attachments_requirement_id_idx" ON "requirement_attachments"("requirement_id");

-- AddForeignKey
ALTER TABLE "requirement_attachments" ADD CONSTRAINT "requirement_attachments_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
