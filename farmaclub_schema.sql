-- FARMACLUB — SCHEMA SUPABASE (versão corrigida)
-- Cole tudo no SQL Editor e clique em Run

CREATE TABLE IF NOT EXISTS farmacias (
  id              SERIAL PRIMARY KEY,
  nome            TEXT NOT NULL,
  razao_social    TEXT,
  cnpj            TEXT UNIQUE,
  crf             TEXT,
  responsavel     TEXT,
  telefone        TEXT,
  endereco        TEXT,
  bairro          TEXT,
  cidade          TEXT DEFAULT 'Itaperuna',
  uf              TEXT DEFAULT 'RJ',
  cep             TEXT DEFAULT '28300-000',
  lat             DECIMAL(10,6),
  lng             DECIMAL(10,6),
  horario         TEXT,
  nota            DECIMAL(2,1) DEFAULT 5.0,
  cor             TEXT DEFAULT '#3BAA35',
  ativo           BOOLEAN DEFAULT TRUE,
  aberto          BOOLEAN DEFAULT TRUE,
  faturamento_mes DECIMAL(12,2) DEFAULT 0,
  comissao_pct    DECIMAL(4,2) DEFAULT 10.00,
  user_id         UUID,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id          SERIAL PRIMARY KEY,
  farmacia_id INTEGER REFERENCES farmacias(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  perfil      TEXT DEFAULT 'farmacia',
  ativo       BOOLEAN DEFAULT TRUE,
  auth_uid    UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS produtos (
  id          SERIAL PRIMARY KEY,
  farmacia_id INTEGER REFERENCES farmacias(id) ON DELETE CASCADE,
  ean         TEXT,
  nome        TEXT NOT NULL,
  laboratorio TEXT,
  categoria   TEXT,
  preco_custo DECIMAL(10,2) DEFAULT 0,
  preco_venda DECIMAL(10,2) NOT NULL,
  preco_pix   DECIMAL(10,2),
  icone       TEXT DEFAULT '💊',
  receita     BOOLEAN DEFAULT FALSE,
  ativo       BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS estoque (
  id             SERIAL PRIMARY KEY,
  farmacia_id    INTEGER REFERENCES farmacias(id) ON DELETE CASCADE,
  produto_id     INTEGER REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade     INTEGER DEFAULT 0,
  quantidade_min INTEGER DEFAULT 5,
  validade       DATE,
  lote           TEXT,
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(farmacia_id, produto_id)
);

CREATE TABLE IF NOT EXISTS clientes (
  id         SERIAL PRIMARY KEY,
  nome       TEXT NOT NULL,
  email      TEXT UNIQUE,
  telefone   TEXT,
  endereco   TEXT,
  bairro     TEXT,
  cidade     TEXT DEFAULT 'Itaperuna',
  auth_uid   UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedidos (
  id                 TEXT PRIMARY KEY DEFAULT ('#' || LPAD(FLOOR(RANDOM()*9999)::TEXT, 4, '0')),
  farmacia_id        INTEGER REFERENCES farmacias(id),
  cliente_id         INTEGER REFERENCES clientes(id),
  motoboy_id         INTEGER,
  cliente_nome       TEXT,
  cliente_tel        TEXT,
  cliente_email      TEXT,
  endereco_entrega   TEXT,
  bairro_entrega     TEXT,
  lat_cliente        DECIMAL(10,6),
  lng_cliente        DECIMAL(10,6),
  total_base         DECIMAL(10,2) DEFAULT 0,
  total_final        DECIMAL(10,2) DEFAULT 0,
  frete              DECIMAL(10,2) DEFAULT 0,
  comissao_fc        DECIMAL(10,2) DEFAULT 0,
  forma_pagamento    TEXT DEFAULT 'PIX',
  modo_entrega       TEXT DEFAULT 'entrega',
  status             TEXT DEFAULT 'aguardando',
  confirmado_cliente BOOLEAN DEFAULT FALSE,
  motoboy_lat        DECIMAL(10,6),
  motoboy_lng        DECIMAL(10,6),
  notas              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedido_itens (
  id          SERIAL PRIMARY KEY,
  pedido_id   TEXT REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id  INTEGER REFERENCES produtos(id),
  farmacia_id INTEGER REFERENCES farmacias(id),
  nome        TEXT NOT NULL,
  icone       TEXT DEFAULT '💊',
  preco_unit  DECIMAL(10,2) NOT NULL,
  quantidade  INTEGER DEFAULT 1,
  subtotal    DECIMAL(10,2),
  receita     BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS motoboys (
  id            SERIAL PRIMARY KEY,
  nome          TEXT NOT NULL,
  telefone      TEXT,
  cnh           TEXT,
  placa         TEXT,
  lat           DECIMAL(10,6),
  lng           DECIMAL(10,6),
  disponivel    BOOLEAN DEFAULT TRUE,
  em_entrega    BOOLEAN DEFAULT FALSE,
  pedido_atual  TEXT,
  ganhos_hoje   DECIMAL(10,2) DEFAULT 0,
  entregas_hoje INTEGER DEFAULT 0,
  nota          DECIMAL(2,1) DEFAULT 5.0,
  auth_uid      UUID,
  ativo         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar segurança
ALTER TABLE farmacias    ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios     ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE motoboys     ENABLE ROW LEVEL SECURITY;

-- Políticas abertas para funcionar de imediato
CREATE POLICY "acesso_farmacias"    ON farmacias    FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "acesso_usuarios"     ON usuarios     FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "acesso_produtos"     ON produtos     FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "acesso_estoque"      ON estoque      FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "acesso_pedidos"      ON pedidos      FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "acesso_itens"        ON pedido_itens FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "acesso_clientes"     ON clientes     FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "acesso_motoboys"     ON motoboys     FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
