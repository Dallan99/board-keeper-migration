import { createFileRoute } from "@tanstack/react-router";
import { FIELDS, body, by, clean, db, fromDb, getBase, guard, hasBases, json, pad3, text, toDb, today } from "@/server/xpt";

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
        const baseId = String(b.base || "");
        if (!(await getBase(baseId))) return text("Base inválida");
        const ready = await hasBases();
        const t = await db();
        const q = (t as any).select("num");
        const { data: last } = await (ready ? q.eq("base_id", baseId) : q).order("num", { ascending: false }).limit(1);
        const num = (last?.[0]?.num || 0) + 1; const ts = new Date().toISOString();
        const it: any = ready
          ? { id: baseId.toUpperCase() + "-" + pad3(num), num, base_id: baseId, status: "A fazer", prioridade: "Média", comentarios: [], historico: [{ em: ts, por: by(b.by), campo: "criado", de: "", para: "" }], criadoEm: ts, atualizadoEm: ts }
          : { id: "XPT-" + pad3(num), num, status: "A fazer", prioridade: "Média", comentarios: [], historico: [{ em: ts, por: by(b.by), campo: "criado", de: "", para: "" }], criadoEm: ts, atualizadoEm: ts };
        for (const k of FIELDS) it[k] = k in d ? clean(k, d[k]) : (it[k] ?? "");
        if (it.status === "Concluído" && !it.conclusao) it.conclusao = today();
        const { data, error } = await (await db()).insert(toDb(it) as never).select("*").single();
        if (error) throw error;
        return json(fromDb(data), 201);
      }),
    },
  },
});
