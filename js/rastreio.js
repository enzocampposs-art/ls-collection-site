/* ============================================================
   LS Collection — rastreamento (página dedicada)
   ============================================================ */
(function () {
  const form = document.getElementById("trackForm");
  const input = document.getElementById("trackInput");
  const hint = document.getElementById("trackHint");
  const result = document.getElementById("trackResult");
  const codeEl = document.getElementById("trackCode");
  const official = document.getElementById("trackOfficial");
  const timeline = document.getElementById("trackTimeline");
  const statusTag = document.getElementById("trackStatusTag");
  if (!form) return;

  // status: 'done' (concluído) | 'current' (em andamento, bolinha pulsando) | 'pending'
  const STEPS = [
    { status: "Pedido confirmado", meta: "Pagamento aprovado · LS Collection", state: "done" },
    { status: "Objeto postado", meta: "Agência dos Correios · origem", state: "done" },
    { status: "Em trânsito para a unidade de distribuição", meta: "Encaminhado para sua região", state: "done" },
    { status: "Saiu para entrega ao destinatário", meta: "Unidade de distribuição · sua cidade", state: "current" },
    { status: "Objeto entregue", meta: "Aguardando entrega", state: "pending" },
  ];

  function render(code) {
    codeEl.textContent = code;
    official.href = `https://www.linkcorreios.com.br/?id=${encodeURIComponent(code)}`;
    const current = STEPS.find((s) => s.state === "current");
    if (statusTag && current) statusTag.textContent = current.status.replace(" ao destinatário", "");
    timeline.innerHTML = STEPS.map((s) => `
      <li class="tl ${s.state}">
        <span class="tl__dot" aria-hidden="true"></span>
        <div class="tl__content">
          <div class="tl__status">${s.status}</div>
          <div class="tl__meta">${s.meta}</div>
        </div>
      </li>`).join("");
    result.hidden = false;
  }

  function handle(code) {
    code = (code || "").trim().toUpperCase();
    input.value = code;
    if (!code) { hint.textContent = "Digite o código de rastreio que você recebeu."; hint.classList.add("is-error"); result.hidden = true; return; }
    if (!/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(code)) {
      hint.textContent = "Código fora do padrão. Confira — ele tem 13 caracteres (ex.: LB123456789BR).";
      hint.classList.add("is-error"); result.hidden = true; return;
    }
    hint.textContent = "Código válido. Veja o andamento abaixo.";
    hint.classList.remove("is-error");
    render(code);
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); handle(input.value); });

  // se veio ?code=XXXX da home, já rastreia
  const params = new URLSearchParams(window.location.search);
  const pre = params.get("code");
  if (pre) handle(pre);
})();
