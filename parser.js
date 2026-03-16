window.LogicaParser = (() => {
  const SIMBOLOS_OPERADORES = ["↔", "→", "¬", "∧", "∨", "⊕"];
  const OPERADORES = {
    "¬": { precedencia: 6, associatividade: "direita" },
    "∧": { precedencia: 5, associatividade: "esquerda" },
    "∨": { precedencia: 4, associatividade: "esquerda" },
    "⊕": { precedencia: 3, associatividade: "esquerda" },
    "→": { precedencia: 2, associatividade: "direita" },
    "↔": { precedencia: 1, associatividade: "esquerda" }
  };

  function normalizar(expressao) {
    return expressao
      .toUpperCase()
      .replace(/\s+/g, " ")
      .replace(/<->|<=>|↔/g, " ↔ ")
      .replace(/->|=>|→/g, " → ")
      .replace(/\bXOR\b|⊕/g, " ⊕ ")
      .replace(/&&|&|\bAND\b|∧/g, " ∧ ")
      .replace(/\|\||\bOR\b|∨/g, " ∨ ")
      .replace(/~|!|¬|∼/g, " ¬ ")
      .replace(/\bTRUE\b|\bT\b/g, " V ")
      .replace(/\bFALSE\b/g, " F ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenizar(expressao) {
    const compacta = expressao.replace(/\s+/g, "");
    const tokens = [];

    for (let indice = 0; indice < compacta.length; indice += 1) {
      const simbolo = compacta[indice];

      if ([...SIMBOLOS_OPERADORES, "(", ")"].includes(simbolo)) {
        tokens.push(simbolo);
        continue;
      }

      if (/^[A-Z]$/.test(simbolo)) {
        tokens.push(
          simbolo === "V" || simbolo === "F"
            ? { tipo: "constante", valor: simbolo === "V" }
            : { tipo: "variavel", valor: simbolo }
        );
        continue;
      }

      throw new Error(`Simbolo invalido proximo de "${compacta.slice(indice, indice + 8)}".`);
    }

    return tokens;
  }

  function listarVariaveis(tokens) {
    return [...new Set(tokens.filter((token) => token.tipo === "variavel").map((token) => token.valor))].sort();
  }

  function validar(tokens) {
    const variaveis = listarVariaveis(tokens);

    if (variaveis.length > 8) {
      throw new Error("A expressao suporta no maximo 8 variaveis distintas.");
    }

    let saldoParenteses = 0;
    let esperaOperando = true;

    tokens.forEach((token) => {
      if (token === "(") {
        if (!esperaOperando) {
          throw new Error("Falta um operador antes de um novo agrupamento.");
        }
        saldoParenteses += 1;
        return;
      }

      if (token === ")") {
        if (esperaOperando) {
          throw new Error("Ha um fechamento de parenteses sem operando valido.");
        }
        saldoParenteses -= 1;
        if (saldoParenteses < 0) {
          throw new Error("Os parenteses da expressao estao desbalanceados.");
        }
        esperaOperando = false;
        return;
      }

      if (typeof token === "object") {
        if (!esperaOperando) {
          throw new Error("Falta um operador entre operandos.");
        }
        esperaOperando = false;
        return;
      }

      if (token === "¬") {
        if (!esperaOperando) {
          throw new Error("A negacao deve anteceder um operando.");
        }
        return;
      }

      if (esperaOperando) {
        throw new Error("Operador binario sem operando a esquerda.");
      }

      esperaOperando = true;
    });

    if (saldoParenteses !== 0) {
      throw new Error("Os parenteses da expressao estao desbalanceados.");
    }

    if (esperaOperando && tokens.length > 0) {
      throw new Error("A expressao termina com um operador incompleto.");
    }

    return variaveis;
  }

  function converterParaPosfixa(tokens) {
    const saida = [];
    const pilha = [];

    tokens.forEach((token) => {
      if (typeof token === "object") {
        saida.push(token);
        return;
      }

      if (token === "(") {
        pilha.push(token);
        return;
      }

      if (token === ")") {
        while (pilha.length && pilha[pilha.length - 1] !== "(") {
          saida.push(pilha.pop());
        }
        pilha.pop();
        return;
      }

      const atual = OPERADORES[token];

      while (pilha.length) {
        const topo = OPERADORES[pilha[pilha.length - 1]];
        if (!topo) {
          break;
        }

        const desempilha =
          (atual.associatividade === "esquerda" && atual.precedencia <= topo.precedencia) ||
          (atual.associatividade === "direita" && atual.precedencia < topo.precedencia);

        if (!desempilha) {
          break;
        }

        saida.push(pilha.pop());
      }

      pilha.push(token);
    });

    return saida.concat(pilha.reverse());
  }

  function analisar(expressaoBruta) {
    const expressao = normalizar(expressaoBruta);

    if (!expressao) {
      throw new Error("Digite uma expressao proposicional.");
    }

    const tokens = tokenizar(expressao);
    const variaveis = validar(tokens);

    return {
      expressao,
      variaveis,
      posfixa: converterParaPosfixa(tokens)
    };
  }

  return { analisar };
})();
