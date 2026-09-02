import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUserByName } from "@/lib/identity";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name : "";
  if (!name.trim()) {
    return NextResponse.json({ error: "請輸入姓名" }, { status: 400 });
  }

  const user = await getOrCreateUserByName(name);
  return NextResponse.json({ id: user.id, name: user.name });
}
