import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nextSeqNo } from "@/lib/idGen";
import { ItemStatus } from "@prisma/client";

const VALID_STATUSES = new Set(Object.values(ItemStatus));

// 編輯開發細項；若版本被改到不同版本，會重新在新版本後面接號，不去動舊版本其他項目的號碼
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "請求格式錯誤" }, { status: 400 });
  }

  const existing = await prisma.devItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "找不到這筆開發細項" }, { status: 404 });
  }

  const plainText = typeof body.plainText === "string" ? body.plainText.trim() : undefined;
  if (plainText === "") {
    return NextResponse.json({ error: "白話描述不可為空" }, { status: 400 });
  }

  let releaseVersion: string | null | undefined = undefined;
  let seqNo: string | undefined = undefined;
  if (body.releaseVersion !== undefined) {
    const newVersion: string | null = body.releaseVersion || null;
    if (newVersion) {
      const release = await prisma.release.findUnique({ where: { version: newVersion } });
      if (!release) {
        return NextResponse.json({ error: "找不到指定的版本" }, { status: 400 });
      }
    }
    if (newVersion !== existing.releaseVersion) {
      seqNo = await nextSeqNo(newVersion);
    }
    releaseVersion = newVersion;
  }

  const status = body.status !== undefined
    ? (VALID_STATUSES.has(body.status) ? body.status : undefined)
    : undefined;

  await prisma.devItem.update({
    where: { id },
    data: {
      plainText,
      content: typeof body.content === "string" ? (body.content.trim() || plainText || existing.plainText) : undefined,
      feature: body.feature === undefined ? undefined : (body.feature || null),
      releaseVersion,
      seqNo,
      assigneeId: body.assigneeId === undefined ? undefined : (body.assigneeId || null),
      status,
    },
  });

  return NextResponse.json({ id });
}
