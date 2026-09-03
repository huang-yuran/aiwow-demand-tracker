import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActorId } from "@/lib/identity";
import { MILESTONE_KINDS } from "@/lib/designTokens";

const VALID_KINDS = new Set<string>(MILESTONE_KINDS);

// 時程表節點備註：以（版本＋節點種類）為鍵，PM 調整節點日期後備註仍跟著同一個節點走
export async function PUT(req: NextRequest, { params }: { params: Promise<{ version: string; kind: string }> }) {
  const { version, kind } = await params;
  if (!VALID_KINDS.has(kind)) {
    return NextResponse.json({ error: "節點種類不正確" }, { status: 400 });
  }

  const release = await prisma.release.findUnique({ where: { version } });
  if (!release) {
    return NextResponse.json({ error: "找不到這個版本" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const note = typeof body?.note === "string" && body.note.trim() ? body.note.trim() : null;
  const updatedById = getActorId(req);

  await prisma.scheduleNote.upsert({
    where: { releaseVersion_milestoneKind: { releaseVersion: version, milestoneKind: kind } },
    create: { releaseVersion: version, milestoneKind: kind, note, updatedById },
    update: { note, updatedById },
  });

  return NextResponse.json({ version, kind, note });
}
