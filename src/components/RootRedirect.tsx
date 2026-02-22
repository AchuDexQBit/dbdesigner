import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Spin } from "@douyinfe/semi-ui";

export function RootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    api
      .me()
      .then(() => navigate("/dashboard", { replace: true }))
      .catch(() => navigate("/login", { replace: true }));
  }, [navigate]);

  return (
    <div className="dexqbit-theme min-h-screen flex items-center justify-center">
      <Spin size="large" />
    </div>
  );
}
