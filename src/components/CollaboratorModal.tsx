import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Avatar,
  Select,
  Button,
  Input,
  Tag,
  Toast,
  Spin,
} from "@douyinfe/semi-ui";
import { IconDeleteStroked } from "@douyinfe/semi-icons";
import { api } from "../api/client";

export type Collaborator = {
  userId?: string;
  id?: string;
  name?: string;
  email?: string;
  permission: string;
};

const PERMISSION_OPTIONS = [
  { value: "read", label: "View" },
  { value: "write", label: "Edit" },
];

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

function permissionLabel(permission: string): string {
  const p = (permission ?? "").toLowerCase();
  if (p === "edit" || p === "write") return "Edit";
  if (p === "view" || p === "read") return "View";
  return PERMISSION_OPTIONS.find((o) => o.value === permission)?.label ?? permission;
}

/** Normalize API permission to option value so Select always has a valid value. */
function normalizePermission(p: string | undefined): string {
  if (!p) return "read";
  const lower = String(p).toLowerCase();
  if (lower === "write" || lower === "edit" || lower === "editor") return "write";
  return "read";
}

type Props = {
  diagramId: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function CollaboratorModal({
  diagramId,
  isOpen,
  onClose,
}: Props) {
  const [list, setList] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addPermission, setAddPermission] = useState("read");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const load = async () => {
    if (!diagramId) return;
    setLoading(true);
    try {
      const data = (await api.listCollaborators(diagramId)) as
        | Collaborator[]
        | { collaborators?: Collaborator[] };
      setList(
        Array.isArray(data) ? data : data?.collaborators ?? []
      );
    } catch {
      setList([]);
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
      await api.addCollaborator(diagramId, email, addPermission);
      setAddEmail("");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      const is404 =
        message.toLowerCase().includes("404") ||
        message.toLowerCase().includes("not found");
      if (is404) {
        setAddError(message || "User not found.");
      } else {
        setAddError(null);
        Toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleUpdatePermission = async (userId: string, permission: string) => {
    const value = normalizePermission(permission);
    try {
      const res = await api.updateCollaborator(diagramId, userId, value);
      const data = res && typeof res === "object" && "permission" in res ? (res as { permission: string }) : null;
      const serverPermission = data?.permission;
      setList((prev) =>
        prev.map((c) => {
          const uid = c.userId ?? c.id ?? "";
          if (uid !== userId) return c;
          const perm = serverPermission ?? value;
          return { ...c, permission: perm };
        }),
      );
      if (!serverPermission) await load();
    } catch {
      Toast.error("Failed to update permission.");
      await load();
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await api.removeCollaborator(diagramId, userId);
      await load();
    } catch {
      Toast.error("Failed to remove collaborator.");
    }
  };

  return (
    <Modal
      title="Share Diagram"
      visible={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      closable
      getPopupContainer={() => document.querySelector(".dexqbit-theme") ?? document.body}
      modalContentClass="dexqbit-theme"
      bodyStyle={{ paddingBottom: 24 }}
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : list.length === 0 ? (
        <p className="text-sm py-4" style={{ color: "var(--dexqbit-text-muted)" }}>
          No collaborators yet.
        </p>
      ) : (
        <ul className="space-y-0 max-h-64 overflow-y-auto border-b pb-4 mb-4" style={{ borderColor: "var(--dexqbit-border)" }}>
          {list.map((c) => {
            const uid = c.userId ?? c.id ?? "";
            const displayName = c.name ?? c.email ?? uid;
            const initials = getInitials(c.name, c.email);
            return (
              <li
                key={uid}
                className="flex items-center gap-3 py-3 border-b last:border-0"
                style={{ borderColor: "var(--dexqbit-border)" }}
              >
                <Avatar size="small" color="blue">
                  {initials}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" style={{ color: "var(--dexqbit-text)" }}>
                    {displayName}
                  </div>
                  {c.email && c.name && (
                    <div className="text-xs truncate" style={{ color: "var(--dexqbit-text-muted)" }}>
                      {c.email}
                    </div>
                  )}
                </div>
                <Tag size="small" color="blue">
                  {permissionLabel(c.permission)}
                </Tag>
                <Select
                  size="small"
                  value={normalizePermission(c.permission)}
                  onChange={(v) => {
                  const val =
                    typeof v === "string"
                      ? v
                      : (v && typeof v === "object" && "value" in v
                          ? (v as { value: string }).value
                          : undefined) ?? c.permission;
                  handleUpdatePermission(uid, val);
                }}
                  optionList={PERMISSION_OPTIONS}
                  style={{ width: 88 }}
                />
                <Button
                  type="danger"
                  theme="borderless"
                  icon={<IconDeleteStroked />}
                  size="small"
                  onClick={() => handleRemove(uid)}
                  aria-label="Remove collaborator"
                />
              </li>
            );
          })}
        </ul>
      )}

      <Form layout="vertical" className="semi-form-vertical">
        <div className="semi-form-field">
          <label className="semi-form-field-label">Add person</label>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Input
              placeholder="Email"
              value={addEmail}
              onChange={(v) => {
                setAddEmail(String(v ?? ""));
                setAddError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              disabled={adding}
              className="flex-1"
              style={{ minWidth: 160 }}
            />
            <Select
              value={addPermission}
              onChange={(v) => setAddPermission(String(v ?? "read"))}
              optionList={PERMISSION_OPTIONS}
              disabled={adding}
              style={{ width: 100 }}
            />
            <Button
              theme="solid"
              loading={adding}
              onClick={handleAdd}
              disabled={!addEmail.trim()}
            >
              Add
            </Button>
          </div>
        </div>
        {addError && (
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--semi-color-danger)" }}
            role="alert"
          >
            {addError}
          </p>
        )}
      </Form>
    </Modal>
  );
}
