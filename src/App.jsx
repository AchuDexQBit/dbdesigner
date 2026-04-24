import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useLayoutEffect } from "react";
import Editor from "./pages/Editor";
import Dashboard from "./pages/Dashboard";
import SettingsContextProvider from "./context/SettingsContext";

export default function App() {
  return (
    <SettingsContextProvider>
      <RestoreScroll />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor/:id" element={<Editor />} />
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
