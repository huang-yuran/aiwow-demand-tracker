"use client";

import { useState } from "react";
import { STAGE_STYLE, STAGE_LABEL, STAGES, STATUS_COLOR, SOURCE_STYLE, FONT_TC } from "@/lib/designTokens";
import type { ReleaseCardDTO } from "@/lib/types";
import { useIsMobile } from "@/lib/useIsMobile";
import { VersionEditForm } from "./VersionEditForm";

export function VersionView({
  versions,
  openMap,
  onToggle,
  onOpenDetail,
  onVersionUpdated,
}: {
  versions: ReleaseCardDTO[];
  openMap: Record<string, boolean>;
  onToggle: (version: string) => void;
  onOpenDetail: (reqId: string) => void;
  onVersionUpdated: () => void;
}) {
  const [editingVersion, setEditingVersion] = useState<string | null>(null);
  const [creatingVersion, setCreatingVersion] = useState(false);
  const isMobile = useIsMobile();
  return (
    <main style={{ padding: isMobile ? "18px 14px 40px" : "26px 28px 60px", maxWidth: 1180 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: isMobile ? "flex-start" : "flex-end", justifyContent: "space-between", marginBottom: 6 }}>
        <h1 style={{ fontFamily: FONT_TC, fontSize: 19, fontWeight: 700, margin: 0, letterSpacing: "0.01em" }}>
          各版本裝了什麼
        </h1>
        <button
          onClick={() => setCreatingVersion(true)}
          style={{
            background: "#1F4C73",
            color: "#FFFFFF",
            border: "none",
            padding: "7px 14px",
            fontFamily: FONT_TC,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            borderRadius: 2,
          }}
        >
          ＋ 新增版本
        </button>
      </div>
      <p style={{ margin: "0 0 22px", fontSize: 13, color: "#5C646E", fontFamily: FONT_TC }}>
        依上線版本分組，展開可看這一版要調整的項目，以及各自對應的需求。
      </p>

      {creatingVersion && (
        <div style={{ background: "#FFFFFF", border: "1px solid #D5D9DE", borderRadius: 2, marginBottom: 14 }}>
          <div style={{ padding: "12px 18px 0", fontFamily: FONT_TC, fontSize: 13, fontWeight: 700 }}>新增版本</div>
          <VersionEditForm
            card={null}
            onCancel={() => setCreatingVersion(false)}
            onSaved={() => {
              setCreatingVersion(false);
              onVersionUpdated();
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {versions.map((v) => {
          const isOpen = !!openMap[v.version];
          const stageStyle = v.stage ? STAGE_STYLE[v.stage] : undefined;
          const [stageColor, stageBg, stageBorder] = stageStyle ?? ["#878F99", "#F4F5F7", "#DDE0E4"];
          const sIdx = v.stage ? STAGES.indexOf(v.stage as (typeof STAGES)[number]) : -1;

          return (
            <section key={v.version} style={{ background: "#FFFFFF", border: "1px solid #D5D9DE", borderRadius: 2 }}>
              <div
                onClick={() => onToggle(v.version)}
                style={
                  isMobile
                    ? {
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        padding: "14px 16px",
                        cursor: "pointer",
                        borderBottom: isOpen ? "1px solid #D5D9DE" : "none",
                      }
                    : {
                        display: "grid",
                        gridTemplateColumns: "168px 120px 1fr 70px 26px",
                        alignItems: "center",
                        gap: 18,
                        padding: "14px 18px",
                        cursor: "pointer",
                        borderBottom: isOpen ? "1px solid #D5D9DE" : "none",
                      }
                }
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
                    <span
                      onClick={(e) => {
                        if (v.version === "未排定") return;
                        e.stopPropagation();
                        setEditingVersion((cur) => (cur === v.version ? null : v.version));
                      }}
                      title={v.version === "未排定" ? undefined : "點擊編輯版本"}
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "-0.01em",
                        whiteSpace: "nowrap",
                        cursor: v.version === "未排定" ? "default" : "pointer",
                        borderBottom: v.version === "未排定" ? "none" : "1px dashed #C7CCD2",
                      }}
                    >
                      {v.version}
                    </span>
                    {v.plannedDate && (
                      <span style={{ fontSize: 11, color: "#878F99" }}>
                        {new Date(v.plannedDate).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" })} 上線
                      </span>
                    )}
                  </div>
                  {isMobile && <span style={{ color: "#99A1AA", fontSize: 11 }}>{isOpen ? "▲" : "▼"}</span>}
                </div>
                <div
                  style={{
                    fontFamily: FONT_TC,
                    fontSize: 12,
                    color: stageColor,
                    background: stageBg,
                    border: `1px solid ${stageBorder}`,
                    padding: "3px 8px",
                    textAlign: "center",
                    justifySelf: "start",
                  }}
                >
                  {v.stage ? STAGE_LABEL[v.stage] ?? v.stage : "尚未排程"}
                </div>
                {!isMobile && <div />}
                <div style={{ fontSize: 11.5, letterSpacing: "0.04em", color: "#5C646E", fontFamily: FONT_TC }}>
                  {v.stateLabel}
                </div>
                {!isMobile && <div style={{ textAlign: "right", color: "#99A1AA", fontSize: 11 }}>{isOpen ? "▲" : "▼"}</div>}
              </div>

              {editingVersion === v.version && (
                <VersionEditForm
                  card={v}
                  onCancel={() => setEditingVersion(null)}
                  onSaved={() => {
                    setEditingVersion(null);
                    onVersionUpdated();
                  }}
                />
              )}

              {(v.iosVersionName || v.androidVersionName) && editingVersion !== v.version && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 16,
                    padding: "8px 18px",
                    borderBottom: "1px solid #E4E7EA",
                    fontSize: 11.5,
                    color: "#6B737D",
                    fontFamily: FONT_TC,
                  }}
                >
                  {v.iosVersionName && <span>iOS：{v.iosVersionName}</span>}
                  {v.androidVersionName && <span>Android：{v.androidVersionName}</span>}
                </div>
              )}

              {isOpen && (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      columnGap: 10,
                      rowGap: 6,
                      padding: isMobile ? "12px 16px" : "12px 18px",
                      borderBottom: "1px solid #E4E7EA",
                    }}
                  >
                    {STAGES.map((label, i) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            background: i < sIdx ? "#B7BEC6" : i === sIdx ? stageColor : "#E4E7EA",
                            display: "inline-block",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: FONT_TC,
                            fontSize: 12,
                            color: i === sIdx ? "#16191D" : i < sIdx ? "#6B737D" : "#A9B1BA",
                          }}
                        >
                          {STAGE_LABEL[label] ?? label}
                        </span>
                        {i < STAGES.length - 1 && <span style={{ color: "#D5D9DE", fontSize: 11, marginLeft: 3 }}>→</span>}
                      </div>
                    ))}
                  </div>
                  {!isMobile && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "58px 88px 1fr 280px 120px",
                        gap: 16,
                        padding: "9px 18px",
                        background: "#F7F8F9",
                        borderBottom: "1px solid #E4E7EA",
                        fontSize: 11,
                        letterSpacing: "0.06em",
                        color: "#878F99",
                      }}
                    >
                      <div>流水號</div>
                      <div>主功能</div>
                      <div>調整的項目</div>
                      <div>對應需求</div>
                      <div>狀態</div>
                    </div>
                  )}
                  {v.items.map((item) => {
                    const src = SOURCE_STYLE[item.reqSource];
                    return isMobile ? (
                      <div
                        key={item.id}
                        onClick={() => onOpenDetail(item.reqId)}
                        style={{ padding: "12px 16px", borderBottom: "1px solid #EDEFF1", cursor: "pointer" }}
                        className="row-hover"
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11.5, fontVariantNumeric: "tabular-nums", color: "#6B737D" }}>{item.seqNo}</span>
                          <span style={{ fontFamily: FONT_TC, fontSize: 11.5, border: "1px solid #C7CCD2", padding: "2px 7px", background: "#F4F5F7" }}>
                            {item.feature ?? "—"}
                          </span>
                        </div>
                        <div style={{ fontFamily: FONT_TC, fontSize: 13.5, lineHeight: 1.45, marginBottom: 8 }}>{item.title}</div>
                        <div style={{ fontFamily: FONT_TC, fontSize: 12.5, color: "#5C646E", lineHeight: 1.45, marginBottom: 4 }}>
                          {item.reqTitle}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <span style={{ fontSize: 11, color: "#99A1AA", fontVariantNumeric: "tabular-nums" }}>
                              {item.reqId}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontFamily: FONT_TC,
                                color: src.color,
                                background: src.bg,
                                padding: "1px 6px",
                              }}
                            >
                              {item.reqSource}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: FONT_TC, fontSize: 12.5, color: "#3B424A" }}>
                            <span style={{ width: 7, height: 7, background: STATUS_COLOR[item.status], display: "inline-block" }} />
                            {item.status}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={item.id}
                        onClick={() => onOpenDetail(item.reqId)}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "58px 88px 1fr 280px 120px",
                          gap: 16,
                          padding: "13px 18px",
                          borderBottom: "1px solid #EDEFF1",
                          cursor: "pointer",
                          alignItems: "center",
                        }}
                        className="row-hover"
                      >
                        <div style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: "#6B737D" }}>{item.seqNo}</div>
                        <div style={{ fontFamily: FONT_TC, fontSize: 12, color: "#3B424A" }}>
                          <span style={{ border: "1px solid #C7CCD2", padding: "2px 7px", background: "#F4F5F7" }}>
                            {item.feature ?? "—"}
                          </span>
                        </div>
                        <div style={{ fontFamily: FONT_TC, fontSize: 13.5, lineHeight: 1.45 }}>{item.title}</div>
                        <div>
                          <div style={{ fontFamily: FONT_TC, fontSize: 12.5, color: "#5C646E", lineHeight: 1.45 }}>
                            {item.reqTitle}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 3 }}>
                            <span style={{ fontSize: 11, color: "#99A1AA", fontVariantNumeric: "tabular-nums" }}>
                              {item.reqId}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontFamily: FONT_TC,
                                color: src.color,
                                background: src.bg,
                                padding: "1px 6px",
                              }}
                            >
                              {item.reqSource}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: FONT_TC, fontSize: 12.5, color: "#3B424A" }}>
                          <span style={{ width: 7, height: 7, background: STATUS_COLOR[item.status], display: "inline-block" }} />
                          {item.status}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
