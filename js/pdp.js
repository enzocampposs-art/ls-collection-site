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
  const prod = list.find((p) => p.team.toLowerCase() === teamParam) || list[0];
  if (!prod) return;

  const isCorinthians = prod.team.toLowerCase() === "corinthians";
  const catLabel = (typeof CAT_LABEL !== "undefined" && CAT_LABEL[prod.category]) || "";

  document.title = `Camisa do ${prod.team} — LS Collection`;
  if ($("pdpCrumbTeam")) $("pdpCrumbTeam").textContent = prod.team;
  if ($("pdpCat")) $("pdpCat").textContent = catLabel;
  if ($("pdpTeam")) $("pdpTeam").textContent = prod.team;

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

  // Seletor de tamanho
  let size = "";
  const sizes = $("pdpSizes");
  const cta = $("pdpBuy");

  function updateCta() {
    const s = size ? (" no tamanho " + size) : "";
    const msg = "Olá! Quero a camisa do " + prod.team + s + " (LS Collection). Ainda tem em estoque?";
    if (cta && typeof waLink === "function") cta.setAttribute("href", waLink(msg));
  }
  updateCta();

  if (sizes) {
    sizes.addEventListener("click", (e) => {
      const b = e.target.closest(".pdp__size");
      if (!b) return;
      size = b.dataset.size;
      sizes.querySelectorAll(".pdp__size").forEach((x) => x.classList.toggle("is-active", x === b));
      updateCta();
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
