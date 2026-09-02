import { prisma } from "./prisma";
import type { NextRequest } from "next/server";

// 全站「輸入姓名」身份機制：自由輸入，系統自動比對既有 users 或新增一筆。
// 不做密碼驗證，僅用於標記「誰做了這個寫入動作」（requirements.created_by_id）。
export async function getOrCreateUserByName(rawName: string) {
  const name = rawName.trim();
  if (!name) throw new Error("姓名不可為空");

  const existing = await prisma.user.findFirst({ where: { name } });
  if (existing) return existing;

  return prisma.user.create({ data: { name } });
}

// 寫入動作的 API 會從 header 讀取目前身份（前端把 sessionStorage 存的 userId 帶上）。
export function getActorId(req: NextRequest): string | null {
  return req.headers.get("x-actor-id");
}
