import { createFileRoute } from "@tanstack/react-router";
import { baseFromDb, baseInfo, basesDb, body, db, getBase, guard, json, text } from "@/server/xpt";

export const Route = createFileRoute("/api/bases/$id")({
  server: {
    handlers: {
      PATCH: ({ request, params }) => guard(async () => {
        if (!(await getBase(params.id))) return text("Base não encontrada", 404);
        const info = baseInfo(await body(request));
        const { data: all, error: e0 } = await (await basesDb()).select("id,codigo"); if (e0) throw e0;
        if ((all || []).some((x: any) => x.id !== params.id && String(x.codigo).toUpperCase() === info.codigo)) throw new Error("Já existe uma base com esse código");
        const { data, error } = await (await basesDb()).update(info).eq("id", params.id).select("*").single();
        if (error) throw error;
        return json(baseFromDb(data));
      }),
      // Exclui a base e todos os itens dela (a tela pede para digitar o código antes).
      DELETE: ({ params }) => guard(async () => {
        if (!(await getBase(params.id))) return text("Base não encontrada", 404);
        const { error: e1 } = await (await db()).delete().eq("base_id" as never, params.id as never); if (e1) throw e1;
        const { error: e2 } = await (await basesDb()).delete().eq("id", params.id); if (e2) throw e2;
        return new Response(null, { status: 204 });
      }),
    },
  },
});
