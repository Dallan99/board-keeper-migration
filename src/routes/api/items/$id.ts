import { createFileRoute } from "@tanstack/react-router";
import { body, by, db, getItem, guard, json, patch, saveItem, text } from "@/server/xpt";

export const Route = createFileRoute("/api/items/$id")({
  server: {
    handlers: {
      PATCH: ({ request, params }) => guard(async () => {
        const it = await getItem(params.id); if (!it) return text("Item não encontrado", 404);
        const b = await body(request);
        return json(await saveItem(patch(it, b.changes, by(b.by))));
      }),
      DELETE: ({ params }) => guard(async () => {
        const it = await getItem(params.id); if (!it) return text("Item não encontrado", 404);
        const { error } = await (await db()).delete().eq("id", params.id); if (error) throw error;
        return new Response(null, { status: 204 });
      }),
    },
  },
});
