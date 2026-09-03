export type DevItemDTO = {
  id: string;
  content: string;
  plainText: string;
  feature: string | null;
  releaseVersion: string | null;
  seqNo: string | null;
  assigneeId: string | null;
  status: "尚未開始" | "進行中" | "待測試" | "已完成";
  updatedAt: string;
};

export type AttachmentDTO = {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
};

export type RequirementDTO = {
  id: string;
  title: string;
  theme: string;
  origin: string | null;
  originDate: string | null;
  requesterName: string;
  priority: "高" | "中" | "低";
  note: string | null;
  createdAt: string;
  tasks: DevItemDTO[];
  status: "規劃中" | "開發中" | "測試中" | "已完成" | "不開發" | "十月再討論";
  statusOverride: "規劃中" | "開發中" | "測試中" | "已完成" | "不開發" | "十月再討論" | null;
  notDevelopedReason: string | null;
  pct: number;
  versions: string[];
  source: "老闆需求" | "行銷需求" | "用戶需求";
  attachments: AttachmentDTO[];
};

export type ReleaseItemDTO = {
  id: string;
  seqNo: string | null;
  title: string;
  feature: string | null;
  status: string;
  reqId: string;
  reqTitle: string;
  reqSource: "老闆需求" | "行銷需求" | "用戶需求";
};

export type ReleaseCardDTO = {
  version: string;
  plannedDate: string | null;
  qaStartDate: string | null;
  testflightDate: string | null;
  reviewResultDate: string | null;
  stage: string | null;
  iosVersionName: string | null;
  androidVersionName: string | null;
  stateLabel: string;
  steps: { label: string; done: boolean; current: boolean }[];
  derivedStatus: string;
  items: ReleaseItemDTO[];
};

export type UserDTO = {
  id: string;
  name: string;
  role: string | null;
};

export type ImportPreviewRow = {
  rowIndex: number;
  title: string;
  theme: string;
  origin: string;
  requesterName: string;
  priority: string;
  note: string;
  issues: string[];
};

export type ScheduleMilestoneDTO = {
  date: string; // yyyy-mm-dd
  version: string;
  kind: "qa" | "testflight" | "review" | "release";
  label: string;
  note: string | null;
  daysFromToday: number;
};

export type ScheduleDTO = {
  current: { version: string; stage: string | null; nextStep: string | null } | null;
  range: { from: string; to: string };
  milestones: ScheduleMilestoneDTO[];
};
