"use client";

import { useState } from "react";
import { STAGES, STAGE_LABEL, FONT_TC } from "@/lib/designTokens";
import type { ReleaseCardDTO } from "@/lib/types";

const inputStyle: React.CSSProperties = {
  border: "1px solid #C7CCD2",
  borderRadius: 2,
  padding: "7px 9px",
  fontSize: 12.5,
  fontFamily: FONT_TC,
  outline: "none",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#878F99",
  letterSpacing: "0.05em",
  marginBottom: 4,
};

export function VersionEditForm({
  card,
  onCancel,
  onSaved,
}: {
  card: ReleaseCardDTO | null; // null = 新增版本
  onCancel: () => void;
  onSaved: () => void;
}) {
  const isCreate = card === null;
  const [versionName, setVersionName] = useState(card?.version ?? "");
  const [stage, setStage] = useState<string>(card?.stage ?? "");
  const [iosVersionName, setIosVersionName] = useState(card?.iosVersionName ?? "");
  const [androidVersionName, setAndroidVersionName] = useState(card?.androidVersionName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!versionName.trim()) {
      setError("版本名稱不可為空");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        version: versionName.trim(),
        stage: stage || null,
        iosVersionName: iosVersionName.trim() || null,
        androidVersionName: androidVersionName.trim() || null,
      };
      const res = await fetch(isCreate ? "/api/releases" : `/api/releases/${encodeURIComponent(card.version)}`, {
        method: isCreate ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ padding: "16px 18px", background: "#F7F8F9", borderBottom: "1px solid #E4E7EA" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: stage ? 12 : 0 }}>
        <div>
          <div style={labelStyle}>版本名稱</div>
          <input value={versionName} onChange={(e) => setVersionName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <div style={labelStyle}>版本狀態</div>
          <select value={stage} onChange={(e) => setStage(e.target.value)} style={{ ...inputStyle, background: "#FFFFFF" }}>
            <option value="">尚未排程</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {stage && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 12 }}>
          <div>
            <div style={labelStyle}>iOS 測試版本名稱</div>
            <input
              value={iosVersionName}
              onChange={(e) => setIosVersionName(e.target.value)}
              placeholder="例如 TestFlight build 名稱"
              style={inputStyle}
            />
          </div>
          <div>
            <div style={labelStyle}>Android 版本名稱</div>
            <input
              value={androidVersionName}
              onChange={(e) => setAndroidVersionName(e.target.value)}
              placeholder="例如 Google Play 版本名稱"
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {error && <div style={{ color: "#A2452F", fontSize: 12, marginBottom: 10, fontFamily: FONT_TC }}>{error}</div>}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onCancel}
          style={{
            background: "#FFFFFF",
            border: "1px solid #C7CCD2",
            padding: "6px 13px",
            fontFamily: FONT_TC,
            fontSize: 12.5,
            cursor: "pointer",
            borderRadius: 2,
          }}
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: "#1F4C73",
            color: "#FFFFFF",
            border: "none",
            padding: "6px 14px",
            fontFamily: FONT_TC,
            fontSize: 12.5,
            fontWeight: 500,
            cursor: saving ? "default" : "pointer",
            borderRadius: 2,
          }}
        >
          {saving ? "儲存中…" : "儲存"}
        </button>
      </div>
    </div>
  );
}
