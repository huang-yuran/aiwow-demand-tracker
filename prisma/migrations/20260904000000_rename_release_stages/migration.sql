-- 版本狀態流程改名：QA測試中→上版進測試、已進TestFlight→版本完成更新、已送審→送審、已上架→上架
-- 用 RENAME VALUE 保留既有資料，不是刪除重建
ALTER TYPE "ReleaseStage" RENAME VALUE 'QA測試中' TO '上版進測試';
ALTER TYPE "ReleaseStage" RENAME VALUE '已進TestFlight' TO '版本完成更新';
ALTER TYPE "ReleaseStage" RENAME VALUE '已送審' TO '送審';
ALTER TYPE "ReleaseStage" RENAME VALUE '已上架' TO '上架';
