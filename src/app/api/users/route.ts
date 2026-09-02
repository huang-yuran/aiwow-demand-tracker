import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 使用者清單，供「負責 RD」下拉選單使用
export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({
    users: users.map((u) => ({ id: u.id, name: u.name, role: u.role })),
  });
}
