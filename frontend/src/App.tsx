import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Shell from "./pages/Shell";
import OverviewPage from "./pages/OverviewPage";
import KnowledgePage from "./pages/KnowledgePage";
import SettingsPage from "./pages/SettingsPage";
import ChatPage from "./pages/ChatPage";
import TelegramPage from "./pages/TelegramPage";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <Shell />
          </RequireAuth>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="telegram" element={<TelegramPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
