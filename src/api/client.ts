/// <reference types="vite/client" />

import { getApiBaseUrl } from "../utils/apiBase";

// ─── Types (exported for consumers; User matches AuthUser from tools) ───────

export interface User {
  id: string;
  email: string;
  full_name: string;
  greet_name: string;
  designation: string;
  active: boolean;
  force_password_change: boolean;
  image_url: string | null;
}

export interface Diagram {
  id: string;
  owner_id: string;
  name: string;
  data: object;
  created_at: string;
  updated_at: string;
}

export interface SharedDiagram extends Diagram {
  permission: "view" | "edit";
  owner_name: string;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  permission: "view" | "edit";
  added_at: string;
}

// ─── Base setup ───────────────────────────────────────────────────────────

const BASE = getApiBaseUrl();
const VERSION = (import.meta.env.VITE_API_VERSION ?? "").trim();

function buildReqHeaders(method: string, hasBody: boolean): HeadersInit {
  const headers: Record<string, string> = {};
  // GET/HEAD without a body: omit Content-Type + custom headers when no version
  // so the request can be a "simple" cross-origin request (no OPTIONS preflight).
  const simpleRead =
    (method === "GET" || method === "HEAD") && !hasBody && !VERSION;
  if (!simpleRead) {
    headers["Content-Type"] = "application/json";
  }
  if (VERSION) {
    headers.version = VERSION;
  }
  return headers;
}

// ─── Request helper (internal) ─────────────────────────────────────────────
// Response shape: { status, message, data } — status 0 = success, 1 = failed, 2 = unauthorised

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const hasBody = body !== undefined;
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: buildReqHeaders(method, hasBody),
      credentials: "include",
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Service unavailable");
  }

  const response = await res.json().catch(() => ({ status: 1, message: "Invalid response", data: null }));

  // status 2 = unauthorised
  if (response.status === 2) {
    window.location.href = `${BASE}/login`;
    throw new Error("Not authenticated");
  }

  // status 1 = failed
  if (response.status === 1) {
    throw new Error(response.message ?? "Request failed");
  }

  // status 0 = success
  return response.data as T;
}

// ─── API (single export) ──────────────────────────────────────────────────

export const api = {
  // Diagrams
  listDiagrams(): Promise<{ owned: Diagram[]; shared: SharedDiagram[] }> {
    return req("GET", "/dbdesigner/diagrams");
  },

  createDiagram(
    name: string,
    data: object
  ): Promise<Diagram> {
    return req("POST", "/dbdesigner/diagrams", { name, data });
  },

  getDiagram(id: string): Promise<Diagram> {
    return req("GET", `/dbdesigner/diagrams/${id}`);
  },

  saveDiagram(
    id: string,
    name: string,
    data: object
  ): Promise<Diagram> {
    return req("POST", `/dbdesigner/diagrams/${id}/save`, { name, data });
  },

  deleteDiagram(id: string): Promise<{ success: boolean }> {
    return req("POST", `/dbdesigner/diagrams/${id}/delete`);
  },

  // Collaborators (owner only — API enforces)
  listCollaborators(id: string): Promise<Collaborator[]> {
    return req("GET", `/dbdesigner/diagrams/${id}/collaborators`);
  },

  addCollaborator(
    id: string,
    email: string,
    permission: string
  ): Promise<{ user: User; permission: string }> {
    return req("POST", `/dbdesigner/diagrams/${id}/collaborators`, {
      email,
      permission,
    });
  },

  updateCollaborator(
    id: string,
    employeeId: string,
    permission: string
  ): Promise<{ success: boolean }> {
    return req("POST", `/dbdesigner/diagrams/${id}/collaborators/${employeeId}/update`, {
      permission,
    });
  },

  removeCollaborator(
    id: string,
    employeeId: string
  ): Promise<{ success: boolean }> {
    return req("POST", `/dbdesigner/diagrams/${id}/collaborators/${employeeId}/remove`);
  },
};
