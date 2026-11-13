import { createFileRoute } from "@tanstack/react-router";
import { FIELDS, baseFromDb, baseInfo, basesDb, body, by, clean, db, fromDb, guard, json, pad3, slug, toDb } from "@/server/xpt";

export const Route = createFileRoute("/api/bases/")({
  server: {
    handlers: {
      GET: () => guard(async () => {
        const { data, error } = await (await basesDb()).select("*").order("criado_em");
        if (error) throw error;
        return json(data.map(baseFromDb));
      }),
      // Cria uma base nova já com a lista de itens enviada pela tela (lista padrão ou cópia de outra base).
      POST: ({ request }) => guard(async () => {
        const b = await body(request); const info = baseInfo(b);
        const t = await basesDb();
        const { data: all, error: e0 } = await t.select("id,codigo"); if (e0) throw e0;
        if ((all || []).some((x: any) => String(x.codigo).toUpperCase() === info.codigo)) throw new Error("Já existe uma base com esse código");
        let id = slug(info.codigo) || "base"; const id0 = id; let k = 2;
        while ((all || []).some((x: any) => x.id === id)) id = id0 + "-" + k++;
        const ts = new Date().toISOString();
        const { data: base, error: e1 } = await (await basesDb()).insert({ id, ...info, criado_em: ts }).select("*").single();
        if (e1) throw e1;
        const rows = (Array.isArray(b.itens) ? b.itens : []).slice(0, 2000).map((d: any, n: number) => {
          const it: any = { id: id.toUpperCase() + "-" + pad3(n + 1), num: n + 1, base_id: id, prioridade: "Média", comentarios: [], historico: [{ em: ts, por: by(b.by), campo: "criado", de: "", para: "" }], criadoEm: ts, atualizadoEm: ts };
          for (const f of FIELDS) it[f] = f in d ? clean(f, d[f]) : (it[f] ?? "");
          it.status = "A fazer"; it.inicio = ""; it.prazo = ""; it.conclusao = "";
          return toDb(it);
        });
        let itens: any[] = [];
        for (let i = 0; i < rows.length; i += 500) {
          const { data, error } = await (await db()).insert(rows.slice(i, i + 500) as never).select("*");
          if (error) { await (await db()).delete().eq("base_id" as never, id as never); await (await basesDb()).delete().eq("id", id); throw error; }
          itens = itens.concat(data);
        }
        return json({ base: baseFromDb(base), itens: itens.map(fromDb) }, 201);
      }),
    },
  },
});
