import { renderSidebar } from "./sidebar.js";
import { renderTopbar } from "./topbar.js";
import { renderToastHost } from "./toast.js";

export function renderShell() {
  return `
  <div class="min-h-screen flex">
    ${renderSidebar()}
    <div class="flex-1 flex flex-col">
      ${renderTopbar()}
      <main id="main" class="flex-1 px-6 md:px-10 py-8">
        <!-- route content -->
      </main>
    </div>
    ${renderToastHost()}
  </div>`;
}
