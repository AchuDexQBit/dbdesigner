import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";
import Editor from "./pages/Editor";
import BugReport from "./pages/BugReport";
import Templates from "./pages/Templates";
import Dashboard from "./pages/Dashboard";
import SettingsContextProvider from "./context/SettingsContext";
import NotFound from "./pages/NotFound";
import { RootRedirect } from "./components/RootRedirect";

export default function App() {
  return (
    <SettingsContextProvider>
      <BrowserRouter>
        <RestoreScroll />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor/:id" element={<Editor />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/bug-report" element={<BugReport />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
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
