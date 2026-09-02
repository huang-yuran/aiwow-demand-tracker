import { createClient } from "@supabase/supabase-js";

// 僅供伺服器端（API route）使用，service role key 絕不可送到瀏覽器
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export const ATTACHMENT_BUCKET = "requirement-attachments";

export async function uploadAttachment(requirementId: string, file: File) {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${requirementId}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw error;

  const { data } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function deleteAttachmentFile(path: string) {
  await supabase.storage.from(ATTACHMENT_BUCKET).remove([path]);
}
