import React from "react";
import { useUser } from "../context/UserContext";
import { api } from "../api/client";
import { getLoginUrl } from "../api/client";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase() || "?";
}

export default function TopBar() {
  const { user } = useUser();

  const full_name = user?.full_name?.trim() || user?.email || "User";
  const initials = user ? getInitials(full_name) : "…";
  const designation = user?.designation?.trim() ?? "";

  const handleLogout = async () => {
    try {
      await api.logout();
      window.location.href = getLoginUrl();
    } catch (e) {
      console.error("[TopBar] Logout failed", e);
    }
  };

  return (
    <header
      style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "16px 24px",
        background: "rgba(15,10,26,0.85)",
        minHeight: 56,
        boxSizing: "border-box",
      }}
      className="px-6 py-4 md:px-8"
    >
      {/* Left — title */}
      <p
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 400,
          color: "#7c3aed",
          fontFamily: "'Audiowide', system-ui, sans-serif",
        }}
      >
        Dexi - DB Designer
      </p>

      {/* Right — user block */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* User name + designation (hidden on small screens) */}
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontWeight: 600, color: "#ffffff", fontSize: 16 }}>
            {full_name}
          </p>
          {designation ? (
            <p style={{ margin: "2px 0 0 0", fontSize: 14, color: "#9A70DD" }}>
              {designation}
            </p>
          ) : null}
        </div>

        {/* Avatar (initials) */}
        <div
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: "50%",
            border: "2px solid rgba(154,112,221,0.3)",
            background: "#9A70DD",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-hidden
        >
          {initials}
        </div>

        {/* Vertical divider */}
        <div
          style={{
            width: 1,
            height: 32,
            flexShrink: 0,
            background: "rgba(74,46,112,0.8)",
          }}
          aria-hidden
        />

        {/* Logout */}
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 8px",
            borderRadius: 6,
            border: "none",
            background: "transparent",
            color: "#94a3b8",
            fontSize: 14,
            fontWeight: 400,
            cursor: "pointer",
          }}
          className="hover:bg-white/5 hover:text-[#b3b3b3]"
          aria-label="Log out"
          onClick={handleLogout}
        >
          <img
            src="/logout.png"
            alt=""
            width={20}
            height={20}
            style={{ opacity: 0.9 }}
          />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
