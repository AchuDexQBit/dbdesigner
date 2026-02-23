import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Spin, Toast } from "@douyinfe/semi-ui";
import { IconPlus } from "@douyinfe/semi-icons";
import { api } from "../api/client";
import type { Diagram, SharedDiagram } from "../api/client";
import { useUser } from "../context/UserContext";
import DiagramCard, { type DiagramCardItem } from "../components/DiagramCard";
import TopBar from "../components/TopBar";
import CollaboratorModal from "../components/CollaboratorModal";

type DiagramsData = { owned: Diagram[]; shared: SharedDiagram[] };

const TEXT_WHITE = "#ffffff";
const TEXT_MUTED = "#6b7280";
const PURPLE = "#7c3aed";
const DIVIDER = "rgba(255,255,255,0.1)";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [diagrams, setDiagrams] = useState<DiagramsData>({ owned: [], shared: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [activeDiagramId, setActiveDiagramId] = useState<string | null>(null);
  const [activeDiagramName, setActiveDiagramName] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await api.listDiagrams();
      setDiagrams(res ?? { owned: [], shared: [] });
    } catch {
      setDiagrams({ owned: [], shared: [] });
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    console.log("[Dashboard] cookies:", document.cookie);
  }, []);

  const handleCreateDiagram = () => {
    const name = window.prompt("Diagram name", "Untitled Diagram");
    if (name == null || name.trim() === "") return;
    api
      .createDiagram(name.trim(), {})
      .then((diagram) => {
        if (diagram?.id) navigate(`/editor/${diagram.id}`);
      })
      .catch(() => {
        Toast.error("Failed to create diagram. Try again.");
      });
  };

  const handleShare = (diagramId: string) => {
    const owned = diagrams.owned.find((d) => d.id === diagramId);
    const shared = diagrams.shared.find((d) => d.id === diagramId);
    const diagram = owned ?? shared ?? null;
    setActiveDiagramId(diagramId);
    setActiveDiagramName(diagram?.name ?? null);
    setShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
    setActiveDiagramId(null);
    setActiveDiagramName(null);
  };

  const handleDelete = async (diagramId: string) => {
    try {
      await api.deleteDiagram(diagramId);
      setDiagrams((prev) => ({
        ...prev,
        owned: prev.owned.filter((d) => d.id !== diagramId),
      }));
    } catch {
      Toast.error("Failed to delete diagram. Try again.");
    }
  };

  const isOwned = (d: DiagramCardItem) => user?.id != null && d.owner_id === user.id;

  return (
    <div
      className="dashboard-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <TopBar />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: 32, width: "100%", boxSizing: "border-box", position: "relative", zIndex: 1 }}>
        {/* Section 1 — My Diagrams */}
        <section style={{ marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: TEXT_WHITE,
                  margin: 0,
                  fontFamily: "'Audiowide', system-ui, sans-serif",
                }}
              >
                My Diagrams
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: TEXT_MUTED,
                  margin: "6px 0 0 0",
                }}
              >
                Create and manage your database schema designs.
              </p>
            </div>
            <Button
              theme="solid"
              type="primary"
              icon={<IconPlus size="large" />}
              onClick={handleCreateDiagram}
              className="dashboard-create-btn"
              style={{
                background: PURPLE,
                borderColor: PURPLE,
                borderRadius: 8,
                padding: "20px 24px",
                fontSize: 14,
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              Create New Diagram
            </Button>
          </div>

          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
              <Spin size="large" />
            </div>
          )}

          {!loading && loadError && (
            <p style={{ padding: "24px 0", fontSize: 13, color: TEXT_MUTED }}>
              Failed to load diagrams. Try refreshing.
            </p>
          )}

          {!loading && !loadError && diagrams.owned.length === 0 && (
            <p
              style={{
                textAlign: "center",
                padding: "32px 0",
                fontSize: 13,
                color: TEXT_MUTED,
                margin: 0,
              }}
            >
              You haven&apos;t created any diagrams yet.
              <br />
              Click &quot;Create New Diagram&quot; to get started.
            </p>
          )}

          {!loading && !loadError && diagrams.owned.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 16,
              }}
              className="dashboard-card-grid"
            >
              {diagrams.owned.map((d) => (
                <DiagramCard
                  key={d.id}
                  diagram={d}
                  isOwned={isOwned(d)}
                  currentUserId={user?.id ?? ""}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>

        {/* Divider: 40px margin top and bottom */}
        <div
          style={{
            width: "100%",
            height: 1,
            background: DIVIDER,
            margin: "40px 0",
          }}
        />

        {/* Section 2 — Shared with me */}
        <section>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: TEXT_WHITE,
              margin: "0 0 24px 0",
              fontFamily: "'Audiowide', system-ui, sans-serif",
            }}
          >
            Shared with me
          </h2>

          {!loading && !loadError && diagrams.shared.length === 0 && (
            <p
              style={{
                padding: "32px 0",
                fontSize: 13,
                color: TEXT_MUTED,
                margin: 0,
              }}
            >
              No diagrams have been shared with you yet.
            </p>
          )}

          {!loading && !loadError && diagrams.shared.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 16,
              }}
              className="dashboard-card-grid"
            >
              {diagrams.shared.map((d) => (
                <DiagramCard
                  key={d.id}
                  diagram={d}
                  isOwned={false}
                  currentUserId={user?.id ?? ""}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <CollaboratorModal
        diagramId={activeDiagramId ?? ""}
        diagramName={activeDiagramName ?? ""}
        isOpen={shareModalOpen}
        onClose={handleCloseShareModal}
      />
    </div>
  );
}
