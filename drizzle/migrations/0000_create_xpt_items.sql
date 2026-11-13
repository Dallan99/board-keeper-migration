CREATE TABLE public.xpt_items (
  id text PRIMARY KEY,
  num integer NOT NULL UNIQUE,
  titulo text NOT NULL DEFAULT '',
  area text NOT NULL DEFAULT '',
  responsavel text NOT NULL DEFAULT '',
  quantidade text NOT NULL DEFAULT '',
  especificacoes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'A fazer',
  prioridade text NOT NULL DEFAULT 'Média',
  inicio text NOT NULL DEFAULT '',
  prazo text NOT NULL DEFAULT '',
  conclusao text NOT NULL DEFAULT '',
  observacao text NOT NULL DEFAULT '',
  validacao text NOT NULL DEFAULT '',
  vigencia text NOT NULL DEFAULT '',
  comentarios jsonb NOT NULL DEFAULT '[]'::jsonb,
  historico jsonb NOT NULL DEFAULT '[]'::jsonb,
  criado_em text NOT NULL DEFAULT '',
  atualizado_em text NOT NULL DEFAULT ''
);
GRANT ALL ON public.xpt_items TO service_role;
ALTER TABLE public.xpt_items ENABLE ROW LEVEL SECURITY;