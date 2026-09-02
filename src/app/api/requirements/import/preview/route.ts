import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { validateRow, type ImportRow } from "@/lib/importParsing";

// 逐列解析＋驗證，不寫入資料庫（對應 UI 的 preview 步驟）
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "請提供檔案" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const rows: ImportRow[] = raw.map((r, i) => ({
    rowIndex: i + 1,
    title: String(r["需求描述"] ?? "").trim(),
    theme: String(r["主題"] ?? "").trim(),
    origin: String(r["源自於"] ?? "").trim(),
    requesterName: String(r["提出人"] ?? "").trim(),
    priority: String(r["優先級"] ?? "").trim(),
    note: String(r["補充說明"] ?? "").trim(),
  }));

  const preview = rows
    .filter((r) => r.title || r.theme || r.origin || r.requesterName || r.priority || r.note)
    .map(validateRow);

  return NextResponse.json({ fileName: file.name, count: preview.length, rows: preview });
}
