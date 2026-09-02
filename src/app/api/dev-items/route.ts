import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nextDevItemId, nextSeqNo } from "@/lib/idGen";
import { ItemStatus } from "@prisma/client";

const VALID_STATUSES = new Set(Object.values(ItemStatus));

// 新增開發細項（一定屬於某個需求）
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const requirementId = typeof body?.requirementId === "string" ? body.requirementId : "";
  const plainText = typeof body?.plainText === "string" ? body.plainText.trim() : "";

  if (!requirementId || !plainText) {
    return NextResponse.json({ error: "所屬需求與白話描述為必填" }, { status: 400 });
  }

  const requirement = await prisma.requirement.findUnique({ where: { id: requirementId } });
  if (!requirement) {
    return NextResponse.json({ error: "找不到所屬需求" }, { status: 404 });
  }

  const releaseVersion = typeof body?.releaseVersion === "string" && body.releaseVersion ? body.releaseVersion : null;
  if (releaseVersion) {
    const release = await prisma.release.findUnique({ where: { version: releaseVersion } });
    if (!release) {
      return NextResponse.json({ error: "找不到指定的版本" }, { status: 400 });
    }
  }

  const status = VALID_STATUSES.has(body?.status) ? body.status : ItemStatus.尚未開始;
  const content = typeof body?.content === "string" && body.content.trim() ? body.content.trim() : plainText;
  const feature = typeof body?.feature === "string" && body.feature.trim() ? body.feature.trim() : null;
  const assigneeId = typeof body?.assigneeId === "string" && body.assigneeId ? body.assigneeId : null;

  const id = await nextDevItemId();
  const seqNo = await nextSeqNo(releaseVersion);

  const devItem = await prisma.devItem.create({
    data: {
      id,
      requirementId,
      content,
      plainText,
      feature,
      releaseVersion,
      seqNo,
      assigneeId,
      status,
    },
  });

  return NextResponse.json({ id: devItem.id }, { status: 201 });
}
