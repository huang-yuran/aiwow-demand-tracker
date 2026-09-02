import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseOrigin, type ImportRow } from "@/lib/importParsing";
import { getActorId } from "@/lib/identity";
import { nextRequirementId } from "@/lib/idGen";
import { Priority } from "@prisma/client";

const VALID_PRIORITIES = new Set(Object.values(Priority));

// 批次寫入需求（匯入後狀態一律規劃中：不建立 dev_items；版本留空由 PM 排定）
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const rows: ImportRow[] | undefined = body?.rows;
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "沒有可匯入的資料" }, { status: 400 });
  }

  const actorId = getActorId(req);

  const created = [];
  for (const row of rows) {
    if (!row.title || !row.theme || !row.requesterName) continue; // 必填缺漏的列不寫入
    const { originText, originDate } = parseOrigin(row.origin);
    const priority = VALID_PRIORITIES.has(row.priority as Priority) ? (row.priority as Priority) : Priority.中;

    const id = await nextRequirementId();

    const requirement = await prisma.requirement.create({
      data: {
        id,
        title: row.title,
        theme: row.theme,
        origin: originText,
        originDate,
        requesterName: row.requesterName,
        priority,
        note: row.note || null,
        createdById: actorId,
      },
    });
    created.push(requirement.id);
  }

  return NextResponse.json({ importedCount: created.length, ids: created });
}
