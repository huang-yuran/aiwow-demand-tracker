import { prisma } from "./prisma";

export async function nextRequirementId(): Promise<string> {
  const last = await prisma.requirement.findMany({ orderBy: { id: "desc" }, take: 1 });
  const n = last.length === 0 ? 1 : Number(last[0].id.match(/(\d+)$/)?.[1] ?? 0) + 1;
  return `R-${String(n).padStart(3, "0")}`;
}

export async function nextDevItemId(): Promise<string> {
  const last = await prisma.devItem.findMany({ orderBy: { id: "desc" }, take: 1 });
  const n = last.length === 0 ? 1 : Number(last[0].id.match(/(\d+)$/)?.[1] ?? 0) + 1;
  return `D-${String(n).padStart(4, "0")}`;
}

// 版號前兩碼 + 該版本內流水序號（見 README「衍生規則」）；只往後接號，不重排既有項目
export async function nextSeqNo(releaseVersion: string | null): Promise<string> {
  const prefix = releaseVersion ? releaseVersion.replace(/^v/i, "").split(".").slice(0, 2).join("") : "TBD";
  const siblings = await prisma.devItem.findMany({
    where: { releaseVersion },
    select: { seqNo: true },
  });
  let maxN = 0;
  for (const s of siblings) {
    const m = s.seqNo?.match(/-(\d+)$/);
    if (m) maxN = Math.max(maxN, Number(m[1]));
  }
  return `${prefix}-${String(maxN + 1).padStart(2, "0")}`;
}
