import { createFileRoute } from "@tanstack/react-router";
import { FIELDS, body, by, clean, db, fromDb, guard, json, text, toDb, today } from "@/server/xpt";

export const Route = createFileRoute("/api/items/")({
  server: {
    handlers: {
      GET: () => guard(async () => {
        const { data, error } = await (await db()).select("*").order("num");
        if (error) throw error;
        return json(data.map(fromDb));
      }),
      POST: ({ request }) => guard(async () => {
        const b = await body(request); const d = b.data || {};
        if (!String(d.titulo || "").trim()) return text("Descrição obrigatória");
        const t = await db();
        const { data: last } = await t.select("num").order("num", { ascending: false }).limit(1);
        const num = (last?.[0]?.num || 0) + 1; const ts = new Date().toISOString();
        const it: any = { id: "XPT-" + String(num).padStart(3, "0"), num, status: "A fazer", prioridade: "Média", comentarios: [], historico: [{ em: ts, por: by(b.by), campo: "criado", de: "", para: "" }], criadoEm: ts, atualizadoEm: ts };
        for (const k of FIELDS) it[k] = k in d ? clean(k, d[k]) : (it[k] ?? "");
        if (it.status === "Concluído" && !it.conclusao) it.conclusao = today();
        const { data, error } = await (await db()).insert(toDb(it) as never).select("*").single();
        if (error) throw error;
        return json(fromDb(data), 201);
      }),
    },
  },
});
