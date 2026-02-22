/// <reference types="vite/client" />

const BASE =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_BACKEND_URL ??
  "";

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include", // sends httpOnly session cookie
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Not authenticated");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    req("POST", "/auth/login", { email, password }),
  logout: () => req("POST", "/auth/logout"),
  me: () => req("GET", "/auth/me"),

  // Diagrams
  listDiagrams: () => req("GET", "/diagrams"),
  createDiagram: (name: string, data = {}) =>
    req("POST", "/diagrams", { name, data }),
  getDiagram: (id: string) => req("GET", `/diagrams/${id}`),
  saveDiagram: (id: string, name: string, data: unknown) =>
    req("PUT", `/diagrams/${id}`, { name, data }),
  deleteDiagram: (id: string) => req("DELETE", `/diagrams/${id}`),

  // Collaborators (owner only — API enforces)
  listCollaborators: (id: string) =>
    req("GET", `/diagrams/${id}/collaborators`),
  addCollaborator: (id: string, email: string, permission: string) =>
    req("POST", `/diagrams/${id}/collaborators`, { email, permission }),
  updateCollaborator: (id: string, userId: string, permission: string) =>
    req("PATCH", `/diagrams/${id}/collaborators/${userId}`, { permission }),
  removeCollaborator: (id: string, userId: string) =>
    req("DELETE", `/diagrams/${id}/collaborators/${userId}`),
};