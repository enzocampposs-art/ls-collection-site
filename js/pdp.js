/* ============================================================
   LS Collection — página de produto (PDP)
   Lê ?team= da URL, usa PRODUTOS/CONFIG/waLink de script.js.
   O giro 360 (só Corinthians) é ativado pelo initShirt360 de script.js.
   ============================================================ */
(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const teamParam = (params.get("team") || "").toLowerCase();

  const list = (typeof PRODUTOS !== "undefined") ? PRODUTOS : [];
  /* aceita "Real Madrid", "real madrid" e "real-madrid" */
  const norm = (typeof slugTeam === "function") ? slugTeam : ((s) => String(s).toLowerCase());
  const acharProd = () => list.find((p) => p.team.toLowerCase() === teamParam || norm(p.team) === norm(teamParam));
  let prod = acharProd() || list[0];
  if (!prod) return;

  /* preenche a página com o produto (roda de novo se a camisa publicada chegar depois) */
  function aplicarProduto() {
    const isCorinthians = prod.team.toLowerCase() === "corinthians";
    const catLabel = (typeof CAT_LABEL !== "undefined" && CAT_LABEL[prod.category]) || "";

    document.title = `Camisa do ${prod.team} — LS Collection`;
    if ($("pdpCrumbTeam")) $("pdpCrumbTeam").textContent = prod.team;
    if ($("pdpCat")) $("pdpCat").textContent = catLabel;
    if ($("pdpTeam")) $("pdpTeam").textContent = prod.team;

    // preço por produto — combo 2x260 só vale no preço padrão (R$ 140)
    const preco = prod.preco || Number(CONFIG.precoUnit);
    if ($("pdpPrice")) $("pdpPrice").textContent = "R$ " + preco;
    if ($("pdpCombo")) $("pdpCombo").hidden = preco !== Number(CONFIG.precoUnit);

    // Galeria: giro 360 no Corinthians; foto única nos demais
    const gallery = $("pdpGallery");
    if (gallery) {
      if (isCorinthians) {
        gallery.innerHTML =
          '<div class="hero__product pdp__stage" id="shirt360">' +
          '<span class="hero__ribbon">★ Mais Vendida</span>' +
          '<img src="assets/cor-01.jpg?v=3" alt="Camisa do Corinthians — LS Collection" class="hero__img" id="shirt360Img" />' +
          '<span class="hero__spin-hint" id="shirt360Hint">Arraste ou passe o mouse para girar ↔</span>' +
          '</div>';
        // initShirt360 (de script.js) roda no DOMContentLoaded e encontra este #shirt360
      } else {
        const ribbon = prod.badge ? '<span class="hero__ribbon">★ ' + prod.badge + '</span>' : "";
        gallery.innerHTML =
          '<div class="hero__product pdp__stage">' + ribbon +
          '<img src="' + prod.img + '" alt="Camisa do ' + prod.team + ' — LS Collection" class="hero__img" />' +
          '</div>';
      }
    }
  }
  aplicarProduto();

  /* a camisa da URL pode ser uma publicada pelo dono (chega async da planilha) */
  if (!acharProd()) {
    document.addEventListener("lsCatalogoExtra", () => {
      const achou = acharProd();
      if (achou) { prod = achou; aplicarProduto(); }
    }, { once: true });
  }

  // Seletor de tamanho
  let size = "";
  const sizes = $("pdpSizes");
  const cta = $("pdpBuy");

  /* o botão "Comprar no WhatsApp" abre o checkout — a mensagem completa
     (nº do pedido, valores, forma de pagamento) é montada pelo checkout.js */
  if (cta) cta.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("pdpCheckoutOpen")?.click();
  });

  if (sizes) {
    sizes.addEventListener("click", (e) => {
      const b = e.target.closest(".pdp__size");
      if (!b) return;
      size = b.dataset.size;
      sizes.querySelectorAll(".pdp__size").forEach((x) => x.classList.toggle("is-active", x === b));
    });
  }

  // Modal guia de medidas
  const modal = $("sizeModal");
  const openBtn = $("pdpSizeGuide");
  if (modal && openBtn) {
    openBtn.addEventListener("click", (e) => { e.preventDefault(); modal.classList.add("is-open"); });
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest("[data-close]")) modal.classList.remove("is-open");
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.classList.remove("is-open"); });
  }
})();
