"use client";

import { useState } from "react";
import { STATUS_COLOR, FONT_TC } from "@/lib/designTokens";
import type { RequirementDTO, DevItemDTO } from "@/lib/types";
import { useActor } from "@/lib/identityContext";
import { useIsMobile } from "@/lib/useIsMobile";
import { RequirementForm } from "./RequirementForm";
import { DevItemForm } from "./DevItemForm";

export function DetailSidebar({
  detail,
  onClose,
  onDeleted,
  onChanged,
}: {
  detail: RequirementDTO | null;
  onClose: () => void;
  onDeleted: () => void;
  onChanged: () => void;
}) {
  const actor = useActor();
  const isMobile = useIsMobile();
  const [confirming, setConfirming] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingRequirement, setEditingRequirement] = useState(false);
  const [devItemForm, setDevItemForm] = useState<"create" | DevItemDTO | null>(null);

  if (!detail) return null;

  const nameMatches = actor != null && typedName.trim() === actor.name.trim() && typedName.trim() !== "";

  function resetDeleteState() {
    setConfirming(false);
    setTypedName("");
    setError(null);
  }

  async function handleDelete() {
    if (!detail || !actor || !nameMatches) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/requirements/${detail.id}`, {
        method: "DELETE",
        headers: { "x-actor-id": actor.id },
      });
      if (!res.ok) throw new Error("刪除失敗");
      resetDeleteState();
      onDeleted();
    } catch {
      setError("刪除失敗，請再試一次");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(23,26,31,0.34)" }} />
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(520px, 100vw)",
          background: "#FFFFFF",
          borderLeft: "1px solid #C7CCD2",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: isMobile ? "18px 18px 16px" : "22px 26px 18px", borderBottom: "1px solid #E4E7EA" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <span style={{ fontSize: 12, color: "#878F99", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", flex: "none" }}>
              {detail.id}　由 {detail.requesterName} 提出
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={() => setEditingRequirement(true)}
                style={{
                  background: "none",
                  border: "1px solid #C7CCD2",
                  color: "#3B424A",
                  padding: "4px 10px",
                  fontFamily: FONT_TC,
                  fontSize: 12,
                  cursor: "pointer",
                  borderRadius: 2,
                }}
              >
                編輯
              </button>
              <button
                onClick={onClose}
                style={{ background: "none", border: "none", fontSize: 16, color: "#878F99", cursor: "pointer", lineHeight: 1, padding: 0 }}
              >
                ✕
              </button>
            </div>
          </div>
          <h2 style={{ fontFamily: FONT_TC, fontSize: 17, fontWeight: 700, margin: "10px 0 14px", lineHeight: 1.5 }}>
            {detail.title}
          </h2>
          <div style={{ display: "flex", columnGap: 26, flexWrap: "wrap", rowGap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: "#878F99", letterSpacing: "0.05em", marginBottom: 4 }}>狀態</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: FONT_TC, fontSize: 13 }}>
                <span style={{ width: 7, height: 7, background: STATUS_COLOR[detail.status], display: "inline-block" }} />
                {detail.status}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#878F99", letterSpacing: "0.05em", marginBottom: 4 }}>安排版本</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {detail.versions.length === 0 ? (
                  <span style={{ fontSize: 11.5, color: "#878F99" }}>未排定</span>
                ) : (
                  detail.versions.map((v) => (
                    <span
                      key={v}
                      style={{
                        fontSize: 11.5,
                        fontVariantNumeric: "tabular-nums",
                        border: "1px solid #C7CCD2",
                        padding: "2px 7px",
                        background: "#F4F5F7",
                      }}
                    >
                      {v}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#878F99", letterSpacing: "0.05em", marginBottom: 4 }}>完成度</div>
              <div style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{detail.pct}%</div>
            </div>
          </div>
          {detail.status === "不開發" && detail.notDevelopedReason && (
            <div style={{ marginTop: 14, fontSize: 12, color: "#9C4A3B", fontFamily: FONT_TC, lineHeight: 1.6 }}>
              不開發原因：{detail.notDevelopedReason}
            </div>
          )}
        </div>
        <div style={{ padding: isMobile ? "16px 18px 32px" : "20px 26px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.06em", color: "#878F99", fontFamily: FONT_TC }}>
              這個需求拆成以下幾件事
            </div>
            <button
              onClick={() => setDevItemForm("create")}
              style={{
                background: "none",
                border: "1px solid #C7CCD2",
                color: "#1F4C73",
                padding: "3px 9px",
                fontFamily: FONT_TC,
                fontSize: 11.5,
                cursor: "pointer",
                borderRadius: 2,
              }}
            >
              ＋ 新增細項
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {detail.tasks.length === 0 && (
              <div style={{ fontFamily: FONT_TC, fontSize: 13, color: "#878F99", padding: "12px 0" }}>尚未拆分開發細項</div>
            )}
            {detail.tasks.map((t) =>
              isMobile ? (
                <div
                  key={t.id}
                  onClick={() => setDevItemForm(t)}
                  style={{ padding: "10px 0", borderBottom: "1px solid #EDEFF1", cursor: "pointer" }}
                  className="row-hover"
                >
                  <div style={{ fontFamily: FONT_TC, fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>{t.plainText}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11.5, fontVariantNumeric: "tabular-nums", color: "#5C646E" }}>
                      {t.releaseVersion ?? "未排定"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: FONT_TC, fontSize: 12, color: "#3B424A" }}>
                      <span style={{ width: 7, height: 7, background: STATUS_COLOR[t.status], display: "inline-block" }} />
                      {t.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  key={t.id}
                  onClick={() => setDevItemForm(t)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 104px 96px",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: "1px solid #EDEFF1",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  className="row-hover"
                >
                  <div style={{ fontFamily: FONT_TC, fontSize: 13, lineHeight: 1.5 }}>{t.plainText}</div>
                  <div style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: "#5C646E" }}>
                    {t.releaseVersion ?? "未排定"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: FONT_TC, fontSize: 12.5, color: "#3B424A" }}>
                    <span style={{ width: 7, height: 7, background: STATUS_COLOR[t.status], display: "inline-block" }} />
                    {t.status}
                  </div>
                </div>
              )
            )}
          </div>
          {detail.note && (
            <div style={{ marginTop: 18, fontSize: 12, color: "#878F99", fontFamily: FONT_TC, lineHeight: 1.6 }}>{detail.note}</div>
          )}

          {detail.attachments.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.06em", color: "#878F99", marginBottom: 10, fontFamily: FONT_TC }}>
                照片／影片（{detail.attachments.length}）
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {detail.attachments.map((a) => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={a.fileName}
                    style={{ display: "block", width: 84, height: 84, border: "1px solid #E4E7EA", borderRadius: 2, overflow: "hidden", background: "#F7F8F9" }}
                  >
                    {a.mimeType.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.url} alt={a.fileName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <video src={a.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #EDEFF1" }}>
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E3B3A8",
                  color: "#A2452F",
                  padding: "7px 14px",
                  fontFamily: FONT_TC,
                  fontSize: 12.5,
                  cursor: "pointer",
                  borderRadius: 2,
                }}
              >
                刪除需求
              </button>
            ) : (
              <div style={{ border: "1px solid #E3B3A8", background: "#FBF3F1", padding: "14px 16px" }}>
                <div style={{ fontFamily: FONT_TC, fontSize: 12.5, color: "#A2452F", marginBottom: 8, lineHeight: 1.6 }}>
                  刪除後無法復原，連同底下的開發細項一併刪除。請再次輸入您的姓名「{actor?.name}」以確認。
                </div>
                <input
                  autoFocus
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="請輸入您的姓名"
                  style={{
                    width: "100%",
                    border: "1px solid #C7CCD2",
                    borderRadius: 2,
                    padding: "8px 10px",
                    fontSize: 13,
                    fontFamily: FONT_TC,
                    marginBottom: 10,
                    outline: "none",
                    background: "#FFFFFF",
                  }}
                />
                {error && (
                  <div style={{ color: "#A2452F", fontSize: 12, marginBottom: 8, fontFamily: FONT_TC }}>{error}</div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={resetDeleteState}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #C7CCD2",
                      padding: "7px 14px",
                      fontFamily: FONT_TC,
                      fontSize: 12.5,
                      cursor: "pointer",
                      borderRadius: 2,
                    }}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={!nameMatches || deleting}
                    style={{
                      background: nameMatches ? "#A2452F" : "#D8B9B2",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "7px 14px",
                      fontFamily: FONT_TC,
                      fontSize: 12.5,
                      fontWeight: 500,
                      cursor: nameMatches && !deleting ? "pointer" : "default",
                      borderRadius: 2,
                    }}
                  >
                    {deleting ? "刪除中…" : "確認刪除"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {editingRequirement && (
        <RequirementForm
          requirement={detail}
          onClose={() => setEditingRequirement(false)}
          onSaved={() => {
            setEditingRequirement(false);
            onChanged();
          }}
        />
      )}

      {devItemForm !== null && (
        <DevItemForm
          requirementId={detail.id}
          devItem={devItemForm === "create" ? null : devItemForm}
          onClose={() => setDevItemForm(null)}
          onSaved={() => {
            setDevItemForm(null);
            onChanged();
          }}
        />
      )}
    </>
  );
}
