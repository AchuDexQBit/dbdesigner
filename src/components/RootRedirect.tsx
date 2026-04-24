import React from "react";
import { Navigate } from "react-router-dom";

/** Root path "/" → send to dashboard. */
export function RootRedirect() {
  return <Navigate to="/dashboard" replace />;
}
