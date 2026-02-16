import { renderShell } from "./components/shell.js";
import { startRouter } from "./router.js";
import { ensureAuthBootstrap } from "./auth.js";

const root = document.getElementById("app");
root.innerHTML = renderShell();

ensureAuthBootstrap();
startRouter();
