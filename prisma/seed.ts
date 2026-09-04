import { PrismaClient, Priority, ItemStatus, BugStatus, Severity, ReleaseStage, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

// 版號前兩碼 + 版本內兩位序號，例：v1.2.0.24 → '12'；未排定版本 → 'TBD'
function versionPrefix(version: string | null): string {
  if (!version) return "TBD";
  const parts = version.replace(/^v/, "").split(".");
  return `${parts[0]}${parts[1]}`;
}

async function main() {
  await prisma.bug.deleteMany();
  await prisma.devItem.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.release.deleteMany();
  await prisma.user.deleteMany();

  const [boss, pm, rdWang, rdLee, qaLin] = await Promise.all([
    prisma.user.create({ data: { name: "老闆", role: UserRole.boss } }),
    prisma.user.create({ data: { name: "陳品柔", role: UserRole.pm } }),
    prisma.user.create({ data: { name: "王大明", role: UserRole.rd } }),
    prisma.user.create({ data: { name: "李小華", role: UserRole.rd } }),
    prisma.user.create({ data: { name: "林佳玲", role: UserRole.qa } }),
  ]);

  const [v1, v2, v3] = await Promise.all([
    prisma.release.create({
      data: { version: "v1.2.0.24", plannedDate: new Date("2026-08-15"), stage: ReleaseStage.上架 },
    }),
    prisma.release.create({
      data: { version: "v1.3.0.5", plannedDate: new Date("2026-09-20"), stage: ReleaseStage.上版進測試 },
    }),
    prisma.release.create({
      data: { version: "v1.4.0.1", plannedDate: new Date("2026-10-30"), stage: ReleaseStage.開發中 },
    }),
  ]);

  const seqCounters: Record<string, number> = {};
  function nextSeqNo(version: string | null): string {
    const prefix = versionPrefix(version);
    seqCounters[prefix] = (seqCounters[prefix] ?? 0) + 1;
    return `${prefix}-${String(seqCounters[prefix]).padStart(2, "0")}`;
  }

  const requirements: {
    id: string;
    title: string;
    theme: string;
    origin: string;
    originDate: Date;
    requesterName: string;
    priority: Priority;
    note?: string;
    createdById: string | null;
    devItems: {
      content: string;
      plainText: string;
      feature: string;
      releaseVersion: string | null;
      assigneeId: string | null;
      status: ItemStatus;
    }[];
  }[] = [
    {
      id: "R-001",
      title: "推播通知常常晚到，希望即時送達",
      theme: "通知",
      origin: "群組回報",
      originDate: new Date("2026-07-02"),
      requesterName: "老闆",
      priority: Priority.高,
      note: "客訴反映延遲最長超過 10 分鐘",
      createdById: pm.id,
      devItems: [
        { content: "改用 FCM 高優先權頻道並調整重試策略", plainText: "重新串接推播服務，縮短送達延遲", feature: "推播通知", releaseVersion: v1.version, assigneeId: rdWang.id, status: ItemStatus.已完成 },
        { content: "補上推播送達率監控儀表板", plainText: "後台可看到通知有沒有準時送出", feature: "推播通知", releaseVersion: v1.version, assigneeId: rdWang.id, status: ItemStatus.已完成 },
      ],
    },
    {
      id: "R-002",
      title: "首頁改版，讓熱門功能更好找",
      theme: "首頁",
      origin: "用戶訪談",
      originDate: new Date("2026-07-10"),
      requesterName: "營運部",
      priority: Priority.中,
      createdById: pm.id,
      devItems: [
        { content: "首頁 Hero 區塊改版與 A/B 測試埋點", plainText: "首頁最上面的主視覺換新設計", feature: "首頁改版", releaseVersion: v1.version, assigneeId: rdLee.id, status: ItemStatus.已完成 },
        { content: "熱門功能捷徑列元件開發", plainText: "首頁新增常用功能捷徑列", feature: "首頁改版", releaseVersion: v2.version, assigneeId: rdLee.id, status: ItemStatus.進行中 },
        { content: "首頁個人化推薦演算法串接", plainText: "根據使用習慣顯示推薦內容", feature: "首頁改版", releaseVersion: v3.version, assigneeId: rdWang.id, status: ItemStatus.尚未開始 },
      ],
    },
    {
      id: "R-003",
      title: "客服工單處理效率太慢，需要優化流程",
      theme: "客服",
      origin: "客服部週會",
      originDate: new Date("2026-07-15"),
      requesterName: "客服部",
      priority: Priority.高,
      createdById: pm.id,
      devItems: [
        { content: "工單自動分派規則引擎", plainText: "客服工單會自動分給對的人處理", feature: "客服工單", releaseVersion: v2.version, assigneeId: rdWang.id, status: ItemStatus.待測試 },
        { content: "工單狀態變更通知串接", plainText: "工單有進度會自動通知客服", feature: "客服工單", releaseVersion: v2.version, assigneeId: rdWang.id, status: ItemStatus.待測試 },
      ],
    },
    {
      id: "R-004",
      title: "老闆想在後台直接看營收報表，不用等月報",
      theme: "報表",
      origin: "老闆口頭交辦",
      originDate: new Date("2026-07-18"),
      requesterName: "老闆",
      priority: Priority.中,
      createdById: null,
      devItems: [
        { content: "營收報表資料彙總排程與快取設計", plainText: "後台可以即時看到營收數字", feature: "營收報表", releaseVersion: v2.version, assigneeId: rdLee.id, status: ItemStatus.進行中 },
        { content: "報表匯出 Excel 功能", plainText: "報表可以一鍵下載成 Excel", feature: "營收報表", releaseVersion: v3.version, assigneeId: rdLee.id, status: ItemStatus.尚未開始 },
      ],
    },
    {
      id: "R-005",
      title: "母親節檔期想加一個限時活動頁",
      theme: "行銷",
      origin: "行銷部提案",
      originDate: new Date("2026-08-01"),
      requesterName: "行銷部",
      priority: Priority.低,
      note: "檔期未定，先開發項目卡位",
      createdById: pm.id,
      devItems: [
        { content: "活動頁樣板與後台可編輯區塊開發", plainText: "做一個可以重複使用的活動頁樣板", feature: "行銷活動頁", releaseVersion: v3.version, assigneeId: rdLee.id, status: ItemStatus.尚未開始 },
        { content: "活動頁流量追蹤埋點", plainText: "可以看到活動頁有多少人瀏覽", feature: "行銷活動頁", releaseVersion: null, assigneeId: null, status: ItemStatus.尚未開始 },
      ],
    },
    {
      id: "R-006",
      title: "APP 冷啟動速度太慢，用戶反映常常要等",
      theme: "效能",
      origin: "20260828 群組回報",
      originDate: new Date("2026-08-28"),
      requesterName: "客服部",
      priority: Priority.中,
      createdById: pm.id,
      devItems: [],
    },
    {
      id: "R-007",
      title: "希望能支援 Apple Pay 付款",
      theme: "付款",
      origin: "老闆口頭交辦",
      originDate: new Date("2026-06-20"),
      requesterName: "老闆",
      priority: Priority.高,
      createdById: pm.id,
      devItems: [
        { content: "串接 Apple Pay SDK 與金流驗證", plainText: "結帳頁新增 Apple Pay 選項", feature: "付款方式", releaseVersion: v1.version, assigneeId: rdWang.id, status: ItemStatus.已完成 },
      ],
    },
    {
      id: "R-008",
      title: "會員等級規則要跟著新的行銷方案調整",
      theme: "會員",
      origin: "營運部提案",
      originDate: new Date("2026-07-25"),
      requesterName: "營運部",
      priority: Priority.中,
      createdById: pm.id,
      devItems: [
        { content: "會員等級門檻與權益設定改版", plainText: "調整升等所需消費金額與贈品", feature: "會員等級", releaseVersion: v1.version, assigneeId: rdLee.id, status: ItemStatus.已完成 },
        { content: "會員等級異動通知信模板", plainText: "升等/降等會寄信通知會員", feature: "會員等級", releaseVersion: v2.version, assigneeId: rdLee.id, status: ItemStatus.待測試 },
        { content: "會員中心等級進度條元件", plainText: "會員中心顯示目前等級進度", feature: "會員等級", releaseVersion: v2.version, assigneeId: rdLee.id, status: ItemStatus.待測試 },
      ],
    },
    {
      id: "R-009",
      title: "客服想要一個內部知識庫搜尋功能",
      theme: "客服",
      origin: "客服部週會",
      originDate: new Date("2026-08-05"),
      requesterName: "客服部",
      priority: Priority.中,
      createdById: pm.id,
      devItems: [
        { content: "知識庫全文檢索索引建置", plainText: "客服後台可以搜尋知識庫文章", feature: "知識庫", releaseVersion: v2.version, assigneeId: rdWang.id, status: ItemStatus.進行中 },
        { content: "知識庫搜尋結果排序優化", plainText: "搜尋結果會依照相關度排序", feature: "知識庫", releaseVersion: v2.version, assigneeId: rdWang.id, status: ItemStatus.進行中 },
        { content: "知識庫文章標籤分類功能", plainText: "文章可以加標籤方便分類", feature: "知識庫", releaseVersion: v1.version, assigneeId: rdWang.id, status: ItemStatus.已完成 },
      ],
    },
    {
      id: "R-010",
      title: "APP 圖片載入太慢，想全面優化效能",
      theme: "效能",
      origin: "老闆口頭交辦",
      originDate: new Date("2026-06-10"),
      requesterName: "老闆",
      priority: Priority.低,
      createdById: null,
      devItems: [
        { content: "圖片 CDN 與 WebP 轉換導入", plainText: "圖片改用更快的技術載入", feature: "效能優化", releaseVersion: v1.version, assigneeId: rdWang.id, status: ItemStatus.已完成 },
        { content: "圖片延遲載入（lazy load）全站導入", plainText: "捲動到才載入圖片，加快開頁速度", feature: "效能優化", releaseVersion: v2.version, assigneeId: rdWang.id, status: ItemStatus.已完成 },
      ],
    },
  ];

  let devItemSeq = 1;
  for (const req of requirements) {
    await prisma.requirement.create({
      data: {
        id: req.id,
        title: req.title,
        theme: req.theme,
        origin: req.origin,
        originDate: req.originDate,
        requesterName: req.requesterName,
        priority: req.priority,
        note: req.note,
        createdById: req.createdById,
      },
    });

    for (const item of req.devItems) {
      const id = `D-${String(devItemSeq).padStart(4, "0")}`;
      devItemSeq += 1;
      await prisma.devItem.create({
        data: {
          id,
          requirementId: req.id,
          content: item.content,
          plainText: item.plainText,
          feature: item.feature,
          releaseVersion: item.releaseVersion,
          seqNo: nextSeqNo(item.releaseVersion),
          assigneeId: item.assigneeId,
          status: item.status,
        },
      });
    }
  }

  const devItemsForBugs = await prisma.devItem.findMany({
    where: { status: { in: [ItemStatus.待測試, ItemStatus.進行中] } },
    take: 5,
  });

  const bugSeeds: { description: string; steps: string; severity: Severity; status: BugStatus }[] = [
    { description: "工單分派後通知未即時送出", steps: "1. 建立新工單 2. 指派給客服 3. 等待通知", severity: Severity.中, status: BugStatus.待處理 },
    { description: "會員等級進度條在小螢幕跑版", steps: "1. 用手機開啟會員中心 2. 觀察進度條", severity: Severity.輕微, status: BugStatus.處理中 },
    { description: "知識庫搜尋中文關鍵字有時查無結果", steps: "1. 搜尋常見中文詞 2. 比對預期文章", severity: Severity.嚴重, status: BugStatus.處理中 },
    { description: "首頁捷徑列在 iOS 偶爾閃退", steps: "1. 開啟首頁 2. 點擊捷徑列多次", severity: Severity.嚴重, status: BugStatus.待處理 },
    { description: "營收報表數字偶爾與後台對不上", steps: "1. 開啟報表頁 2. 對照後台原始數字", severity: Severity.中, status: BugStatus.已修復待驗證 },
  ];

  for (let i = 0; i < devItemsForBugs.length; i++) {
    const seed = bugSeeds[i];
    await prisma.bug.create({
      data: {
        id: `B-${String(i + 1).padStart(4, "0")}`,
        devItemId: devItemsForBugs[i].id,
        description: seed.description,
        steps: seed.steps,
        severity: seed.severity,
        status: seed.status,
        reporterId: qaLin.id,
        assigneeId: devItemsForBugs[i].assigneeId,
      },
    });
  }

  console.log(`Seeded: ${requirements.length} requirements, ${devItemSeq - 1} dev items, 3 releases, ${devItemsForBugs.length} bugs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
