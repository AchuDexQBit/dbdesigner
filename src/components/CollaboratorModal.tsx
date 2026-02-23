import React, { useEffect, useState } from "react";
import { Toast } from "@douyinfe/semi-ui";
import { api } from "../api/client";
import type { Collaborator as ApiCollaborator } from "../api/client";
import { useUser } from "../context/UserContext";

const PERMISSION_OPTIONS = [
  { value: "view", label: "View" },
  { value: "edit", label: "Edit" },
];

const MODAL_BG = "#12111a";
const CARD_BG = "rgba(255,255,255,0.06)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT_WHITE = "#ffffff";
const TEXT_MUTED = "rgba(255,255,255,0.55)";
const PURPLE = "#7c3aed";
const OVERLAY_BG = "rgba(0,0,0,0.65)";
const INPUT_BG = "rgba(255,255,255,0.06)";
const BADGE_BG = "rgba(255,255,255,0.12)";
const DIVIDER = "rgba(255,255,255,0.1)";

function getInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    const local = email.split("@")[0];
    if (local.length >= 2) return local.slice(0, 2).toUpperCase();
    return local.slice(0, 1).toUpperCase();
  }
  return "?";
}

function normalizePermission(p: string | undefined): "view" | "edit" {
  const lower = (p ?? "").toLowerCase();
  if (lower === "edit" || lower === "write" || lower === "editor") return "edit";
  return "view";
}

function permissionLabel(p: string): string {
  return normalizePermission(p) === "edit" ? "Editor" : "Viewer";
}

export interface CollaboratorModalProps {
  diagramId: string;
  diagramName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CollaboratorModal({
  diagramId,
  diagramName,
  isOpen,
  onClose,
}: CollaboratorModalProps) {
  const { user: currentUser } = useUser();
  const [list, setList] = useState<ApiCollaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addPermission, setAddPermission] = useState<"view" | "edit">("view");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const load = async () => {
    if (!diagramId) return;
    setLoading(true);
    setLoadError(false);
    try {
      const data = await api.listCollaborators(diagramId);
      setList(Array.isArray(data) ? data : []);
    } catch {
      setList([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && diagramId) load();
  }, [isOpen, diagramId]);

  const handleAdd = async () => {
    const email = addEmail.trim();
    if (!email) return;
    setAdding(true);
    setAddError(null);
    try {
      const res = await api.addCollaborator(diagramId, email, addPermission);
      const user = res?.user;
      if (user) {
        setList((prev) => [
          ...prev,
          {
            id: user.id,
            name: user.name,
            email: user.email,
            permission: addPermission,
            added_at: new Date().toISOString(),
          },
        ]);
      }
      setAddEmail("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const is404 =
        msg.toLowerCase().includes("404") ||
        msg.toLowerCase().includes("not found");
      if (is404) {
        setAddError("No account found for that email.");
      } else {
        setAddError("Failed to add collaborator.");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleUpdatePermission = async (
    userId: string,
    permission: "view" | "edit"
  ) => {
    try {
      await api.updateCollaborator(diagramId, userId, permission);
      setList((prev) =>
        prev.map((c) =>
          c.id === userId ? { ...c, permission } : c
        )
      );
    } catch {
      Toast.error("Failed to update permission.");
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await api.removeCollaborator(diagramId, userId);
      setList((prev) => prev.filter((c) => c.id !== userId));
    } catch {
      Toast.error("Failed to remove collaborator.");
    }
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: TEXT_MUTED,
    margin: "0 0 8px 0",
    textTransform: "uppercase",
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-diagram-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      {/* Overlay — click to close */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: OVERLAY_BG,
          cursor: "pointer",
        }}
        onClick={onClose}
        aria-hidden
      />

      {/* Modal panel */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          maxHeight: "calc(100vh - 48px)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: MODAL_BG,
          borderRadius: 16,
          boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
          border: `1px solid ${CARD_BORDER}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: title + close X */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "20px 24px 0",
          }}
        >
          <h2
            id="share-diagram-title"
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: TEXT_WHITE,
              fontFamily: "'Audiowide', system-ui, sans-serif",
            }}
          >
            Share Diagram
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              margin: -4,
              padding: 4,
              border: "none",
              background: "none",
              color: TEXT_WHITE,
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
              opacity: 0.9,
            }}
          >
            ×
          </button>
        </div>

        {/* Divider below title */}
        <div
          style={{
            height: 1,
            background: DIVIDER,
            margin: "16px 24px 0",
          }}
        />

        {/* Body — scrollable */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 24px 16px",
          }}
        >
          {/* INVITE VIA EMAIL */}
          <section style={{ marginBottom: 24 }}>
            <p style={sectionLabelStyle}>Invite via email</p>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "stretch",
                flexWrap: "wrap",
              }}
            >
              <input
                type="email"
                placeholder="Email Address"
                value={addEmail}
                onChange={(e) => {
                  setAddEmail(e.target.value);
                  setAddError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                disabled={adding}
                style={{
                  flex: "1 1 160px",
                  minWidth: 0,
                  height: 40,
                  padding: "0 14px",
                  borderRadius: 10,
                  border: `1px solid ${CARD_BORDER}`,
                  background: INPUT_BG,
                  color: TEXT_WHITE,
                  fontSize: 14,
                }}
              />
              <select
                value={addPermission}
                onChange={(e) =>
                  setAddPermission(
                    e.target.value === "edit" ? "edit" : "view"
                  )
                }
                disabled={adding}
                style={{
                  width: 100,
                  height: 40,
                  padding: "0 12px",
                  borderRadius: 10,
                  border: `1px solid ${CARD_BORDER}`,
                  background: INPUT_BG,
                  color: TEXT_WHITE,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {PERMISSION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!addEmail.trim() || adding}
                style={{
                  width: 80,
                  height: 40,
                  padding: 0,
                  borderRadius: 10,
                  border: "none",
                  background: PURPLE,
                  color: TEXT_WHITE,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: adding ? "wait" : "pointer",
                  opacity: !addEmail.trim() ? 0.6 : 1,
                }}
              >
                {adding ? "..." : "Add"}
              </button>
            </div>
            {addError && (
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: 13,
                  color: "#f87171",
                }}
                role="alert"
              >
                {addError}
              </p>
            )}
          </section>

          {/* SHARED WITH */}
          <section>
            <p style={sectionLabelStyle}>Shared with</p>

            {loading ? (
              <div
                style={{
                  padding: "32px 0",
                  textAlign: "center",
                  color: TEXT_MUTED,
                  fontSize: 14,
                }}
              >
                Loading…
              </div>
            ) : loadError ? (
              <p
                style={{
                  padding: "24px 0",
                  fontSize: 14,
                  color: TEXT_MUTED,
                  margin: 0,
                }}
              >
                Failed to load collaborators.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  maxHeight: 280,
                  overflowY: "auto",
                }}
              >
                {/* Owner row (current user) */}
                {currentUser && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      background: CARD_BG,
                      borderRadius: 12,
                      border: `1px solid ${CARD_BORDER}`,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: PURPLE,
                        color: TEXT_WHITE,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(currentUser.name, currentUser.email)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: TEXT_WHITE,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {currentUser.name || currentUser.email || "You"}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: TEXT_MUTED,
                          fontStyle: "italic",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Owner
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: 9999,
                        background: BADGE_BG,
                        color: TEXT_WHITE,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      Editor
                    </span>
                  </div>
                )}

                {/* Collaborator rows */}
                {list.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      background: CARD_BG,
                      borderRadius: 12,
                      border: `1px solid ${CARD_BORDER}`,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "rgba(120,120,140,0.5)",
                        color: TEXT_WHITE,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(c.name, c.email)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: TEXT_WHITE,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.name || c.email || c.id}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: TEXT_MUTED,
                          fontStyle: "italic",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.email || permissionLabel(c.permission)}
                      </div>
                    </div>
                    <select
                      value={normalizePermission(c.permission)}
                      onChange={(e) => {
                        const v =
                          e.target.value === "edit" ? "edit" : "view";
                        handleUpdatePermission(c.id, v);
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 9999,
                        border: `1px solid ${CARD_BORDER}`,
                        background: BADGE_BG,
                        color: TEXT_WHITE,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        minWidth: 72,
                      }}
                    >
                      {PERMISSION_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label === "View" ? "Viewer" : "Editor"}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemove(c.id)}
                      aria-label="Remove collaborator"
                      style={{
                        width: 32,
                        height: 32,
                        padding: 0,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(255,255,255,0.15)",
                        color: TEXT_WHITE,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        lineHeight: 1,
                      }}
                    >
                      ⊖
                    </button>
                  </div>
                ))}

                {!loading && !loadError && list.length === 0 && (
                  <p
                    style={{
                      padding: currentUser ? "12px 0 0" : "24px 0 0",
                      fontSize: 13,
                      color: TEXT_MUTED,
                      margin: 0,
                    }}
                  >
                    No collaborators yet.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Footer: Close */}
        <div
          style={{
            padding: "12px 24px 20px",
            borderTop: `1px solid ${DIVIDER}`,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              border: "none",
              background: "none",
              color: TEXT_MUTED,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
