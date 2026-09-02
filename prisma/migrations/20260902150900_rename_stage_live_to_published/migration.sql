-- 發布階段「已上線」改名為「已上架」（沿用既有資料，非刪除重建）
ALTER TYPE "ReleaseStage" RENAME VALUE '已上線' TO '已上架';
