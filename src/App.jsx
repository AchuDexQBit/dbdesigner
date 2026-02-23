import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useLayoutEffect } from "react";
import Editor from "./pages/Editor";
import Dashboard from "./pages/Dashboard";
import SettingsContextProvider from "./context/SettingsContext";
import { AuthGuard } from "./components/AuthGuard";

export default function App() {
  return (
    <SettingsContextProvider>
      <RestoreScroll />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/editor/:id"
          element={
            <AuthGuard>
              <Editor />
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </SettingsContextProvider>
  );
}

function RestoreScroll() {
  const location = useLocation();
  useLayoutEffect(() => {
    window.scroll(0, 0);
  }, [location.pathname]);
  return null;
}
