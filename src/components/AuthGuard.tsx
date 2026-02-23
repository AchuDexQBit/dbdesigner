import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useUser } from "../context/UserContext";
import { Spin } from "@douyinfe/semi-ui";

const TOOLS_URL = import.meta.env.VITE_TOOLS_URL;
const LOGIN_PATH = "/login";

function getLoginRedirectUrl(): string {
  const base = TOOLS_URL ?? window.location.origin;
  if (!TOOLS_URL) {
    console.error(
      "VITE_TOOLS_URL is not set; falling back to window.location.origin for auth redirect"
    );
  }
  return `${base}${LOGIN_PATH}`;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { setUser } = useUser();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    api
      .me()
      .then((user) => {
        setUser(user);
        setAuthenticated(true);
      })
      .catch(() => {
        window.location.href = getLoginRedirectUrl();
      });
  }, [setUser]);

  if (!authenticated) {
    return (
      <div className="dexqbit-theme min-h-screen flex items-center justify-center bg-[var(--semi-color-bg-0)]">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
