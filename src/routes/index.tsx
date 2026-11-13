import { createFileRoute } from "@tanstack/react-router";
import boardHtml from "../legacy/board.html?raw";

// The original self-contained board page is served as-is; its data calls go to /api/items.
export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: () => new Response(boardHtml, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }),
    },
  },
});
