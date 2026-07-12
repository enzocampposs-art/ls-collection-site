/* ============================================================
   LS Collection — checkout (produto.html)
   Fluxo: produto → dados do cliente → resumo do pedido →
   pagamento externo (Mercado Pago / PagSeguro / Pix) ou WhatsApp →
   acompanhamento pelo WhatsApp.
   Reusa PRODUTOS / CONFIG / FRETE / calcularFrete / waLink de script.js.
   Não captura dados de cartão — o pagamento acontece fora do site.
   ============================================================ */
(function () {
  const $ = (id) => document.getElementById(id);
  const modal = $("checkoutModal");
  if (!modal) return; // só roda em páginas com o modal de checkout

  const params = new URLSearchParams(location.search);
  const teamParam = (params.get("team") || "").toLowerCase();
  const list = (typeof PRODUTOS !== "undefined") ? PRODUTOS : [];
  /* aceita "Real Madrid", "real madrid" e "real-madrid" */
  const norm = (typeof slugTeam === "function") ? slugTeam : ((s) => String(s).toLowerCase());
  const prod = list.find((p) => p.team.toLowerCase() === teamParam || norm(p.team) === norm(teamParam)) || list[0];
  if (!prod) return;

  const QTD_MAX = 10;
  const precoUnitPadrao = Number(CONFIG.precoUnit);
  const unitPrice = prod.preco || precoUnitPadrao;
  const comboElegivel = unitPrice === precoUnitPadrao; // só as camisas de preço padrão entram no combo 2x260

  const state = { qtd: 1, pay: "pix", frete: null };
  const money = (n) => "R$ " + n.toFixed(2).replace(".", ",");

  /* nº do pedido: LS-AAAAMMDD-HHMM-4dígitos (ex.: LS-20260712-1607-4821) */
  function gerarNumeroPedido() {
    const d = new Date();
    const p2 = (n) => String(n).padStart(2, "0");
    const rand = String(Math.floor(1000 + Math.random() * 9000));
    return `LS-${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}-${p2(d.getHours())}${p2(d.getMinutes())}-${rand}`;
  }

  /* preço total dos produtos, já aplicando o combo 2x260 quando elegível */
  function calcularTotalProdutos(qtd) {
    if (!comboElegivel) return unitPrice * qtd;
    const pares = Math.floor(qtd / 2);
    const resto = qtd % 2;
    return pares * Number(CONFIG.precoCombo) + resto * unitPrice;
  }

  function tamanhoSelecionado() {
    return document.querySelector(".pdp__size.is-active")?.dataset.size || "";
  }

  /* ---------- render: produto + resumo ao vivo ---------- */
  function renderProduto() {
    const el = $("ckProduct");
    if (!el) return;
    el.innerHTML = `
      <img src="${prod.img}" alt="Camisa do ${prod.team}" />
      <div class="ck__product-txt">
        <strong>Camisa do ${prod.team}</strong>
        <span>Premium 1.1 · Tamanho <b>${tamanhoSelecionado() || "não escolhido"}</b></span>
      </div>`;
  }

  function renderResumo() {
    const el = $("ckResumo");
    if (!el) return;
    const totalProdutos = calcularTotalProdutos(state.qtd);
    const freteValor = state.frete ? state.frete.valorNum : 0;
    const total = totalProdutos + freteValor;

    el.innerHTML = `
      <div class="ck__resumo-row"><span>Produto</span><span>Camisa do ${prod.team}</span></div>
      <div class="ck__resumo-row"><span>Tamanho</span><span>${tamanhoSelecionado() || "—"}</span></div>
      <div class="ck__resumo-row"><span>Quantidade</span><span>${state.qtd}</span></div>
      <div class="ck__resumo-row"><span>Valor unitário</span><span>R$ ${unitPrice}</span></div>
      ${comboElegivel && state.qtd >= 2 ? `<div class="ck__resumo-row ck__resumo-row--gold"><span>Promoção aplicada</span><span>2 por R$ ${CONFIG.precoCombo}</span></div>` : ""}
      <div class="ck__resumo-row"><span>Frete</span><span>${state.frete ? money(freteValor) + " · " + state.frete.regiao : "informe o CEP"}</span></div>
      <div class="ck__resumo-row ck__resumo-row--total"><span>Total</span><span>${money(total)}</span></div>`;
  }

  function renderAll() { renderProduto(); renderResumo(); atualizarHint(); }

  /* ---------- quantidade ---------- */
  $("ckQtyMinus")?.addEventListener("click", () => {
    state.qtd = Math.max(1, state.qtd - 1);
    if ($("ckQty")) $("ckQty").value = state.qtd;
    renderResumo();
  });
  $("ckQtyPlus")?.addEventListener("click", () => {
    state.qtd = Math.min(QTD_MAX, state.qtd + 1);
    if ($("ckQty")) $("ckQty").value = state.qtd;
    renderResumo();
  });

  /* ---------- tamanho: reflete a seleção feita nos botões da PDP ---------- */
  $("pdpSizes")?.addEventListener("click", () => setTimeout(renderAll, 0));

  /* ---------- telefone: máscara leve (11) 91234-5678 ---------- */
  $("ckTelefone")?.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    e.target.value = v;
  });

  /* ---------- CEP: reusa calcularFrete() de script.js ---------- */
  $("ckCep")?.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 8);
    if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5);
    e.target.value = v;
    const digits = v.replace(/\D/g, "");
    if (digits.length === 8 && typeof calcularFrete === "function") {
      const r = calcularFrete(digits);
      const valorNum = (FRETE.faixas[r.tier] && FRETE.faixas[r.tier].valorNum) || 0;
      state.frete = Object.assign({}, r, { valorNum });
    } else {
      state.frete = null;
    }
    renderResumo();
  });

  /* ---------- forma de pagamento ---------- */
  $("ckPayOpts")?.addEventListener("click", (e) => {
    const chip = e.target.closest(".ck__pay-chip");
    if (!chip) return;
    state.pay = chip.dataset.pay;
    document.querySelectorAll(".ck__pay-chip").forEach((c) => c.classList.toggle("is-active", c === chip));
    if ($("ckPixBox")) $("ckPixBox").hidden = state.pay !== "pix";
  });

  /* ---------- validação simples (sem backend) ---------- */
  function camposValidos() {
    const nome = $("ckNome")?.value.trim();
    const tel = $("ckTelefone")?.value.trim();
    return !!(nome && tel && tamanhoSelecionado());
  }
  function atualizarHint() {
    const hint = $("ckHint");
    if (hint) hint.hidden = camposValidos();
  }
  ["ckNome", "ckTelefone", "ckCidade"].forEach((id) => $(id)?.addEventListener("input", atualizarHint));

  /* ---------- monta o objeto do pedido ---------- */
  function montarPedido() {
    const totalProdutos = calcularTotalProdutos(state.qtd);
    const freteValor = state.frete ? state.frete.valorNum : 0;
    const nomePagamento = { pix: "Pix", credito: "Cartão de crédito", debito: "Cartão de débito" }[state.pay];
    return {
      numero: gerarNumeroPedido(),
      cliente: {
        nome: $("ckNome")?.value.trim() || "",
        telefone: $("ckTelefone")?.value.trim() || "",
        cidade: $("ckCidade")?.value.trim() || "",
        cep: $("ckCep")?.value.trim() || "",
      },
      produto: prod.team,
      tamanho: tamanhoSelecionado(),
      quantidade: state.qtd,
      valorUnitario: unitPrice,
      comboAplicado: comboElegivel && state.qtd >= 2,
      frete: freteValor,
      freteRegiao: state.frete ? state.frete.regiao : "",
      total: totalProdutos + freteValor,
      formaPagamento: nomePagamento,
    };
  }

  /* ---------- gera a mensagem do WhatsApp a partir do pedido ---------- */
  function gerarMensagemWhatsApp(pedido) {
    const linhas = [];
    linhas.push("Olá! Quero finalizar meu pedido na LS Collection.");
    linhas.push("");
    linhas.push(`Número do pedido: ${pedido.numero}`);
    linhas.push("");

    /* dados do cliente — só entram se preenchidos */
    const cli = [];
    if (pedido.cliente.nome) cli.push(`Nome: ${pedido.cliente.nome}`);
    if (pedido.cliente.telefone) cli.push(`Telefone: ${pedido.cliente.telefone}`);
    const cidadeCep = [pedido.cliente.cidade, pedido.cliente.cep].filter(Boolean).join(" · ");
    if (cidadeCep) cli.push(`Cidade/CEP: ${cidadeCep}`);
    if (cli.length) { linhas.push("Dados do cliente:"); linhas.push(...cli); linhas.push(""); }

    linhas.push("Dados do pedido:");
    linhas.push(`Produto: Camisa ${pedido.produto}`);
    linhas.push(`Tamanho: ${pedido.tamanho}`);
    linhas.push(`Quantidade: ${pedido.quantidade}`);
    linhas.push(`Valor unitário: ${money(pedido.valorUnitario)}`);
    if (pedido.comboAplicado) linhas.push(`Promoção aplicada: 2 camisas por R$ ${CONFIG.precoCombo}`);
    if (pedido.frete > 0) linhas.push(`Frete: ${money(pedido.frete)}${pedido.freteRegiao ? " (" + pedido.freteRegiao + ")" : ""}`);
    linhas.push(`Total: ${money(pedido.total)}`);
    linhas.push("");
    linhas.push(`Forma de pagamento escolhida: ${pedido.formaPagamento}`);
    linhas.push("");

    if (state.pay === "pix") {
      linhas.push("Chave Pix:");
      linhas.push(CONFIG.pixChave);
      linhas.push("");
      linhas.push("Nome do recebedor:");
      linhas.push(CONFIG.pixRecebedor);
      linhas.push("");
      linhas.push("Após o pagamento, envio o comprovante por aqui.");
    } else {
      linhas.push("Observação:");
      linhas.push("Escolhi pagamento no cartão. Por favor, envie o link de pagamento ou me oriente para finalizar.");
    }
    return linhas.join("\n");
  }

  /* ---------- abre o WhatsApp com a mensagem do pedido ---------- */
  function abrirWhatsAppPedido() {
    const pedido = montarPedido();
    const msg = gerarMensagemWhatsApp(pedido);
    if (typeof waLink === "function") window.open(waLink(msg), "_blank", "noopener");
  }

  /* ---------- Finalizar pelo WhatsApp (fluxo único) ---------- */
  $("ckWpp")?.addEventListener("click", () => {
    if (!camposValidos()) { atualizarHint(); return; }
    abrirWhatsAppPedido();
  });

  /* ---------- copiar chave Pix ---------- */
  $("ckPixCopy")?.addEventListener("click", () => {
    navigator.clipboard?.writeText(CONFIG.pixChave || "");
    const btn = $("ckPixCopy");
    if (!btn) return;
    const old = btn.textContent;
    btn.textContent = "Copiado!";
    setTimeout(() => { btn.textContent = old; }, 1500);
  });

  /* ---------- abrir / fechar modal ---------- */
  function abrirModal() {
    state.qtd = 1; if ($("ckQty")) $("ckQty").value = 1;
    state.frete = null; if ($("ckCep")) $("ckCep").value = "";
    if ($("ckPixKey")) $("ckPixKey").textContent = CONFIG.pixChave || "";
    if ($("ckPixNome")) $("ckPixNome").textContent = CONFIG.pixRecebedor || "";
    if ($("ckPixBox")) $("ckPixBox").hidden = state.pay !== "pix";
    renderAll();
    modal.classList.add("is-open");
  }
  $("pdpCheckoutOpen")?.addEventListener("click", abrirModal);
  if (params.get("ck") === "1") abrirModal(); // link direto pro checkout (e testes)
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-close]")) modal.classList.remove("is-open");
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.classList.remove("is-open"); });

  renderAll();
})();
