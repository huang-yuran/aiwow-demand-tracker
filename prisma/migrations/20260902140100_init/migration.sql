-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('boss', 'pm', 'qa', 'rd');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('高', '中', '低');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('尚未開始', '進行中', '待測試', '已完成');

-- CreateEnum
CREATE TYPE "BugStatus" AS ENUM ('待處理', '處理中', '已修復待驗證', '已關閉');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('嚴重', '中', '輕微');

-- CreateEnum
CREATE TYPE "ReleaseStage" AS ENUM ('開發中', 'QA 測試中', '已進 TestFlight', '已送審', '已上線');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole",
    "email" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "releases" (
    "version" TEXT NOT NULL,
    "planned_date" DATE,
    "stage" "ReleaseStage",

    CONSTRAINT "releases_pkey" PRIMARY KEY ("version")
);

-- CreateTable
CREATE TABLE "requirements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "origin" TEXT,
    "origin_date" DATE,
    "requester_name" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT '中',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT,

    CONSTRAINT "requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dev_items" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "plain_text" TEXT NOT NULL,
    "feature" TEXT,
    "release_version" TEXT,
    "seq_no" TEXT,
    "assignee_id" TEXT,
    "status" "ItemStatus" NOT NULL DEFAULT '尚未開始',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dev_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bugs" (
    "id" TEXT NOT NULL,
    "dev_item_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "steps" TEXT,
    "severity" "Severity" NOT NULL DEFAULT '中',
    "reporter_id" TEXT,
    "assignee_id" TEXT,
    "status" "BugStatus" NOT NULL DEFAULT '待處理',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bugs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "dev_items_release_version_idx" ON "dev_items"("release_version");

-- CreateIndex
CREATE INDEX "dev_items_requirement_id_idx" ON "dev_items"("requirement_id");

-- CreateIndex
CREATE INDEX "dev_items_assignee_id_status_idx" ON "dev_items"("assignee_id", "status");

-- CreateIndex
CREATE INDEX "bugs_dev_item_id_idx" ON "bugs"("dev_item_id");

-- CreateIndex
CREATE INDEX "bugs_assignee_id_status_idx" ON "bugs"("assignee_id", "status");

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev_items" ADD CONSTRAINT "dev_items_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev_items" ADD CONSTRAINT "dev_items_release_version_fkey" FOREIGN KEY ("release_version") REFERENCES "releases"("version") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dev_items" ADD CONSTRAINT "dev_items_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_dev_item_id_fkey" FOREIGN KEY ("dev_item_id") REFERENCES "dev_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
