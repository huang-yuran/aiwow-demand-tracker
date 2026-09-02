// 解析「源自於」欄位，例如 "20260902 群組回報" -> { originDate: 2026-09-02, originText: "群組回報" }
export function parseOrigin(raw: string | undefined | null): { originText: string | null; originDate: Date | null; missingDate: boolean } {
  const value = (raw ?? "").trim();
  if (!value) return { originText: null, originDate: null, missingDate: false };

  const match = value.match(/^(\d{8})\s*(.*)$/);
  if (match) {
    const [, ymd, rest] = match;
    const year = Number(ymd.slice(0, 4));
    const month = Number(ymd.slice(4, 6));
    const day = Number(ymd.slice(6, 8));
    const date = new Date(Date.UTC(year, month - 1, day));
    return { originText: rest.trim() || value, originDate: date, missingDate: false };
  }
  return { originText: value, originDate: null, missingDate: true };
}

export type ImportRow = {
  rowIndex: number;
  title: string;
  theme: string;
  origin: string;
  requesterName: string;
  priority: string;
  note: string;
};

export type ImportPreviewRow = ImportRow & {
  issues: string[];
};

const VALID_PRIORITIES = new Set(["高", "中", "低"]);

export function validateRow(row: ImportRow): ImportPreviewRow {
  const issues: string[] = [];
  if (!row.title) issues.push("缺需求描述");
  if (!row.theme) issues.push("缺主題");
  if (!row.requesterName) issues.push("缺提出人");
  const { missingDate, originText } = parseOrigin(row.origin);
  if (originText && missingDate) issues.push("缺來源日期");
  if (row.priority && !VALID_PRIORITIES.has(row.priority)) issues.push("優先級格式不正確");
  return { ...row, issues };
}
