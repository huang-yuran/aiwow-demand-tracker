import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadAttachment } from "@/lib/supabaseStorage";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

// 上傳照片／影片附件（可一次多檔）
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const requirement = await prisma.requirement.findUnique({ where: { id } });
  if (!requirement) {
    return NextResponse.json({ error: "找不到這筆需求" }, { status: 404 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "請求格式錯誤" }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "沒有選擇檔案" }, { status: 400 });
  }

  const created = [];
  for (const file of files) {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      return NextResponse.json({ error: `${file.name} 不是圖片或影片檔` }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `${file.name} 超過 50MB 上限` }, { status: 400 });
    }

    const { path, url } = await uploadAttachment(id, file);
    const attachment = await prisma.requirementAttachment.create({
      data: {
        requirementId: id,
        url,
        path,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      },
    });
    created.push(attachment);
  }

  return NextResponse.json({ attachments: created }, { status: 201 });
}
