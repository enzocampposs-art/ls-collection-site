/* ============================================================
   LS Collection — script principal (index + rastreio)
   ============================================================ */

const CONFIG = {
  whatsapp: "5511947739081",
  instagram: "https://www.instagram.com/lscolletion00",
  precoUnit: "140",
  precoCombo: "260",
};

/* PRODUTOS — foto real de cada camisa em assets/.
   category: 'brasileirao' | 'selecoes' | 'europeus'
   badge (opcional): 'Mais vendida' | 'Novidade' | 'Jogador' | 'Retrô'
   preco (opcional): só quando difere dos R$ 140 padrão (combo 2x260 vale apenas no preço padrão) */
const PRODUTOS = [
  { team: "Corinthians", category: "brasileirao", img: "assets/prod19.jpg", badge: "Mais vendida", top: true },
  { team: "Flamengo",    category: "brasileirao", img: "assets/prod35.jpg", badge: "Novidade", top: true },
  { team: "Palmeiras",   category: "brasileirao", img: "assets/prod01.jpg", top: true },
  { team: "São Paulo",   category: "brasileirao", img: "assets/prod10.jpg", top: true },
  { team: "Vasco",       category: "brasileirao", img: "assets/prod11.jpg" },
  { team: "Santos",      category: "brasileirao", img: "assets/prod18.jpg" },
  { team: "Brasil",      category: "selecoes",    img: "assets/prod03.jpg", badge: "Mais vendida", top: true },
  { team: "Portugal",    category: "selecoes",    img: "assets/prod13.jpg" },
  { team: "Alemanha",    category: "selecoes",    img: "assets/prod17.jpg" },
  { team: "México",      category: "selecoes",    img: "assets/prod21.jpg" },
  { team: "Real Madrid", category: "europeus",    img: "assets/prod09.jpg", top: true },
  { team: "Barcelona",   category: "europeus",    img: "assets/prod14.jpg", top: true },
  { team: "Inter de Milão", category: "europeus", img: "assets/prod20.jpg" },
  { team: "Liverpool",   category: "europeus",    img: "assets/prod23.jpg" },
  { team: "Bayern de Munique", category: "europeus", img: "assets/prod24.jpg" },
  { team: "Arsenal",     category: "europeus",    img: "assets/prod27.jpg" },
  { team: "Tottenham",   category: "europeus",    img: "assets/prod28.jpg" },
  { team: "Manchester City", category: "europeus", img: "assets/prod34.jpg" },
  { team: "AS Roma",     category: "europeus",    img: "assets/prod32.jpg" },
  { team: "Argentina",   category: "selecoes",    img: "assets/prod39.jpg", badge: "Jogador", preco: 210 },
  { team: "Barcelona Roxa", category: "europeus", img: "assets/prod40.jpg" },
  { team: "Bayern Vermelha", category: "europeus", img: "assets/prod41.jpg", badge: "Jogador", preco: 170 },
  { team: "Benfica",     category: "europeus",    img: "assets/prod42.jpg" },
  { team: "Corinthians Retrô 1995", category: "brasileirao", img: "assets/prod43.jpg", badge: "Retrô", preco: 200 },
  { team: "Corinthians Preta", category: "brasileirao", img: "assets/prod44.jpg", badge: "Jogador", preco: 210 },
  { team: "Espanha",     category: "selecoes",    img: "assets/prod45.jpg", badge: "Jogador", preco: 210 },
  { team: "França",      category: "selecoes",    img: "assets/prod46.jpg", badge: "Jogador", preco: 210 },
  { team: "Japão",       category: "selecoes",    img: "assets/prod47.jpg" },
  { team: "Palmeiras Branca", category: "brasileirao", img: "assets/prod48.jpg", badge: "Jogador", preco: 210 },
  { team: "Palmeiras Verde", category: "brasileirao", img: "assets/prod49.jpg", badge: "Jogador", preco: 210 },
  { team: "Santos Retrô 2012 Azul", category: "brasileirao", img: "assets/prod50.jpg", badge: "Retrô" },
  { team: "Santos Retrô 2012 Branca", category: "brasileirao", img: "assets/prod51.jpg", badge: "Retrô" },
  { team: "São Paulo Listrada", category: "brasileirao", img: "assets/prod52.jpg", badge: "Jogador", preco: 210 },
];

const CAT_LABEL = { brasileirao: "Brasileirão", selecoes: "Seleção", europeus: "Europa" };

const REVIEWS = [
  { name: "Rafael M.", meta: "Corinthians · São Paulo/SP", text: "Chegou rápido e a qualidade é surreal, parece oficial. Já é a segunda que compro." },
  { name: "Juliana S.", meta: "Flamengo · Rio de Janeiro/RJ", text: "Peguei 2 no combo e economizei. Atendimento nota 10 no WhatsApp, tiraram todas as dúvidas." },
  { name: "Diego A.", meta: "Palmeiras · Belo Horizonte/MG", text: "Melhor camisa 1.1 que já tive. Caimento perfeito e veio com o rastreio certinho." },
];

/* WhatsApp */
function waLink(msg) { return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`; }

/* Catálogo */
const STATE = { filter: "todos", query: "" };

function renderCatalog() {
  const grid = document.getElementById("catalogGrid");
  const empty = document.getElementById("catalogEmpty");
  if (!grid) return;

  const q = STATE.query.trim().toLowerCase();
  const items = PRODUTOS.filter((p) => {
    const catOk = STATE.filter === "todos" ? true
      : STATE.filter === "maisvendidos" ? !!p.top
      : p.category === STATE.filter;
    const qOk = !q || p.team.toLowerCase().includes(q);
    return catOk && qOk;
  });
  if (empty) empty.hidden = items.length !== 0;

  grid.innerHTML = items.map((p) => {
    const msg = `Olá! Tenho interesse na camisa do ${p.team} (do P ao G1). Vi no site — ainda tem em estoque?`;
    const badge = p.badge ? `<span class="card__badge">${p.badge}</span>` : "";
    const preco = p.preco || Number(CONFIG.precoUnit);
    const combo = preco === Number(CONFIG.precoUnit)
      ? `<span class="card__combo">2 por R$ ${CONFIG.precoCombo}</span>` : "";
    return `
      <article class="card">
        <a class="card__media" href="produto.html?team=${encodeURIComponent(p.team)}">
          <span class="card__quality">Premium 1.1</span>
          ${badge}
          <img src="${p.img}" alt="Camisa do ${p.team} — LS Collection" loading="lazy" />
        </a>
        <div class="card__body">
          <span class="card__cat">${CAT_LABEL[p.category] || ""}</span>
          <h3 class="card__team"><a href="produto.html?team=${encodeURIComponent(p.team)}">${p.team}</a></h3>
          <span class="card__sizes" aria-label="Tamanhos: P, M, G, GG e G1"><i>P</i><i>M</i><i>G</i><i>GG</i><i>G1</i></span>
          <div class="card__pricing">
            <div class="card__price"><b>R$ ${preco}</b><span>na unidade</span></div>
            ${combo}
          </div>
          <a class="card__buy" href="${waLink(msg)}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.7 15l-1.3 5 5.1-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.3.5-.4.4c-.1.1-.3.3-.1.6.1.3.7 1.1 1.4 1.8.9.8 1.7 1.1 2 1.2.2.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.5.3.1.3.1.6-.1 1.5Z"/></svg>
            Comprar no WhatsApp
          </a>
          <span class="card__secure"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg> Compra segura · envio com rastreio</span>
        </div>
      </article>`;
  }).join("");

  revealCards();
}

function revealCards() {
  const cards = document.querySelectorAll(".card");
  if (!("IntersectionObserver" in window)) { cards.forEach((c) => c.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) { setTimeout(() => e.target.classList.add("is-in"), (i % 4) * 70); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  cards.forEach((c) => io.observe(c));
}

/* Reveal suave on-scroll — mesmo padrão do revealCards, pra elementos estáticos.
   A classe é adicionada via JS: sem JS, nada fica escondido. */
function revealSoft(selector) {
  const els = document.querySelectorAll(selector);
  if (!els.length || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) { setTimeout(() => e.target.classList.add("is-in"), (i % 4) * 80); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach((el) => { el.classList.add("reveal-init"); io.observe(el); });
}

/* Depoimentos */
function renderReviews() {
  const grid = document.getElementById("reviewsGrid");
  if (!grid) return;
  grid.innerHTML = REVIEWS.map((r) => `
    <article class="review">
      <div class="review__stars">★★★★★</div>
      <p class="review__text">"${r.text}"</p>
      <div class="review__who">
        <span class="review__ava">${r.name.charAt(0)}</span>
        <div>
          <div class="review__name">${r.name}</div>
          <div class="review__meta">${r.meta}</div>
        </div>
      </div>
    </article>`).join("");
}

/* Cronômetro — janela de 3 dias, persistente; reinicia sozinho ao zerar */
function initCountdown() {
  const d = document.getElementById("cdD");
  const h = document.getElementById("cdH");
  const m = document.getElementById("cdM");
  const s = document.getElementById("cdS");
  if (!h || !m || !s) return;
  const pad = (n) => String(n).padStart(2, "0");
  const SPAN = 3 * 24 * 60 * 60 * 1000; // 3 dias
  const KEY = "ls_promo_end";

  function getEnd() {
    let end = parseInt(localStorage.getItem(KEY) || "0", 10);
    if (!end || isNaN(end) || end <= Date.now()) {
      end = Date.now() + SPAN;
      try { localStorage.setItem(KEY, String(end)); } catch (e) {}
    }
    return end;
  }
  let end = getEnd();

  function tick() {
    let diff = end - Date.now();
    if (diff <= 0) { end = getEnd(); diff = end - Date.now(); } // reinicia ao zerar
    const total = Math.floor(diff / 1000);
    if (d) d.textContent = pad(Math.floor(total / 86400));
    h.textContent = pad(Math.floor((total % 86400) / 3600));
    m.textContent = pad(Math.floor((total % 3600) / 60));
    s.textContent = pad(total % 60);
  }
  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   MÓDULO 4 — Frete e entrega
   Cálculo de frete por CEP. Hoje é SIMULADO no front-end.
   A estrutura já está pronta para plugar a API do Melhor Envio.
   ============================================================ */

const FRETE = {
  // TODO Melhor Envio: CEP de origem da loja (de onde as camisas saem).
  cepOrigem: "01000000",
  // Faixas SIMULADAS — trocar pelos valores/prazos reais retornados pela API.
  faixas: {
    capital:  { regiao: "Capital de São Paulo",        prazo: "Hoje — entrega no mesmo dia", valor: "a partir de R$ 19,90" },
    grandesp: { regiao: "ABC / Grande São Paulo",       prazo: "Expressa — 1 a 2 dias úteis", valor: "a partir de R$ 14,90" },
    brasil:   { regiao: "Demais regiões do Brasil",     prazo: "5 a 10 dias úteis",           valor: "a partir de R$ 24,90" },
  },
};

/* Classifica o CEP numa faixa de entrega (simulação por prefixo).
   Produção: essa decisão virá do retorno da API do Melhor Envio. */
function faixaPorCep(cepDigits) {
  const n = parseInt(cepDigits, 10);
  if (n >= 1000000 && n <= 5999999) return "capital";   // 01000-000 a 05999-999
  if (n >= 6000000 && n <= 9999999) return "grandesp";  // 06000-000 a 09999-999 (ABC + Grande SP)
  return "brasil";
}

/* Cálculo de frete — hoje simulado no front.
   Para produção, substituir o corpo por uma chamada à API do Melhor Envio:
     - CEP de origem da loja ......... FRETE.cepOrigem
     - CEP do cliente ................ cepDigits
     - cotação de transportadoras .... Correios / Jadlog / etc.
     - opções de frete .............. serviços disponíveis
     - prazo e valor ................ de cada opção retornada
   e renderizar as opções reais no lugar da faixa simulada abaixo. */
function calcularFrete(cepDigits) {
  const tier = faixaPorCep(cepDigits);
  return { tier, ...FRETE.faixas[tier] };
}

function initFrete() {
  const form = document.getElementById("freteForm");
  const input = document.getElementById("cepInput");
  const result = document.getElementById("freteResult");
  if (!form || !input || !result) return;

  // máscara de CEP: nnnnn-nnn
  input.addEventListener("input", () => {
    let v = input.value.replace(/\D/g, "").slice(0, 8);
    if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5);
    input.value = v;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const cepDigits = input.value.replace(/\D/g, "");

    if (cepDigits.length !== 8) {
      result.hidden = false;
      result.innerHTML = `
        <div class="ship__result-card is-erro">
          <span class="ship__result-ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4"/><circle cx="12" cy="17" r="0.6"/></svg></span>
          <div class="ship__result-main">
            <strong class="ship__result-prazo">CEP incompleto</strong>
            <span class="ship__result-region">Digite os 8 números do seu CEP.</span>
          </div>
        </div>`;
      return;
    }

    const r = calcularFrete(cepDigits);
    const cepFmt = cepDigits.slice(0, 5) + "-" + cepDigits.slice(5);
    const msg = `Olá! Meu CEP é ${cepFmt}. Quero confirmar o frete e o prazo de entrega das camisas.`;
    result.hidden = false;
    result.innerHTML = `
      <div class="ship__result-card is-${r.tier}">
        <span class="ship__result-ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v8H3z"/><path d="M14 10h4l3 3v2h-7z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></span>
        <div class="ship__result-main">
          <span class="ship__result-region">CEP ${cepFmt} · ${r.regiao}</span>
          <strong class="ship__result-prazo">${r.prazo}</strong>
          <span class="ship__result-valor">Frete ${r.valor}</span>
        </div>
        <a class="btn btn--gold ship__result-cta" href="${waLink(msg)}" target="_blank" rel="noopener">Finalizar no WhatsApp</a>
      </div>`;
  });
}

/* Navegação mobile + header scroll */
function initNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    nav.classList.remove("is-open"); toggle.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false");
  }));
}

/* WhatsApp nos [data-wpp] */
function initWhatsApp() {
  document.querySelectorAll("[data-wpp]").forEach((el) => {
    const msg = el.getAttribute("data-wpp-msg") || "Olá! Vim pelo site da LS Collection.";
    el.setAttribute("href", waLink(msg));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
}

/* Utils categoria/busca */
function setActiveChip(filter) {
  document.querySelectorAll("#filters .chip").forEach((c) => c.classList.toggle("chip--active", c.dataset.filter === filter));
}
function scrollToCatalog() { document.getElementById("colecao")?.scrollIntoView({ behavior: "smooth", block: "start" }); }

/* ============================================================
   Camisa 360 — giro por ângulos no bloco "mais vendida".
   Frames em assets/cor-01.jpg, cor-02.jpg, ... (sequenciais).
   Ativa sozinho quando os frames existirem; senão mantém a foto atual.
   ============================================================ */
function initShirt360() {
  const wrap = document.getElementById("shirt360");
  const img = document.getElementById("shirt360Img");
  const hint = document.getElementById("shirt360Hint");
  if (!wrap || !img) return;

  const BASE = "assets/cor-", EXT = ".jpg?v=3", MAX = 40;
  const frames = [];

  // pré-carrega frames sequenciais (cor-01, cor-02, ...) até faltar um
  (function probe(n) {
    if (n > MAX) return activate();
    const src = BASE + String(n).padStart(2, "0") + EXT;
    const im = new Image();
    im.onload = () => { frames.push(src); probe(n + 1); };
    im.onerror = () => activate();
    im.src = src;
  })(1);

  function activate() {
    if (frames.length < 2) { if (hint) hint.style.display = "none"; return; } // sem frames -> mantém estático
    img.src = frames[0];
    img.setAttribute("draggable", "false");
    if (hint) hint.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7 3 12l5 5"/><path d="m16 7 5 5-5 5"/></svg> Arraste ou passe o mouse para girar';
    wrap.classList.add("is-360");

    const N = frames.length;
    const HALF = Math.floor(N / 2); // meia volta: frente → costas

    // indicador de ângulo (dots) — um por frame útil
    const dotsEl = document.createElement("div");
    dotsEl.className = "spin-dots";
    dotsEl.setAttribute("aria-hidden", "true");
    for (let i = 0; i <= HALF; i++) dotsEl.appendChild(document.createElement("i"));
    wrap.appendChild(dotsEl);
    const dots = Array.from(dotsEl.children);
    const paintDots = (idx) => dots.forEach((d, k) => d.classList.toggle("on", k === idx));
    paintDots(0);

    let target = 0, cur = 0, shown = 0, raf = null;
    // anima o índice suavemente até o alvo (evita "pulos" quando o mouse vai rápido)
    const render = () => {
      cur += (target - cur) * 0.16;
      if (Math.abs(target - cur) < 0.01) cur = target;
      let idx = Math.round(cur);
      if (idx < 0) idx = 0; else if (idx > N - 1) idx = N - 1;
      if (idx !== shown) { shown = idx; img.src = frames[idx]; paintDots(idx); }
      raf = Math.abs(target - cur) > 0.01 ? requestAnimationFrame(render) : null;
    };
    const kick = () => { if (raf == null) raf = requestAnimationFrame(render); };
    const setFromX = (clientX) => {
      wrap.classList.add("is-used"); // esconde a dica depois do primeiro giro
      const r = wrap.getBoundingClientRect();
      let p = (clientX - r.left) / r.width;
      p = Math.max(0, Math.min(0.9999, p));
      target = p * HALF;   // meia volta: frente → costas (não "volta" pra frente)
      kick();
    };
    // desktop: passar o mouse gira; mobile: arrastar o dedo gira — tudo suavizado
    wrap.addEventListener("pointerdown", (e) => { wrap.setPointerCapture?.(e.pointerId); setFromX(e.clientX); });
    wrap.addEventListener("pointermove", (e) => setFromX(e.clientX));
    wrap.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { target = 0; kick(); } });
  }
}

/* Init */
document.addEventListener("DOMContentLoaded", () => {
  renderCatalog();
  renderReviews();
  initCountdown();
  initNav();
  initWhatsApp();
  initFrete();
  initShirt360();

  document.getElementById("filters")?.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    STATE.filter = chip.dataset.filter; setActiveChip(STATE.filter); renderCatalog();
  });

  document.querySelectorAll("[data-goto]").forEach((el) => el.addEventListener("click", () => {
    STATE.filter = el.dataset.goto; STATE.query = "";
    const si = document.getElementById("searchInput"); if (si) si.value = "";
    setActiveChip(STATE.filter); renderCatalog(); scrollToCatalog();
  }));

  const searchInput = document.getElementById("searchInput");
  searchInput?.addEventListener("input", (e) => { STATE.query = e.target.value; renderCatalog(); });
  document.getElementById("searchForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    // fora da home (produto/rastreio) não há catálogo: leva a busca pra home
    if (!document.getElementById("catalogGrid")) {
      const q = (searchInput?.value || "").trim();
      window.location.href = "index.html" + (q ? "?q=" + encodeURIComponent(q) : "") + "#colecao";
      return;
    }
    renderCatalog(); scrollToCatalog();
  });

  // busca vinda de outra página (?q=)
  const qParam = new URLSearchParams(location.search).get("q");
  if (qParam && document.getElementById("catalogGrid")) {
    STATE.query = qParam;
    if (searchInput) searchInput.value = qParam;
    renderCatalog();
    scrollToCatalog();
  }

  // entrada suave dos blocos ao rolar (depoimentos já renderizados acima)
  revealSoft(".tcard, .catbanner, .howto__step, .ship__card, .review, .stat, .track__help-item");

  // formulário de rastreio da home -> página dedicada
  document.getElementById("trackHomeForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("trackHomeInput").value.trim();
    window.location.href = code ? `rastreio.html?code=${encodeURIComponent(code)}` : "rastreio.html";
  });

  // newsletter / cupom -> WhatsApp
  document.getElementById("newsForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = (document.getElementById("newsEmail")?.value || "").trim();
    const msg = `Quero meu cupom de 10% de desconto no primeiro pedido!${email ? " Meu e-mail: " + email : ""}`;
    window.open(waLink(msg), "_blank");
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
