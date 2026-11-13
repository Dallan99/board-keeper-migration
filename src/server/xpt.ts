// Board item rules ported 1:1 from the original server.js.
export const FIELDS = ["titulo","area","responsavel","quantidade","especificacoes","status","prioridade","inicio","prazo","conclusao","observacao","validacao","vigencia"] as const;
export const STATUSES = ["A fazer","Em andamento","Bloqueado","Concluído"];
export const PRIS = ["Alta","Média","Baixa"];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
export function clean(k: string, v: unknown): string {
  const s = v == null ? "" : String(v).slice(0, 4000).trim();
  if (k === "status" && !STATUSES.includes(s)) throw new Error("status inválido");
  if (k === "prioridade" && !PRIS.includes(s)) throw new Error("prioridade inválida");
  if (["inicio","prazo","conclusao"].includes(k) && s && !/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error("data inválida");
  return s;
}
export const by = (b: unknown) => String(b || "").slice(0, 80).trim();

export function patch(it: Row, changes: Row, who: string, now = new Date().toISOString()) {
  const ok: Row = {};
  for (const k of Object.keys(changes || {})) if ((FIELDS as readonly string[]).includes(k)) ok[k] = clean(k, changes[k]);
  let changed = false;
  for (const k of Object.keys(ok)) {
    if ((it[k] ?? "") === ok[k]) continue;
    it.historico = [...(it.historico || []), { em: now, por: who, campo: k, de: it[k] ?? "", para: ok[k] }].slice(-200);
    it[k] = ok[k]; changed = true;
  }
  if (changes && changes.status === "Concluído" && !it.conclusao) it.conclusao = today();
  if (changed) it.atualizadoEm = now;
  return it;
}

export const fromDb = ({ criado_em, atualizado_em, ...r }: Row) => ({ ...r, criadoEm: criado_em, atualizadoEm: atualizado_em });
export const toDb = ({ criadoEm, atualizadoEm, ...r }: Row) => ({ ...r, criado_em: criadoEm, atualizado_em: atualizadoEm });

export const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
export const text = (b: string, status = 400) => new Response(b, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
export async function body(req: Request): Promise<Row> {
  const s = await req.text(); if (s.length > 1e6) throw new Error("corpo muito grande");
  try { return s ? JSON.parse(s) : {}; } catch { throw new Error("JSON inválido"); }
}
export async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin.from("xpt_items");
}
export async function getItem(id: string) {
  const { data, error } = await (await db()).select("*").eq("id", id).maybeSingle();
  if (error) throw error; return data ? fromDb(data) : null;
}
export async function saveItem(it: Row) {
  const { data, error } = await (await db()).update(toDb(it) as never).eq("id", it.id).select("*").single();
  if (error) throw error; return fromDb(data);
}
export const guard = (fn: () => Promise<Response>) => fn().catch((e: any) => text(e?.message || "Erro", 400));
