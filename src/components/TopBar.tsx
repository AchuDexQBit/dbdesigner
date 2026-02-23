import React from "react";
import { useUser } from "../context/UserContext";
import { api } from "../api/client";

// Match tools-FE app/dashboard/page.tsx and app/components/LogoutButton.tsx
const BAR_BG = "#12111a";
const BAR_BORDER = "rgba(255,255,255,0.1)";
const TEXT_WHITE = "#ffffff";
const PURPLE = "#9A70DD"; // tools top bar avatar/accent
const PURPLE_BORDER = "rgba(154,112,221,0.3)";
const SEPARATOR = "rgba(74,46,112,0.8)";
const LOGOUT_TEXT = "#94a3b8";
const LOGOUT_HOVER_BG = "rgba(255,255,255,0.05)";
const LOGOUT_HOVER_TEXT = "#b3b3b3";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase() || "?";
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function getLoginRedirectUrl(): string {
  const base = import.meta.env.VITE_TOOLS_URL ?? "";
  return base ? `${base.replace(/\/$/, "")}` : "";
}

export default function TopBar() {
  const { user } = useUser();

  if (!user) return null;

  const displayName = user.name?.trim() || user.email || "User";
  const initials = getInitials(displayName);

  const handleLogout = async () => {
    try {
      await api.logout();
      window.location.href = getLoginRedirectUrl();
    } catch (e) {
      console.error("[TopBar] Logout failed", e);
    }
  };

  return (
    <header
      style={{
        width: "100%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: BAR_BG,
        borderBottom: `1px solid ${BAR_BORDER}`,
        padding: "16px 0",
        boxSizing: "border-box",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      }}
      className="topbar-header"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <p
          style={{
            margin: 0,
            fontSize: "1.2rem",
            fontWeight: 400,
            color: PURPLE,
            fontFamily: "'Audiowide', system-ui, sans-serif",
          }}
          className="topbar-title-responsive"
        >
          DB Designer
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: TEXT_WHITE,
            }}
          >
            {displayName}
          </p>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `2px solid ${PURPLE_BORDER}`,
            background: PURPLE,
            color: TEXT_WHITE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 600,
            flexShrink: 0,
          }}
          aria-hidden
        >
          {initials}
        </div>
        <div
          style={{
            width: 1,
            height: 32,
            background: SEPARATOR,
            flexShrink: 0,
          }}
          aria-hidden
        />
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 8px",
            borderRadius: 6,
            border: "none",
            background: "none",
            color: LOGOUT_TEXT,
            fontSize: 14,
            fontWeight: 400,
            cursor: "pointer",
          }}
          className="topbar-logout-btn"
          aria-label="Log out"
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
