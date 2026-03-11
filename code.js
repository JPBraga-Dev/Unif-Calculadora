window.LogicaMotor = (() => {
  function avaliarPosfixa(expressaoPosfixa, atribuicao) {
    const pilha = [];

    expressaoPosfixa.forEach((token) => {
      if (typeof token === "object") {
        pilha.push(token.tipo === "constante" ? token.valor : atribuicao[token.valor]);
        return;
      }

      if (token === "¬") {
        pilha.push(!pilha.pop());
        return;
      }

      const direita = pilha.pop();
      const esquerda = pilha.pop();

      switch (token) {
        case "∧":
          pilha.push(esquerda && direita);
          break;
        case "∨":
          pilha.push(esquerda || direita);
          break;
        case "⊕":
          pilha.push(Boolean(esquerda) !== Boolean(direita));
          break;
        case "→":
          pilha.push((!esquerda) || direita);
          break;
        case "↔":
          pilha.push(esquerda === direita);
          break;
        default:
          throw new Error("Operador desconhecido na avaliacao.");
      }
    });

    if (pilha.length !== 1) {
      throw new Error("Nao foi possivel concluir a avaliacao da expressao.");
    }

    return pilha[0];
  }

  function calcular(expressaoBruta) {
    const analise = window.LogicaParser.analisar(expressaoBruta);
    const linhas = window.LogicaTabela.gerarLinhas(analise.variaveis);
    const resultados = linhas.map((linha) => avaliarPosfixa(analise.posfixa, linha));
    const veredito = window.LogicaTabela.classificar(resultados);

    return {
      expressao: analise.expressao,
      variaveis: analise.variaveis,
      linhas,
      resultados,
      veredito
    };
  }

  return { calcular };
})();
