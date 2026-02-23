import React from "react";
import { useUser } from "../context/UserContext";
import { api, getLoginUrl } from "../api/client";

const BAR_BG = "#12111a";
const BORDER = "rgba(255,255,255,0.1)";
const TEXT_WHITE = "#ffffff";
const TEXT_MUTED = "#6b7280";
const PURPLE = "#7c3aed";

function getInitials(name: string, email: string): string {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }
  if (email?.trim()) {
    return email.trim().slice(0, 2).toUpperCase();
  }
  return "?";
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function Titlebar() {
  const { user } = useUser();

  if (!user) return null;

  const displayName = user.name?.trim() || user.email || "User";
  const greetingName = user.name?.trim()?.split(/\s+/)[0] || displayName;
  const initials = getInitials(user.name ?? "", user.email ?? "");
  const subtitle = user.email ?? "";

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <header
      style={{
        width: "100%",
        background: BAR_BG,
        borderBottom: `1px solid ${BORDER}`,
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          fontSize: 16,
          fontWeight: 400,
          color: TEXT_WHITE,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        Hi, {greetingName}
      </span>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "right" }}>
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 400,
                color: TEXT_WHITE,
                fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              {displayName}
            </div>
            {subtitle && (
              <div
                style={{
                  fontSize: 12,
                  color: TEXT_MUTED,
                  marginTop: 2,
                  fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: PURPLE,
              color: TEXT_WHITE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 600,
              flexShrink: 0,
              fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {initials}
          </div>
        </div>

        <div
          style={{
            width: 1,
            height: 24,
            background: BORDER,
            flexShrink: 0,
          }}
        />

        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 0",
            border: "none",
            background: "none",
            color: TEXT_MUTED,
            fontSize: 13,
            fontWeight: 400,
            cursor: "pointer",
            fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          }}
          className="titlebar-logout-btn"
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
