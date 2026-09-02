import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { statusOf, pctOf, sourceOf, versionsOf, toDevItemDTO } from "@/lib/rollup";
import { getActorId } from "@/lib/identity";
import { deleteAttachmentFile } from "@/lib/supabaseStorage";
import { Priority } from "@prisma/client";

const VALID_PRIORITIES = new Set(Object.values(Priority));

// 需求詳情側欄
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const r = await prisma.requirement.findUnique({
    where: { id },
    include: { devItems: true, attachments: { orderBy: { createdAt: "asc" } } },
  });

  if (!r) {
    return NextResponse.json({ error: "找不到這筆需求" }, { status: 404 });
  }

  const tasks = r.devItems.map(toDevItemDTO);

  return NextResponse.json({
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
  });
}

// 編輯需求
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "請求格式錯誤" }, { status: 400 });
  }

  const existing = await prisma.requirement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "找不到這筆需求" }, { status: 404 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  const theme = typeof body.theme === "string" ? body.theme.trim() : undefined;
  const requesterName = typeof body.requesterName === "string" ? body.requesterName.trim() : undefined;
  if (title === "" || theme === "" || requesterName === "") {
    return NextResponse.json({ error: "需求描述、主題、提出人不可為空" }, { status: 400 });
  }

  const priority = body.priority !== undefined
    ? (VALID_PRIORITIES.has(body.priority) ? body.priority : undefined)
    : undefined;

  await prisma.requirement.update({
    where: { id },
    data: {
      title,
      theme,
      requesterName,
      priority,
      origin: body.origin === undefined ? undefined : (body.origin || null),
      originDate: body.originDate === undefined ? undefined : (body.originDate ? new Date(body.originDate) : null),
      note: body.note === undefined ? undefined : (body.note || null),
    },
  });

  return NextResponse.json({ id });
}

// 刪除需求（連同底下的開發細項／Bug 一併刪除，前端已要求使用者再次輸入姓名確認）
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actorId = getActorId(req);
  if (!actorId) {
    return NextResponse.json({ error: "缺少身份資訊" }, { status: 400 });
  }

  const existing = await prisma.requirement.findUnique({
    where: { id },
    include: { attachments: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "找不到這筆需求" }, { status: 404 });
  }

  await Promise.all(existing.attachments.map((a) => deleteAttachmentFile(a.path)));
  await prisma.requirement.delete({ where: { id } });

  return NextResponse.json({ deleted: id });
}
