"use client";

import { useEffect, useRef, useState } from "react";
import { FONT_TC, FONT_BASE, STAGE_LABEL, STAGE_STYLE, MILESTONE_COLOR } from "@/lib/designTokens";
import type { ScheduleDTO } from "@/lib/types";
import { useActor } from "@/lib/identityContext";
import { useIsMobile } from "@/lib/useIsMobile";

const WEEKDAY = ["日", "一", "二", "三", "四", "五", "六"];

function formatDate(iso: string): string {
  // iso 是無時區曆日（yyyy-mm-dd），一律用 UTC 方法讀取，避免本地時區把日期推前/推後一天
  const d = new Date(iso + "T00:00:00Z");
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}（${WEEKDAY[d.getUTCDay()]}）`;
}

function relativeLabel(daysFromToday: number): string {
  if (daysFromToday <= 0) return "今天";
  return `${daysFromToday} 天後`;
}

function EditableText({
  value,
  placeholder,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  textStyle,
}: {
  value: string | null;
  placeholder: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (next: string) => void;
  onCancel: () => void;
  textStyle: React.CSSProperties;
}) {
  const [draft, setDraft] = useState(value ?? "");
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(value ?? "");
      cancelledRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  if (isEditing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          } else if (e.key === "Escape") {
            cancelledRef.current = true;
            e.currentTarget.blur();
          }
        }}
        onBlur={() => {
          if (cancelledRef.current) {
            onCancel();
          } else {
            onSave(draft.trim());
          }
        }}
        style={{
          ...textStyle,
          border: "1px solid #C7CCD2",
          borderRadius: 2,
          padding: "3px 6px",
          outline: "none",
          fontFamily: FONT_TC,
          width: "100%",
          background: "#FFFFFF",
        }}
      />
    );
  }

  return (
    <span onClick={onStartEdit} style={{ ...textStyle, cursor: "pointer", color: value ? textStyle.color : "#B7BEC6" }}>
      {value || placeholder}
    </span>
  );
}

export function ScheduleView() {
  const actor = useActor();
  const isMobile = useIsMobile();
  const [data, setData] = useState<ScheduleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/schedule");
    const json: ScheduleDTO = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    // 掛載時向 API 抓資料，非由 props/state 推導
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function saveNextStep(version: string, next: string) {
    setData((prev) => (prev && prev.current ? { ...prev, current: { ...prev.current, nextStep: next || null } } : prev));
    setEditingKey(null);
    await fetch(`/api/releases/${encodeURIComponent(version)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nextStepNote: next || null }),
    });
  }

  async function saveNote(version: string, kind: string, next: string) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            milestones: prev.milestones.map((m) =>
              m.version === version && m.kind === kind ? { ...m, note: next || null } : m
            ),
          }
        : prev
    );
    setEditingKey(null);
    await fetch(`/api/schedule-notes/${encodeURIComponent(version)}/${kind}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: next || null }),
    });
  }

  if (loading || !data) {
    return <div style={{ padding: 40, fontFamily: FONT_TC, fontSize: 13, color: "#6B737D" }}>載入中…</div>;
  }

  const { current, range, milestones } = data;
  const stageStyle = current?.stage ? STAGE_STYLE[current.stage] : undefined;
  const [stageColor, stageBg, stageBorder] = stageStyle ?? ["#878F99", "#F4F5F7", "#DDE0E4"];

  return (
    <main style={{ padding: isMobile ? "18px 14px 40px" : "26px 28px 60px", maxWidth: 1180, fontFamily: FONT_BASE }}>
      <h1 style={{ fontFamily: FONT_TC, fontSize: 28, fontWeight: 700, margin: 0 }}>時程表</h1>
      <p style={{ margin: "6px 0 18px", fontSize: 13, color: "#5C646E", fontFamily: FONT_TC }}>
        哈囉{actor?.name ? `，${actor.name}` : "老大"}
      </p>

      {/* 今天 */}
      <section style={{ background: "#FFFFFF", border: "1px solid #D5D9DE", borderRadius: 2, padding: "22px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.08em", color: "#878F99", fontFamily: FONT_TC, marginBottom: 10 }}>今天</div>
        {current ? (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 20, rowGap: 10 }}>
            <span style={{ fontSize: 26, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{current.version}</span>
            <span
              style={{
                fontFamily: FONT_TC,
                fontSize: 14,
                color: stageColor,
                background: stageBg,
                border: `1px solid ${stageBorder}`,
                padding: "5px 14px",
                borderRadius: 2,
              }}
            >
              {current.stage ? STAGE_LABEL[current.stage] ?? current.stage : "尚未排程"}
            </span>
            <EditableText
              value={current.nextStep}
              placeholder="點擊新增下一步"
              isEditing={editingKey === "nextStep"}
              onStartEdit={() => setEditingKey("nextStep")}
              onSave={(next) => saveNextStep(current.version, next)}
              onCancel={() => setEditingKey(null)}
              textStyle={{ fontSize: 13.5, color: "#5C646E", fontFamily: FONT_TC }}
            />
          </div>
        ) : (
          <div style={{ fontSize: 13.5, color: "#878F99", fontFamily: FONT_TC }}>目前沒有進行中的版本</div>
        )}
      </section>

      {/* 未來兩週 */}
      <section style={{ background: "#FFFFFF", border: "1px solid #D5D9DE", borderRadius: 2 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "16px 24px 12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 700, fontFamily: FONT_TC }}>未來兩週</span>
          <span style={{ fontSize: 12, color: "#878F99" }}>
            {formatDate(range.from)} – {formatDate(range.to)}
          </span>
        </div>

        {milestones.length === 0 ? (
          <div style={{ padding: "24px", fontSize: 13, color: "#878F99", fontFamily: FONT_TC }}>未來兩週沒有排定的節點</div>
        ) : isMobile ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {milestones.map((m) => {
              const soon = m.daysFromToday <= 3;
              const key = `note:${m.version}:${m.kind}`;
              return (
                <div
                  key={key}
                  style={{
                    padding: "12px 16px",
                    borderTop: "1px solid #EDEFF1",
                    background: soon ? "#FBFCFD" : undefined,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontVariantNumeric: "tabular-nums", fontWeight: soon ? 700 : 400, color: soon ? "#16191D" : undefined }}>
                      {formatDate(m.date)}
                    </span>
                    <span style={{ fontSize: 11, color: "#99A1AA" }}>{relativeLabel(m.daysFromToday)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", color: "#5C646E" }}>{m.version}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT_TC, fontSize: 12.5, color: "#3B424A" }}>
                      <span style={{ width: 7, height: 7, background: MILESTONE_COLOR[m.kind], display: "inline-block" }} />
                      {m.label}
                    </span>
                  </div>
                  <EditableText
                    value={m.note}
                    placeholder="點擊新增備註"
                    isEditing={editingKey === key}
                    onStartEdit={() => setEditingKey(key)}
                    onSave={(next) => saveNote(m.version, m.kind, next)}
                    onCancel={() => setEditingKey(null)}
                    textStyle={{ fontSize: 12.5, fontFamily: FONT_TC }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "96px 132px 116px minmax(200px,1fr) 30px",
                gap: 16,
                padding: "9px 24px",
                background: "#F7F8F9",
                borderTop: "1px solid #E4E7EA",
                borderBottom: "1px solid #E4E7EA",
                fontSize: 11,
                letterSpacing: "0.06em",
                color: "#878F99",
              }}
            >
              <div>日期</div>
              <div>版本</div>
              <div>安排</div>
              <div>備註</div>
              <div />
            </div>
            {milestones.map((m) => {
              const soon = m.daysFromToday <= 3;
              const key = `note:${m.version}:${m.kind}`;
              return (
                <div
                  key={key}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "96px 132px 116px minmax(200px,1fr) 30px",
                    gap: 16,
                    padding: "14px 24px",
                    borderBottom: "1px solid #EDEFF1",
                    alignItems: "center",
                    background: soon ? "#FBFCFD" : undefined,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontVariantNumeric: "tabular-nums", fontWeight: soon ? 700 : 400, color: soon ? "#16191D" : undefined }}>
                      {formatDate(m.date)}
                    </div>
                    <div style={{ fontSize: 11, color: "#99A1AA" }}>{relativeLabel(m.daysFromToday)}</div>
                  </div>
                  <div style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{m.version}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: FONT_TC, fontSize: 13 }}>
                    <span style={{ width: 7, height: 7, background: MILESTONE_COLOR[m.kind], display: "inline-block" }} />
                    {m.label}
                  </div>
                  <div style={{ gridColumn: editingKey === key ? "4 / span 2" : "4" }}>
                    <EditableText
                      value={m.note}
                      placeholder="點擊新增備註"
                      isEditing={editingKey === key}
                      onStartEdit={() => setEditingKey(key)}
                      onSave={(next) => saveNote(m.version, m.kind, next)}
                      onCancel={() => setEditingKey(null)}
                      textStyle={{ fontSize: 12.5, fontFamily: FONT_TC }}
                    />
                  </div>
                  {editingKey !== key && (
                    <button
                      onClick={() => setEditingKey(key)}
                      title="編輯備註"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#A9B1BA", fontSize: 12, padding: 0 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#1F4C73")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#A9B1BA")}
                    >
                      ✎
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ padding: "12px 24px", fontSize: 11.5, color: "#99A1AA", fontFamily: FONT_TC }}>
          日期與安排由各版本細項自動帶入，備註可點擊直接編輯。
        </div>
      </section>
    </main>
  );
}
