import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { statusOf, sourceOf, releaseSteps } from "@/lib/rollup";
import { STAGES } from "@/lib/designTokens";
import type { ReleaseStage } from "@prisma/client";

const VALID_STAGES = new Set<string>(STAGES);

function compareVersions(a: string, b: string) {
  const pa = a.replace(/^v/i, "").split(".").map(Number);
  const pb = b.replace(/^v/i, "").split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

// A1 版本視圖：依版本分組的細項清單＋對應需求（含未排定版本）
export async function GET() {
  const [releases, devItems] = await Promise.all([
    prisma.release.findMany(),
    prisma.devItem.findMany({ include: { requirement: true }, orderBy: { seqNo: "asc" } }),
  ]);

  const byVersion = new Map<string | null, typeof devItems>();
  for (const item of devItems) {
    const key = item.releaseVersion;
    if (!byVersion.has(key)) byVersion.set(key, []);
    byVersion.get(key)!.push(item);
  }

  function buildCard(
    version: string | null,
    stage: string | null,
    plannedDate: Date | null,
    iosVersionName: string | null = null,
    androidVersionName: string | null = null
  ) {
    const items = (byVersion.get(version) ?? []).map((item) => ({
      id: item.id,
      seqNo: item.seqNo,
      title: item.plainText,
      feature: item.feature,
      status: item.status,
      reqId: item.requirement.id,
      reqTitle: item.requirement.title,
      reqSource: sourceOf(item.requirement.requesterName),
    }));
    const statuses = items.map((i) => ({ status: i.status }));
    return {
      version: version ?? "未排定",
      plannedDate,
      stage,
      iosVersionName,
      androidVersionName,
      stateLabel: `${items.length} 筆`,
      steps: releaseSteps(stage),
      derivedStatus: statusOf(statuses),
      items,
    };
  }

  // 不管版本狀態，純依版號新到舊排（由上到下＝離現在近到遠）；未排定放最後
  const sorted = releases.slice().sort((a, b) => compareVersions(b.version, a.version));

  const cards = sorted.map((r) => buildCard(r.version, r.stage, r.plannedDate, r.iosVersionName, r.androidVersionName));
  if (byVersion.has(null)) {
    cards.push(buildCard(null, null, null));
  }

  return NextResponse.json({ versions: cards });
}

// 新增版本
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const version = typeof body?.version === "string" ? body.version.trim() : "";
  if (!version) {
    return NextResponse.json({ error: "版本名稱不可為空" }, { status: 400 });
  }
  if (version === "未排定") {
    return NextResponse.json({ error: "「未排定」是保留名稱，請換一個版本名稱" }, { status: 400 });
  }

  const existing = await prisma.release.findUnique({ where: { version } });
  if (existing) {
    return NextResponse.json({ error: "已有相同名稱的版本" }, { status: 409 });
  }

  let stage: ReleaseStage | null = null;
  if (typeof body.stage === "string" && body.stage) {
    if (!VALID_STAGES.has(body.stage)) {
      return NextResponse.json({ error: "版本狀態不正確" }, { status: 400 });
    }
    stage = body.stage as ReleaseStage;
  }

  const release = await prisma.release.create({
    data: {
      version,
      stage,
      iosVersionName: typeof body.iosVersionName === "string" && body.iosVersionName.trim() ? body.iosVersionName.trim() : null,
      androidVersionName: typeof body.androidVersionName === "string" && body.androidVersionName.trim() ? body.androidVersionName.trim() : null,
    },
  });

  return NextResponse.json({ version: release.version }, { status: 201 });
}
