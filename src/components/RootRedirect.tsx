import { Navigate } from "react-router-dom";

/**
 * Root path "/" → send to dashboard. AuthGuard on that route will run api.me()
 * and redirect to login if unauthenticated.
 */
export function RootRedirect() {
  return <Navigate to="/dashboard" replace />;
}
