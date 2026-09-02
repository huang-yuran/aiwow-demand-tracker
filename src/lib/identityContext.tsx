"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Actor = { id: string; name: string };

const IdentityContext = createContext<{ actor: Actor | null }>({ actor: null });

const STORAGE_KEY = "actor";

export function useActor() {
  return useContext(IdentityContext).actor;
}

export function IdentityGate({ children }: { children: React.ReactNode }) {
  const [actor, setActor] = useState<Actor | null | undefined>(undefined); // undefined = 還沒檢查過 sessionStorage
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 讀取瀏覽器 sessionStorage（外部系統），非由 props/state 推導
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActor(raw ? (JSON.parse(raw) as Actor) : null);
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActor(null);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("身份建立失敗");
      const data: Actor = await res.json();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setActor(data);
    } catch {
      setError("發生錯誤，請再試一次");
    } finally {
      setSubmitting(false);
    }
  }

  if (actor === undefined) {
    return <div style={{ minHeight: "100vh", background: "#EEF0F2" }} />;
  }

  if (actor === null) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#EEF0F2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'IBM Plex Sans', 'Noto Sans TC', sans-serif",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: 360,
            background: "#FFFFFF",
            border: "1px solid #D5D9DE",
            borderRadius: 2,
            padding: "28px 26px",
          }}
        >
          <div style={{ fontFamily: "'Noto Sans TC', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
            版本進度台
          </div>
          <div style={{ fontFamily: "'Noto Sans TC', sans-serif", fontSize: 12.5, color: "#5C646E", marginBottom: 18 }}>
            請輸入您的姓名以繼續。分頁關閉後需要重新輸入。
          </div>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="您的姓名"
            style={{
              width: "100%",
              border: "1px solid #C7CCD2",
              borderRadius: 2,
              padding: "9px 11px",
              fontSize: 13.5,
              fontFamily: "'Noto Sans TC', sans-serif",
              marginBottom: 14,
              outline: "none",
            }}
          />
          {error && (
            <div style={{ color: "#A2452F", fontSize: 12, marginBottom: 12, fontFamily: "'Noto Sans TC', sans-serif" }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            style={{
              width: "100%",
              background: submitting || !name.trim() ? "#A9B1BA" : "#1F4C73",
              color: "#fff",
              border: "none",
              borderRadius: 2,
              padding: "10px 14px",
              fontFamily: "'Noto Sans TC', sans-serif",
              fontSize: 13.5,
              fontWeight: 500,
              cursor: submitting || !name.trim() ? "default" : "pointer",
            }}
          >
            進入
          </button>
        </form>
      </div>
    );
  }

  return <IdentityContext.Provider value={{ actor }}>{children}</IdentityContext.Provider>;
}
