import React from "react";
import { useUser } from "../context/UserContext";
import { api } from "../api/client";

// Match tools dashboard: border-white/10, purple accent #7c3aed for title, avatar #9A70DD, divider #4A2E70/80
const BAR_BORDER = "rgba(255,255,255,0.1)";
const TEXT_WHITE = "#ffffff";
const TITLE_PURPLE = "#7c3aed";
const PURPLE = "#9A70DD";
const PURPLE_BORDER = "rgba(154,112,221,0.3)";
const SEPARATOR = "rgba(74,46,112,0.8)";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase() || "?";
}

function getLoginRedirectUrl(): string {
  const base = (import.meta.env.VITE_TOOLS_URL ?? "").replace(/\/$/, "");
  return base ? `${base}/login` : "/login";
}

export default function TopBar() {
  const { user } = useUser();

  if (!user) return null;

  const displayName = user.name?.trim() || user.email || "User";
  const initials = getInitials(displayName);
  const designation = user.designation?.trim() ?? "";

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
      className="topbar-header"
      style={{
        width: "100%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${BAR_BORDER}`,
        paddingTop: 16,
        paddingBottom: 16,
        boxSizing: "border-box",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 400,
          color: TITLE_PURPLE,
          fontFamily: "'Audiowide', system-ui, sans-serif",
        }}
      >
        DexQBit DB Designer
      </p>

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
          {designation ? (
            <p
              style={{
                margin: "2px 0 0 0",
                fontSize: 14,
                color: PURPLE,
              }}
            >
              {designation}
            </p>
          ) : null}
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
      </div>
    </header>
  );
}
