import { PrismaClient, ItemStatus, ReleaseStage } from "@prisma/client";
import fs from "node:fs";

const prisma = new PrismaClient();

type FinalItem = {
  source: string;
  version: string | null;
  theme: string;
  title: string;
  status: string;
  note: string | null;
};

const STATUS_MAP: Record<string, ItemStatus> = {
  "尚未開始": ItemStatus.尚未開始,
  "進行中": ItemStatus.進行中,
  "待測試": ItemStatus.待測試,
  "已完成": ItemStatus.已完成,
};

const OLD_VERSIONS = new Set(["V1.1.1", "V1.1.2", "V1.1.3", "V1.1.3.1"]);

function versionPrefix(version: string | null): string {
  if (!version) return "TBD";
  const parts = version.replace(/^V/i, "").split(".");
  return `${parts[0]}${parts[1]}`;
}

async function main() {
  const raw = fs.readFileSync(
    "/private/tmp/claude-501/-Users-huangyuran-Desktop------------/522a4e6b-ff33-4a54-84a4-40ffff186a25/scratchpad/final_import.json",
    "utf-8"
  );
  const items: FinalItem[] = JSON.parse(raw);

  await prisma.bug.deleteMany();
  await prisma.devItem.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.release.deleteMany();

  const versions = Array.from(new Set(items.map((i) => i.version).filter((v): v is string => !!v))).sort();
  for (const v of versions) {
    await prisma.release.create({
      data: {
        version: v,
        stage: OLD_VERSIONS.has(v) ? ReleaseStage.已上架 : ReleaseStage.開發中,
      },
    });
  }
  console.log(`Created ${versions.length} releases:`, versions);

  const seqCounters: Record<string, number> = {};
  function nextSeqNo(version: string | null): string {
    const prefix = versionPrefix(version);
    seqCounters[prefix] = (seqCounters[prefix] ?? 0) + 1;
    return `${prefix}-${String(seqCounters[prefix]).padStart(2, "0")}`;
  }

  let seq = 1;
  for (const item of items) {
    const reqId = `R-${String(seq).padStart(3, "0")}`;
    const devId = `D-${String(seq).padStart(4, "0")}`;
    seq += 1;

    await prisma.requirement.create({
      data: {
        id: reqId,
        title: item.title,
        theme: item.theme,
        origin: `Excel 匯入 - ${item.source}`,
        requesterName: "產品部",
        note: item.note,
      },
    });

    await prisma.devItem.create({
      data: {
        id: devId,
        requirementId: reqId,
        content: item.title,
        plainText: item.title,
        feature: item.theme,
        releaseVersion: item.version,
        seqNo: nextSeqNo(item.version),
        status: STATUS_MAP[item.status] ?? ItemStatus.尚未開始,
      },
    });
  }

  console.log(`Imported ${items.length} requirement + dev item pairs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
