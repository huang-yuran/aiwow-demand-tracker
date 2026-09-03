// 對應 README「Design Tokens」與設計稿 Boss Views.dc.html 的色彩定義

export const STATUS_COLOR: Record<string, string> = {
  "規劃中": "#8A929C",
  "尚未開始": "#8A929C",
  "開發中": "#2F6BA6",
  "進行中": "#2F6BA6",
  "測試中": "#A07B22",
  "待測試": "#A07B22",
  "已完成": "#3F7A52",
  "不開發": "#9C4A3B",
  "十月再討論": "#6B5FA0",
};

export const PRIORITY_COLOR: Record<string, string> = {
  "高": "#A2452F",
  "中": "#3B424A",
  "低": "#878F99",
};

export const SOURCE_STYLE: Record<string, { color: string; bg: string }> = {
  "老闆需求": { color: "#1F4C73", bg: "#EAF0F6" },
  "行銷需求": { color: "#2F6B5E", bg: "#EAF3F0" },
  "用戶需求": { color: "#6B5A2E", bg: "#F4F1E8" },
};

// 無空格識別字，跟資料庫 ReleaseStage enum 值一致（Prisma 對 enum 值的 @map 只作用於底層儲存，
// JS 端讀寫仍是無空格識別字，所以資料邏輯一律用這組，不要用帶空格的顯示文字）
export const STAGES = ["開發中", "QA測試中", "已進TestFlight", "已送審", "已上架"] as const;

// 畫面顯示用的文字（帶空格），只用於渲染文字，不能拿來比對資料
export const STAGE_LABEL: Record<string, string> = {
  "開發中": "開發中",
  "QA測試中": "QA 測試中",
  "已進TestFlight": "已進 TestFlight",
  "已送審": "已送審",
  "已上架": "已上架",
};

export const STAGE_STYLE: Record<string, [string, string, string]> = {
  "開發中": ["#2F6BA6", "#EAF0F6", "#C6D6E5"],
  "QA測試中": ["#6B5A2E", "#F4F1E8", "#DFD6BE"],
  "已進TestFlight": ["#4A4A7A", "#EEEEF5", "#CFCFE2"],
  "已送審": ["#8A5A2B", "#F7F0E9", "#E3D2C1"],
  "已上架": ["#3F7A52", "#F0F5F1", "#C9D9CD"],
};

export const FONT_TC = "'Noto Sans TC', sans-serif";
export const FONT_BASE = "'IBM Plex Sans', 'Noto Sans TC', sans-serif";

// 時程表節點種類，對應 schedule_notes.milestone_kind
export const MILESTONE_KINDS = ["qa", "testflight", "review", "release"] as const;
export type MilestoneKind = (typeof MILESTONE_KINDS)[number];

export const MILESTONE_LABEL: Record<MilestoneKind, string> = {
  qa: "開始測試",
  testflight: "進 TestFlight",
  review: "審核結果",
  release: "正式上線",
};

export const MILESTONE_COLOR: Record<MilestoneKind, string> = {
  qa: "#A07B22",
  testflight: "#4A4A7A",
  review: "#8A5A2B",
  release: "#3F7A52",
};
