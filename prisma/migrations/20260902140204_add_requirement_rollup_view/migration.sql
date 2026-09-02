-- 需求層衍生值：版本清單、狀態、完成度、來源分類
-- 前後端須與 README「衍生規則」保持一致；此 view 不落庫，僅供查詢。
CREATE VIEW requirement_rollup AS
SELECT
  r.id,
  COALESCE(array_agg(DISTINCT d.release_version) FILTER (WHERE d.release_version IS NOT NULL), '{}') AS versions,
  CASE
    WHEN count(d.*) = 0 THEN '規劃中'
    WHEN count(*) FILTER (WHERE d.status <> '已完成') = 0 THEN '已完成'
    WHEN count(*) FILTER (WHERE d.status = '待測試') > 0
     AND count(*) FILTER (WHERE d.status = '進行中') = 0 THEN '測試中'
    WHEN count(*) FILTER (WHERE d.status <> '尚未開始') > 0 THEN '開發中'
    ELSE '規劃中'
  END AS status,
  COALESCE(round(100 * avg(CASE d.status
    WHEN '已完成' THEN 1.0 WHEN '待測試' THEN 0.8 WHEN '進行中' THEN 0.4 ELSE 0 END)), 0) AS pct,
  CASE WHEN r.requester_name = '老闆' THEN '老闆需求' ELSE '用戶需求' END AS source
FROM requirements r
LEFT JOIN dev_items d ON d.requirement_id = r.id
GROUP BY r.id, r.requester_name;
