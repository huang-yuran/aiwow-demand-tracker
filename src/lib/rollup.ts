import type { DevItem, Release } from "@prisma/client";
import { STAGES } from "./designTokens";

// 與 prisma/migrations/.../requirement_rollup view 邏輯保持一致（README「衍生規則」）。

export type ReqStatus = "規劃中" | "開發中" | "測試中" | "已完成" | "不開發" | "十月再討論";

export const REQ_STATUSES: ReqStatus[] = ["規劃中", "開發中", "測試中", "已完成", "不開發", "十月再討論"];

export function statusOf(tasks: { status: string }[], statusOverride?: string | null): ReqStatus {
  if (statusOverride) return statusOverride as ReqStatus;
  if (tasks.length === 0) return "規劃中";
  if (tasks.every((t) => t.status === "已完成")) return "已完成";
  if (tasks.some((t) => t.status === "待測試") && !tasks.some((t) => t.status === "進行中")) return "測試中";
  if (tasks.some((t) => t.status !== "尚未開始")) return "開發中";
  return "規劃中";
}

export function pctOf(tasks: { status: string }[]): number {
  if (tasks.length === 0) return 0;
  const weight: Record<string, number> = { "已完成": 1, "待測試": 0.8, "進行中": 0.4, "尚未開始": 0 };
  const sum = tasks.reduce((a, t) => a + (weight[t.status] ?? 0), 0);
  return Math.round((sum / tasks.length) * 100);
}

const MARKETING_REQUESTERS = new Set(["MQ", "V"]);

export function sourceOf(requesterName: string): "老闆需求" | "行銷需求" | "用戶需求" {
  if (requesterName === "老闆") return "老闆需求";
  if (MARKETING_REQUESTERS.has(requesterName)) return "行銷需求";
  return "用戶需求";
}

export function versionsOf(tasks: { releaseVersion: string | null }[]): string[] {
  return Array.from(new Set(tasks.map((t) => t.releaseVersion).filter((v): v is string => !!v)));
}

export function nextVersionOf(tasks: { status: string; releaseVersion: string | null }[]): string {
  const pending = tasks
    .filter((t) => t.status !== "已完成" && t.releaseVersion)
    .map((t) => t.releaseVersion as string)
    .sort();
  return pending[0] ?? "已全數上線";
}

export function versionPrefix(version: string | null): string {
  if (!version) return "TBD";
  const body = version.replace(/^v/i, "");
  const parts = body.split(".");
  return `${parts[0]}${parts[1] ?? ""}`;
}

export function releaseSteps(stage: string | null) {
  const sIdx = stage ? STAGES.indexOf(stage as (typeof STAGES)[number]) : -1;
  return STAGES.map((label, i) => ({
    label,
    done: i < sIdx,
    current: i === sIdx,
  }));
}

export type DevItemDTO = ReturnType<typeof toDevItemDTO>;
export function toDevItemDTO(item: DevItem) {
  return {
    id: item.id,
    content: item.content,
    plainText: item.plainText,
    feature: item.feature,
    releaseVersion: item.releaseVersion,
    seqNo: item.seqNo,
    assigneeId: item.assigneeId,
    status: item.status,
    updatedAt: item.updatedAt,
  };
}

export function toReleaseDTO(release: Release) {
  return {
    version: release.version,
    plannedDate: release.plannedDate,
    stage: release.stage,
  };
}
