import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ReleaseStage } from "@prisma/client";
import { STAGES } from "@/lib/designTokens";

const VALID_STAGES = new Set<string>(STAGES);

// 編輯版本：版本名稱（重新命名 PK，底下 dev_items 會自動連動更新）、發布階段、iOS/Android 版本名稱
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "請求格式錯誤" }, { status: 400 });
  }

  const existing = await prisma.release.findUnique({ where: { version } });
  if (!existing) {
    return NextResponse.json({ error: "找不到這個版本" }, { status: 404 });
  }

  const newVersion = typeof body.version === "string" ? body.version.trim() : undefined;
  if (newVersion !== undefined && !newVersion) {
    return NextResponse.json({ error: "版本名稱不可為空" }, { status: 400 });
  }
  if (newVersion && newVersion !== version) {
    const conflict = await prisma.release.findUnique({ where: { version: newVersion } });
    if (conflict) {
      return NextResponse.json({ error: "已有相同名稱的版本" }, { status: 409 });
    }
  }

  let stage: ReleaseStage | null | undefined = undefined;
  if (body.stage === null) {
    stage = null;
  } else if (typeof body.stage === "string") {
    if (!VALID_STAGES.has(body.stage)) {
      return NextResponse.json({ error: "版本狀態不正確" }, { status: 400 });
    }
    stage = body.stage as ReleaseStage;
  }

  const updated = await prisma.release.update({
    where: { version },
    data: {
      version: newVersion ?? undefined,
      stage,
      iosVersionName: body.iosVersionName === undefined ? undefined : (body.iosVersionName || null),
      androidVersionName: body.androidVersionName === undefined ? undefined : (body.androidVersionName || null),
    },
  });

  return NextResponse.json({
    version: updated.version,
    stage: updated.stage,
    plannedDate: updated.plannedDate,
    iosVersionName: updated.iosVersionName,
    androidVersionName: updated.androidVersionName,
  });
}
