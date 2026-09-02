import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteAttachmentFile } from "@/lib/supabaseStorage";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ attachmentId: string }> }) {
  const { attachmentId } = await params;

  const attachment = await prisma.requirementAttachment.findUnique({ where: { id: attachmentId } });
  if (!attachment) {
    return NextResponse.json({ error: "找不到這個附件" }, { status: 404 });
  }

  await deleteAttachmentFile(attachment.path);
  await prisma.requirementAttachment.delete({ where: { id: attachmentId } });

  return NextResponse.json({ deleted: attachmentId });
}
