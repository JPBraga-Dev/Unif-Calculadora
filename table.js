window.LogicaTabela = (() => {
  function textoBooleano(valor) {
    return valor ? "V" : "F";
  }

  function gerarLinhas(variaveis) {
    const total = 2 ** variaveis.length;

    return Array.from({ length: total }, (_, indiceLinha) => {
      const atribuicao = {};
      variaveis.forEach((variavel, indiceVariavel) => {
        atribuicao[variavel] = Boolean((indiceLinha >> (variaveis.length - indiceVariavel - 1)) & 1);
      });
      return atribuicao;
    });
  }

  function classificar(resultados) {
    if (resultados.every(Boolean)) {
      return "Tautologia";
    }
    if (resultados.every((valor) => !valor)) {
      return "Contradicao";
    }
    return "Contingencia";
  }

  function classeDoVeredito(veredito) {
    return {
      Tautologia: "verdict-tautologia",
      Contradicao: "verdict-contradicao",
      Contingencia: "verdict-contingencia"
    }[veredito];
  }

  function criarTabela(dados) {
    const tabela = document.createElement("table");
    const cabecalho = document.createElement("thead");
    const linhaCabecalho = document.createElement("tr");

    [...dados.variaveis, dados.expressao].forEach((rotulo) => {
      const th = document.createElement("th");
      th.textContent = rotulo;
      linhaCabecalho.appendChild(th);
    });

    cabecalho.appendChild(linhaCabecalho);
    tabela.appendChild(cabecalho);

    const corpo = document.createElement("tbody");

    dados.linhas.forEach((linha, indice) => {
      const tr = document.createElement("tr");

      dados.variaveis.forEach((variavel) => {
        const td = document.createElement("td");
        td.textContent = textoBooleano(linha[variavel]);
        td.className = linha[variavel] ? "value-v" : "value-f";
        tr.appendChild(td);
      });

      const tdResultado = document.createElement("td");
      tdResultado.textContent = textoBooleano(dados.resultados[indice]);
      tdResultado.className = dados.resultados[indice] ? "value-v" : "value-f";
      tr.appendChild(tdResultado);

      corpo.appendChild(tr);
    });

    tabela.appendChild(corpo);
    return tabela;
  }

  return {
    gerarLinhas,
    classificar,
    classeDoVeredito,
    criarTabela
  };
})();
