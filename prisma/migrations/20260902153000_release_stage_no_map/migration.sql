-- Prisma 對有 @map 別名的 enum 值，JS 端讀寫一律用無空格識別字，導致跟畫面顯示字串（帶空格）永遠對不上。
-- 移除這兩個值的空格別名，統一用無空格識別字當唯一真實值；顯示文字改在程式層另外對照。
ALTER TYPE "ReleaseStage" RENAME VALUE 'QA 測試中' TO 'QA測試中';
ALTER TYPE "ReleaseStage" RENAME VALUE '已進 TestFlight' TO '已進TestFlight';
