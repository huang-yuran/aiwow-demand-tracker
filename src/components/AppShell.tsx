"use client";

import { useCallback, useEffect, useState } from "react";
import { FONT_TC, FONT_BASE } from "@/lib/designTokens";
import type { RequirementDTO, ReleaseCardDTO } from "@/lib/types";
import { useActor } from "@/lib/identityContext";
import { VersionView } from "./VersionView";
import { ListView } from "./ListView";
import { DetailSidebar } from "./DetailSidebar";
import { ImportDialog } from "./ImportDialog";
import { RequirementForm } from "./RequirementForm";

type View = "version" | "list";

export function AppShell() {
  const actor = useActor();
  const [view, setView] = useState<View>("version");
  const [requirements, setRequirements] = useState<RequirementDTO[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [releases, setReleases] = useState<ReleaseCardDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("全部");
  const [source, setSource] = useState("老闆需求");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [createReqOpen, setCreateReqOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [reqRes, relRes] = await Promise.all([fetch("/api/requirements"), fetch("/api/releases")]);
    const reqData = await reqRes.json();
    const relData = await relRes.json();
    setRequirements(reqData.rows);
    setCounts(reqData.counts);
    setReleases(relData.versions);
    setOpenMap((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      const initial: Record<string, boolean> = {};
      relData.versions.forEach((v: ReleaseCardDTO, i: number) => {
        initial[v.version] = i < 2; // 預設展開前兩個版本
      });
      return initial;
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    // 掛載時向 API 抓資料（外部系統同步），非由 props/state 推導
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const rows = requirements
    .filter((r) => r.source === source)
    .filter((r) => filter === "全部" || r.status === filter);

  const detail = requirements.find((r) => r.id === detailId) ?? null;

  function tabStyle(active: boolean) {
    return {
      background: "none",
      border: "none",
      borderBottom: `2px solid ${active ? "#1F4C73" : "transparent"}`,
      color: active ? "#16191D" : "#6B737D",
      fontFamily: FONT_TC,
      fontSize: 13.5,
      fontWeight: active ? 500 : 400,
      padding: "14px 2px 12px",
      cursor: "pointer",
    } as const;
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: FONT_BASE, color: "#16191D", fontSize: 14 }}>
      <header
        style={{
          background: "#171A1F",
          color: "#EDEFF2",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 52,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <span style={{ fontWeight: 600, letterSpacing: "0.02em", fontSize: 15 }}>版本進度台</span>
          <span style={{ fontSize: 12, color: "#8A929C" }}>Aiwow進度開發追蹤</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#C7CCD2" }}>{actor?.name ?? ""}</span>
        </div>
      </header>

      <nav style={{ background: "#FFFFFF", borderBottom: "1px solid #D5D9DE", padding: "0 28px", display: "flex", gap: 26 }}>
        <button onClick={() => setView("version")} style={tabStyle(view === "version")}>
          版本視圖
        </button>
        <button onClick={() => setView("list")} style={tabStyle(view === "list")}>
          需求列表
        </button>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setImportOpen(true)}
            style={{
              background: "#FFFFFF",
              color: "#16191D",
              border: "1px solid #C7CCD2",
              padding: "7px 14px",
              fontFamily: FONT_TC,
              fontSize: 13,
              cursor: "pointer",
              borderRadius: 2,
              alignSelf: "center",
            }}
          >
            匯入 Excel
          </button>
          <button
            onClick={() => setCreateReqOpen(true)}
            style={{
              background: "#1F4C73",
              color: "#fff",
              border: "none",
              padding: "7px 14px",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              borderRadius: 2,
              alignSelf: "center",
            }}
          >
            ＋ 提出新需求
          </button>
        </div>
      </nav>

      {loading ? (
        <div style={{ padding: 40, fontFamily: FONT_TC, fontSize: 13, color: "#6B737D" }}>載入中…</div>
      ) : view === "version" ? (
        <VersionView
          versions={releases}
          openMap={openMap}
          onToggle={(v) => setOpenMap((s) => ({ ...s, [v]: !s[v] }))}
          onOpenDetail={(id) => setDetailId(id)}
          onVersionUpdated={load}
        />
      ) : (
        <ListView
          rows={rows}
          counts={counts}
          filter={filter}
          source={source}
          expanded={expanded}
          onFilterChange={setFilter}
          onSourceChange={setSource}
          onToggleExpand={(id) => setExpanded((s) => ({ ...s, [id]: !s[id] }))}
          onOpenDetail={(id) => setDetailId(id)}
        />
      )}

      <DetailSidebar
        detail={detail}
        onClose={() => setDetailId(null)}
        onDeleted={() => {
          setDetailId(null);
          load();
        }}
        onChanged={load}
      />

      {importOpen && (
        <ImportDialog
          onClose={() => setImportOpen(false)}
          onImported={() => {
            load();
          }}
        />
      )}

      {createReqOpen && (
        <RequirementForm
          requirement={null}
          onClose={() => setCreateReqOpen(false)}
          onSaved={() => {
            setCreateReqOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}
