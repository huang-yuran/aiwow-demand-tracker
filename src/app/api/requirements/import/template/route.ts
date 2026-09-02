import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

// 下載匯入範本：需求描述、主題、源自於、提出人、優先級、補充說明
export async function GET() {
  const header = ["需求描述", "主題", "源自於", "提出人", "優先級", "補充說明"];
  const example = ["結帳頁希望能記住上次用的付款方式", "付款", "20260902 群組回報", "營運部", "中", "可匯入"];

  const ws = XLSX.utils.aoa_to_sheet([header, example]);
  ws["!cols"] = [{ wch: 36 }, { wch: 10 }, { wch: 18 }, { wch: 12 }, { wch: 8 }, { wch: 24 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "需求匯入範本");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  const encodedName = encodeURIComponent("需求匯入範本.xlsx");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="template.xlsx"; filename*=UTF-8''${encodedName}`,
    },
  });
}
