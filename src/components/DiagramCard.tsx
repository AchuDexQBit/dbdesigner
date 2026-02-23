import React from "react";
import type { Diagram, SharedDiagram } from "../api/client";
import { relativeTime } from "../utils/relativeTime";

const CARD_BG = "#12111a";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const TEXT_WHITE = "#ffffff";
const TEXT_MUTED = "#6b7280";
const PURPLE = "#7c3aed";
const ICON_BG_OWNED = "rgba(124,58,237,0.25)";
const ICON_BG_SHARED = "rgba(100,100,120,0.3)";

/** DB Designer app icon (from public/dbdesigner.png). Used for both owned and shared cards. */
function DiagramCardIcon() {
  return (
    <img
      src="/dbdesigner.png"
      alt=""
      width={20}
      height={20}
      style={{ objectFit: "contain" }}
    />
  );
}

/** Branching share icon (3 nodes connected by lines), 18×18. */
function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.5 10.5 15.5 7.5M8.5 13.5l7 4" />
    </svg>
  );
}

/** Trash icon, 18×18. */
function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

/** Filled circle clock icon, 12×12. */
function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export type DiagramCardItem = Diagram | SharedDiagram;

function isSharedDiagram(d: DiagramCardItem): d is SharedDiagram {
  return "owner_name" in d && "permission" in d;
}

export interface DiagramCardProps {
  diagram: DiagramCardItem;
  isOwned: boolean;
  currentUserId: string;
  onShare: (diagramId: string) => void;
  onDelete: (diagramId: string) => void;
}

export default function DiagramCard({
  diagram,
  isOwned,
  currentUserId,
  onShare,
  onDelete,
}: DiagramCardProps) {
  const ownerLabel = isOwned ? "You" : isSharedDiagram(diagram) ? diagram.owner_name : "—";
  const updatedAt = diagram.updated_at ?? "";
  const timeLabel = relativeTime(updatedAt);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-card-actions]")) return;
    const base = window.location.pathname.replace(/\/dashboard\/?$/, "") || "";
    const url = `${window.location.origin}${base}/editor/${diagram.id}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this diagram? This cannot be undone.")) return;
    onDelete(diagram.id);
  };

  const showActions = isOwned && diagram.owner_id === currentUserId;
  const iconBg = isOwned ? ICON_BG_OWNED : ICON_BG_SHARED;

  const openShareModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare(diagram.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick(e as unknown as React.MouseEvent);
        }
      }}
      style={{
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 10,
        padding: 20,
        cursor: "pointer",
        minWidth: 0,
      }}
    >
      {/* Row 1: icon area + action buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <DiagramCardIcon />
        </div>
        {showActions && (
          <div data-card-actions style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
            <button
              type="button"
              onClick={openShareModal}
              aria-label="Share"
              style={{
                padding: 0,
                border: "none",
                background: "none",
                color: TEXT_MUTED,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="dashboard-card-action"
            >
              <ShareIcon />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Delete"
              style={{
                padding: 0,
                border: "none",
                background: "none",
                color: TEXT_MUTED,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="dashboard-card-action"
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </div>

      {/* 24px gap then diagram name */}
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: TEXT_WHITE,
          margin: "24px 0 12px 0",
          padding: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontFamily: "'Audiowide', system-ui, sans-serif",
        }}
      >
        {diagram.name}
      </h3>

      {/* Created by */}
      <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0 }}>
        Created by: <span style={{ color: PURPLE }}>{ownerLabel}</span>
      </p>

      {/* Clock row: 8px margin top, 4px gap, 12px text */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginTop: 8,
          fontSize: 12,
          color: TEXT_MUTED,
        }}
      >
        <ClockIcon />
        <span>Last updated: {timeLabel}</span>
      </div>
    </div>
  );
}
