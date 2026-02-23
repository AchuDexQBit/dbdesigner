/// <reference types="vite/client" />

// ─── Types (exported for consumers; User matches AuthUser from tools) ───────

export interface User {
  id: string;
  email: string;
  name: string;
  greet_name: string;
  active: boolean;
  designation: string;
  created_at: string;
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

const BASE = import.meta.env.VITE_API_URL ?? "";

const TOOLS_URL =
  import.meta.env.VITE_TOOLS_URL ?? "https://tools.dexqbit.com";

/** Login URL on the tools app. Use for manual redirects (e.g. after logout). */
export function getLoginUrl(): string {
  return `${TOOLS_URL}`;
}

// ─── Request helper (internal) ─────────────────────────────────────────────

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: { skip401Redirect?: boolean }
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Service unavailable");
  }

  if (res.status === 401) {
    if (!options?.skip401Redirect) {
      window.location.href = `${TOOLS_URL}`;
    }
    throw new Error("Not authenticated");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = typeof data?.error === "string" ? data.error : "Request failed";
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return res.json();
}

// ─── API (single export) ──────────────────────────────────────────────────

export const api = {
  // Auth
  me(): Promise<User> {
    return req<User>("GET", "/auth/me", undefined, { skip401Redirect: true });
  },

  logout(): Promise<{ success: boolean }> {
    return req("POST", "/auth/logout");
  },

  changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean }> {
    return req("POST", "/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

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
    return req("PUT", `/dbdesigner/diagrams/${id}`, { name, data });
  },

  deleteDiagram(id: string): Promise<{ success: boolean }> {
    return req("DELETE", `/dbdesigner/diagrams/${id}`);
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
    userId: string,
    permission: string
  ): Promise<{ success: boolean }> {
    return req("PATCH", `/dbdesigner/diagrams/${id}/collaborators/${userId}`, {
      permission,
    });
  },

  removeCollaborator(
    id: string,
    userId: string
  ): Promise<{ success: boolean }> {
    return req("DELETE", `/dbdesigner/diagrams/${id}/collaborators/${userId}`);
  },
};
