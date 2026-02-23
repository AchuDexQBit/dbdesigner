import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  Input,
  Spin,
  Toast,
} from "@douyinfe/semi-ui";
import { IconDeleteStroked } from "@douyinfe/semi-icons";
import { api } from "../api/client";
import type { Collaborator as ApiCollaborator } from "../api/client";

const PERMISSION_OPTIONS = [
  { value: "view", label: "View" },
  { value: "edit", label: "Edit" },
];

const CARD_BG = "#12111a";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const TEXT_WHITE = "#ffffff";
const TEXT_MUTED = "#6b7280";
const PURPLE = "#7c3aed";

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

  const title = diagramName
    ? `Share: ${diagramName}`
    : "Share diagram";

  return (
    <Modal
      title={title}
      visible={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      closable
      getPopupContainer={() =>
        document.querySelector(".dexqbit-theme") ?? document.body
      }
      modalContentClass="dexqbit-theme"
      bodyStyle={{
        paddingBottom: 24,
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 10,
      }}
    >
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
          <Spin size="large" />
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
      ) : list.length === 0 ? (
        <p
          style={{
            padding: "24px 0",
            fontSize: 14,
            color: TEXT_MUTED,
            margin: 0,
          }}
        >
          No collaborators yet.
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            maxHeight: 280,
            overflowY: "auto",
            borderBottom: `1px solid ${CARD_BORDER}`,
            paddingBottom: 16,
            marginBottom: 16,
          }}
        >
          {list.map((c) => (
            <li
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: `1px solid ${CARD_BORDER}`,
              }}
            >
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
                  fontSize: 12,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {getInitials(c.name, c.email)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: TEXT_WHITE,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.name || c.email || c.id}
                </div>
                {c.email && (
                  <div
                    style={{
                      fontSize: 12,
                      color: TEXT_MUTED,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.email}
                  </div>
                )}
              </div>
              <Select
                size="small"
                value={normalizePermission(c.permission)}
                onChange={(v) => {
                  const val =
                    typeof v === "string"
                      ? (v as "view" | "edit")
                      : (v && typeof v === "object" && "value" in v
                        ? (v as { value: string }).value
                        : undefined);
                  if (val === "view" || val === "edit")
                    handleUpdatePermission(c.id, val);
                }}
                optionList={PERMISSION_OPTIONS}
                style={{ width: 88 }}
              />
              <button
                type="button"
                onClick={() => handleRemove(c.id)}
                aria-label="Remove collaborator"
                style={{
                  padding: 4,
                  border: "none",
                  background: "none",
                  color: TEXT_MUTED,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconDeleteStroked size="small" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!loading && (
        <Form layout="vertical" className="semi-form-vertical">
          <div className="semi-form-field">
            <label className="semi-form-field-label" style={{ color: TEXT_WHITE }}>
              Add person
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
              }}
            >
              <Input
                placeholder="Email"
                value={addEmail}
                onChange={(v) => {
                  setAddEmail(String(v ?? ""));
                  setAddError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                disabled={adding}
                style={{ flex: 1, minWidth: 160 }}
              />
              <Select
                value={addPermission}
                onChange={(v) => {
                  const val = typeof v === "string" ? v : (v as { value?: string })?.value;
                  setAddPermission(val === "edit" || val === "view" ? val : "view");
                }}
                optionList={PERMISSION_OPTIONS}
                disabled={adding}
                style={{ width: 100 }}
              />
              <Button
                theme="solid"
                loading={adding}
                onClick={handleAdd}
                disabled={!addEmail.trim()}
                style={{
                  background: PURPLE,
                  borderColor: PURPLE,
                }}
              >
                Add
              </Button>
            </div>
          </div>
          {addError && (
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: 13,
                color: "var(--semi-color-danger)",
              }}
              role="alert"
            >
              {addError}
            </p>
          )}
        </Form>
      )}
    </Modal>
  );
}
