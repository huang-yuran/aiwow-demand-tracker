import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { statusOf, pctOf, sourceOf, versionsOf, toDevItemDTO } from "@/lib/rollup";
import { nextRequirementId } from "@/lib/idGen";
import { getActorId } from "@/lib/identity";
import { Priority } from "@prisma/client";

const VALID_PRIORITIES = new Set(Object.values(Priority));

// A2 需求列表：支援狀態篩選（規劃中/開發中/測試中/已完成）與來源分頁（老闆需求/行銷需求/用戶需求）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status"); // 全部 | 規劃中 | 開發中 | 測試中 | 已完成
  const sourceFilter = searchParams.get("source"); // 老闆需求 | 行銷需求 | 用戶需求

  const requirements = await prisma.requirement.findMany({
    include: { devItems: true, attachments: { orderBy: { createdAt: "asc" } } },
    orderBy: { id: "asc" },
  });

  let rows = requirements.map((r) => {
    const tasks = r.devItems.map(toDevItemDTO);
    return {
      id: r.id,
      title: r.title,
      theme: r.theme,
      origin: r.origin,
      originDate: r.originDate,
      requesterName: r.requesterName,
      priority: r.priority,
      note: r.note,
      createdAt: r.createdAt,
      tasks,
      status: statusOf(tasks),
      pct: pctOf(tasks),
      versions: versionsOf(tasks),
      source: sourceOf(r.requesterName),
      attachments: r.attachments.map((a) => ({
        id: a.id,
        url: a.url,
        fileName: a.fileName,
        mimeType: a.mimeType,
        size: a.size,
      })),
    };
  });

  if (statusFilter && statusFilter !== "全部") {
    rows = rows.filter((r) => r.status === statusFilter);
  }
  if (sourceFilter) {
    rows = rows.filter((r) => r.source === sourceFilter);
  }

  const all = requirements.map((r) => sourceOf(r.requesterName));
  const counts = {
    老闆需求: all.filter((s) => s === "老闆需求").length,
    行銷需求: all.filter((s) => s === "行銷需求").length,
    用戶需求: all.filter((s) => s === "用戶需求").length,
  };

  return NextResponse.json({ rows, counts });
}

// 新增需求（手動提出，非批次匯入）
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const theme = typeof body?.theme === "string" ? body.theme.trim() : "";
  const requesterName = typeof body?.requesterName === "string" ? body.requesterName.trim() : "";

  if (!title || !theme || !requesterName) {
    return NextResponse.json({ error: "需求描述、主題、提出人為必填" }, { status: 400 });
  }

  const priority = VALID_PRIORITIES.has(body?.priority) ? body.priority : Priority.中;
  const origin = typeof body?.origin === "string" && body.origin.trim() ? body.origin.trim() : null;
  const originDate = typeof body?.originDate === "string" && body.originDate ? new Date(body.originDate) : null;
  const note = typeof body?.note === "string" && body.note.trim() ? body.note.trim() : null;

  const id = await nextRequirementId();
  const requirement = await prisma.requirement.create({
    data: {
      id,
      title,
      theme,
      origin,
      originDate,
      requesterName,
      priority,
      note,
      createdById: getActorId(req),
    },
  });

  return NextResponse.json({ id: requirement.id }, { status: 201 });
}
