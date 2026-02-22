import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Button, Tag, Spin } from "@douyinfe/semi-ui";
import { IconUserAdd, IconDeleteStroked } from "@douyinfe/semi-icons";
import { api } from "../api/client";
import CollaboratorModal from "../components/CollaboratorModal";
import ChangePasswordModal from "../components/ChangePasswordModal";

type User = { name?: string; email?: string };
type Diagram = {
  id: string;
  name: string;
  updatedAt?: string;
  updated_at?: string;
  ownerName?: string;
  owner_name?: string;
  permission?: string;
};

type DiagramsData = { owned: Diagram[]; shared: Diagram[] };

function formatDate(raw?: string): string {
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DiagramCard({
  diagram,
  isOwned,
  onOpen,
  onShare,
  onDelete,
  onRefresh,
}: {
  diagram: Diagram;
  isOwned: boolean;
  onOpen: (id: string) => void;
  onShare: (d: Diagram) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}) {
  const updated =
    diagram.updatedAt ?? diagram.updated_at;
  const ownerName = diagram.ownerName ?? diagram.owner_name ?? "—";
  const permission = diagram.permission ?? "read";

  const handleDelete = () => {
    if (!window.confirm(`Delete "${diagram.name}"? This cannot be undone.`))
      return;
    api
      .deleteDiagram(diagram.id)
      .then(() => onRefresh())
      .catch(() => {});
  };

  return (
    <Card
      key={diagram.id}
      className="flex flex-col"
      style={{ minWidth: 260 }}
      bodyStyle={{ flex: 1, display: "flex", flexDirection: "column" }}
    >
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3
            className="font-semibold truncate flex-1 min-w-0"
            style={{ color: "var(--dexqbit-text)" }}
          >
            {diagram.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isOwned && (
              <Tag size="small" color="blue">
                {permission}
              </Tag>
            )}
            {isOwned && (
              <Button
                type="danger"
                theme="borderless"
                size="small"
                icon={<IconDeleteStroked />}
                onClick={handleDelete}
                aria-label="Delete diagram"
              />
            )}
          </div>
        </div>
        {!isOwned && (
          <p
            className="text-sm mb-1"
            style={{ color: "var(--dexqbit-text-muted)" }}
          >
            Owner: {ownerName}
          </p>
        )}
        <p
          className="text-xs mb-4"
          style={{ color: "var(--dexqbit-text-muted)" }}
        >
          Updated {formatDate(updated)}
        </p>
        <div className="flex flex-wrap gap-2 mt-auto">
          <Button theme="solid" onClick={() => onOpen(diagram.id)}>
            Open
          </Button>
          {isOwned && (
            <Button
              theme="light"
              icon={<IconUserAdd />}
              onClick={() => onShare(diagram)}
              aria-label="Share"
            >
              Share
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [diagrams, setDiagrams] = useState<DiagramsData>({ owned: [], shared: [] });
  const [loading, setLoading] = useState(true);
  const [shareModal, setShareModal] = useState<Diagram | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, diagramsRes] = await Promise.all([
        api.me(),
        api.listDiagrams(),
      ]);
      setUser((meRes as User) ?? null);
      setDiagrams(
        (diagramsRes as DiagramsData) ?? { owned: [], shared: [] }
      );
    } catch {
      setUser(null);
      setDiagrams({ owned: [], shared: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSignOut = async () => {
    try {
      await api.logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleNewDiagram = () => {
    const name = window.prompt("Diagram name", "Untitled Diagram");
    if (name == null || name.trim() === "") return;
    api
      .createDiagram(name.trim())
      .then((res: unknown) => {
        const id = (res as { id?: string })?.id;
        if (id) navigate(`/editor/${id}`);
        else load();
      })
      .catch(() => load());
  };

  const handleOpen = (id: string) => {
    navigate(`/editor/${id}`);
  };

  if (loading && !user) {
    return (
      <div className="dexqbit-theme min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="dexqbit-theme min-h-screen flex flex-col">
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: "var(--dexqbit-border)",
          backgroundColor: "var(--dexqbit-bg-elevated)",
        }}
      >
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold hover:opacity-80 no-underline"
          style={{ color: "var(--dexqbit-text)" }}
        >
          <img
            src="/logo.png"
            alt=""
            className="h-8 w-auto object-contain"
          />
          DexQBit DB Designer
        </Link>
        <div className="flex items-center gap-3">
          <span
            className="font-bold text-lg"
            style={{ color: "var(--dexqbit-text)" }}
          >
            Hi, {user?.name ?? user?.email ?? "User"}
          </span>
          <Button theme="borderless" onClick={() => setChangePasswordOpen(true)}>
            Change Password
          </Button>
          <Button theme="borderless" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <Button theme="solid" onClick={handleNewDiagram}>
            New Diagram
          </Button>
        </div>

        {/* My Diagrams */}
        <section className="mb-10">
          <h2
            className="text-base font-bold mb-4 py-2 px-3 rounded-md border-l-4"
            style={{
              color: "var(--dexqbit-text)",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderLeftColor: "var(--dexqbit-accent)",
            }}
          >
            My Diagrams
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spin />
            </div>
          ) : !diagrams.owned?.length ? (
            <p
              className="py-6"
              style={{ color: "var(--dexqbit-text-muted)" }}
            >
              No diagrams yet. Create one with &quot;New Diagram&quot;.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {diagrams.owned.map((d) => (
                <DiagramCard
                  key={d.id}
                  diagram={d}
                  isOwned
                  onOpen={handleOpen}
                  onShare={setShareModal}
                  onDelete={() => {}}
                  onRefresh={load}
                />
              ))}
            </div>
          )}
        </section>

        {/* Shared with me */}
        <section>
          <h2
            className="text-base font-bold mb-4 py-2 px-3 rounded-md border-l-4"
            style={{
              color: "var(--dexqbit-text)",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderLeftColor: "var(--dexqbit-accent)",
            }}
          >
            Shared with me
          </h2>
          {loading ? null : !diagrams.shared?.length ? (
            <p
              className="py-6"
              style={{ color: "var(--dexqbit-text-muted)" }}
            >
              No diagrams shared with you yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {diagrams.shared.map((d) => (
                <DiagramCard
                  key={d.id}
                  diagram={d}
                  isOwned={false}
                  onOpen={handleOpen}
                  onShare={() => {}}
                  onDelete={() => {}}
                  onRefresh={load}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {shareModal && (
        <CollaboratorModal
          diagramId={shareModal.id}
          isOpen={!!shareModal}
          onClose={() => setShareModal(null)}
        />
      )}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
}
