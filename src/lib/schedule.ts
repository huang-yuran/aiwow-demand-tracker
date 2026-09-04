import { MILESTONE_KINDS, type MilestoneKind } from "./designTokens";

// 所有日期都是 @db.Date（無時區的曆日），一律用 UTC 方法運算，避免伺服器本地時區把日期推前/推後一天。
function startOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

function daysBetween(from: Date, to: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY);
}

// 區間 = 今天 00:00 起算 14 天（含今天），例「9/3 – 9/16」
export function scheduleRange(today: Date = new Date()) {
  const from = startOfDay(today);
  const to = addDays(from, 13);
  return { from, to };
}

type ReleaseForCurrent = { stage: string | null; plannedDate: Date | null };

// 「目前版本」：stage 非 NULL 且非「上架」、planned_date 最近的一筆；若全部上架，取最近上架的一筆。
export function pickCurrentRelease<T extends ReleaseForCurrent>(releases: T[]): T | null {
  const inProgress = releases
    .filter((r) => r.stage !== null && r.stage !== "上架")
    .sort((a, b) => {
      const at = a.plannedDate ? a.plannedDate.getTime() : Infinity;
      const bt = b.plannedDate ? b.plannedDate.getTime() : Infinity;
      return at - bt;
    });
  if (inProgress.length > 0) return inProgress[0];

  const released = releases
    .filter((r) => r.stage === "上架")
    .sort((a, b) => {
      const at = a.plannedDate ? a.plannedDate.getTime() : -Infinity;
      const bt = b.plannedDate ? b.plannedDate.getTime() : -Infinity;
      return bt - at;
    });
  return released[0] ?? null;
}

type ReleaseForMilestones = {
  version: string;
  qaStartDate: Date | null;
  testflightDate: Date | null;
  reviewResultDate: Date | null;
  plannedDate: Date | null;
};

export type Milestone = { date: Date; version: string; kind: MilestoneKind };

const MILESTONE_DATE_FIELD: Record<MilestoneKind, keyof ReleaseForMilestones> = {
  qa: "qaStartDate",
  testflight: "testflightDate",
  review: "reviewResultDate",
  release: "plannedDate",
};

// 節點來自 releases 的排程日期欄位，落在區間內者依日期排序；已過期（日期 < 今天）的節點不顯示。
export function extractMilestones(releases: ReleaseForMilestones[], from: Date, to: Date): Milestone[] {
  const list: Milestone[] = [];
  for (const r of releases) {
    for (const kind of MILESTONE_KINDS) {
      const raw = r[MILESTONE_DATE_FIELD[kind]] as Date | null;
      if (!raw) continue;
      const date = startOfDay(raw);
      if (date.getTime() >= from.getTime() && date.getTime() <= to.getTime()) {
        list.push({ date, version: r.version, kind });
      }
    }
  }
  list.sort((a, b) => a.date.getTime() - b.date.getTime());
  return list;
}

export { daysBetween };
