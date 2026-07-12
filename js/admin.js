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
  /* conexão oficial do painel (App da Web da planilha da LS Collection).
     A senha NÃO fica aqui — é digitada no login e validada pelo Apps Script. */
  const API_URL_FIXA = "https://script.google.com/macros/s/AKfycbxDAk6qGXJFb2DjnQnry4FjsGlwrW-fQctv4u2yIRJiao5aG4WtnnVI86u3jZemRYgqNQ/exec";

  const API_KEY = "ls_admin_api";      // localStorage: URL alternativa (troca de implantação sem editar código)
  const CRED_KEY = "ls_admin_cred";    // sessionStorage: credencial validada nesta sessão
  const SESSION_KEY = "ls_admin_logged";

  const apiUrl = () => (localStorage.getItem(API_KEY) || "").trim() || API_URL_FIXA;
  function getCred() { try { return JSON.parse(sessionStorage.getItem(CRED_KEY) || "null"); } catch (e) { return null; } }
  function setCred(c) { sessionStorage.setItem(CRED_KEY, JSON.stringify(c)); }

  async function apiGet(params) {
    const url = apiUrl();
    if (!url) return null;
    const q = new URLSearchParams(params).toString();
    const res = await fetch(url + (url.includes("?") ? "&" : "?") + q, { redirect: "follow" });
    return res.json();
  }

  /* descobre a versão da API: v2 tem "primeiro acesso"; script antigo cai no login por senha única */
  let apiInfo = null, apiInfoPromise = null;
  function apiStatus() {
    if (apiInfoPromise) return apiInfoPromise;
    apiInfoPromise = (async () => {
      try {
        const r = await apiGet({ action: "status" });
        apiInfo = (r && r.ok && r.v === 2) ? { v2: true, configurado: !!r.configurado } : { v2: false, configurado: true };
      } catch (err) {
        apiInfo = { v2: false, configurado: true };
      }
      return apiInfo;
    })();
    return apiInfoPromise;
  }

  async function adminLogin(email, senha) {
    const st = await apiStatus();
    try {
      if (st.v2) {
        const r = await apiGet({ action: "login", email, senha });
        if (r && r.ok) { setCred({ email, senha }); sessionStorage.setItem(SESSION_KEY, "1"); return { ok: true }; }
        return { ok: false, erro: (r && r.erro) || "E-mail ou senha incorretos." };
      }
      /* script antigo (senha única no código) */
      const r = await apiGet({ action: "ping", token: senha });
      if (r && r.ok) { setCred({ token: senha }); sessionStorage.setItem(SESSION_KEY, "1"); return { ok: true }; }
      return { ok: false, erro: (r && r.erro) || "Senha incorreta." };
    } catch (err) {
      return { ok: false, erro: "Não consegui falar com a planilha. Confira sua internet e a URL em Configurações." };
    }
  }

  /* primeiro acesso — cria a conta do dono (só funciona uma vez, ver planilha-painel.gs) */
  async function adminRegistrar(email, senha) {
    try {
      const r = await apiGet({ action: "registrar", email, senha });
      if (r && r.ok) {
        setCred({ email, senha }); sessionStorage.setItem(SESSION_KEY, "1");
        apiInfo = { v2: true, configurado: true };
        return { ok: true };
      }
      return { ok: false, erro: (r && r.erro) || "Não foi possível criar a conta." };
    } catch (err) {
      return { ok: false, erro: "Não consegui falar com a planilha. Confira sua internet." };
    }
  }

  function adminLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(CRED_KEY);
  }
  function isLogged() { return sessionStorage.getItem(SESSION_KEY) === "1" && !!getCred(); }

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
    const cred = getCred();
    if (!apiUrl() || !cred) return false;
    try {
      const params = cred.token ? { token: cred.token } : { action: "dados", email: cred.email, senha: cred.senha };
      const d = await apiGet(params);
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

  /* ============================================================
     PINTOR DE ANÚNCIO — usado pela aba Nova Camisa (lançamentos)
     ============================================================ */
  const adCache = {};
  const adLoadImg = (src) => new Promise((res) => {
    if (adCache[src]) return res(adCache[src]);
    const i = new Image();
    i.onload = () => { adCache[src] = i; res(i); };
    i.onerror = () => res(null);
    i.src = src;
  });

  function adRoundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  /* desenha a arte de anúncio no padrão da marca (o = {story,gancho,titulo,badge,foto,preco,comboOk}) */
  async function pintarAnuncio(cv, o) {
    const W = 1080, H = o.story ? 1920 : 1350;
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) {}
    const logo = await adLoadImg("assets/logo.png");

    const GOLD = "#C9A24B", GOLD2 = "#F3D98A", INK2 = "rgba(255,255,255,.72)";

    g.fillStyle = "#0D0D10"; g.fillRect(0, 0, W, H);
    const rg = g.createRadialGradient(W / 2, H * 0.44, 60, W / 2, H * 0.44, W * 0.78);
    rg.addColorStop(0, "rgba(201,162,75,.26)"); rg.addColorStop(1, "rgba(201,162,75,0)");
    g.fillStyle = rg; g.fillRect(0, 0, W, H);
    const frame = g.createLinearGradient(0, 0, W, H);
    frame.addColorStop(0, "#8A6D2B"); frame.addColorStop(.5, GOLD2); frame.addColorStop(1, "#B8891F");
    g.strokeStyle = frame; g.lineWidth = 4; g.strokeRect(30, 30, W - 60, H - 60);

    let y = o.story ? 110 : 82;
    if (logo) {
      const lw = 250, lh = lw * (logo.height / logo.width);
      g.drawImage(logo, (W - lw) / 2, y, lw, lh);
      y += lh + (o.story ? 50 : 30);
    }

    g.textAlign = "center";
    if (o.gancho) {
      g.fillStyle = GOLD2; g.font = "600 40px Oswald, sans-serif";
      g.fillText(o.gancho.toUpperCase(), W / 2, y + 30); y += (o.story ? 72 : 58);
    }

    /* título com quebra */
    g.fillStyle = "#fff";
    let fs = 88; g.font = `700 ${fs}px Oswald, sans-serif`;
    let linhas = [o.titulo];
    if (g.measureText(o.titulo).width > W - 180) {
      const pal = o.titulo.split(" "); const meio = Math.ceil(pal.length / 2);
      linhas = [pal.slice(0, meio).join(" "), pal.slice(meio).join(" ")];
      fs = 72; g.font = `700 ${fs}px Oswald, sans-serif`;
      while (linhas.some(l => g.measureText(l).width > W - 180) && fs > 46) { fs -= 4; g.font = `700 ${fs}px Oswald, sans-serif`; }
    }
    linhas.forEach((l, i) => g.fillText(l, W / 2, y + fs * (i + 0.9)));
    y += fs * linhas.length + (o.story ? 30 : 18);

    /* badge (ex.: LANÇAMENTO · VERSÃO JOGADOR) */
    if (o.badge) {
      g.font = "600 30px Oswald, sans-serif";
      const bw = g.measureText(o.badge).width + 56;
      g.strokeStyle = GOLD; g.lineWidth = 2;
      adRoundRect(g, W / 2 - bw / 2, y, bw, 56, 28); g.stroke();
      g.fillStyle = GOLD2; g.fillText(o.badge, W / 2, y + 38);
      y += (o.story ? 92 : 70);
    } else { y += (o.story ? 40 : 26); }

    /* foto (ou placeholder tracejado) */
    const boxW = W - 300, boxH = o.story ? 650 : 410;
    if (o.foto) {
      const sc = Math.min(boxW / o.foto.width, boxH / o.foto.height);
      const fw = o.foto.width * sc, fh = o.foto.height * sc;
      g.save();
      g.shadowColor = "rgba(0,0,0,.55)"; g.shadowBlur = 46; g.shadowOffsetY = 22;
      g.drawImage(o.foto, (W - fw) / 2, y, fw, fh);
      g.restore();
      g.fillStyle = "rgba(13,13,16,.82)";
      adRoundRect(g, W / 2 - 128, y + fh - 22, 256, 52, 26); g.fill();
      g.strokeStyle = GOLD; g.lineWidth = 2;
      adRoundRect(g, W / 2 - 128, y + fh - 22, 256, 52, 26); g.stroke();
      g.fillStyle = GOLD2; g.font = "600 26px Oswald, sans-serif";
      g.fillText("PREMIUM 1.1 · P AO G1", W / 2, y + fh + 13);
      y += fh + (o.story ? 130 : 104);
    } else {
      g.save();
      g.setLineDash([16, 12]); g.strokeStyle = "rgba(201,162,75,.55)"; g.lineWidth = 3;
      adRoundRect(g, (W - boxW) / 2, y, boxW, boxH, 18); g.stroke();
      g.restore();
      g.fillStyle = INK2; g.font = "600 40px Oswald, sans-serif";
      g.fillText("FOTO DA CAMISA", W / 2, y + boxH / 2 - 8);
      g.fillStyle = "rgba(255,255,255,.45)"; g.font = "400 26px Inter, sans-serif";
      g.fillText("suba a foto no campo ao lado", W / 2, y + boxH / 2 + 34);
      y += boxH + (o.story ? 130 : 104);
    }

    /* preço + combo */
    g.fillStyle = GOLD2; g.font = "700 104px Oswald, sans-serif";
    g.fillText("R$ " + o.preco, W / 2, y);
    g.fillStyle = INK2; g.font = "500 32px Oswald, sans-serif";
    g.fillText("A UNIDADE", W / 2, y + 44);
    y += o.story ? 118 : 92;
    if (o.comboOk) {
      const pw = 560, ph = 76;
      const pg = g.createLinearGradient(W / 2 - pw / 2, 0, W / 2 + pw / 2, 0);
      pg.addColorStop(0, "#8A6D2B"); pg.addColorStop(.45, GOLD); pg.addColorStop(.62, GOLD2); pg.addColorStop(1, "#B8891F");
      g.fillStyle = pg; adRoundRect(g, W / 2 - pw / 2, y - ph / 2, pw, ph, ph / 2); g.fill();
      g.fillStyle = "#1a1206"; g.font = "700 38px Oswald, sans-serif";
      g.fillText("2 CAMISAS POR R$ " + CONFIG.precoCombo, W / 2, y + 13);
    }

    /* rodapé */
    const baseY = H - (o.story ? 150 : 118);
    g.strokeStyle = "rgba(201,162,75,.5)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(W / 2 - 200, baseY - 56); g.lineTo(W / 2 + 200, baseY - 56); g.stroke();
    g.fillStyle = GOLD2; g.font = "600 32px Oswald, sans-serif";
    g.fillText("VISTA SUA PAIXÃO. MOSTRE SEU ESTILO.", W / 2, baseY);
    g.fillStyle = INK2; g.font = "400 28px Inter, sans-serif";
    g.fillText("@lscolletion00  ·  WhatsApp (11) 94773-9081", W / 2, baseY + 44);
  }

  /* ============================================================
     NOVA CAMISA — anúncio de lançamento (foto enviada pelo dono)
     ============================================================ */
  function initLancamento() {
    const file = $("lcFoto"), nome = $("lcNome"), versao = $("lcVersao"), precoEl = $("lcPreco"),
          fmt = $("lcFmt"), gancho = $("lcGancho"), cv = $("lcCanvas");
    if (!cv || !file) return;

    let fotoImg = null;
    file.addEventListener("change", () => {
      const f = file.files && file.files[0];
      if (!f) { fotoImg = null; draw(); return; }
      const r = new FileReader();
      r.onload = () => { const i = new Image(); i.onload = () => { fotoImg = i; draw(); }; i.src = r.result; };
      r.readAsDataURL(f);
    });

    versao.addEventListener("change", () => {
      precoEl.value = versao.selectedOptions[0].dataset.preco || 140;
      draw();
    });
    fmt.addEventListener("change", draw);
    [nome, gancho, precoEl].forEach(el => el.addEventListener("input", () => {
      clearTimeout(el._t); el._t = setTimeout(draw, 300);
    }));

    const precoAtual = () => Number(precoEl.value) || Number(CONFIG.precoUnit);

    async function draw() {
      await pintarAnuncio(cv, {
        story: fmt.value === "story",
        gancho: gancho.value.trim() || "CHEGOU NA LS COLLECTION",
        titulo: "CAMISA " + (nome.value.trim() || "NOVA").toUpperCase(),
        badge: "LANÇAMENTO · VERSÃO " + versao.value.toUpperCase(),
        foto: fotoImg,
        preco: precoAtual(),
        comboOk: precoAtual() === Number(CONFIG.precoUnit),
      });
    }

    function legendaLancamento() {
      const n = nome.value.trim() || "nova";
      const tag = n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
      const p = precoAtual();
      return [
        `🚨 CHEGOU NA LS COLLECTION!`,
        "",
        `CAMISA ${n.toUpperCase()} — versão ${versao.value} Premium 1.1`,
        "Do P ao G1, qualidade que se sente no tecido e no caimento.",
        "",
        `💰 R$ ${p} a unidade`,
        ...(p === Number(CONFIG.precoUnit) ? [`🔥 Combo: 2 camisas por R$ ${CONFIG.precoCombo}`] : []),
        "📦 Envio com rastreio pra todo o Brasil",
        "📍 São Paulo: entrega no mesmo dia",
        "",
        `Garanta a sua antes de esgotar 👉 WhatsApp (11) 94773-9081`,
        "",
        `#lancamento #${tag} #camisadetime #futebol #lscollection`,
      ].join("\n");
    }

    $("lcDown")?.addEventListener("click", () => {
      if (!nome.value.trim()) { toast("Dá um nome pra camisa antes de baixar."); return; }
      if (!fotoImg) { toast("Suba a foto da camisa primeiro."); return; }
      const slug = nome.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      cv.toBlob((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = `lancamento-${slug}-${fmt.value}.png`; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        toast("Arte de lançamento baixada 🚀");
      }, "image/png");
    });
    $("lcCopy")?.addEventListener("click", () => {
      navigator.clipboard?.writeText(legendaLancamento());
      toast("Legenda de lançamento copiada.");
    });

    draw();
  }

  /* ============================================================
     CRIAR ANÚNCIO — arte PNG no padrão da marca (canvas, sem libs)
     ============================================================ */
  function initAdMaker() {
    const sel = $("adProd"), fmt = $("adFmt"), gancho = $("adGancho"), combo = $("adCombo"), cv = $("adCanvas");
    if (!sel || !cv) return;

    sel.innerHTML = catalogo.map(p =>
      `<option value="${p.team}">${p.team} — R$ ${p.preco || CONFIG.precoUnit}</option>`).join("");

    const cache = {};
    const loadImg = (src) => new Promise((res) => {
      if (cache[src]) return res(cache[src]);
      const i = new Image();
      i.onload = () => { cache[src] = i; res(i); };
      i.onerror = () => res(null);
      i.src = src;
    });

    const prodAtual = () => catalogo.find(x => x.team === sel.value) || catalogo[0];

    /* desenha a arte no padrão do design guide: preto + dourado, logo, camisa, preço */
    async function draw() {
      const p = prodAtual();
      const story = fmt.value === "story";
      const W = 1080, H = story ? 1920 : 1350;
      cv.width = W; cv.height = H;
      const g = cv.getContext("2d");
      try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) {}
      const [logo, foto] = await Promise.all([loadImg("assets/logo.png"), loadImg(p.img)]);

      const GOLD = "#C9A24B", GOLD2 = "#F3D98A", INK2 = "rgba(255,255,255,.72)";
      const preco = p.preco || Number(CONFIG.precoUnit);
      const temCombo = combo.checked && preco === Number(CONFIG.precoUnit);

      /* fundo premium + brilho dourado + moldura */
      g.fillStyle = "#0D0D10"; g.fillRect(0, 0, W, H);
      const rg = g.createRadialGradient(W / 2, H * 0.44, 60, W / 2, H * 0.44, W * 0.78);
      rg.addColorStop(0, "rgba(201,162,75,.26)"); rg.addColorStop(1, "rgba(201,162,75,0)");
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
      const frame = g.createLinearGradient(0, 0, W, H);
      frame.addColorStop(0, "#8A6D2B"); frame.addColorStop(.5, GOLD2); frame.addColorStop(1, "#B8891F");
      g.strokeStyle = frame; g.lineWidth = 4; g.strokeRect(30, 30, W - 60, H - 60);

      let y = story ? 120 : 88;

      /* logo */
      if (logo) {
        const lw = 260, lh = lw * (logo.height / logo.width);
        g.drawImage(logo, (W - lw) / 2, y, lw, lh);
        y += lh + (story ? 56 : 34);
      }

      /* chamada opcional */
      const hook = gancho.value.trim();
      if (hook) {
        g.fillStyle = GOLD2; g.font = "600 40px Oswald, sans-serif"; g.textAlign = "center";
        g.fillText(hook.toUpperCase(), W / 2, y + 30); y += (story ? 76 : 62);
      }

      /* título (quebra em 2 linhas se precisar) */
      g.fillStyle = "#fff"; g.textAlign = "center";
      const titulo = "CAMISA " + p.team.toUpperCase();
      let fs = 92; g.font = `700 ${fs}px Oswald, sans-serif`;
      const palavras = titulo.split(" "); let linhas = [titulo];
      if (g.measureText(titulo).width > W - 180) {
        const meio = Math.ceil(palavras.length / 2);
        linhas = [palavras.slice(0, meio).join(" "), palavras.slice(meio).join(" ")];
        fs = 76; g.font = `700 ${fs}px Oswald, sans-serif`;
        while (linhas.some(l => g.measureText(l).width > W - 180) && fs > 48) { fs -= 4; g.font = `700 ${fs}px Oswald, sans-serif`; }
      }
      linhas.forEach((l, i) => g.fillText(l, W / 2, y + fs * (i + 0.9)));
      y += fs * linhas.length + (story ? 60 : 36);

      /* foto da camisa (contida, com sombra) */
      if (foto) {
        const boxW = W - 300, boxH = story ? 760 : 520;
        const sc = Math.min(boxW / foto.width, boxH / foto.height);
        const fw = foto.width * sc, fh = foto.height * sc;
        g.save();
        g.shadowColor = "rgba(0,0,0,.55)"; g.shadowBlur = 46; g.shadowOffsetY = 22;
        g.drawImage(foto, (W - fw) / 2, y, fw, fh);
        g.restore();
        /* selo premium sobre a foto */
        g.fillStyle = "rgba(13,13,16,.82)";
        roundRect(g, W / 2 - 128, y + fh - 22, 256, 52, 26); g.fill();
        g.strokeStyle = GOLD; g.lineWidth = 2;
        roundRect(g, W / 2 - 128, y + fh - 22, 256, 52, 26); g.stroke();
        g.fillStyle = GOLD2; g.font = "600 26px Oswald, sans-serif";
        g.fillText("PREMIUM 1.1 · P AO G1", W / 2, y + fh + 13);
        y += fh + (story ? 130 : 108);
      }

      /* preço */
      g.fillStyle = GOLD2; g.font = "700 108px Oswald, sans-serif";
      const precoTxt = "R$ " + preco;
      g.fillText(precoTxt, W / 2, y);
      g.fillStyle = INK2; g.font = "500 34px Oswald, sans-serif";
      g.fillText("A UNIDADE", W / 2, y + 46);
      y += story ? 120 : 96;

      /* pill do combo */
      if (temCombo) {
        const pw = 560, ph = 78;
        const pg = g.createLinearGradient(W / 2 - pw / 2, 0, W / 2 + pw / 2, 0);
        pg.addColorStop(0, "#8A6D2B"); pg.addColorStop(.45, GOLD); pg.addColorStop(.62, GOLD2); pg.addColorStop(1, "#B8891F");
        g.fillStyle = pg; roundRect(g, W / 2 - pw / 2, y - ph / 2, pw, ph, ph / 2); g.fill();
        g.fillStyle = "#1a1206"; g.font = "700 40px Oswald, sans-serif";
        g.fillText("2 CAMISAS POR R$ " + CONFIG.precoCombo, W / 2, y + 14);
        y += story ? 110 : 88;
      }

      /* rodapé: tagline + contato */
      const baseY = H - (story ? 150 : 120);
      g.strokeStyle = "rgba(201,162,75,.5)"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(W / 2 - 200, baseY - 58); g.lineTo(W / 2 + 200, baseY - 58); g.stroke();
      g.fillStyle = GOLD2; g.font = "600 32px Oswald, sans-serif";
      g.fillText("VISTA SUA PAIXÃO. MOSTRE SEU ESTILO.", W / 2, baseY);
      g.fillStyle = INK2; g.font = "400 28px Inter, sans-serif";
      g.fillText("@lscolletion00  ·  WhatsApp (11) 94773-9081", W / 2, baseY + 46);
    }

    function roundRect(g, x, y, w, h, r) {
      g.beginPath();
      g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
    }

    /* legenda pronta pra copiar */
    function legenda() {
      const p = prodAtual();
      const preco = p.preco || Number(CONFIG.precoUnit);
      const temCombo = combo.checked && preco === Number(CONFIG.precoUnit);
      const tag = p.team.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
      return [
        `🖤💛 CAMISA ${p.team.toUpperCase()} — PREMIUM 1.1`,
        "",
        "Qualidade que se sente no tecido e no caimento. Do P ao G1.",
        "",
        `💰 R$ ${preco} a unidade`,
        ...(temCombo ? [`🔥 Combo: 2 camisas por R$ ${CONFIG.precoCombo}`] : []),
        "📦 Envio com rastreio pra todo o Brasil",
        "📍 São Paulo: entrega no mesmo dia",
        "",
        `Garanta a sua 👉 WhatsApp (11) 94773-9081`,
        "",
        `#${tag} #camisadetime #futebol #lscollection #vistasuapaixao`,
      ].join("\n");
    }

    /* eventos */
    [sel, fmt, combo].forEach(el => el.addEventListener("change", draw));
    gancho.addEventListener("input", () => { clearTimeout(gancho._t); gancho._t = setTimeout(draw, 300); });

    $("adDown")?.addEventListener("click", () => {
      const p = prodAtual();
      const nome = `anuncio-${p.team.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${fmt.value}.png`;
      cv.toBlob((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = nome; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        toast("Arte baixada — pronta pra postar 🎉");
      }, "image/png");
    });

    $("adCopy")?.addEventListener("click", () => {
      navigator.clipboard?.writeText(legenda());
      toast("Legenda copiada — cola direto no Instagram/WhatsApp.");
    });

    draw();
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
    const lv = $("loginView"), av = $("appView");
    if (lv) lv.hidden = true;
    if (av) av.hidden = false;
    renderAll();
    initAdMaker();
    initLancamento();
  }
  function showLogin() {
    const lv = $("loginView"), av = $("appView");
    if (av) av.hidden = true;
    if (lv) lv.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!$("loginView")) return; // só roda no admin.html

    /* conteúdo sempre renderizado ao carregar (KPIs, gráficos e tabelas),
       independente do estado do login — evita painel vazio */
    renderAll();

    /* card de login: vira "Primeiro acesso" quando o Apps Script v2 ainda não tem conta criada */
    let loginMode = "entrar";
    (async function setupLoginCard() {
      const st = await apiStatus();
      if (st.v2 && !st.configurado) {
        loginMode = "registrar";
        const sub = $("loginSub"), btn = $("loginBtn"), wrap = $("loginPass2Wrap");
        if (sub) sub.textContent = "Primeiro acesso: crie o e-mail e a senha do dono. Isso acontece uma única vez.";
        if (btn) btn.textContent = "Criar conta e entrar";
        if (wrap) wrap.hidden = false;
      }
    })();

    /* login / primeiro acesso — validado no Apps Script da planilha */
    $("loginForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = $("loginBtn");
      const email = $("loginEmail").value.trim();
      const senha = $("loginPass").value;
      const rotulo = loginMode === "registrar" ? "Criar conta e entrar" : "Entrar no painel";

      if (loginMode === "registrar") {
        if (senha.length < 6) { toast("A senha precisa de pelo menos 6 caracteres."); return; }
        if (senha !== ($("loginPass2")?.value || "")) { toast("As senhas não conferem."); return; }
      }

      if (btn) { btn.disabled = true; btn.textContent = loginMode === "registrar" ? "Criando conta…" : "Entrando…"; }
      const r = loginMode === "registrar" ? await adminRegistrar(email, senha) : await adminLogin(email, senha);
      if (btn) { btn.disabled = false; btn.textContent = rotulo; }
      if (!r.ok) { toast(r.erro || "Não foi possível entrar."); return; }

      showApp();
      toast(loginMode === "registrar" ? "Conta do dono criada — bem-vindo ao painel 👑" : "Bem-vindo ao painel da LS Collection 👑");
      loginMode = "entrar";
      const ok = await fetchData();
      if (ok) renderAll();
    });
    $("btnLogout")?.addEventListener("click", () => { adminLogout(); showLogin(); });
    /* porta de entrada: login sempre primeiro; painel só com sessão validada */
    if (isLogged()) {
      showApp();
      fetchData().then(ok => { if (ok) renderAll(); });
    } else {
      showLogin();
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
      if (apiUrl() && getCred()) {
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
