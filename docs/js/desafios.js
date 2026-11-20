/**
 * Desafios dos atos: quando uma conquista vale e quando uma pista é liberada.
 *
 * Funções PURAS, sem DOM e sem armazenamento, para serem conferidas em Node (camada 6 de
 * `testes/conferir_js.mjs`) — a conquista não pode disparar por engano na apresentação.
 * Quem liga isto à página é `progresso.js`. Regras do `04_planejamento.md`, seção
 * "Pistas progressivas e conquistas":
 *
 *   - Uma conquista só vale quando o treino RESOLVE DE VERDADE: terminou convergindo, sem
 *     esgotar nem divergir, e a recontagem de erros com os pesos finais dá zero. "Convergiu"
 *     não basta: o Adaline "converge" com um ponto errado quando o η é grande (η = 0,7 no
 *     AND, o problema do Ato 2).
 *   - E na configuração do desafio do ato (modo e porta); fora dela o laboratório continua
 *     livre para explorar, só não conta.
 *   - Uma tentativa é um treino ligado ao problema do ato que terminou sem resolver, ou que
 *     foi abandonado depois de um mínimo de épocas (um clique acidental não conta).
 *   - A cada TENTATIVAS_POR_PISTA tentativas, uma pista a mais; depois da conquista, todas.
 */

import { PORTAS_NAO_SEPARAVEIS, PORTAS_SEPARAVEIS } from './dados.js';

export const TENTATIVAS_POR_PISTA = 2;
export const PISTAS_POR_ATO = 3;

/** Épocas que um treino abandonado precisa ter completado para contar como tentativa. */
export const EPOCAS_MINIMAS_TENTATIVA = { perceptron: 3, adaline: 3, mlp: 300 };

export const DESAFIOS = {
  ato1: {
    id: 'ato1',
    // a conquista é fazer o Perceptron convergir nas 5 portas separáveis (uma de cada vez)
    partes: PORTAS_SEPARAVEIS,
    resolve: (c) => c.modo === 'perceptron' && PORTAS_SEPARAVEIS.includes(c.porta),
    // as pistas do Ato 1 são sobre o XOR/XNOR, que o Perceptron nunca resolve
    tentativa: (c) => c.modo === 'perceptron' && PORTAS_NAO_SEPARAVEIS.includes(c.porta),
    inicial: { modo: 'perceptron', porta: 'AND', taxa: 0.1 },
  },
  ato2: {
    id: 'ato2',
    resolve: (c) => c.modo === 'adaline' && c.porta === 'AND',
    tentativa: (c) => c.modo === 'adaline' && c.porta === 'AND',
    inicial: { modo: 'adaline', porta: 'AND', taxa: 0.7 },
  },
  ato3: {
    id: 'ato3',
    resolve: (c) => c.modo === 'mlp' && PORTAS_NAO_SEPARAVEIS.includes(c.porta),
    tentativa: (c) => PORTAS_NAO_SEPARAVEIS.includes(c.porta),
    inicial: { modo: 'mlp', porta: 'XOR', ativacao: 'sigmoide', taxa: 0.1 },
  },
};

/**
 * O treino terminou resolvendo o problema? Independe do desafio. A recontagem de erros usa
 * `errosAtuais()`, a mesma classe por `degrau(z)` dos treinos.
 */
export function resolveuDeVerdade(treino) {
  return Boolean(treino?.terminou) && treino.convergiu === true && !treino.esgotou
    && !treino.divergiu && treino.errosAtuais() === 0;
}

/**
 * Este treino, nesta configuração, conta para a conquista do desafio? `contexto` é
 * { modo, porta, ... } (o que o laboratório envia nos eventos).
 */
export function avaliarConquista(idDesafio, contexto, treino) {
  const desafio = DESAFIOS[idDesafio];
  if (!desafio || !contexto) return false;
  return desafio.resolve(contexto) && resolveuDeVerdade(treino);
}

/** Estado inicial (o que `progresso.js` guarda no navegador). */
export function criarEstado() {
  const estado = { versao: 1, desafios: {} };
  Object.keys(DESAFIOS).forEach((id) => {
    estado.desafios[id] = { tentativas: 0, partes: [], conquistado: false };
  });
  return estado;
}

/** Cópia defensiva, aceitando um estado salvo antigo ou incompleto. */
export function normalizarEstado(salvo) {
  const estado = criarEstado();
  if (!salvo || salvo.versao !== 1 || typeof salvo.desafios !== 'object') return estado;
  Object.keys(DESAFIOS).forEach((id) => {
    const d = salvo.desafios[id];
    if (!d) return;
    estado.desafios[id] = {
      tentativas: Number.isInteger(d.tentativas) && d.tentativas >= 0 ? d.tentativas : 0,
      partes: Array.isArray(d.partes) ? d.partes.filter((p) => DESAFIOS[id].partes?.includes(p)) : [],
      conquistado: d.conquistado === true,
    };
  });
  return estado;
}

function copiar(estado) {
  return normalizarEstado(JSON.parse(JSON.stringify(estado)));
}

/**
 * Um treino do laboratório do ato terminou. Devolve o novo estado e o que aconteceu:
 * `conquistou` (a conquista acabou de valer), `parte` (no Ato 1, a porta resolvida agora)
 * e `contouTentativa`.
 */
export function registrarTermino(estado, idDesafio, contexto, treino) {
  const novo = copiar(estado);
  const d = novo.desafios[idDesafio];
  const desafio = DESAFIOS[idDesafio];
  const resultado = { estado: novo, conquistou: false, parte: null, contouTentativa: false };
  if (!d || !desafio) return resultado;

  if (avaliarConquista(idDesafio, contexto, treino)) {
    if (desafio.partes) {
      if (!d.partes.includes(contexto.porta)) {
        d.partes.push(contexto.porta);
        resultado.parte = contexto.porta;
      }
      if (!d.conquistado && desafio.partes.every((p) => d.partes.includes(p))) {
        d.conquistado = true;
        resultado.conquistou = true;
      }
    } else if (!d.conquistado) {
      d.conquistado = true;
      resultado.conquistou = true;
    }
    return resultado;
  }

  if (desafio.tentativa(contexto) && !resolveuDeVerdade(treino)) {
    d.tentativas += 1;
    resultado.contouTentativa = true;
  }
  return resultado;
}

/** Um treino do problema do ato foi abandonado (parâmetro mudou, ↺, outro modo). */
export function registrarAbandono(estado, idDesafio, contexto, epocasConcluidas) {
  const novo = copiar(estado);
  const d = novo.desafios[idDesafio];
  const desafio = DESAFIOS[idDesafio];
  const resultado = { estado: novo, contouTentativa: false };
  if (!d || !desafio || !desafio.tentativa(contexto)) return resultado;
  const minimo = EPOCAS_MINIMAS_TENTATIVA[contexto.modo] ?? 3;
  if (epocasConcluidas >= minimo) {
    d.tentativas += 1;
    resultado.contouTentativa = true;
  }
  return resultado;
}

/** Libera a próxima pista sem esperar tentativas (o botão "Estou travado"). */
export function pedirPista(estado, idDesafio) {
  const novo = copiar(estado);
  const d = novo.desafios[idDesafio];
  if (!d) return novo;
  const liberadas = pistasLiberadas(novo, idDesafio);
  if (liberadas < PISTAS_POR_ATO) d.tentativas = (liberadas + 1) * TENTATIVAS_POR_PISTA;
  return novo;
}

/** Quantas pistas do ato estão liberadas (0 a PISTAS_POR_ATO). */
export function pistasLiberadas(estado, idDesafio) {
  const d = estado?.desafios?.[idDesafio];
  if (!d) return 0;
  if (d.conquistado) return PISTAS_POR_ATO;
  return Math.min(PISTAS_POR_ATO, Math.floor(d.tentativas / TENTATIVAS_POR_PISTA));
}

/** Quantas tentativas sem resolver faltam para a próxima pista (0 se já não há próxima). */
export function tentativasParaProximaPista(estado, idDesafio) {
  const d = estado?.desafios?.[idDesafio];
  const liberadas = pistasLiberadas(estado, idDesafio);
  if (!d || liberadas >= PISTAS_POR_ATO) return 0;
  return (liberadas + 1) * TENTATIVAS_POR_PISTA - d.tentativas;
}
