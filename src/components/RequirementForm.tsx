"use client";

import { useRef, useState } from "react";
import { FONT_TC } from "@/lib/designTokens";
import type { RequirementDTO, AttachmentDTO } from "@/lib/types";
import { useIsMobile } from "@/lib/useIsMobile";
import { REQ_STATUSES } from "@/lib/rollup";

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#878F99",
  letterSpacing: "0.05em",
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #C7CCD2",
  borderRadius: 2,
  padding: "8px 10px",
  fontSize: 13,
  fontFamily: FONT_TC,
  outline: "none",
};

function dateToInputValue(d: string | null): string {
  if (!d) return "";
  return d.slice(0, 10);
}

export function RequirementForm({
  requirement,
  onClose,
  onSaved,
}: {
  requirement: RequirementDTO | null; // null = 新增；有值 = 編輯
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!requirement;
  const isMobile = useIsMobile();
  const [title, setTitle] = useState(requirement?.title ?? "");
  const [theme, setTheme] = useState(requirement?.theme ?? "");
  const [requesterName, setRequesterName] = useState(requirement?.requesterName ?? "");
  const [priority, setPriority] = useState(requirement?.priority ?? "中");
  const [originText, setOriginText] = useState(requirement?.origin ?? "");
  const [originDate, setOriginDate] = useState(dateToInputValue(requirement?.originDate ?? null));
  const [note, setNote] = useState(requirement?.note ?? "");
  const [statusOverride, setStatusOverride] = useState(requirement?.statusOverride ?? "");
  const [notDevelopedReason, setNotDevelopedReason] = useState(requirement?.notDevelopedReason ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [existingAttachments, setExistingAttachments] = useState<AttachmentDTO[]>(requirement?.attachments ?? []);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleDeleteAttachment(attachmentId: string) {
    setDeletingAttachmentId(attachmentId);
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setExistingAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch {
      setError("附件刪除失敗，請再試一次");
    } finally {
      setDeletingAttachmentId(null);
    }
  }

  function addStagedFiles(files: FileList | null) {
    if (!files) return;
    const invalid = Array.from(files).find((f) => !f.type.startsWith("image/") && !f.type.startsWith("video/"));
    if (invalid) {
      setError(`${invalid.name} 不是圖片或影片檔`);
      return;
    }
    setStagedFiles((prev) => [...prev, ...Array.from(files)]);
  }

  async function handleSave() {
    if (!title.trim() || !theme.trim() || !requesterName.trim()) {
      setError("需求描述、主題、提出人為必填");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        theme: theme.trim(),
        requesterName: requesterName.trim(),
        priority,
        origin: originText.trim() || null,
        originDate: originDate || null,
        note: note.trim() || null,
        statusOverride: statusOverride || null,
        notDevelopedReason: statusOverride === "不開發" ? notDevelopedReason.trim() || null : null,
      };
      const res = await fetch(isEdit ? `/api/requirements/${requirement!.id}` : "/api/requirements", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "儲存失敗");
      }
      const data = await res.json();
      const requirementId: string = isEdit ? requirement!.id : data.id;

      if (stagedFiles.length > 0) {
        const form = new FormData();
        stagedFiles.forEach((f) => form.append("files", f));
        const uploadRes = await fetch(`/api/requirements/${requirementId}/attachments`, {
          method: "POST",
          body: form,
        });
        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json().catch(() => null);
          throw new Error(uploadData?.error ?? "需求已儲存，但附件上傳失敗");
        }
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(23,26,31,0.34)" }} />
      <div
        style={{
          position: "fixed",
          top: isMobile ? 16 : 60,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(560px, calc(100vw - 32px))",
          background: "#FFFFFF",
          border: "1px solid #C7CCD2",
          borderRadius: 2,
          fontFamily: "'IBM Plex Sans', 'Noto Sans TC', sans-serif",
          maxHeight: isMobile ? "calc(100vh - 32px)" : "85vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #E4E7EA" }}>
          <h2 style={{ margin: 0, fontFamily: FONT_TC, fontSize: 16, fontWeight: 700 }}>
            {isEdit ? "編輯需求" : "提出新需求"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 16, color: "#878F99", cursor: "pointer", lineHeight: 1, padding: 0 }}>
            ✕
          </button>
        </div>

        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={labelStyle}>需求描述</div>
            <textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
            <div>
              <div style={labelStyle}>主題</div>
              <input value={theme} onChange={(e) => setTheme(e.target.value)} style={inputStyle} placeholder="例如：通知、首頁、付款" />
            </div>
            <div>
              <div style={labelStyle}>提出人</div>
              <input value={requesterName} onChange={(e) => setRequesterName(e.target.value)} style={inputStyle} placeholder="例如：老闆、營運部" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 14 }}>
            <div>
              <div style={labelStyle}>優先級</div>
              <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} style={{ ...inputStyle, background: "#FFFFFF" }}>
                <option value="高">高</option>
                <option value="中">中</option>
                <option value="低">低</option>
              </select>
            </div>
            <div>
              <div style={labelStyle}>源自於</div>
              <input value={originText} onChange={(e) => setOriginText(e.target.value)} style={inputStyle} placeholder="例如：群組回報" />
            </div>
            <div>
              <div style={labelStyle}>來源日期</div>
              <input type="date" value={originDate} onChange={(e) => setOriginDate(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <div style={labelStyle}>補充說明</div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <div style={labelStyle}>狀態</div>
            <select
              value={statusOverride}
              onChange={(e) => setStatusOverride(e.target.value as typeof statusOverride)}
              style={{ ...inputStyle, background: "#FFFFFF" }}
            >
              <option value="">自動（依開發細項推算{isEdit ? `：${requirement!.status}` : ""}）</option>
              {REQ_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {statusOverride === "不開發" && (
              <div style={{ marginTop: 8 }}>
                <div style={labelStyle}>不開發原因</div>
                <textarea
                  value={notDevelopedReason}
                  onChange={(e) => setNotDevelopedReason(e.target.value)}
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="例如：與既有規劃衝突、優先級調整…"
                />
              </div>
            )}
          </div>

          <div>
            <div style={labelStyle}>照片／影片</div>

            {existingAttachments.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                {existingAttachments.map((a) => (
                  <div key={a.id} style={{ position: "relative", width: 72, height: 72, border: "1px solid #E4E7EA", borderRadius: 2, overflow: "hidden", background: "#F7F8F9" }}>
                    {a.mimeType.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.url} alt={a.fileName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <video src={a.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                    <button
                      onClick={() => handleDeleteAttachment(a.id)}
                      disabled={deletingAttachmentId === a.id}
                      title="刪除"
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(23,26,31,0.6)",
                        color: "#fff",
                        fontSize: 11,
                        lineHeight: "18px",
                        textAlign: "center",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {stagedFiles.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                {stagedFiles.map((f, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: FONT_TC, fontSize: 12, color: "#5C646E" }}>
                    <span>{f.name}（{(f.size / 1024 / 1024).toFixed(1)}MB，待上傳）</span>
                    <button
                      onClick={() => setStagedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      style={{ background: "none", border: "none", color: "#A2452F", cursor: "pointer", fontSize: 12 }}
                    >
                      移除
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                addStagedFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ background: "#FFFFFF", border: "1px dashed #B7BEC6", padding: "7px 13px", fontFamily: FONT_TC, fontSize: 12.5, cursor: "pointer", borderRadius: 2, color: "#5C646E" }}
            >
              ＋ 選擇照片／影片
            </button>
          </div>

          {error && <div style={{ color: "#A2452F", fontSize: 12.5, fontFamily: FONT_TC }}>{error}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button
              onClick={onClose}
              style={{ background: "#FFFFFF", border: "1px solid #C7CCD2", padding: "8px 16px", fontFamily: FONT_TC, fontSize: 13, cursor: "pointer", borderRadius: 2 }}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ background: "#1F4C73", color: "#FFFFFF", border: "none", padding: "8px 18px", fontFamily: FONT_TC, fontSize: 13, fontWeight: 500, cursor: saving ? "default" : "pointer", borderRadius: 2 }}
            >
              {saving ? "儲存中…" : "儲存"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
