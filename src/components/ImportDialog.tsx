"use client";

import { useRef, useState } from "react";
import { FONT_TC } from "@/lib/designTokens";
import type { ImportPreviewRow } from "@/lib/types";
import { useActor } from "@/lib/identityContext";
import { useIsMobile } from "@/lib/useIsMobile";

type Step = "idle" | "preview" | "done";

export function ImportDialog({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [step, setStep] = useState<Step>("idle");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ImportPreviewRow[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const actor = useActor();
  const isMobile = useIsMobile();

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/requirements/import/preview", { method: "POST", body: form });
      if (!res.ok) throw new Error("解析失敗");
      const data = await res.json();
      setFileName(data.fileName);
      setRows(data.rows);
      setStep("preview");
    } catch {
      setError("檔案解析失敗，請確認格式是否正確");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/requirements/import/commit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(actor ? { "x-actor-id": actor.id } : {}),
        },
        body: JSON.stringify({ rows }),
      });
      if (!res.ok) throw new Error("匯入失敗");
      const data = await res.json();
      setImportedCount(data.importedCount);
      setStep("done");
      onImported();
    } catch {
      setError("匯入失敗，請再試一次");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("idle");
    setRows([]);
    setFileName("");
    setError(null);
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(23,26,31,0.34)" }} />
      <div
        style={{
          position: "fixed",
          top: isMobile ? 16 : 84,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(640px, calc(100vw - 32px))",
          background: "#FFFFFF",
          border: "1px solid #C7CCD2",
          borderRadius: 2,
          fontFamily: "'IBM Plex Sans', 'Noto Sans TC', sans-serif",
          maxHeight: isMobile ? "calc(100vh - 32px)" : "80vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #E4E7EA" }}>
          <h2 style={{ margin: 0, fontFamily: FONT_TC, fontSize: 16, fontWeight: 700 }}>批次匯入需求</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 16, color: "#878F99", cursor: "pointer", lineHeight: 1, padding: 0 }}>
            ✕
          </button>
        </div>

        <div style={{ padding: "20px 24px 24px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              border: "1px solid #E4E7EA",
              background: "#F7F8F9",
              padding: "12px 14px",
              marginBottom: 18,
            }}
          >
            <div>
              <div style={{ fontFamily: FONT_TC, fontSize: 13, marginBottom: 3 }}>第一次使用？先下載範本</div>
              <div style={{ fontSize: 11.5, color: "#6B737D", fontFamily: FONT_TC }}>
                範本欄位：需求描述、主題、源自於、提出人、優先級、補充說明
              </div>
            </div>
            {/* API 檔案下載端點，非站內頁面路由，故不用 next/link */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/api/requirements/import/template"
              style={{
                background: "#FFFFFF",
                border: "1px solid #C7CCD2",
                padding: "7px 13px",
                fontFamily: FONT_TC,
                fontSize: 12.5,
                cursor: "pointer",
                whiteSpace: "nowrap",
                borderRadius: 2,
                color: "#16191D",
                textDecoration: "none",
              }}
            >
              下載 Excel 範本
            </a>
          </div>

          {error && <div style={{ color: "#A2452F", fontSize: 12.5, marginBottom: 12, fontFamily: FONT_TC }}>{error}</div>}

          {step === "idle" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              style={{
                border: "1px dashed #B7BEC6",
                background: "#FCFCFD",
                padding: "34px 20px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <div style={{ fontFamily: FONT_TC, fontSize: 13.5, marginBottom: 6 }}>
                {loading ? "解析中…" : "把 Excel 拖進來，或點擊選擇檔案"}
              </div>
              <div style={{ fontSize: 11.5, color: "#878F99" }}>支援 .xlsx / .csv，單檔上限 200 筆</div>
            </div>
          )}

          {step === "preview" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontFamily: FONT_TC, fontSize: 13 }}>
                  {fileName}
                  <span style={{ color: "#878F99", fontSize: 12 }}>
                    　讀到 {rows.length} 筆，{rows.filter((r) => r.issues.length > 0).length} 筆需確認
                  </span>
                </div>
                <button
                  onClick={reset}
                  style={{ background: "none", border: "none", padding: 0, color: "#1F4C73", fontSize: 12.5, fontFamily: FONT_TC, cursor: "pointer", textDecoration: "underline" }}
                >
                  換一個檔案
                </button>
              </div>
              <div style={{ border: "1px solid #E4E7EA", overflowX: "auto" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(200px, 1fr) 78px 130px 92px",
                    gap: 12,
                    minWidth: 520,
                    padding: "8px 12px",
                    background: "#F7F8F9",
                    borderBottom: "1px solid #E4E7EA",
                    fontSize: 11,
                    letterSpacing: "0.05em",
                    color: "#878F99",
                  }}
                >
                  <div>需求描述</div>
                  <div>主題</div>
                  <div>源自於</div>
                  <div>檢查</div>
                </div>
                {rows.map((row) => (
                  <div
                    key={row.rowIndex}
                    style={{ display: "grid", gridTemplateColumns: "minmax(200px, 1fr) 78px 130px 92px", gap: 12, minWidth: 520, padding: "9px 12px", borderBottom: "1px solid #EDEFF1", alignItems: "center" }}
                  >
                    <div style={{ fontFamily: FONT_TC, fontSize: 12.5, lineHeight: 1.45 }}>{row.title || "（未填）"}</div>
                    <div style={{ fontFamily: FONT_TC, fontSize: 12, color: "#5C646E" }}>{row.theme || "（未填）"}</div>
                    <div style={{ fontSize: 11.5, color: "#5C646E", fontVariantNumeric: "tabular-nums" }}>{row.origin || "（空白）"}</div>
                    <div style={{ fontFamily: FONT_TC, fontSize: 11.5, color: row.issues.length > 0 ? "#A07B22" : "#3F7A52" }}>
                      {row.issues.length > 0 ? row.issues.join("、") : "可匯入"}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                <button
                  onClick={onClose}
                  style={{ background: "#FFFFFF", border: "1px solid #C7CCD2", padding: "8px 16px", fontFamily: FONT_TC, fontSize: 13, cursor: "pointer", borderRadius: 2 }}
                >
                  取消
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  style={{ background: "#1F4C73", color: "#FFFFFF", border: "none", padding: "8px 18px", fontFamily: FONT_TC, fontSize: 13, fontWeight: 500, cursor: loading ? "default" : "pointer", borderRadius: 2 }}
                >
                  {loading ? "匯入中…" : `確認匯入 ${rows.length} 筆`}
                </button>
              </div>
            </>
          )}

          {step === "done" && (
            <div style={{ border: "1px solid #C9D9CD", background: "#F2F7F3", padding: 20, textAlign: "center" }}>
              <div style={{ fontFamily: FONT_TC, fontSize: 14, marginBottom: 6 }}>已匯入 {importedCount} 筆需求</div>
              <div style={{ fontSize: 12, color: "#5C646E", fontFamily: FONT_TC }}>狀態皆為規劃中，我們會盡快評估排定版本。</div>
              <button
                onClick={onClose}
                style={{ marginTop: 16, background: "#16191D", color: "#FFFFFF", border: "none", padding: "8px 18px", fontFamily: FONT_TC, fontSize: 13, cursor: "pointer", borderRadius: 2 }}
              >
                完成
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
