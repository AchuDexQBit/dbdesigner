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

const BASE = import.meta.env.VITE_DEXI_API_URL ?? "";
const TOOLS_URL = import.meta.env.VITE_DEXI_URL ?? "https://dexi.dexqbit.com";

/** Login URL on the tools app. Use for manual redirects (e.g. after logout). */
export function getLoginUrl(): string {
  return `${TOOLS_URL}/login`;
}

// ─── Request helper (internal) ─────────────────────────────────────────────
// Response shape: { status, message, data } — status 0 = success, 1 = failed, 2 = unauthorised

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

  const response = await res.json().catch(() => ({ status: 1, message: "Invalid response", data: null }));

  // status 2 = unauthorised
  if (response.status === 2) {
    if (!options?.skip401Redirect) {
      window.location.href = `${TOOLS_URL}/login`;
    }
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
  // Auth
  me(): Promise<User> {
    return req<User>("GET", "/app/authentication/me", undefined, { skip401Redirect: true });
  },

  logout(): Promise<{ success: boolean }> {
    return req("POST", "/app/authentication/logout");
  },

  changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean }> {
    return req("POST", "/app/authentication/change_password", {
      currentPassword,
      newPassword,
    });
  },

  // Diagrams
  listDiagrams(): Promise<{ owned: Diagram[]; shared: SharedDiagram[] }> {
    return req("GET", "/app/dbdesigner/diagrams");
  },

  createDiagram(
    name: string,
    data: object
  ): Promise<Diagram> {
    return req("POST", "/app/dbdesigner/diagrams", { name, data });
  },

  getDiagram(id: string): Promise<Diagram> {
    return req("GET", `/app/dbdesigner/diagrams/${id}`);
  },

  saveDiagram(
    id: string,
    name: string,
    data: object
  ): Promise<Diagram> {
    return req("PUT", `/app/dbdesigner/diagrams/${id}`, { name, data });
  },

  deleteDiagram(id: string): Promise<{ success: boolean }> {
    return req("DELETE", `/app/dbdesigner/diagrams/${id}`);
  },

  // Collaborators (owner only — API enforces)
  listCollaborators(id: string): Promise<Collaborator[]> {
    return req("GET", `/app/dbdesigner/diagrams/${id}/collaborators`);
  },

  addCollaborator(
    id: string,
    email: string,
    permission: string
  ): Promise<{ user: User; permission: string }> {
    return req("POST", `/app/dbdesigner/diagrams/${id}/collaborators`, {
      email,
      permission,
    });
  },

  updateCollaborator(
    id: string,
    employeeId: string,
    permission: string
  ): Promise<{ success: boolean }> {
    return req("PATCH", `/app/dbdesigner/diagrams/${id}/collaborators/${employeeId}`, {
      permission,
    });
  },

  removeCollaborator(
    id: string,
    employeeId: string
  ): Promise<{ success: boolean }> {
    return req("DELETE", `/app/dbdesigner/diagrams/${id}/collaborators/${employeeId}`);
  },
};
