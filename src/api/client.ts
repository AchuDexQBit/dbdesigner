/// <reference types="vite/client" />

import { getApiBaseUrl, buildApiHeaders } from "../utils/apiBase";

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
  /** Present on some list/detail API payloads (e.g. list diagrams). */
  owner_email?: string;
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

// ─── Request helper (internal) ─────────────────────────────────────────────
// Response shape: { status, message, data? } — status 0 = success, 1 = failed, 2 = unauthorised

async function reqJson(
  method: string,
  path: string,
  body?: unknown,
): Promise<Record<string, unknown>> {
  const base = getApiBaseUrl();
  const hasBody = body !== undefined;
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers: buildApiHeaders(method, hasBody),
      credentials: "include",
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Service unavailable");
  }

  const response = (await res
    .json()
    .catch(() => ({ status: 1, message: "Invalid response", data: null }))) as Record<
    string,
    unknown
  >;

  if (response.status === 2) {
    window.location.href = `${getApiBaseUrl()}/login`;
    throw new Error("Not authenticated");
  }

  if (response.status === 1) {
    throw new Error(String(response.message ?? "Request failed"));
  }

  if (response.status !== 0) {
    throw new Error(String(response.message ?? "Request failed"));
  }

  return response;
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await reqJson(method, path, body);
  if (response.data === undefined) {
    throw new Error("Invalid response: expected data");
  }
  return response.data as T;
}

function normalizeListDiagram(row: Record<string, unknown>): Diagram {
  return {
    id: String(row.id ?? ""),
    owner_id: typeof row.owner_id === "string" ? row.owner_id : "",
    owner_email:
      typeof row.owner_email === "string" ? row.owner_email : undefined,
    name: String(row.name ?? "Untitled"),
    data:
      typeof row.data === "object" && row.data !== null && !Array.isArray(row.data)
        ? (row.data as object)
        : {},
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

// ─── API (single export) ──────────────────────────────────────────────────

export const api = {
  // Diagrams
  async listDiagrams(): Promise<{ owned: Diagram[]; shared: SharedDiagram[] }> {
    const response = await reqJson("GET", "/dbdesigner/diagrams", undefined);
    const rawDiagrams = response.diagrams;
    if (Array.isArray(rawDiagrams)) {
      return {
        owned: rawDiagrams.map((row) =>
          normalizeListDiagram(row as Record<string, unknown>),
        ),
        shared: [],
      };
    }
    const data = response.data as
      | { owned?: Diagram[]; shared?: SharedDiagram[] }
      | undefined;
    if (data && typeof data === "object") {
      return {
        owned: Array.isArray(data.owned) ? data.owned : [],
        shared: Array.isArray(data.shared) ? data.shared : [],
      };
    }
    return { owned: [], shared: [] };
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
