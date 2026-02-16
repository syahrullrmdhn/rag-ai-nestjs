import { getToken } from "./auth.js";
import { mountLogin } from "./pages/login.js";
import { mountDashboard } from "./pages/dashboard.js";
import { mountKnowledge } from "./pages/knowledge.js";
import { mountChat } from "./pages/chat.js";
import { mountSettings } from "./pages/settings.js";
import { setActiveNav } from "./components/sidebar.js";

const routes = {
  "#/login": mountLogin,
  "#/": mountDashboard,
  "#/dashboard": mountDashboard,
  "#/knowledge": mountKnowledge,
  "#/chat": mountChat,
  "#/settings": mountSettings,
};

function normalizeHash() {
  const h = location.hash || "#/";
  return routes[h] ? h : "#/";
}

export function startRouter() {
  window.addEventListener("hashchange", () => renderRoute());
  renderRoute();
}

function renderRoute() {
  const hash = normalizeHash();

  const token = getToken();
  if (!token && hash !== "#/login") {
    location.hash = "#/login";
    return;
  }
  if (token && hash === "#/login") {
    location.hash = "#/";
    return;
  }

  setActiveNav(hash);

  const main = document.getElementById("main");
  main.innerHTML = "";
  routes[hash](main);
}
