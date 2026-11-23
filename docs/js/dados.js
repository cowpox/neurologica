/**
 * As 7 portas lógicas do Tópico 2 do curso e os utilitários numéricos compartilhados
 * pelos treinos.
 *
 * Port de `prototipos/utils_plot.py` (dados das portas) e de `prototipos/01_perceptron_gates.py`
 * (`degrau`, `TOLERANCIA_ZERO` e `contar_erros`). Cada porta é uma tabela-verdade completa:
 * 4 pontos (2 entradas) ou 2 pontos (NOT). Não há conjunto de teste: o objetivo é didático,
 * mostrar a fronteira de decisão se formando, e não medir generalização.
 *
 * As classes são sempre 0/1 em `y`, como no Python. Os alvos −1/+1 existem só dentro do
 * treino do Adaline (`treino_adaline.js`).
 */

export const PORTAS = {
  AND: {
    nome: 'AND',
    entradas: 2,
    X: [[0, 0], [0, 1], [1, 0], [1, 1]],
    y: [0, 0, 0, 1],
    separavel: true,
    resumo: 'Só liga quando as duas entradas são 1.',
    detalhe:
      'A classe 1 tem um único ponto, o canto (1,1). Como só existe uma forma de ' +
      'isolar um canto com uma reta, a fronteira aprendida é sempre parecida, ' +
      'independente da inicialização.',
  },
  OR: {
    nome: 'OR',
    entradas: 2,
    X: [[0, 0], [0, 1], [1, 0], [1, 1]],
    y: [0, 1, 1, 1],
    separavel: true,
    resumo: 'Liga quando pelo menos uma entrada é 1.',
    detalhe:
      'É o espelho do AND: agora quem está sozinho é o (0,0), da classe 0. A reta ' +
      'isola o canto de baixo em vez do de cima.',
  },
  NOT: {
    nome: 'NOT',
    entradas: 1,
    X: [[0], [1]],
    y: [1, 0],
    separavel: true,
    resumo: 'Inverte a única entrada.',
    detalhe:
      'Com uma entrada só, o espaço é uma reta e a "fronteira" é um ponto sobre ela. ' +
      'É também a única porta em que o Adaline consegue zerar o erro quadrático: são ' +
      '2 pontos para 2 parâmetros (w e b), então o ajuste é exato.',
  },
  NAND: {
    nome: 'NAND',
    entradas: 2,
    X: [[0, 0], [0, 1], [1, 0], [1, 1]],
    y: [1, 1, 1, 0],
    separavel: true,
    resumo: 'O contrário do AND: só desliga quando as duas entradas são 1.',
    detalhe:
      'Com pesos fixos, o neurônio de McCulloch-Pitts precisa de DOIS neurônios ' +
      'encadeados (AND seguido de NOT) para montar um NAND. Com pesos aprendidos, um ' +
      'único neurônio resolve, porque o NAND é linearmente separável: o que faltava ao ' +
      'MCP era poder ajustar os pesos.',
  },
  NOR: {
    nome: 'NOR',
    entradas: 2,
    X: [[0, 0], [0, 1], [1, 0], [1, 1]],
    y: [1, 0, 0, 0],
    separavel: true,
    resumo: 'O contrário do OR: só liga quando as duas entradas são 0.',
    detalhe: 'Mesma geometria do AND, com as classes trocadas.',
  },
  XOR: {
    nome: 'XOR',
    entradas: 2,
    X: [[0, 0], [0, 1], [1, 0], [1, 1]],
    y: [0, 1, 1, 0],
    separavel: false,
    resumo: 'Liga quando as entradas são diferentes.',
    detalhe:
      'A porta que quebra o neurônio único. As duas classes ocupam cantos opostos do ' +
      'quadrado, e nenhuma reta separa cantos opostos. Não é limitação de treino: é ' +
      'geometria. Exige uma camada oculta.',
  },
  XNOR: {
    nome: 'XNOR',
    entradas: 2,
    X: [[0, 0], [0, 1], [1, 0], [1, 1]],
    y: [1, 0, 0, 1],
    separavel: false,
    resumo: 'Liga quando as entradas são iguais.',
    detalhe: 'O complemento do XOR, e igualmente impossível para um neurônio só.',
  },
};

export const PORTAS_SEPARAVEIS = ['AND', 'OR', 'NOT', 'NAND', 'NOR'];
export const PORTAS_NAO_SEPARAVEIS = ['XOR', 'XNOR'];

/**
 * Tolerância para tratar um z "praticamente zero" como zero exato (a mesma do Python).
 *
 * Com hiperparâmetros redondos, um ponto pode cair matematicamente EXATO sobre a fronteira,
 * e aí é o resíduo de arredondamento (~1e-16) que decide de que lado ele fica
 *. Sem esta tolerância, o número de épocas até convergir dependeria da ordem
 * das operações de ponto flutuante, e não do algoritmo, e o JS poderia discordar do Python.
 */
export const TOLERANCIA_ZERO = 1e-9;

/** Degrau: 1 se z >= 0, senão 0, tratando |z| < TOLERANCIA_ZERO como zero. */
export function degrau(z, tolerancia = TOLERANCIA_ZERO) {
  const valor = Math.abs(z) < tolerancia ? 0 : z;
  return valor >= 0 ? 1 : 0;
}

/**
 * Produto escalar, somando da primeira à última posição a partir de 0 (a mesma ordem de
 * `np.dot` para estes vetores pequenos). Com entradas 0/1 cada produto é exato, então a
 * ordem nem chega a mudar o resultado.
 */
export function produtoEscalar(a, b) {
  let soma = 0;
  for (let i = 0; i < a.length; i += 1) soma += a[i] * b[i];
  return soma;
}

/**
 * Quantos pontos ficam mal classificados (degrau(z) != y) com estes pesos e bias: o veredito
 * da reta COMO ELA ESTÁ agora. Port de `contar_erros`, a medida de erro por época
 * comum ao Perceptron e ao Adaline.
 */
export function contarErros(X, y, pesos, bias) {
  let total = 0;
  for (let i = 0; i < X.length; i += 1) {
    if (degrau(produtoEscalar(pesos, X[i]) + bias) !== y[i]) total += 1;
  }
  return total;
}

/** Confere o tamanho de pesos iniciais escolhidos à mão (a mesma mensagem do Python). */
export function validarPesosIniciais(pesosIniciais, nEntradas) {
  if (pesosIniciais.length !== nEntradas) {
    throw new RangeError(
      `--pesos-iniciais precisa ter exatamente ${nEntradas} valor(es) para esta porta ` +
      `(recebido ${pesosIniciais.length}: ${JSON.stringify(pesosIniciais)}).`,
    );
  }
}

/**
 * Gerador pseudoaleatório com semente (mulberry32).
 *
 * `Math.random()` não aceita semente, e a reprodutibilidade importa: a mesma semente dá a
 * mesma animação, para repetir um experimento ao vivo e para comparar modelos partindo do
 * mesmo ponto. ATENÇÃO: ele NÃO sorteia os mesmos números que o `numpy` com a mesma semente;
 * por isso os gabaritos de época do site valem só para o JS, e a conferência contra o Python
 * usa pesos iniciais injetados (`testes/`).
 */
export function criarAleatorio(semente) {
  let estado = semente >>> 0;
  return function aleatorio() {
    estado |= 0;
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sorteia um número em [-amplitude, amplitude). */
export function uniforme(aleatorio, amplitude) {
  return (aleatorio() * 2 - 1) * amplitude;
}

/**
 * Pontos da reta w1*x1 + w2*x2 + b = 0 dentro de uma faixa de x1.
 * Devolve null quando os pesos ainda são praticamente nulos (não há reta definida).
 */
export function pontosDaReta(pesos, bias, faixa = [-0.5, 1.5]) {
  const [w1, w2] = pesos;
  if (Math.abs(w1) < TOLERANCIA_ZERO && Math.abs(w2) < TOLERANCIA_ZERO) return null;
  if (Math.abs(w2) < TOLERANCIA_ZERO) {
    const x = -bias / w1;
    return [{ x, y: faixa[0] }, { x, y: faixa[1] }];
  }
  return faixa.map((x) => ({ x, y: -(w1 * x + bias) / w2 }));
}

// ---------------------------------------------------------------------------------------------
// Exponencial e tangente hiperbólica DETERMINÍSTICAS.
//
// `Math.exp` e `Math.tanh` não são iguais em todos os navegadores: o padrão do JavaScript não
// exige arredondamento correto, e cada motor usa a sua implementação. Medido: entre o Chrome 157
// e o Node 24, Math.tanh difere (por 1 ulp) em 6% dos valores e Math.exp em 10%. Num treino de
// milhares de épocas isso basta para mudar a época de convergência (a espiral dava 7969 num e
// 8151 no outro). Como a turma vai abrir o site em celulares diferentes, e os textos citam
// épocas exatas, as funções abaixo usam só soma, subtração, multiplicação e divisão — que o
// IEEE-754 garante idênticas em qualquer motor (e o JavaScript nunca as funde em FMA) —, mais
// uma escala exata por potência de 2. O resultado é o mesmo, bit a bit, em todo navegador.
// ---------------------------------------------------------------------------------------------

const BITS = new DataView(new ArrayBuffer(8));

/** 2^k exato, montando o expoente do double à mão (k inteiro em [−1022, 1023]). */
function potenciaDeDois(k) {
  BITS.setUint32(0, (k + 1023) << 20);
  BITS.setUint32(4, 0);
  return BITS.getFloat64(0);
}

// Constantes do exp do fdlibm (Sun Microsystems), a implementação clássica de referência.
const LN2_HI = 6.93147180369123816490e-01;
const LN2_LO = 1.90821492927058770002e-10;
const INV_LN2 = 1.44269504088896338700e+00;
const P1 = 1.66666666666666019037e-01;
const P2 = -2.77777777770155933842e-03;
const P3 = 6.61375632143793436117e-05;
const P4 = -1.65339022054652515390e-06;
const P5 = 4.13813679705723846039e-08;
const DOIS_A_MENOS_1000 = 9.33263618503218878990e-302;

/**
 * e^x, port do `e_exp.c` do fdlibm: redução x = k·ln2 + r (com ln2 em duas partes, para a
 * subtração ser exata), aproximação racional de e^r e escala exata por 2^k. Erro < 1 ulp.
 */
export function exponencial(x) {
  if (Number.isNaN(x)) return NaN;
  if (x > 709.782712893384) return Infinity;
  if (x < -745.1332191019411) return 0;
  const absoluto = Math.abs(x);
  let hi = 0;
  let lo = 0;
  let k = 0;
  if (absoluto > 0.34657359027997264) {        // |x| > ln2 / 2
    if (absoluto < 1.0397207708399179) {        // |x| < 1,5 · ln2
      k = x > 0 ? 1 : -1;
    } else {
      k = Math.trunc(INV_LN2 * x + (x > 0 ? 0.5 : -0.5));
    }
    hi = x - k * LN2_HI;                        // exato: LN2_HI tem os bits baixos zerados
    lo = k * LN2_LO;
    x = hi - lo;
  } else if (absoluto < 3.725290298461914e-9) { // |x| < 2^−28
    return 1 + x;
  }
  const t = x * x;
  const c = x - t * (P1 + t * (P2 + t * (P3 + t * (P4 + t * P5))));
  if (k === 0) return 1 - ((x * c) / (c - 2) - x);
  const y = 1 - ((lo - (x * c) / (2 - c)) - hi);
  if (k === 1024) return y * 2 * potenciaDeDois(1023);
  if (k >= -1021) return y * potenciaDeDois(k);
  return y * potenciaDeDois(k + 1000) * DOIS_A_MENOS_1000;
}

const UM_TERCO = 1 / 3;
const DOIS_QUINZE_AVOS = 2 / 15;
const DEZESSETE_315_AVOS = 17 / 315;
const SESSENTA_E_DOIS_2835_AVOS = 62 / 2835;

/**
 * tanh(x) a partir de `exponencial`: série de Taylor perto de zero (onde e^{2x} − 1 perderia
 * precisão), (e − 1)/(e + 1) no meio e 1 − 2/(e + 1) longe de zero; ±1 a partir de 22.
 */
export function tangenteHiperbolica(x) {
  if (Number.isNaN(x)) return NaN;
  const a = Math.abs(x);
  let t;
  if (a >= 22) {
    t = 1;
  } else if (a < 3.725290298461914e-9) {
    return x;
  } else if (a < 0.05) {
    const q = a * a;
    t = a * (1 + q * (-UM_TERCO + q * (DOIS_QUINZE_AVOS + q * (-DEZESSETE_315_AVOS + q * SESSENTA_E_DOIS_2835_AVOS))));
  } else if (a < 1) {
    const e = exponencial(2 * a);
    t = (e - 1) / (e + 1);
  } else {
    t = 1 - 2 / (exponencial(2 * a) + 1);
  }
  return x < 0 ? -t : t;
}

/**
 * Sigmoide, com o mesmo recorte do Python (`np.clip(z, -500, 500)`): só evita overflow do
 * exp quando os pesos divergem e não muda nada na faixa útil. Usa a exponencial
 * determinística (acima), para dar o mesmo resultado em todo navegador.
 */
export function sigmoide(z) {
  const recortado = z < -500 ? -500 : (z > 500 ? 500 : z);
  return 1 / (1 + exponencial(-recortado));
}
