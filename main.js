const API_URL = "https://6a3124697bc5e1c612654135.mockapi.io/materiais";

const inputNome       = document.getElementById("input-nome");
const inputQuantidade = document.getElementById("input-quantidade");
const inputCategoria  = document.getElementById("input-categoria");
const inputValidade   = document.getElementById("input-validade");
const inputInstrutor  = document.getElementById("input-instrutor");
const btnCadastrar    = document.getElementById("btn-cadastrar");
const formFeedback    = document.getElementById("form-feedback");
const btnLabel        = btnCadastrar.querySelector(".btn-label");
const btnSpinner      = btnCadastrar.querySelector(".btn-spinner");

const listaMateriais  = document.getElementById("lista-materiais");
const tabelaBody      = document.getElementById("tabela-body");
const tabelaWrapper   = document.getElementById("tabela-wrapper");
const emptyState      = document.getElementById("empty-state");
const loadingState    = document.getElementById("loading-state");

const inputBusca      = document.getElementById("input-busca");
const filtroCategoria = document.getElementById("filtro-categoria");

const alertsBar       = document.getElementById("alerts-bar");
const alertMessage    = document.getElementById("alert-message");
const statusDot       = document.getElementById("status-dot");
const statusText      = document.getElementById("status-text");

const totalItens      = document.getElementById("total-itens");
const totalZerados    = document.getElementById("total-zerados");
const totalVencendo   = document.getElementById("total-vencendo");

const modalOverlay    = document.getElementById("modal-overlay");
const modalFechar     = document.getElementById("modal-fechar");
const modalCancelar   = document.getElementById("modal-cancelar");
const modalSalvar     = document.getElementById("modal-salvar");
const modalNome       = document.getElementById("modal-nome-material");
const modalQtd        = document.getElementById("modal-quantidade");
const modalId         = document.getElementById("modal-id");

let todosOsMateriais = [];

function validarRetirada(estoqueAtual, quantidadeRetirada) {
  if (isNaN(quantidadeRetirada) || quantidadeRetirada <= 0) return false;
  if (quantidadeRetirada > estoqueAtual) return false;
  return true;
}

async function baixarEstoque(id, estoqueAtual, btnBaixar, inputRetirada) {
  const quantidadeRetirada = parseInt(inputRetirada.value, 10);

  if (!validarRetirada(estoqueAtual, quantidadeRetirada)) {
    mostrarFeedback(
      quantidadeRetirada > estoqueAtual
        ? `Quantidade inválida: estoque atual é ${estoqueAtual}.`
        : "Informe uma quantidade válida (mínimo 1).",
      "error"
    );
    inputRetirada.focus();
    return;
  }

  const novaQuantidade = estoqueAtual - quantidadeRetirada;

  btnBaixar.disabled = true;
  btnBaixar.textContent = "...";

  try {
    if (!navigator.onLine) throw new Error("OFFLINE");

    const res = await fetch(`${API_URL}/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ quantidade: novaQuantidade }),
    });

    if (!res.ok) throw new Error("Erro PUT: " + res.status);

    mostrarFeedback(
      `Baixa realizada! ${quantidadeRetirada} unidade(s) retirada(s). Novo saldo: ${novaQuantidade}.`,
      "success"
    );
    await carregarMateriais();

  } catch (err) {
    console.error("Erro ao realizar baixa:", err);
    mostrarFeedback(
      err.message === "OFFLINE"
        ? "Sem conexão com a internet. Tente novamente."
        : "Falha ao atualizar o estoque. Tente novamente.",
      "error"
    );
    btnBaixar.disabled = false;
    btnBaixar.textContent = "Baixar";
  }
}

function setStatus(online) {
  statusDot.className    = "status-dot " + (online ? "online" : "offline");
  statusText.textContent = online ? "API conectada" : "Sem conexão";
}

async function carregarMateriais() {
  loadingState.hidden  = false;
  tabelaWrapper.hidden = true;
  emptyState.hidden    = true;

  try {
    if (!navigator.onLine) throw new Error("OFFLINE");

    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Resposta inesperada: " + res.status);

    const dados = await res.json();
    todosOsMateriais = dados;

    setStatus(true);
    atualizarResumo(dados);
    verificarAlertas(dados);
    renderizarTabela(dados);

  } catch (err) {
    console.error("Erro ao carregar materiais:", err);
    setStatus(false);
    loadingState.hidden  = true;
    tabelaWrapper.hidden = true;
    emptyState.hidden    = false;
    emptyState.querySelector(".empty-icon").textContent = "⚠";
    emptyState.querySelector("p:nth-child(2)").textContent = "Não foi possível carregar os materiais.";
    emptyState.querySelector(".empty-sub").textContent =
      err.message === "OFFLINE"
        ? "Você está sem conexão com a internet."
        : "Verifique sua conexão ou a URL da API em main.js.";
    mostrarFeedback(
      err.message === "OFFLINE"
        ? "Sem conexão com a internet. Verifique sua rede."
        : "Não foi possível conectar à API. Tente novamente em instantes.",
      "error"
    );
  }
}

async function cadastrarMaterial() {
  const nome       = inputNome.value.trim();
  const quantidade = parseInt(inputQuantidade.value, 10);
  const categoria  = inputCategoria.value;
  const validade   = inputValidade.value;
  const instrutor  = inputInstrutor.value.trim();

  if (!nome) {
    mostrarFeedback("Informe o nome do material.", "error");
    inputNome.focus();
    return;
  }
  if (isNaN(quantidade) || quantidade < 0) {
    mostrarFeedback("Informe uma quantidade válida (mínimo 0).", "error");
    inputQuantidade.focus();
    return;
  }

  const novoMaterial = { nome, quantidade, categoria, validade, instrutor };

  setCarregando(true);

  try {
    if (!navigator.onLine) throw new Error("OFFLINE");

    const res = await fetch(API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(novoMaterial),
    });

    if (!res.ok) throw new Error("Erro POST: " + res.status);

    mostrarFeedback(`"${nome}" cadastrado com sucesso!`, "success");
    limparFormulario();
    await carregarMateriais();

  } catch (err) {
    console.error("Erro ao cadastrar:", err);
    mostrarFeedback(
      err.message === "OFFLINE"
        ? "Sem conexão com a internet. Tente novamente."
        : "Falha ao cadastrar. Tente novamente.",
      "error"
    );
  } finally {
    setCarregando(false);
  }
}

async function salvarEdicao() {
  const id         = modalId.value;
  const quantidade = parseInt(modalQtd.value, 10);

  if (isNaN(quantidade) || quantidade < 0) {
    alert("Quantidade inválida.");
    return;
  }

  try {
    if (!navigator.onLine) throw new Error("OFFLINE");

    const res = await fetch(`${API_URL}/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ quantidade }),
    });

    if (!res.ok) throw new Error("Erro PUT: " + res.status);

    fecharModal();
    await carregarMateriais();

  } catch (err) {
    console.error("Erro ao atualizar:", err);
    alert(
      err.message === "OFFLINE"
        ? "Sem conexão com a internet. Verifique sua rede e tente novamente."
        : "Não foi possível atualizar o material. Tente novamente."
    );
  }
}

async function excluirMaterial(id, nome) {
  const confirmar = confirm(`Excluir "${nome}" do estoque?\nEsta ação não pode ser desfeita.`);
  if (!confirmar) return;

  try {
    if (!navigator.onLine) throw new Error("OFFLINE");

    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro DELETE: " + res.status);
    await carregarMateriais();
  } catch (err) {
    console.error("Erro ao excluir:", err);
    alert(
      err.message === "OFFLINE"
        ? "Sem conexão com a internet. Verifique sua rede e tente novamente."
        : "Falha ao excluir. Tente novamente."
    );
  }
}

function renderizarTabela(materiais) {
  loadingState.hidden = true;

  const termoBusca = inputBusca.value.toLowerCase();
  const catFiltro  = filtroCategoria.value;

  const filtrados = materiais.filter(m => {
    const nomeOk = m.nome?.toLowerCase().includes(termoBusca);
    const catOk  = catFiltro === "" || m.categoria === catFiltro;
    return nomeOk && catOk;
  });

  if (filtrados.length === 0) {
    emptyState.hidden    = false;
    tabelaWrapper.hidden = true;
    return;
  }

  emptyState.hidden    = false;
  tabelaWrapper.hidden = false;
  emptyState.hidden    = true;

  tabelaBody.innerHTML = filtrados.map(m => `
    <tr class="${classeLinhaEstoque(m.quantidade)}">
      <td class="td-nome">${escHtml(m.nome || "—")}</td>
      <td>${badgeCategoria(m.categoria)}</td>
      <td class="td-qtd ${classeQtd(m.quantidade)}">${m.quantidade ?? "—"}</td>
      <td class="td-validade ${classeValidade(m.validade)}">${formatarData(m.validade)}</td>
      <td>${escHtml(m.instrutor || "—")}</td>
      <td class="acoes-cell">
        <input
          type="number"
          class="input-retirada"
          id="input-retirada"
          min="1"
          max="${m.quantidade ?? 0}"
          placeholder="Qtd"
          data-id="${m.id}"
        />
        <button
          class="btn-acao btn-baixar"
          data-id="${m.id}"
          data-estoque="${m.quantidade ?? 0}"
          ${(m.quantidade ?? 0) === 0 ? "disabled title='Sem estoque disponível'" : ""}
        >Baixar</button>
        <button class="btn-acao btn-editar"  onclick="abrirModal('${m.id}', '${escHtml(m.nome)}', ${m.quantidade})">Editar</button>
        <button class="btn-acao btn-excluir" data-id="${m.id}" data-nome="${escHtml(m.nome)}">Excluir</button>
      </td>
    </tr>
  `).join("");
  
  tabelaBody.querySelectorAll(".btn-baixar").forEach(btn => {
    btn.addEventListener("click", () => {
      const id          = btn.dataset.id;
      const estoque     = parseInt(btn.dataset.estoque, 10);
      const inputRet    = btn.closest("tr").querySelector(".input-retirada");
      baixarEstoque(id, estoque, btn, inputRet);
    });
  });

  tabelaBody.querySelectorAll(".btn-excluir").forEach(btn => {
    btn.addEventListener("click", () => {
      excluirMaterial(btn.dataset.id, btn.dataset.nome);
    });
  });
}

function atualizarResumo(materiais) {
  const zerados  = materiais.filter(m => (m.quantidade ?? 0) === 0);
  const vencendo = materiais.filter(m => statusValidade(m.validade) === "vencendo");

  totalItens.textContent    = materiais.length;
  totalZerados.textContent  = zerados.length;
  totalVencendo.textContent = vencendo.length;
}

function verificarAlertas(materiais) {
  const zerados  = materiais.filter(m => (m.quantidade ?? 0) === 0).map(m => m.nome);
  const vencendo = materiais.filter(m => statusValidade(m.validade) === "vencendo").map(m => m.nome);

  const msgs = [];
  if (zerados.length)  msgs.push(`${zerados.length} item(ns) zerado(s): ${zerados.slice(0,3).join(", ")}${zerados.length > 3 ? "..." : ""}`);
  if (vencendo.length) msgs.push(`${vencendo.length} item(ns) vencendo em breve: ${vencendo.slice(0,3).join(", ")}${vencendo.length > 3 ? "..." : ""}`);

  if (msgs.length) {
    alertMessage.textContent = msgs.join(" · ");
    alertsBar.hidden = false;
  } else {
    alertsBar.hidden = true;
  }
}

function abrirModal(id, nome, quantidade) {
  modalId.value         = id;
  modalNome.textContent = nome;
  modalQtd.value        = quantidade;
  modalOverlay.hidden   = false;
  modalQtd.focus();
}

function fecharModal() {
  modalOverlay.hidden = true;
}

function badgeCategoria(cat) {
  const mapa = {
    consumo:    ["consumo",    "Consumo"],
    permanente: ["permanente", "Permanente"],
    epi:        ["epi",        "EPI"],
  };
  const [cls, label] = mapa[cat] ?? ["default", cat || "—"];
  return `<span class="badge-categoria badge-${cls}">${label}</span>`;
}

function classeQtd(qtd) {
  if (qtd === 0 || qtd === "0" || qtd === null || qtd === undefined) return "zero";
  if (qtd <= 5) return "baixo";
  return "";
}

function classeLinhaEstoque(qtd) {
  const valor = Number(qtd ?? 0);
  return valor < 10 ? "estoque-critico" : "";
}

function statusValidade(val) {
  if (!val) return "sem-data";
  const hoje = new Date();
  const data = new Date(val + "T00:00:00");
  const diff = (data - hoje) / (1000 * 60 * 60 * 24);
  if (diff < 0)   return "vencida";
  if (diff <= 30) return "vencendo";
  return "ok";
}

function classeValidade(val) {
  const mapa = { ok: "validade-ok", vencendo: "validade-vencendo", vencida: "validade-vencida" };
  return mapa[statusValidade(val)] ?? "";
}

function formatarData(val) {
  if (!val) return "—";
  const [ano, mes, dia] = val.split("-");
  if (!dia) return val;
  return `${dia}/${mes}/${ano}`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function limparFormulario() {
  inputNome.value       = "";
  inputQuantidade.value = "";
  inputCategoria.value  = "";
  inputValidade.value   = "";
  inputInstrutor.value  = "";
  inputNome.focus();
}

function mostrarFeedback(msg, tipo) {
  formFeedback.textContent = msg;
  formFeedback.className   = "form-feedback " + tipo;
  formFeedback.hidden      = false;
  setTimeout(() => { formFeedback.hidden = true; }, 4000);
}

function setCarregando(carregando) {
  btnCadastrar.disabled = carregando;
  btnLabel.hidden       = carregando;
  btnSpinner.hidden     = !carregando;
}

btnCadastrar.addEventListener("click", cadastrarMaterial);

inputBusca.addEventListener("input",    () => renderizarTabela(todosOsMateriais));
filtroCategoria.addEventListener("change", () => renderizarTabela(todosOsMateriais));

modalFechar.addEventListener("click",   fecharModal);
modalCancelar.addEventListener("click", fecharModal);
modalSalvar.addEventListener("click",   salvarEdicao);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) fecharModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharModal();
});

[inputNome, inputQuantidade, inputInstrutor].forEach(el => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnCadastrar.click();
  });
});

window.addEventListener("online", () => {
  mostrarFeedback("Conexão restabelecida. Atualizando dados...", "success");
  carregarMateriais();
});

window.addEventListener("offline", () => {
  setStatus(false);
  mostrarFeedback("Você está sem conexão com a internet.", "error");
});

carregarMateriais();
