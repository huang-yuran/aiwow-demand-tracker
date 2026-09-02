"use client";

import { PRIORITY_COLOR, STATUS_COLOR, FONT_TC } from "@/lib/designTokens";
import type { RequirementDTO } from "@/lib/types";

const STATUS_FILTERS = ["規劃中", "開發中", "已完成"] as const;
const SOURCE_TABS = ["老闆需求", "行銷需求", "用戶需求"] as const;

export function ListView({
  rows,
  counts,
  filter,
  source,
  expanded,
  onFilterChange,
  onSourceChange,
  onToggleExpand,
  onOpenDetail,
}: {
  rows: RequirementDTO[];
  counts: Record<string, number>;
  filter: string;
  source: string;
  expanded: Record<string, boolean>;
  onFilterChange: (f: string) => void;
  onSourceChange: (s: string) => void;
  onToggleExpand: (id: string) => void;
  onOpenDetail: (id: string) => void;
}) {
  return (
    <main style={{ padding: "26px 28px 60px", maxWidth: 1180 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, maxWidth: 1360 }}>
        <h1 style={{ fontFamily: FONT_TC, fontSize: 19, fontWeight: 700, margin: 0 }}>需求列表</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {STATUS_FILTERS.map((label) => {
            const active = filter === label;
            return (
              <button
                key={label}
                onClick={() => onFilterChange(label)}
                style={{
                  background: active ? "#16191D" : "#FFFFFF",
                  color: active ? "#FFFFFF" : "#5C646E",
                  border: `1px solid ${active ? "#16191D" : "#C7CCD2"}`,
                  padding: "5px 12px",
                  fontFamily: FONT_TC,
                  fontSize: 12.5,
                  cursor: "pointer",
                  borderRadius: 2,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 22, borderBottom: "1px solid #D5D9DE", marginBottom: 14, maxWidth: 1360 }}>
        {SOURCE_TABS.map((label) => {
          const active = source === label;
          return (
            <button
              key={label}
              onClick={() => onSourceChange(label)}
              style={{
                background: "none",
                border: "none",
                borderBottom: `2px solid ${active ? "#16191D" : "transparent"}`,
                color: active ? "#16191D" : "#6B737D",
                fontFamily: FONT_TC,
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                padding: "9px 2px 8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "baseline",
                gap: 4,
              }}
            >
              {label}
              <span style={{ fontSize: 11.5, color: "#99A1AA", fontVariantNumeric: "tabular-nums" }}>（{counts[label] ?? 0}）</span>
            </button>
          );
        })}
      </div>

      <div style={{ maxWidth: 1360, overflowX: "auto" }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #D5D9DE", borderRadius: 2, minWidth: 950 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "74px 80px minmax(260px, 1fr) 168px 76px 68px 130px 24px",
              gap: 12,
              minWidth: 950,
              padding: "10px 18px",
              background: "#F7F8F9",
              borderBottom: "1px solid #D5D9DE",
              fontSize: 11,
              letterSpacing: "0.06em",
              color: "#878F99",
            }}
          >
            <div>編號</div>
            <div>主題</div>
            <div>需求描述</div>
            <div>源自於</div>
            <div>提出人</div>
            <div>優先級</div>
            <div>狀態／完成度</div>
            <div />
          </div>

          {rows.map((r) => {
            const isExpanded = !!expanded[r.id];
            return (
              <div key={r.id} style={{ borderBottom: "1px solid #EDEFF1" }}>
                <div
                  onClick={() => onToggleExpand(r.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "74px 80px minmax(260px, 1fr) 168px 76px 68px 130px 24px",
                    gap: 12,
                    minWidth: 950,
                    padding: "13px 18px",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  className="row-hover"
                >
                  <div style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: "#6B737D" }}>{r.id}</div>
                  <div style={{ fontFamily: FONT_TC, fontSize: 12, color: "#3B424A" }}>
                    <span style={{ border: "1px solid #C7CCD2", padding: "2px 7px", background: "#F4F5F7" }}>{r.theme}</span>
                  </div>
                  <div style={{ fontFamily: FONT_TC, fontSize: 13.5, lineHeight: 1.45 }}>{r.title}</div>
                  <div style={{ fontFamily: FONT_TC, fontSize: 12, color: "#5C646E", fontVariantNumeric: "tabular-nums", lineHeight: 1.4 }}>
                    {r.origin ?? "—"}
                  </div>
                  <div style={{ fontFamily: FONT_TC, fontSize: 12.5, color: "#3B424A" }}>{r.requesterName}</div>
                  <div style={{ fontFamily: FONT_TC, fontSize: 12.5, color: PRIORITY_COLOR[r.priority] }}>{r.priority}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: FONT_TC, fontSize: 12.5, color: "#3B424A", marginBottom: 5 }}>
                      <span style={{ width: 7, height: 7, background: STATUS_COLOR[r.status], display: "inline-block" }} />
                      {r.status}
                    </div>
                    <div style={{ height: 4, background: "#E4E7EA" }}>
                      <div style={{ height: "100%", width: `${r.pct}%`, background: STATUS_COLOR[r.status] }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", color: "#99A1AA", fontSize: 10 }}>{isExpanded ? "▲" : "▼"}</div>
                </div>

                {isExpanded && (
                  <div style={{ background: "#F7F8F9", borderTop: "1px solid #EDEFF1", padding: "14px 18px 16px 172px", minWidth: 950 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ fontSize: 11, letterSpacing: "0.06em", color: "#878F99", fontFamily: FONT_TC }}>
                        拆成以下調整項目
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetail(r.id);
                        }}
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
                        編輯需求／管理細項
                      </button>
                    </div>
                    {r.tasks.length === 0 && (
                      <div style={{ fontFamily: FONT_TC, fontSize: 12.5, color: "#878F99" }}>尚未拆分開發細項</div>
                    )}
                    {r.tasks.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(240px, 1fr) 120px 110px",
                          gap: 14,
                          alignItems: "center",
                          padding: "8px 0",
                          borderBottom: "1px solid #E4E7EA",
                        }}
                      >
                        <div style={{ fontFamily: FONT_TC, fontSize: 13, lineHeight: 1.5 }}>{t.plainText}</div>
                        <div style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: "#3B424A" }}>
                          {t.releaseVersion ?? "未排定"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: FONT_TC, fontSize: 12.5, color: "#3B424A" }}>
                          <span style={{ width: 7, height: 7, background: STATUS_COLOR[t.status], display: "inline-block" }} />
                          {t.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
