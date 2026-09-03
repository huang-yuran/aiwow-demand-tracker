"use client";

import { useEffect, useState } from "react";
import { FONT_TC, STATUS_COLOR } from "@/lib/designTokens";
import type { DevItemDTO, UserDTO } from "@/lib/types";
import { useIsMobile } from "@/lib/useIsMobile";

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

const STATUS_OPTIONS: DevItemDTO["status"][] = ["尚未開始", "進行中", "待測試", "已完成"];

export function DevItemForm({
  requirementId,
  devItem,
  onClose,
  onSaved,
}: {
  requirementId: string;
  devItem: DevItemDTO | null; // null = 新增；有值 = 編輯
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!devItem;
  const isMobile = useIsMobile();
  const [plainText, setPlainText] = useState(devItem?.plainText ?? "");
  const [content, setContent] = useState(devItem?.content ?? "");
  const [feature, setFeature] = useState(devItem?.feature ?? "");
  const [releaseVersion, setReleaseVersion] = useState(devItem?.releaseVersion ?? "");
  const [assigneeId, setAssigneeId] = useState(devItem?.assigneeId ?? "");
  const [status, setStatus] = useState<DevItemDTO["status"]>(devItem?.status ?? "尚未開始");
  const [versions, setVersions] = useState<string[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [relRes, userRes] = await Promise.all([fetch("/api/releases"), fetch("/api/users")]);
      const relData = await relRes.json();
      const userData = await userRes.json();
      setVersions(
        relData.versions.map((v: { version: string }) => v.version).filter((v: string) => v !== "未排定")
      );
      setUsers(userData.users);
    })();
  }, []);

  async function handleSave() {
    if (!plainText.trim()) {
      setError("白話描述為必填");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        plainText: plainText.trim(),
        content: content.trim() || plainText.trim(),
        feature: feature.trim() || null,
        releaseVersion: releaseVersion || null,
        assigneeId: assigneeId || null,
        status,
      };
      const res = await fetch(isEdit ? `/api/dev-items/${devItem!.id}` : "/api/dev-items", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? payload : { ...payload, requirementId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "儲存失敗");
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
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(23,26,31,0.34)", zIndex: 10 }} />
      <div
        style={{
          position: "fixed",
          top: isMobile ? 16 : 60,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(520px, calc(100vw - 32px))",
          background: "#FFFFFF",
          border: "1px solid #C7CCD2",
          borderRadius: 2,
          fontFamily: "'IBM Plex Sans', 'Noto Sans TC', sans-serif",
          maxHeight: isMobile ? "calc(100vh - 32px)" : "85vh",
          overflowY: "auto",
          zIndex: 11,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #E4E7EA" }}>
          <h2 style={{ margin: 0, fontFamily: FONT_TC, fontSize: 16, fontWeight: 700 }}>
            {isEdit ? "編輯開發細項" : "新增開發細項"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 16, color: "#878F99", cursor: "pointer", lineHeight: 1, padding: 0 }}>
            ✕
          </button>
        </div>

        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={labelStyle}>白話描述（老闆視角顯示這欄）</div>
            <textarea value={plainText} onChange={(e) => setPlainText(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <div style={labelStyle}>開發內容（RD 技術描述，留空則沿用白話描述）</div>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
            <div>
              <div style={labelStyle}>主功能</div>
              <input value={feature} onChange={(e) => setFeature(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>所屬版本</div>
              <select value={releaseVersion} onChange={(e) => setReleaseVersion(e.target.value)} style={{ ...inputStyle, background: "#FFFFFF" }}>
                <option value="">未排定</option>
                {versions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
            <div>
              <div style={labelStyle}>負責 RD</div>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} style={{ ...inputStyle, background: "#FFFFFF" }}>
                <option value="">未指派</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div style={labelStyle}>狀態</div>
              <select value={status} onChange={(e) => setStatus(e.target.value as DevItemDTO["status"])} style={{ ...inputStyle, background: "#FFFFFF" }}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: FONT_TC, fontSize: 12.5, color: "#3B424A" }}>
            <span style={{ width: 7, height: 7, background: STATUS_COLOR[status], display: "inline-block" }} />
            目前狀態：{status}
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
