/**
 * FARMACLUB — INTEGRAÇÃO SUPABASE
 * Fase B: banco de dados real, autenticação por farmácia, dados em tempo real
 *
 * CONFIGURAÇÃO (preencher com suas chaves):
 * 1. SUPABASE_URL   → já configurada abaixo
 * 2. SUPABASE_ANON  → eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzd3d2b25lZGZleHZ4bHprb29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODQ5MTYsImV4cCI6MjA4OTI2MDkxNn0.gTIWF1TnPdcpIqzGDEHH-9l45fbQ4IV4wGVqLx2Tp3k
 *    Supabase Dashboard → Settings → API → Project API keys → anon public
 */

// ══════════════════════════════════════════════════════════
// CONFIGURAÇÃO — PREENCHER COM SUA CHAVE ANON
// ══════════════════════════════════════════════════════════
const SUPABASE_URL  = "https://eswwvonedfexvxlzkoof.supabase.co";
const SUPABASE_ANON = "COLE_AQUI_SUA_CHAVE_ANON_PUBLIC"; // ← substituir

// ══════════════════════════════════════════════════════════
// CLIENTE SUPABASE — helper leve sem NPM
// ══════════════════════════════════════════════════════════
const sb = {
  url:  SUPABASE_URL,
  anon: SUPABASE_ANON,

  // Cabeçalhos padrão
  _headers(token) {
    const h = {
      "Content-Type":  "application/json",
      "apikey":        this.anon,
      "Authorization": `Bearer ${token || this.anon}`,
      "Prefer":        "return=representation",
    };
    return h;
  },

  // Token do usuário logado
  _token() {
    try { return JSON.parse(localStorage.getItem("sb_session") || "{}")?.access_token || this.anon; }
    catch { return this.anon; }
  },

  // ── QUERY BUILDER leve ──
  from(table) {
    const base = `${this.url}/rest/v1/${table}`;
    const client = this;
    let params = [];
    let selectFields = "*";
    let orderBy = null;
    let limitN = null;

    const q = {
      select(fields = "*") { selectFields = fields; return q; },
      eq(col, val)   { params.push(`${col}=eq.${val}`); return q; },
      neq(col, val)  { params.push(`${col}=neq.${val}`); return q; },
      gt(col, val)   { params.push(`${col}=gt.${val}`); return q; },
      gte(col, val)  { params.push(`${col}=gte.${val}`); return q; },
      lt(col, val)   { params.push(`${col}=lt.${val}`); return q; },
      lte(col, val)  { params.push(`${col}=lte.${val}`); return q; },
      ilike(col, val){ params.push(`${col}=ilike.${encodeURIComponent(val)}`); return q; },
      order(col, asc=true) { orderBy = `${col}=${asc?"asc":"desc"}`; return q; },
      limit(n)       { limitN = n; return q; },

      async get() {
        const qs = [...params, `select=${selectFields}`, orderBy && `order=${orderBy}`, limitN && `limit=${limitN}`].filter(Boolean).join("&");
        const r = await fetch(`${base}?${qs}`, { headers: client._headers(client._token()) });
        const data = await r.json();
        if (!r.ok) return { data: null, error: data };
        return { data, error: null };
      },

      async single() {
        const res = await q.limit(1).get();
        if (res.error) return res;
        return { data: res.data?.[0] || null, error: null };
      },

      async insert(body) {
        const r = await fetch(base, {
          method: "POST",
          headers: client._headers(client._token()),
          body: JSON.stringify(Array.isArray(body) ? body : [body]),
        });
        const data = await r.json();
        if (!r.ok) return { data: null, error: data };
        return { data: Array.isArray(data) ? data[0] : data, error: null };
      },

      async update(body) {
        const qs = params.join("&");
        const r = await fetch(`${base}?${qs}`, {
          method: "PATCH",
          headers: client._headers(client._token()),
          body: JSON.stringify(body),
        });
        const data = await r.json();
        if (!r.ok) return { data: null, error: data };
        return { data: Array.isArray(data) ? data[0] : data, error: null };
      },

      async delete() {
        const qs = params.join("&");
        const r = await fetch(`${base}?${qs}`, {
          method: "DELETE",
          headers: client._headers(client._token()),
        });
        if (!r.ok) { const data = await r.json(); return { error: data }; }
        return { error: null };
      },
    };
    return q;
  },

  // ── AUTENTICAÇÃO ──
  auth: {
    _url: SUPABASE_URL + "/auth/v1",
    _anon: SUPABASE_ANON,

    async signIn(email, password) {
      const r = await fetch(`${this._url}/token?grant_type=password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": this._anon },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) return { user: null, session: null, error: data };
      localStorage.setItem("sb_session", JSON.stringify(data));
      return { user: data.user, session: data, error: null };
    },

    async signUp(email, password, metadata = {}) {
      const r = await fetch(`${this._url}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": this._anon },
        body: JSON.stringify({ email, password, data: metadata }),
      });
      const data = await r.json();
      if (!r.ok) return { user: null, error: data };
      return { user: data.user, error: null };
    },

    async signOut() {
      const session = JSON.parse(localStorage.getItem("sb_session") || "{}");
      if (session.access_token) {
        await fetch(`${this._url}/logout`, {
          method: "POST",
          headers: { "apikey": this._anon, "Authorization": `Bearer ${session.access_token}` },
        });
      }
      localStorage.removeItem("sb_session");
      localStorage.removeItem("fc_farmacia_logada");
      return { error: null };
    },

    getSession() {
      try {
        const s = JSON.parse(localStorage.getItem("sb_session") || "{}");
        if (!s.access_token) return null;
        // Verificar expiração
        const exp = s.expires_at ? s.expires_at * 1000 : 0;
        if (exp && Date.now() > exp) { localStorage.removeItem("sb_session"); return null; }
        return s;
      } catch { return null; }
    },

    getUser() {
      const s = this.getSession();
      return s?.user || null;
    },

    async refreshSession() {
      const s = this.getSession();
      if (!s?.refresh_token) return null;
      const r = await fetch(`${this._url}/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": this._anon },
        body: JSON.stringify({ refresh_token: s.refresh_token }),
      });
      if (!r.ok) return null;
      const data = await r.json();
      localStorage.setItem("sb_session", JSON.stringify(data));
      return data;
    },
  },

  // ── REALTIME (polling leve — sem WebSocket) ──
  realtime: {
    _intervals: {},

    subscribe(table, farmaciaId, callback, intervalMs = 5000) {
      const key = `${table}_${farmaciaId}`;
      if (this._intervals[key]) return;
      this._intervals[key] = setInterval(async () => {
        const q = sb.from(table);
        if (farmaciaId) q.eq("farmacia_id", farmaciaId);
        q.order("created_at", false).limit(50);
        const { data } = await q.get();
        if (data) callback(data);
      }, intervalMs);
      return key;
    },

    unsubscribe(key) {
      if (this._intervals[key]) {
        clearInterval(this._intervals[key]);
        delete this._intervals[key];
      }
    },

    unsubscribeAll() {
      Object.keys(this._intervals).forEach(k => this.unsubscribe(k));
    },
  },
};

// ══════════════════════════════════════════════════════════
// HELPERS DE NEGÓCIO — usados por todos os módulos
// ══════════════════════════════════════════════════════════
const FC = {

  // Farmácia logada no ERP
  getFarmaciaLogada() {
    try { return JSON.parse(localStorage.getItem("fc_farmacia_logada") || "null"); }
    catch { return null; }
  },

  setFarmaciaLogada(f) {
    localStorage.setItem("fc_farmacia_logada", JSON.stringify(f));
  },

  // ── FARMÁCIAS ──
  async listarFarmacias() {
    const { data, error } = await sb.from("farmacias").select("*").order("nome").get();
    return data || [];
  },

  async getFarmacia(id) {
    const { data } = await sb.from("farmacias").eq("id", id).single();
    return data;
  },

  async salvarFarmacia(obj) {
    if (obj.id) {
      return sb.from("farmacias").eq("id", obj.id).update(obj);
    }
    return sb.from("farmacias").insert(obj);
  },

  // ── PRODUTOS ──
  async listarProdutos(farmaciaId) {
    const q = sb.from("produtos").select("*").order("nome");
    if (farmaciaId) q.eq("farmacia_id", farmaciaId);
    const { data } = await q.get();
    return data || [];
  },

  async salvarProduto(obj) {
    if (obj.id) return sb.from("produtos").eq("id", obj.id).update(obj);
    return sb.from("produtos").insert(obj);
  },

  // ── ESTOQUE ──
  async getEstoque(farmaciaId) {
    const { data } = await sb.from("estoque").select("*, produtos(*)").eq("farmacia_id", farmaciaId).get();
    return data || [];
  },

  async atualizarEstoque(farmaciaId, produtoId, qtd) {
    // Verificar se já existe
    const { data: ex } = await sb.from("estoque")
      .eq("farmacia_id", farmaciaId).eq("produto_id", produtoId).single();
    if (ex) {
      return sb.from("estoque").eq("id", ex.id).update({ quantidade: qtd, updated_at: new Date().toISOString() });
    }
    return sb.from("estoque").insert({ farmacia_id: farmaciaId, produto_id: produtoId, quantidade: qtd });
  },

  // ── PEDIDOS ──
  async criarPedido(pedido, itens) {
    // Inserir pedido
    const { data: ped, error: e1 } = await sb.from("pedidos").insert(pedido);
    if (e1) return { error: e1 };

    // Inserir itens
    const itensComId = itens.map(it => ({ ...it, pedido_id: ped.id }));
    const { error: e2 } = await sb.from("pedido_itens").insert(itensComId);
    if (e2) return { error: e2 };

    return { data: ped, error: null };
  },

  async listarPedidos(filtros = {}) {
    const q = sb.from("pedidos").select("*, pedido_itens(*), farmacias(nome,bairro)").order("created_at", false);
    if (filtros.farmacia_id) q.eq("farmacia_id", filtros.farmacia_id);
    if (filtros.status)      q.eq("status", filtros.status);
    if (filtros.limit)       q.limit(filtros.limit);
    const { data } = await q.get();
    return data || [];
  },

  async atualizarStatusPedido(pedidoId, status, extra = {}) {
    return sb.from("pedidos").eq("id", pedidoId).update({ status, updated_at: new Date().toISOString(), ...extra });
  },

  // ── MOTOBOYS ──
  async listarMotoboys(filtros = {}) {
    const q = sb.from("motoboys").select("*").order("nome");
    if (filtros.disponivel !== undefined) q.eq("disponivel", filtros.disponivel);
    const { data } = await q.get();
    return data || [];
  },

  async atualizarMotoboy(id, dados) {
    return sb.from("motoboys").eq("id", id).update(dados);
  },

  // ── CLIENTES ──
  async buscarCliente(email) {
    const { data } = await sb.from("clientes").eq("email", email).single();
    return data;
  },

  async salvarCliente(obj) {
    if (obj.id) return sb.from("clientes").eq("id", obj.id).update(obj);
    return sb.from("clientes").insert(obj);
  },

  // ── DIAGNÓSTICO DA CONEXÃO ──
  async testarConexao() {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/farmacias?select=id&limit=1`, {
        headers: { "apikey": SUPABASE_ANON, "Authorization": `Bearer ${SUPABASE_ANON}` }
      });
      if (r.status === 401) return { ok: false, msg: "Chave ANON incorreta ou não configurada" };
      if (r.status === 404) return { ok: false, msg: "Tabela 'farmacias' não encontrada — rode o SQL de criação" };
      if (!r.ok)            return { ok: false, msg: `Erro HTTP ${r.status}` };
      return { ok: true, msg: "Conexão Supabase OK ✅" };
    } catch(e) {
      return { ok: false, msg: `Falha de rede: ${e.message}` };
    }
  },
};

// Expor globalmente
window.sb = sb;
window.FC = FC;

console.log("🟢 FarmaClub Supabase carregado —", SUPABASE_URL);
