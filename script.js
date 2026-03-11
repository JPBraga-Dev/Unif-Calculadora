const ui = {
  campo: document.getElementById("campoExpressao"),
  titulo: document.getElementById("tituloResultado"),
  selo: document.getElementById("seloVeredito"),
  tabela: document.getElementById("areaTabela"),
  linhas: document.getElementById("textoLinhas"),
  variaveis: document.getElementById("textoVariaveis"),
  grade: document.getElementById("gradeVariaveis"),
  botoes: {
    calcular: document.getElementById("botaoCalcular"),
    tautologia: document.getElementById("botaoTautologia"),
    contradicao: document.getElementById("botaoContradicao"),
    limpar: document.getElementById("botaoLimpar"),
    apagar: document.getElementById("botaoApagar")
  }
};

function montarTecladoDeVariaveis() {
  for (let codigo = 65; codigo <= 90; codigo += 1) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "key-button";
    botao.dataset.insert = String.fromCharCode(codigo);
    botao.textContent = String.fromCharCode(codigo);
    ui.grade.appendChild(botao);
  }
}

function exibirErro(mensagem) {
  ui.titulo.textContent = mensagem;
  ui.selo.hidden = true;
  ui.tabela.innerHTML = '<div class="empty-state"></div>';
}

function limparErro() {
  if (ui.selo.hidden) {
    ui.titulo.textContent = "Nenhum calculo realizado";
  }
}

function inserirTexto(texto) {
  const inicio = ui.campo.selectionStart;
  const fim = ui.campo.selectionEnd;
  const valorAtual = ui.campo.value;
  ui.campo.value = valorAtual.slice(0, inicio) + texto + valorAtual.slice(fim);
  const proximaPosicao = inicio + texto.length;
  ui.campo.focus();
  ui.campo.setSelectionRange(proximaPosicao, proximaPosicao);
}

function apagarTexto() {
  const inicio = ui.campo.selectionStart;
  const fim = ui.campo.selectionEnd;
  const valorAtual = ui.campo.value;

  if (inicio !== fim) {
    ui.campo.value = valorAtual.slice(0, inicio) + valorAtual.slice(fim);
    ui.campo.setSelectionRange(inicio, inicio);
  } else if (inicio > 0) {
    ui.campo.value = valorAtual.slice(0, inicio - 1) + valorAtual.slice(fim);
    ui.campo.setSelectionRange(inicio - 1, inicio - 1);
  }

  ui.campo.focus();
}

function renderizarResultado(dados) {
  ui.tabela.innerHTML = "";
  ui.tabela.appendChild(window.LogicaTabela.criarTabela(dados));
  ui.titulo.textContent = dados.expressao;
  ui.selo.hidden = false;
  ui.selo.textContent = dados.veredito;
  ui.selo.className = `verdict-badge ${window.LogicaTabela.classeDoVeredito(dados.veredito)}`;
  ui.linhas.textContent = `Linhas: ${dados.linhas.length}`;
  ui.variaveis.textContent = `Variaveis: ${dados.variaveis.length}`;
}

function calcular() {
  limparErro();
  const dados = window.LogicaMotor.calcular(ui.campo.value);
  renderizarResultado(dados);
  return dados;
}

function verificarClassificacao(classificacaoEsperada) {
  try {
    const dados = calcular();
    if (dados.veredito !== classificacaoEsperada) {
      exibirErro(
        `A expressao foi classificada como ${dados.veredito.toLowerCase()}, nao como ${classificacaoEsperada.toLowerCase()}.`
      );
    }
  } catch (erro) {
    exibirErro(erro.message);
  }
}

document.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-insert]");
  if (botao) {
    inserirTexto(botao.dataset.insert);
  }
});

ui.botoes.limpar.addEventListener("click", () => {
  ui.campo.value = "";
  limparErro();
  ui.selo.hidden = true;
  ui.tabela.innerHTML = '<div class="empty-state"></div>';
  ui.linhas.textContent = "Linhas: 0";
  ui.variaveis.textContent = "Variaveis: 0";
  ui.campo.focus();
});

ui.botoes.apagar.addEventListener("click", apagarTexto);

ui.botoes.calcular.addEventListener("click", () => {
  try {
    calcular();
  } catch (erro) {
    exibirErro(erro.message);
  }
});

ui.botoes.tautologia.addEventListener("click", () => {
  verificarClassificacao("Tautologia");
});

ui.botoes.contradicao.addEventListener("click", () => {
  verificarClassificacao("Contradicao");
});

ui.campo.addEventListener("input", limparErro);
ui.campo.addEventListener("keydown", (evento) => {
  if (evento.ctrlKey && evento.key === "Enter") {
    evento.preventDefault();
    ui.botoes.calcular.click();
  }
});

montarTecladoDeVariaveis();
