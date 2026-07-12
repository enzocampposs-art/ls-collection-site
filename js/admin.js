/* ============================================================
   LS Collection — Painel administrativo (admin.html)
   Reusa PRODUTOS / CONFIG / CAT_LABEL reais de js/script.js.
   Todos os dados marcados como MOCK serão substituídos pela API.
   ============================================================ */

(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const money = (n) => "R$ " + Number(n).toLocaleString("pt-BR");

  /* ---------- conexão com a planilha Google (Apps Script — ver scripts/planilha-painel.gs) ----------
     Sem URL configurada, o painel roda em modo demonstração (login aberto + dados fictícios).
     Com URL salva (aba Configurações), o login exige a senha definida no Apps Script
     e as tabelas passam a ler a planilha de verdade. */
  const API_KEY = "ls_admin_api";      // localStorage: URL /exec do Apps Script
  const TOKEN_KEY = "ls_admin_token";  // sessionStorage: senha validada nesta sessão
  const SESSION_KEY = "ls_admin_logged";

  const apiUrl = () => (localStorage.getItem(API_KEY) || "").trim();
  const apiToken = () => sessionStorage.getItem(TOKEN_KEY) || "";

  async function apiGet(params) {
    const url = apiUrl();
    if (!url) return null;
    const q = new URLSearchParams(params).toString();
    const res = await fetch(url + (url.includes("?") ? "&" : "?") + q, { redirect: "follow" });
    return res.json();
  }

  async function adminLogin(email, pass) {
    void email; // reservado pra multiusuário no futuro
    if (!apiUrl()) { // modo demonstração
      sessionStorage.setItem(SESSION_KEY, "1");
      return { ok: true, demo: true };
    }
    try {
      const r = await apiGet({ action: "ping", token: pass });
      if (r && r.ok) {
        sessionStorage.setItem(SESSION_KEY, "1");
        sessionStorage.setItem(TOKEN_KEY, pass);
        return { ok: true };
      }
      return { ok: false, erro: "Senha incorreta. Confira a senha definida no Apps Script." };
    } catch (err) {
      return { ok: false, erro: "Não consegui falar com a planilha. Confira a URL em Configurações." };
    }
  }
  function adminLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }
  function isLogged() { return sessionStorage.getItem(SESSION_KEY) === "1"; }

  /* ============================================================
     MOCKS — substituir pela API
     ============================================================ */
  const MOCK = {
    kpis: [
      { label: "Vendas do mês", value: "R$ 18.460", delta: "+12%", up: true, ico: "money" },
      { label: "Pedidos hoje", value: "7", delta: "+2 vs ontem", up: true, ico: "box" },
      { label: "Produtos ativos", value: "0", delta: "catálogo do site", up: true, ico: "shirt" }, // preenchido com PRODUTOS.length
      { label: "Clientes cadastrados", value: "212", delta: "+18 no mês", up: true, ico: "users" },
      { label: "Taxa de conversão", value: "3,4%", delta: "+0,6 pt", up: true, ico: "target" },
      { label: "Faturamento estimado", value: "R$ 21.900", delta: "projeção do mês", up: true, ico: "chart" },
      { label: "Carrinhos abandonados", value: "14", delta: "-3 vs semana passada", up: false, ico: "cart" },
      { label: "Fretes calculados", value: "96", delta: "+31 na semana", up: true, ico: "truck" },
    ],
    vendasMes: [ // MOCK — substituir pela API (12 meses)
      { m: "Ago", v: 7400 }, { m: "Set", v: 9100 }, { m: "Out", v: 8300 }, { m: "Nov", v: 12100 },
      { m: "Dez", v: 16800 }, { m: "Jan", v: 11200 }, { m: "Fev", v: 9800 }, { m: "Mar", v: 12900 },
      { m: "Abr", v: 14100 }, { m: "Mai", v: 15400 }, { m: "Jun", v: 16200 }, { m: "Jul", v: 18460 },
    ],
    topProdutos: [ // MOCK
      { nome: "Corinthians", qtd: 34 }, { nome: "Brasil", qtd: 27 }, { nome: "Flamengo", qtd: 22 },
      { nome: "Real Madrid", qtd: 17 }, { nome: "Palmeiras", qtd: 14 },
    ],
    origem: [ // MOCK
      { canal: "Instagram", pct: 46, cor: "#C9A24B" },
      { canal: "WhatsApp", pct: 28, cor: "#37d67a" },
      { canal: "Site / Google", pct: 18, cor: "#5b9dd9" },
      { canal: "Indicação", pct: 8, cor: "#9f8cf0" },
    ],
    pedidos: [ // MOCK — substituir pela API
      { n: "#1042", cliente: "Rafael M.", prod: "Corinthians (M)", valor: 140, st: "Novo", frete: "SP — mesmo dia", data: "11/07/2026" },
      { n: "#1041", cliente: "Juliana S.", prod: "Flamengo + Brasil (combo)", valor: 260, st: "Pago", frete: "SEDEX", data: "11/07/2026" },
      { n: "#1040", cliente: "Diego A.", prod: "Palmeiras Verde (G)", valor: 210, st: "Separando", frete: "PAC", data: "10/07/2026" },
      { n: "#1039", cliente: "Marcos P.", prod: "Real Madrid (GG)", valor: 140, st: "Enviado", frete: "SEDEX", data: "09/07/2026" },
      { n: "#1038", cliente: "Ana C.", prod: "Argentina (P)", valor: 210, st: "Enviado", frete: "PAC", data: "09/07/2026" },
      { n: "#1037", cliente: "Bruno L.", prod: "São Paulo + Santos (combo)", valor: 260, st: "Entregue", frete: "SEDEX", data: "07/07/2026" },
      { n: "#1036", cliente: "Carla R.", prod: "Corinthians Retrô 1995 (M)", valor: 200, st: "Entregue", frete: "PAC", data: "05/07/2026" },
      { n: "#1035", cliente: "Felipe T.", prod: "Bayern Vermelha (G)", valor: 170, st: "Entregue", frete: "PAC", data: "04/07/2026" },
      { n: "#1034", cliente: "Lucas V.", prod: "Barcelona (M)", valor: 140, st: "Cancelado", frete: "—", data: "03/07/2026" },
      { n: "#1033", cliente: "Pedro H.", prod: "França (GG)", valor: 210, st: "Entregue", frete: "SEDEX", data: "01/07/2026" },
    ],
    clientes: [ // MOCK
      { nome: "Rafael M.", cidade: "São Paulo/SP", pedidos: 3, total: 480, canal: "Instagram" },
      { nome: "Juliana S.", cidade: "Rio de Janeiro/RJ", pedidos: 2, total: 400, canal: "WhatsApp" },
      { nome: "Diego A.", cidade: "Belo Horizonte/MG", pedidos: 2, total: 350, canal: "Instagram" },
      { nome: "Ana C.", cidade: "Guarulhos/SP", pedidos: 1, total: 210, canal: "Site" },
      { nome: "Bruno L.", cidade: "Campinas/SP", pedidos: 2, total: 400, canal: "Indicação" },
      { nome: "Carla R.", cidade: "Osasco/SP", pedidos: 1, total: 200, canal: "Instagram" },
      { nome: "Felipe T.", cidade: "Curitiba/PR", pedidos: 1, total: 170, canal: "WhatsApp" },
      { nome: "Pedro H.", cidade: "Santos/SP", pedidos: 4, total: 690, canal: "Instagram" },
    ],
    fretes: [ // MOCK — substituir pela API dos Correios / Melhor Envio
      { n: "#1039", cod: "LB123456789BR", transp: "Correios · SEDEX", prazo: "2 dias úteis", st: "Em trânsito" },
      { n: "#1038", cod: "LB987654321BR", transp: "Correios · PAC", prazo: "7 dias úteis", st: "Em trânsito" },
      { n: "#1037", cod: "LB456789123BR", transp: "Correios · SEDEX", prazo: "—", st: "Entregue" },
      { n: "#1036", cod: "LB321654987BR", transp: "Correios · PAC", prazo: "—", st: "Entregue" },
      { n: "#1042", cod: "aguardando postagem", transp: "Entrega local · SP", prazo: "hoje", st: "Separando" },
    ],
    campanhas: [ // MOCK
      { nome: "Combo 2x260 — Stories", canal: "Instagram", invest: 250, retorno: 1840, status: "Ativa" },
      { nome: "Lista VIP torcedor", canal: "WhatsApp", invest: 0, retorno: 920, status: "Ativa" },
      { nome: "Camisa do Corinthians — tráfego", canal: "Meta Ads", invest: 400, retorno: 2380, status: "Pausada" },
    ],
    ideias: [
      { canal: "Instagram", titulo: "Semana do Torcedor", itens: ["Carrossel: 5 camisas mais pedidas do mês", "Reels provador: caimento P ao G1", "Enquete nos stories: qual próximo time entra no catálogo?"] },
      { canal: "WhatsApp", titulo: "Lista VIP", itens: ["Oferta relâmpago do combo 2x260 só pra lista", "Aviso de reposição do time do cliente", "Cupom TORCIDA10 pra primeira compra"] },
      { canal: "Tráfego pago", titulo: "Meta Ads — fundo de funil", itens: ["Remarketing: quem calculou frete e não comprou", "Lookalike de compradores do Instagram", "Anúncio do giro 360 da camisa do Corinthians"] },
    ],
    statusResumo: [ // MOCK
      { st: "Novo", q: 3 }, { st: "Pago", q: 5 }, { st: "Separando", q: 4 },
      { st: "Enviado", q: 6 }, { st: "Entregue", q: 41 }, { st: "Cancelado", q: 2 },
    ],
  };

  /* ---------- dados reais da planilha → substituem os mocks ---------- */
  function parseData(str) { // "dd/mm/aaaa" → Date
    const m = String(str || "").match(/(\d{2})\/(\d{2})\/(\d{4})/);
    return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
  }

  function applySheetData(d) {
    const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const hoje = new Date();

    /* pedidos */
    const ped = (d.pedidos || []).map(p => ({
      n: String(p.Numero || ""), cliente: String(p.Cliente || ""), prod: String(p.Produto || ""),
      valor: Number(p.Valor) || 0, st: String(p.Status || "Novo"), frete: String(p.Frete || "—"),
      data: String(p.Data || ""), rastreio: String(p.Rastreio || ""), transp: String(p.Transportadora || ""),
      prazo: String(p.Prazo || ""),
    })).reverse(); // mais recentes primeiro
    if (ped.length) MOCK.pedidos = ped;

    /* clientes */
    const cli = (d.clientes || []).map(c => ({
      nome: String(c.Nome || ""), cidade: String(c.Cidade || ""), pedidos: Number(c.Pedidos) || 0,
      total: Number(c.TotalGasto) || 0, canal: String(c.Canal || "—"),
    }));
    if (cli.length) MOCK.clientes = cli;

    /* estoque real (Produto | P M G GG G1) */
    if ((d.estoque || []).length) MOCK.estoqueReal = d.estoque;

    /* fretes = pedidos com rastreio ou a caminho */
    const fr = ped.filter(p => p.rastreio || ["Separando", "Enviado"].includes(p.st)).map(p => ({
      n: p.n, cod: p.rastreio || "aguardando postagem", transp: p.transp || "Correios",
      prazo: p.prazo || "—", st: p.st === "Entregue" ? "Entregue" : (p.rastreio ? "Em trânsito" : p.st),
    }));
    if (fr.length) MOCK.fretes = fr;

    if (ped.length) {
      /* vendas por mês (últimos 12) */
      const byMonth = {};
      ped.forEach(p => {
        const dt = parseData(p.data);
        if (!dt || p.st === "Cancelado") return;
        const k = dt.getFullYear() + "-" + dt.getMonth();
        byMonth[k] = (byMonth[k] || 0) + p.valor;
      });
      const serie = [];
      for (let i = 11; i >= 0; i--) {
        const dt = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        serie.push({ m: MESES[dt.getMonth()], v: byMonth[dt.getFullYear() + "-" + dt.getMonth()] || 0 });
      }
      if (serie.some(x => x.v > 0)) MOCK.vendasMes = serie;

      /* mais vendidos (agrupa por produto, sem o tamanho) */
      const byProd = {};
      ped.forEach(p => {
        if (p.st === "Cancelado") return;
        const nome = p.prod.replace(/\s*\(.*\)\s*$/, "").trim() || "—";
        byProd[nome] = (byProd[nome] || 0) + 1;
      });
      const top = Object.entries(byProd).map(([nome, qtd]) => ({ nome, qtd }))
        .sort((a, b) => b.qtd - a.qtd).slice(0, 5);
      if (top.length) MOCK.topProdutos = top;

      /* pedidos por status */
      const sts = ["Novo", "Pago", "Separando", "Enviado", "Entregue", "Cancelado"];
      MOCK.statusResumo = sts.map(st => ({ st, q: ped.filter(p => p.st === st).length }));

      /* KPIs calculáveis */
      const mesAtual = ped.filter(p => { const dt = parseData(p.data); return dt && dt.getMonth() === hoje.getMonth() && dt.getFullYear() === hoje.getFullYear() && p.st !== "Cancelado"; });
      const hojeStr = String(hoje.getDate()).padStart(2, "0") + "/" + String(hoje.getMonth() + 1).padStart(2, "0") + "/" + hoje.getFullYear();
      MOCK.kpis[0].value = money(mesAtual.reduce((a, p) => a + p.valor, 0));
      MOCK.kpis[0].delta = mesAtual.length + " pedidos no mês";
      MOCK.kpis[1].value = String(ped.filter(p => p.data === hojeStr).length);
      MOCK.kpis[1].delta = "na planilha";
      MOCK.kpis[5].value = money(Math.round(mesAtual.reduce((a, p) => a + p.valor, 0) * 1.15));
      MOCK.kpis[5].delta = "projeção do mês";
    }
    if (cli.length) {
      MOCK.kpis[3].value = String(cli.length);
      MOCK.kpis[3].delta = "na planilha";
      /* origem dos clientes */
      const CORES = ["#C9A24B", "#37d67a", "#5b9dd9", "#9f8cf0", "#d9b45b", "#e05561"];
      const byCanal = {};
      cli.forEach(c => { byCanal[c.canal] = (byCanal[c.canal] || 0) + 1; });
      const total = cli.length;
      MOCK.origem = Object.entries(byCanal).sort((a, b) => b[1] - a[1]).map(([canal, q], i) => ({
        canal, pct: Math.round(q / total * 100), cor: CORES[i % CORES.length],
      }));
      MOCK.origemTotal = total;
    }
  }

  async function fetchData() {
    if (!apiUrl() || !apiToken()) return false;
    try {
      const d = await apiGet({ token: apiToken() });
      if (d && d.ok) { applySheetData(d); return true; }
    } catch (err) { /* mantém mocks */ }
    return false;
  }

  /* estado em memória da sessão (produtos) — TODO backend: persistir via API */
  const catalogo = (typeof PRODUTOS !== "undefined" ? PRODUTOS : []).map((p, i) => ({
    ...p,
    id: i,
    ativo: true,
    destaque: !!p.top,
    estoque: 6 + ((i * 7) % 22), // MOCK determinístico
  }));

  /* ---------- helpers de UI ---------- */
  let toastTimer = null;
  function toast(msg) {
    const el = $("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-show"), 2600);
  }
  const pill = (st) => `<span class="pill pill--${st.replace(/\s.*/, "")}">${st}</span>`;

  const ICO = {
    money: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',
    box: '<svg viewBox="0 0 24 24"><path d="M3 8 12 3l9 5v8l-9 5-9-5V8Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/></svg>',
    shirt: '<svg viewBox="0 0 24 24"><path d="M16.5 3 12 5 7.5 3 3 6l2 3 2-.7V20h10V8.3l2 .7 2-3-4.5-3Z"/></svg>',
    users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.6c2.9.4 5 2.7 5 5.4"/></svg>',
    target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
    chart: '<svg viewBox="0 0 24 24"><path d="M4 20V6"/><path d="M10 20v-9"/><path d="M16 20V4"/><path d="M22 20H2"/></svg>',
    cart: '<svg viewBox="0 0 24 24"><circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 4h2l2.6 12h10.8L21 8H6"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M3 7h11v8H3z"/><path d="M14 10h4l3 3v2h-7z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L20 8l-4-4L4 16v4Z"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8L12 3Z"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
  };

  /* ============================================================
     RENDERS
     ============================================================ */
  function renderKPIs() {
    const grid = $("kpiGrid");
    if (!grid) return;
    MOCK.kpis[2].value = String(catalogo.filter(p => p.ativo).length); // produtos ativos reais
    grid.innerHTML = MOCK.kpis.map(k => `
      <div class="kpi">
        <span class="kpi__label">${ICO[k.ico] || ""} ${k.label}</span>
        <span class="kpi__value">${k.value}</span>
        <span class="kpi__delta ${k.up ? "up" : "down"}">${k.up ? "▲" : "▼"} ${k.delta}</span>
      </div>`).join("");
  }

  function renderBars(elId) {
    const el = $(elId);
    if (!el) return;
    const max = Math.max(...MOCK.vendasMes.map(x => x.v));
    el.innerHTML = MOCK.vendasMes.map(x => `
      <div class="bar${x.v === max ? " max" : ""}" title="${x.m}: ${money(x.v)}">
        <em>${Math.round(x.v / 1000)}k</em>
        <i style="height:${Math.round(x.v / max * 100)}%"></i>
        <span>${x.m}</span>
      </div>`).join("");
  }

  function renderHbars(elId) {
    const el = $(elId);
    if (!el) return;
    const max = Math.max(...MOCK.topProdutos.map(x => x.qtd));
    el.innerHTML = MOCK.topProdutos.map(x => `
      <div class="hbar" style="--w:${Math.round(x.qtd / max * 100)}%">
        <span>${x.nome} <b>${x.qtd} un.</b></span><i></i>
      </div>`).join("");
  }

  function renderDashPedidos() {
    const t = $("dashPedidos");
    if (!t) return;
    const rows = MOCK.pedidos.slice(0, 5);
    t.innerHTML = `
      <thead><tr><th>Pedido</th><th>Cliente</th><th>Produto</th><th>Valor</th><th>Status</th><th>Data</th></tr></thead>
      <tbody>${rows.map(p => `
        <tr><td><b>${p.n}</b></td><td>${p.cliente}</td><td>${p.prod}</td><td><b>${money(p.valor)}</b></td><td>${pill(p.st)}</td><td>${p.data}</td></tr>`).join("")}
      </tbody>`;
  }

  /* produtos — catálogo real do site */
  const prodState = { busca: "", cat: "todos" };
  function renderProdutos() {
    const t = $("prodTable");
    if (!t) return;
    const q = prodState.busca.trim().toLowerCase();
    const items = catalogo.filter(p =>
      (prodState.cat === "todos" || p.category === prodState.cat) &&
      (!q || p.team.toLowerCase().includes(q)));
    t.innerHTML = `
      <thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Promoção</th><th>Estoque</th><th>Ativo</th><th>Ações</th></tr></thead>
      <tbody>${items.map(p => {
        const preco = p.preco || Number(CONFIG.precoUnit);
        const promo = preco === Number(CONFIG.precoUnit) ? `2 por ${money(CONFIG.precoCombo)}` : "—";
        return `
        <tr data-id="${p.id}" ${p.ativo ? "" : 'style="opacity:.45"'}>
          <td><span class="prodcell"><img class="thumb" src="${p.img}" alt="" loading="lazy" /><b>${p.team}</b>${p.badge ? ` <span class="pill">${p.badge}</span>` : ""}</span></td>
          <td>${(typeof CAT_LABEL !== "undefined" && CAT_LABEL[p.category]) || p.category}</td>
          <td><b>${money(preco)}</b></td>
          <td>${promo}</td>
          <td>${p.estoque} un.</td>
          <td><button class="tgl ${p.ativo ? "is-on" : ""}" data-act="toggle" aria-label="Ativar/desativar"></button></td>
          <td><div class="rowact">
            <button data-act="edit" title="Editar">${ICO.edit}</button>
            <button data-act="star" class="${p.destaque ? "is-star" : ""}" title="Destacar">${ICO.star}</button>
            <button data-act="del" class="danger" title="Remover">${ICO.trash}</button>
          </div></td>
        </tr>`;
      }).join("")}</tbody>`;
  }

  /* pedidos */
  const pedState = { st: "todos" };
  function renderPedidos() {
    const t = $("pedTable");
    if (!t) return;
    const rows = MOCK.pedidos.filter(p => pedState.st === "todos" || p.st === pedState.st);
    t.innerHTML = `
      <thead><tr><th>Pedido</th><th>Cliente</th><th>Produto</th><th>Valor</th><th>Status</th><th>Frete</th><th>Data</th><th>Ação</th></tr></thead>
      <tbody>${rows.map(p => `
        <tr><td><b>${p.n}</b></td><td>${p.cliente}</td><td>${p.prod}</td><td><b>${money(p.valor)}</b></td>
        <td>${pill(p.st)}</td><td>${p.frete}</td><td>${p.data}</td>
        <td><div class="rowact"><button data-toast="Detalhe do pedido ${p.n} será conectado ao backend." title="Ver">${ICO.eye}</button></div></td></tr>`).join("")}
      </tbody>`;
  }

  function renderClientes() {
    const t = $("cliTable");
    if (!t) return;
    t.innerHTML = `
      <thead><tr><th>Cliente</th><th>Cidade</th><th>Pedidos</th><th>Total gasto</th><th>Canal</th></tr></thead>
      <tbody>${MOCK.clientes.map(c => `
        <tr><td><b>${c.nome}</b></td><td>${c.cidade}</td><td>${c.pedidos}</td><td><b>${money(c.total)}</b></td><td>${pill(c.canal)}</td></tr>`).join("")}
      </tbody>`;
  }

  function renderEstoque() {
    const t = $("estTable");
    if (!t) return;
    const sizes = ["P", "M", "G", "GG", "G1"];
    const head = `<thead><tr><th>Produto</th>${sizes.map(s => `<th>${s}</th>`).join("")}<th>Total</th></tr></thead>`;
    const cell = (q) => `<td ${q <= 2 ? 'style="color:#e05561;font-weight:700"' : ""}>${q}</td>`;
    if (MOCK.estoqueReal) { // dados reais da aba Estoque
      t.innerHTML = head + `<tbody>${MOCK.estoqueReal.map(r => {
        const qts = sizes.map(s => Number(r[s]) || 0);
        return `<tr><td><b>${r.Produto || "—"}</b></td>${qts.map(cell).join("")}<td><b>${qts.reduce((a, b) => a + b, 0)}</b></td></tr>`;
      }).join("")}</tbody>`;
      return;
    }
    t.innerHTML = head + `<tbody>${catalogo.filter(p => p.ativo).map(p => {
      const qts = sizes.map((s, k) => (p.id * 3 + k * 5 + 2) % 11); // MOCK determinístico
      return `<tr><td><b>${p.team}</b></td>${qts.map(cell).join("")}<td><b>${qts.reduce((a, b) => a + b, 0)}</b></td></tr>`;
    }).join("")}</tbody>`;
  }

  function renderPromoDestaques() {
    const el = $("promoDestaques");
    if (!el) return;
    const tops = catalogo.filter(p => p.destaque && p.ativo);
    el.innerHTML = tops.length
      ? tops.map(p => `<span class="pill">★ ${p.team}</span>`).join("")
      : '<span class="pill">Nenhum produto destacado</span>';
  }

  function renderFretes() {
    const t = $("fretTable");
    if (!t) return;
    t.innerHTML = `
      <thead><tr><th>Pedido</th><th>Código de rastreio</th><th>Transportadora</th><th>Prazo</th><th>Status</th></tr></thead>
      <tbody>${MOCK.fretes.map(f => `
        <tr><td><b>${f.n}</b></td><td>${f.cod}</td><td>${f.transp}</td><td>${f.prazo}</td><td>${pill(f.st)}</td></tr>`).join("")}
      </tbody>`;
  }

  function renderIdeias() {
    const el = $("adIdeas");
    if (!el) return;
    el.innerHTML = MOCK.ideias.map(i => `
      <div class="card">
        <span class="idea__ch">${i.canal}</span>
        <div class="card__head"><h2>${i.titulo}</h2></div>
        <ul class="idea__list">${i.itens.map(x => `<li>${x}</li>`).join("")}</ul>
      </div>`).join("");
  }

  function renderCampanhas() {
    const t = $("campTable");
    if (!t) return;
    t.innerHTML = `
      <thead><tr><th>Campanha</th><th>Canal</th><th>Investimento</th><th>Retorno</th><th>ROI</th><th>Status</th></tr></thead>
      <tbody>${MOCK.campanhas.map(c => {
        const roi = c.invest ? (c.retorno / c.invest).toFixed(1) + "x" : "orgânico";
        return `<tr><td><b>${c.nome}</b></td><td>${c.canal}</td><td>${c.invest ? money(c.invest) : "—"}</td>
          <td><b>${money(c.retorno)}</b></td><td>${roi}</td><td>${pill(c.status === "Ativa" ? "Entregue" : "Separando").replace(/>[^<]+</, ">" + c.status + "<")}</td></tr>`;
      }).join("")}</tbody>`;
  }

  function renderOrigem() {
    const donut = $("repOrigem"), hole = $("repOrigemTotal"), leg = $("repOrigemLegend");
    if (!donut || !leg) return;
    let acc = 0;
    const stops = MOCK.origem.map(o => {
      const s = `${o.cor} ${acc}% ${acc + o.pct}%`;
      acc += o.pct;
      return s;
    });
    donut.style.background = `conic-gradient(${stops.join(", ")})`;
    if (hole) hole.innerHTML = `${MOCK.origemTotal || 212}<small>clientes</small>`;
    leg.innerHTML = MOCK.origem.map(o => `<li><i style="background:${o.cor}"></i>${o.canal}<b>${o.pct}%</b></li>`).join("");
  }

  function renderStatusResumo() {
    const el = $("repStatus");
    if (!el) return;
    el.innerHTML = MOCK.statusResumo.map(s => `
      <div class="stbox"><b>${s.q}</b>${pill(s.st)}</div>`).join("");
  }

  function renderConfig() {
    if ($("cfgWpp") && typeof CONFIG !== "undefined") {
      $("cfgWpp").value = "+" + CONFIG.whatsapp.replace(/^(\d\d)(\d\d)(\d{5})(\d{4})$/, "$1 ($2) $3-$4");
      $("cfgInsta").value = "@lscolletion00";
      $("cfgUnit").value = money(CONFIG.precoUnit);
      $("cfgCombo").value = "2 por " + money(CONFIG.precoCombo);
    }
  }

  function renderAll() {
    renderKPIs();
    renderBars("dashVendas"); renderBars("repVendas");
    renderHbars("dashTop"); renderHbars("repTop");
    renderDashPedidos(); renderProdutos(); renderPedidos(); renderClientes();
    renderEstoque(); renderPromoDestaques(); renderFretes(); renderIdeias();
    renderCampanhas(); renderOrigem(); renderStatusResumo(); renderConfig();
  }

  /* ============================================================
     NAVEGAÇÃO / EVENTOS
     ============================================================ */
  function goSection(sec) {
    document.querySelectorAll(".sb__item").forEach(b => b.classList.toggle("is-active", b.dataset.sec === sec));
    document.querySelectorAll(".panel").forEach(p => p.classList.toggle("is-active", p.dataset.panel === sec));
    const btn = document.querySelector(`.sb__item[data-sec="${sec}"]`);
    const title = $("tbTitle");
    if (btn && title) title.textContent = btn.dataset.title || sec;
    closeDrawer();
    window.scrollTo({ top: 0 });
  }

  function openDrawer() {
    $("sidebar")?.classList.add("is-open");
    $("sbOverlay")?.classList.add("is-show");
    $("sbToggle")?.setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    $("sidebar")?.classList.remove("is-open");
    $("sbOverlay")?.classList.remove("is-show");
    $("sbToggle")?.setAttribute("aria-expanded", "false");
  }

  function showApp() {
    $("loginView").hidden = true;
    $("appView").hidden = false;
    renderAll();
  }
  function showLogin() {
    $("appView").hidden = true;
    $("loginView").hidden = false;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!$("loginView")) return; // só roda no admin.html

    /* conteúdo sempre renderizado ao carregar (KPIs, gráficos e tabelas),
       independente do estado do login — evita painel vazio */
    renderAll();
// FORÇAR ABERTURA DO PAINEL LOCAL
// Temporário: usado para acessar o dashboard e conectar a planilha
const loginViewForce = $("loginView");
const appViewForce = $("appView");

if (loginViewForce) {
  loginViewForce.remove();
}

if (appViewForce) {
  appViewForce.removeAttribute("hidden");
  appViewForce.hidden = false;
  appViewForce.style.display = "";
}

localStorage.setItem("ls_admin_logged", "1");

fetchData().then(ok => {
  if (ok) {
    renderAll();
  }
}).catch(() => {
  renderAll();
});
    /* login (valida a senha na planilha quando a conexão está configurada) */
    $("loginForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "Entrando…"; }
const email = $("loginEmail").value.trim();
const senha = $("loginPass").value.trim();

if (btn) { btn.disabled = false; btn.textContent = "Entrar no painel"; }

if (email !== "admin@lscollection.com.br" || senha !== "LSadm@2026") {
  toast("E-mail ou senha incorretos.");
  return;
}

$("loginView").hidden = true;
$("loginView").style.display = "none";

$("appView").hidden = false;
$("appView").style.display = "block";
showApp();
toast("Bem-vindo ao painel da LS Collection 👑");

const ok = await fetchData();
if (ok) {
  renderAll();
}
    });
    $("btnLogout")?.addEventListener("click", () => { adminLogout(); showLogin(); });
    if (isLogged()) {
      showApp();
      fetchData().then(ok => { if (ok) renderAll(); });
    } else if (!$("appView").hidden) {
      /* painel aberto sem sessão (acesso direto) — dados da planilha se houver conexão salva */
      fetchData().then(ok => { if (ok) renderAll(); });
    }

    /* navegação */
    document.querySelectorAll(".sb__item").forEach(b => b.addEventListener("click", () => goSection(b.dataset.sec)));
    document.querySelectorAll("[data-goto]").forEach(b => b.addEventListener("click", () => goSection(b.dataset.goto)));
    $("sbToggle")?.addEventListener("click", () => {
      $("sidebar").classList.contains("is-open") ? closeDrawer() : openDrawer();
    });
    $("sbOverlay")?.addEventListener("click", closeDrawer);

    /* toasts genéricos (botões ainda não conectados ao backend) */
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-toast]");
      if (t) toast(t.dataset.toast);
    });

    /* produtos: busca, filtro e ações em memória */
    $("prodSearch")?.addEventListener("input", (e) => { prodState.busca = e.target.value; renderProdutos(); });
    $("prodCat")?.addEventListener("change", (e) => { prodState.cat = e.target.value; renderProdutos(); });
    $("prodNew")?.addEventListener("click", () => toast("Cadastro de produto será conectado ao backend."));
    $("prodTable")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const tr = btn.closest("tr");
      const p = catalogo.find(x => x.id === Number(tr?.dataset.id));
      if (!p) return;
      if (btn.dataset.act === "toggle") {
        p.ativo = !p.ativo;
        toast(`${p.team} ${p.ativo ? "ativada" : "desativada"} (nesta sessão — backend em breve).`);
        renderProdutos(); renderKPIs(); renderEstoque(); renderPromoDestaques();
      }
      if (btn.dataset.act === "star") {
        p.destaque = !p.destaque;
        toast(`${p.team} ${p.destaque ? "adicionada aos" : "removida dos"} destaques (nesta sessão).`);
        renderProdutos(); renderPromoDestaques();
      }
      if (btn.dataset.act === "edit") toast(`Edição de "${p.team}" será conectada ao backend.`);
      if (btn.dataset.act === "del") {
        p.ativo = false;
        toast(`${p.team} removida da vitrine (nesta sessão — backend em breve).`);
        renderProdutos(); renderKPIs(); renderEstoque(); renderPromoDestaques();
      }
    });

    /* pedidos: filtro por status */
    $("pedFilter")?.addEventListener("click", (e) => {
      const chip = e.target.closest(".fchip");
      if (!chip) return;
      pedState.st = chip.dataset.st;
      document.querySelectorAll("#pedFilter .fchip").forEach(c => c.classList.toggle("is-active", c === chip));
      renderPedidos();
    });

    /* fretes: relê a planilha quando conectado */
    $("fretRefresh")?.addEventListener("click", async () => {
      if (apiUrl() && apiToken()) {
        const ok = await fetchData();
        if (ok) { renderAll(); toast("Dados atualizados direto da planilha ✓"); }
        else toast("Não consegui ler a planilha agora — tenta de novo.");
      } else {
        toast("Rastreios atualizados (simulação) — conecte a planilha em Configurações.");
      }
    });

    /* conexão com a planilha (Configurações) */
    const cfgUrl = $("cfgApiUrl");
    if (cfgUrl) cfgUrl.value = apiUrl();
    updateApiStatus();
    $("cfgApiSave")?.addEventListener("click", () => {
      const v = (cfgUrl?.value || "").trim();
      if (v && !/^https:\/\/script\.google\.com\/.+\/exec/.test(v)) {
        toast("A URL deve ser a do App da Web (termina em /exec)."); return;
      }
      localStorage.setItem(API_KEY, v);
      updateApiStatus();
      toast(v ? "Planilha conectada! Saia e entre com a senha do Apps Script." : "Conexão removida — painel volta ao modo demonstração.");
    });
    function updateApiStatus() {
      const s = $("cfgApiStatus");
      if (s) s.innerHTML = apiUrl()
        ? '<span class="pill pill--on">Conectado à planilha</span>'
        : '<span class="pill">Modo demonstração</span>';
    }

    /* notificações mock */
    $("tbBell")?.addEventListener("click", () => {
      toast("3 novidades: 2 pedidos novos e 1 estoque baixo (Corinthians · G).");
      const c = $("tbBellCount"); if (c) c.textContent = "0";
    });

    /* busca do topo (mock) */
    $("tbSearch")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); toast("Busca global será conectada ao backend."); }
    });
  });
})();
