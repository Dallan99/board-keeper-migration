import { createFileRoute } from "@tanstack/react-router";
import { body, by, getItem, guard, json, saveItem, text } from "@/server/xpt";

export const Route = createFileRoute("/api/items/$id/comentarios")({
  server: {
    handlers: {
      POST: ({ request, params }) => guard(async () => {
        const it = await getItem(params.id); if (!it) return text("Item não encontrado", 404);
        const b = await body(request); const t = String(b.texto || "").slice(0, 4000).trim();
        if (!t) return text("Comentário vazio");
        const now = new Date().toISOString();
        it.comentarios = [...(it.comentarios || []), { em: now, por: by(b.by), texto: t }];
        it.atualizadoEm = now;
        return json(await saveItem(it));
      }),
    },
  },
});
