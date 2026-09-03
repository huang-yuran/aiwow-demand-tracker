-- AlterTable
ALTER TABLE "releases" ADD COLUMN     "qa_start_date" DATE,
ADD COLUMN     "review_result_date" DATE,
ADD COLUMN     "testflight_date" DATE;
