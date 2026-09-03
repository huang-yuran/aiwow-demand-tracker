import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MILESTONE_LABEL } from "@/lib/designTokens";
import { scheduleRange, pickCurrentRelease, extractMilestones, daysBetween } from "@/lib/schedule";

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// 時程表首頁：今天在哪一版、下一步是什麼，以及未來兩週會影響上線的節點
export async function GET() {
  const releases = await prisma.release.findMany();
  const { from, to } = scheduleRange();

  const current = pickCurrentRelease(releases);
  const milestones = extractMilestones(releases, from, to);

  const versions = Array.from(new Set(milestones.map((m) => m.version)));
  const kinds = Array.from(new Set(milestones.map((m) => m.kind)));
  const notes = versions.length > 0
    ? await prisma.scheduleNote.findMany({
        where: { releaseVersion: { in: versions }, milestoneKind: { in: kinds } },
      })
    : [];
  const noteMap = new Map(notes.map((n) => [`${n.releaseVersion}:${n.milestoneKind}`, n.note]));

  const today = new Date();

  return NextResponse.json({
    current: current ? { version: current.version, stage: current.stage, nextStep: current.nextStepNote } : null,
    range: { from: toDateOnly(from), to: toDateOnly(to) },
    milestones: milestones.map((m) => ({
      date: toDateOnly(m.date),
      version: m.version,
      kind: m.kind,
      label: MILESTONE_LABEL[m.kind],
      note: noteMap.get(`${m.version}:${m.kind}`) ?? null,
      daysFromToday: daysBetween(today, m.date),
    })),
  });
}
