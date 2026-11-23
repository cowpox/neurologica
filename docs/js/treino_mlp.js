/**
 * Rede multicamada com backpropagation: port de `prototipos/04_mlp_backprop_xor.py`
 *, generalizado para um número qualquer de camadas ocultas.
 *
 * O protótipo tem uma camada oculta só, o suficiente para a história do XOR. No laboratório
 * livre a arquitetura é editável, então aqui ela é genérica: `camadas = [4, 2, 2]` são três
 * camadas ocultas com 4, 2 e 2 neurônios. Com `camadas = [n]` o cálculo é exatamente o do
 * Python, na mesma ordem de operações.
 *
 * O que muda em relação ao neurônio único:
 *   ARQUITETURA: cada neurônio oculto traça a sua reta; com duas dá para recortar o XOR.
 *   ATIVAÇÃO: o degrau tem derivada zero, então não há gradiente para propagar; a camada
 *     oculta usa uma função não linear e diferenciável (sigmoide, tanh ou ReLU).
 *   TREINO: backpropagation, a regra da cadeia aplicada camada a camada.
 *
 * Convenções do treino:
 *   - Saída SIGMOIDE, alvos 0/1, e a classe decidida por `degrau(z_saída)` (z ANTES da
 *     sigmoide; σ(z) ≥ 0,5 exatamente quando z ≥ 0), com a mesma tolerância dos Marcos 1 a 3.
 *   - Custo SSE = ½ Σ (alvo − saída)², a mesma definição do Adaline. A atualização usa a MÉDIA
 *     dos gradientes (desce sse / n).
 *   - Limiares do site convertidos para a escala do SSE (sse = n/2 · EQM): converge com
 *     SSE < 0,04 e reinicia se, em 300 épocas, o SSE não caiu 0,006 (com 4 pontos).
 *   - Treino em LOTE: um `passo()` é uma época; `epoca` conta as atualizações já feitas
 *     (0 = pesos iniciais). Um reinício ocupa o lugar de uma atualização e NÃO aplica o passo
 *     de gradiente da rede antiga.
 *
 * Arredondamento: a parte numérica (propagar, gradientes, aplicar) são funções puras,
 * separadas da lógica de parada (`JanelaDeReinicio`). A conferência contra o Python
 * (`testes/conferir_js.mjs`) usa isso para checar CADA época a partir do estado do Python,
 * sem deixar o erro de arredondamento se acumular.
 */

import { criarAleatorio, degrau, exponencial, sigmoide, tangenteHiperbolica } from './dados.js';

/** Inclinação do lado negativo da Leaky ReLU e escala do lado negativo da ELU. */
export const ALFA_LEAKY = 0.01;
export const ALFA_ELU = 1;
const RAIZ_2_SOBRE_PI = Math.sqrt(2 / Math.PI);

/**
 * Funções de ativação das camadas ocultas. `derivadaDaSaida(a, z)` recebe a saída `a = f(z)`
 * e, como segundo argumento, a soma `z`: sigmoide, tanh, ReLU, Leaky ReLU e ELU escrevem a
 * derivada só com `a` (de graça, já calculada no passo para a frente); Swish e GELU não
 * são invertíveis (têm um vale) e precisam do `z`. Só entram contas com + − × ÷, a raiz
 * quadrada (arredondada corretamente) e a `exponencial` e a `tangenteHiperbolica` do site,
 * para o resultado ser idêntico em qualquer navegador.
 */
export const ATIVACOES = {
  sigmoide: {
    rotulo: 'sigmoide',
    f: sigmoide,
    // σ'(z) = a·(1 − a): como `a` já foi calculado no passo para a frente, a derivada sai de graça.
    derivadaDaSaida: (a) => a * (1 - a),
    faixa: [0, 1],
  },
  tanh: {
    rotulo: 'tanh',
    // não Math.tanh: ela muda de navegador para navegador (ver dados.js)
    f: (z) => tangenteHiperbolica(z),
    derivadaDaSaida: (a) => 1 - a * a,
    faixa: [-1, 1],
  },
  relu: {
    rotulo: 'ReLU',
    f: (z) => (z > 0 ? z : 0),
    // "Neurônio morto": se a saída for 0 para todos os exemplos, a derivada é 0 em todos eles e
    // o neurônio nunca mais recebe gradiente.
    derivadaDaSaida: (a) => (a > 0 ? 1 : 0),
    faixa: [-1, 1],
  },
  // Leaky ReLU: o lado negativo deixa de ser zero e ganha uma inclinação pequena, então o
  // neurônio nunca fica totalmente sem gradiente.
  leaky: {
    rotulo: 'Leaky ReLU',
    f: (z) => (z > 0 ? z : ALFA_LEAKY * z),
    derivadaDaSaida: (a) => (a > 0 ? 1 : ALFA_LEAKY),
    faixa: [-1, 1],
  },
  // ELU: no lado negativo curva suavemente até −α, sem quina em z = 0. Para z < 0,
  // f'(z) = α·e^z = f(z) + α, escrita pela própria saída.
  elu: {
    rotulo: 'ELU',
    f: (z) => (z > 0 ? z : ALFA_ELU * (exponencial(z) - 1)),
    derivadaDaSaida: (a) => (a > 0 ? 1 : a + ALFA_ELU),
    faixa: [-1, 1],
  },
  // Swish (SiLU): z·σ(z). Suave, e passa um pouco abaixo de zero antes de subir.
  swish: {
    rotulo: 'Swish',
    f: (z) => z * sigmoide(z),
    derivadaDaSaida: (a, z) => {
      const s = sigmoide(z);
      return s * (1 + z * (1 - s));
    },
    faixa: [-1, 1],
  },
  // GELU (aproximação por tanh, a usada nos transformers): ½·z·(1 + tanh(√(2/π)·(z + 0,044715·z³))).
  gelu: {
    rotulo: 'GELU',
    f: (z) => 0.5 * z * (1 + tangenteHiperbolica(RAIZ_2_SOBRE_PI * (z + 0.044715 * z * z * z))),
    derivadaDaSaida: (a, z) => {
      const t = tangenteHiperbolica(RAIZ_2_SOBRE_PI * (z + 0.044715 * z * z * z));
      return 0.5 * (1 + t) + 0.5 * z * (1 - t * t) * RAIZ_2_SOBRE_PI * (1 + 3 * 0.044715 * z * z);
    },
    faixa: [-1, 1],
  },
};

/** Convergência expressa no erro quadrático médio, como no site e no Python (EQM < 0,02). */
export const LIMIAR_EQM = 0.02;

/**
 * Detecção de mínimo local por JANELA: se em JANELA épocas o erro não
 * caiu pelo menos MELHORA_NA_JANELA_EQM, o treino está rastejando e vale recomeçar de outro
 * sorteio. Comparar com o "melhor erro já visto" não funciona: no mínimo local o erro continua
 * melhorando ~2,5·10⁻⁶ por época, e o contador zeraria para sempre.
 */
export const JANELA = 300;
export const MELHORA_NA_JANELA_EQM = 3e-3;

/**
 * Quantas inicializações tentar antes de desistir. Era 6 (Python também); com 6, cada tentativa
 * presa com ~35–47% de chance fazia 2 de 200 sementes do XNOR com sigmoide esgotarem tudo. Com
 * 10, as 200 convergem. O mesmo valor está no `04` (paridade).
 */
export const MAX_TENTATIVAS = 10;

// ---------------------------------------------------------------------------------------------
// Parte numérica: funções puras. Uma rede é { pesos, bias }, com pesos[l][i][j] (da entrada i
// da camada l para o neurônio j da camada seguinte, o mesmo layout do W1/W2 do Python) e
// bias[l][j].
// ---------------------------------------------------------------------------------------------

/** Tamanhos de todas as camadas, incluindo entrada e saída. */
export function formatoDaRede(nEntradas, camadas) {
  return [nEntradas, ...camadas, 1];
}

/**
 * Pesos iniciais pela regra de Xavier: uniforme em ±√(6 / (entradas + saídas)) por camada.
 * A simetria precisa ser quebrada: neurônios que começam iguais recebem gradientes iguais e
 * continuam iguais para sempre. A ordem do sorteio (matriz linha a linha, depois o bias) é a
 * do Python, e é dela que dependem os gabaritos de época do site.
 */
export function inicializarXavier(formato, aleatorio) {
  const pesos = [];
  const bias = [];
  for (let l = 0; l < formato.length - 1; l += 1) {
    const entrada = formato[l];
    const saida = formato[l + 1];
    const amplitude = Math.sqrt(6 / (entrada + saida));
    const matriz = [];
    for (let i = 0; i < entrada; i += 1) {
      const linha = [];
      for (let j = 0; j < saida; j += 1) linha.push((aleatorio() * 2 - 1) * amplitude);
      matriz.push(linha);
    }
    pesos.push(matriz);
    bias.push(Array.from({ length: saida }, () => (aleatorio() * 2 - 1) * amplitude));
  }
  return { pesos, bias };
}

/** Cópia profunda de uma rede (os treinos nunca compartilham arrays com quem os chama). */
export function copiarRede(rede) {
  return {
    pesos: rede.pesos.map((matriz) => matriz.map((linha) => [...linha])),
    bias: rede.bias.map((linha) => [...linha]),
  };
}

/**
 * Passo para a frente sobre vários exemplos. Devolve as somas `z` e as ativações de cada
 * camada; `ativacoes[0]` é a própria entrada. A camada de saída é sempre sigmoide.
 *
 * Cada soma é calculada como no Python (`X @ W + b`): primeiro o produto escalar, da primeira
 * à última entrada, e só depois o bias.
 */
export function propagar(rede, X, ativacao) {
  const { f } = ATIVACOES[ativacao];
  const ultima = rede.pesos.length - 1;
  const ativacoes = [X];
  const somas = [];
  let atual = X;

  for (let l = 0; l <= ultima; l += 1) {
    const W = rede.pesos[l];
    const b = rede.bias[l];
    const largura = b.length;
    const ativar = l === ultima ? sigmoide : f;
    const zCamada = new Array(atual.length);
    const aCamada = new Array(atual.length);

    for (let m = 0; m < atual.length; m += 1) {
      const entrada = atual[m];
      const z = new Array(largura);
      const a = new Array(largura);
      for (let j = 0; j < largura; j += 1) {
        let soma = 0;
        for (let i = 0; i < entrada.length; i += 1) soma += entrada[i] * W[i][j];
        z[j] = soma + b[j];
        a[j] = ativar(z[j]);
      }
      zCamada[m] = z;
      aCamada[m] = a;
    }
    somas.push(zCamada);
    ativacoes.push(aCamada);
    atual = aCamada;
  }
  return { somas, ativacoes };
}

/** SSE = ½ Σ (alvo − saída)², somado na ordem dos exemplos. */
export function custoSSE(y, saidaDaRede) {
  let soma = 0;
  for (let m = 0; m < y.length; m += 1) {
    const diferenca = y[m] - saidaDaRede[m][0];
    soma += diferenca * diferenca;
  }
  return 0.5 * soma;
}

/**
 * Backpropagation à mão: gradiente MÉDIO (de sse / n) de cada peso e bias, da saída para a
 * entrada. Os `delta` são a responsabilidade de cada neurônio pelo erro; na camada oculta ela
 * chega repartida pelos pesos da camada seguinte (é aqui que a regra da cadeia "atravessa" a
 * camada) e é filtrada pela derivada da ativação. Todos os gradientes são calculados com os
 * pesos ANTIGOS; só depois `aplicarGradiente` atualiza.
 */
export function gradientes(rede, y, ativacao, propagacao) {
  const { derivadaDaSaida } = ATIVACOES[ativacao];
  const { ativacoes, somas } = propagacao;
  const ultima = rede.pesos.length - 1;
  const n = y.length;
  const gradPesos = new Array(rede.pesos.length);
  const gradBias = new Array(rede.bias.length);

  // Camada de saída: d(sse)/dz = (saída − alvo) · σ'(z), com σ' escrita pela própria saída.
  const saida = ativacoes[ultima + 1];
  let delta = saida.map((linha, m) => [(linha[0] - y[m]) * (linha[0] * (1 - linha[0]))]);

  for (let l = ultima; l >= 0; l -= 1) {
    const entradaDaCamada = ativacoes[l];
    const W = rede.pesos[l];
    const largura = rede.bias[l].length;

    gradPesos[l] = W.map((linha, i) => linha.map((_, j) => {
      let soma = 0;
      for (let m = 0; m < n; m += 1) soma += entradaDaCamada[m][i] * delta[m][j];
      return soma / n;
    }));
    gradBias[l] = Array.from({ length: largura }, (_, j) => {
      let soma = 0;
      for (let m = 0; m < n; m += 1) soma += delta[m][j];
      return soma / n;
    });

    if (l > 0) {
      const larguraAnterior = W.length;
      delta = entradaDaCamada.map((a, m) => {
        const linha = new Array(larguraAnterior);
        for (let i = 0; i < larguraAnterior; i += 1) {
          let soma = 0;
          for (let j = 0; j < largura; j += 1) soma += delta[m][j] * W[i][j];
          linha[i] = soma * derivadaDaSaida(a[i], somas[l - 1][m][i]);
        }
        return linha;
      });
    }
  }
  return { pesos: gradPesos, bias: gradBias };
}

/** Um passo de gradiente descendente: peso ← peso − η · gradiente. Devolve uma rede nova. */
export function aplicarGradiente(rede, grad, taxa) {
  return {
    pesos: rede.pesos.map((matriz, l) => matriz.map((linha, i) => linha.map(
      (w, j) => w - taxa * grad.pesos[l][i][j],
    ))),
    bias: rede.bias.map((linha, l) => linha.map((b, j) => b - taxa * grad.bias[l][j])),
  };
}

/** Uma época inteira de treino a partir de uma rede qualquer (usada também pela conferência). */
export function epocaDeGradiente(rede, X, y, ativacao, taxa) {
  const propagacao = propagar(rede, X, ativacao);
  return aplicarGradiente(rede, gradientes(rede, y, ativacao, propagacao), taxa);
}

// ---------------------------------------------------------------------------------------------
// Lógica de parada: separada da parte numérica, para ser conferida sozinha.
// ---------------------------------------------------------------------------------------------

/**
 * Detector de estagnação por janela, com a regra exata do Python: a janela começa no primeiro
 * SSE observado depois de zerar e fecha quando o contador chega a JANELA. Por isso a primeira
 * janela mede 299 atualizações e as seguintes 300 (divergência conhecida (b) do plano, mantida
 * igual nos dois lados).
 */
export class JanelaDeReinicio {
  constructor(melhoraMinima, tamanho = JANELA) {
    this.melhoraMinima = melhoraMinima;
    this.tamanho = tamanho;
    this.zerar();
  }

  zerar() {
    this.inicio = null;
    this.contador = 0;
  }

  /** Registra o SSE da época e responde se o treino empacou (fechou a janela sem melhorar). */
  observar(sse) {
    if (this.inicio === null) this.inicio = sse;
    this.contador += 1;
    if (this.contador < this.tamanho) return false;
    if (this.inicio - sse < this.melhoraMinima) return true;
    this.inicio = sse;
    this.contador = 0;
    return false;
  }
}

// ---------------------------------------------------------------------------------------------
// O treino usado pelo site.
// ---------------------------------------------------------------------------------------------

export class TreinoMLP {
  /**
   * `fontePesos(tentativa)` é opcional: devolve a rede inicial da tentativa ({ pesos, bias }).
   * Sem ela, cada tentativa sorteia por Xavier com a semente `semente + 1000 · tentativa`
   * (a mesma regra do Python, mas com o gerador do site). Serve para a conferência injetar os
   * pesos que o Python sorteou com o numpy.
   *
   * `pararQuando` escolhe o critério de convergência: 'erro' (padrão, o do Python: SSE abaixo
   * do limiar, EQM < 0,02) ou 'acertos' (todos os pontos do lado certo). O segundo serve aos
   * conjuntos de classificação do laboratório livre, com centenas de pontos, onde "acertou
   * todos" é o que interessa e o SSE pode levar muito mais tempo para cair abaixo do limiar.
   */
  constructor({
    X, y, camadas = [2], ativacao = 'sigmoide', taxa = 2.0,
    maxEpocas = 20000, semente = 42, reiniciarAoEmpacar = true, fontePesos = null,
    pararQuando = 'erro',
  }) {
    if (!ATIVACOES[ativacao]) throw new RangeError(`Ativação desconhecida: ${ativacao}`);
    if (!['erro', 'acertos'].includes(pararQuando)) throw new RangeError(`Critério desconhecido: ${pararQuando}`);
    this.pararQuando = pararQuando;
    this.X = X;
    this.y = y;
    this.camadas = [...camadas];
    this.ativacao = ativacao;
    this.taxa = taxa;
    this.maxEpocas = maxEpocas;
    this.semente = semente;
    this.reiniciarAoEmpacar = reiniciarAoEmpacar;
    this.fontePesos = fontePesos;
    const n = X.length;
    this.limiarSse = LIMIAR_EQM * n / 2;
    this.melhoraMinimaSse = MELHORA_NA_JANELA_EQM * n / 2;
    this.reiniciar();
  }

  get rotulo() {
    return 'Rede multicamada';
  }

  get tipoErro() {
    return { chave: 'sse', titulo: 'Custo SSE = ½ Σ (alvo − saída)²', discreto: false };
  }

  /** Tamanhos de todas as camadas, incluindo entrada e saída. */
  get formato() {
    return formatoDaRede(this.X[0].length, this.camadas);
  }

  /** Volta ao começo: tentativa 0, época 0. */
  reiniciar() {
    this.tentativa = 0;
    this.epoca = 0;
    this.historicoErro = [];
    this.reinicios = [];
    this.janela = new JanelaDeReinicio(this.melhoraMinimaSse);
    this.carregarPesos();
    this.estado = 'treinando';
    this.convergiu = false;
    this.esgotou = false;
    this.ultimoPasso = null;
  }

  carregarPesos() {
    const rede = this.fontePesos
      ? copiarRede(this.fontePesos(this.tentativa))
      : inicializarXavier(this.formato, criarAleatorio(this.semente + this.tentativa * 1000));
    this.pesos = rede.pesos;
    this.bias = rede.bias;
  }

  get rede() {
    return { pesos: this.pesos, bias: this.bias };
  }

  get terminou() {
    return this.convergiu || this.esgotou;
  }

  /** Termina o treino. `esgotou` vale tanto para o limite de épocas quanto para as tentativas. */
  finalizar(registro, estado) {
    this.estado = estado;
    registro.estado = estado;
    if (estado === 'convergiu') this.convergiu = true;
    else this.esgotou = true;
    this.ultimoPasso = registro;
    return registro;
  }

  /**
   * Uma época. A ordem dos testes é a do Python: mede o estado atual; se convergiu, para; se
   * chegou ao limite de épocas, para; se a janela diz que empacou, reinicia (ou desiste, sem
   * mais tentativas); senão, aplica um passo de gradiente.
   */
  passo() {
    if (this.terminou) return this.ultimoPasso;

    const propagacao = propagar(this.rede, this.X, this.ativacao);
    const saida = propagacao.ativacoes[propagacao.ativacoes.length - 1];
    const zSaida = propagacao.somas[propagacao.somas.length - 1].map((linha) => linha[0]);
    const sse = custoSSE(this.y, saida);
    const yPrevisto = zSaida.map((z) => degrau(z));
    let errosNaEpoca = 0;
    for (let m = 0; m < this.y.length; m += 1) if (yPrevisto[m] !== this.y[m]) errosNaEpoca += 1;

    const registro = {
      epoca: this.epoca,
      tentativa: this.tentativa,
      sse,
      errosNaEpoca,
      yPrevisto,
      saidas: saida.map((linha) => linha[0]),
      zSaida,
      ativacoes: propagacao.ativacoes,
      reiniciou: false,
      fimDeEpoca: true,
    };
    this.historicoErro.push({ epoca: this.epoca, valor: sse });

    const atingiu = this.pararQuando === 'acertos' ? errosNaEpoca === 0 : sse < this.limiarSse;
    if (atingiu) return this.finalizar(registro, 'convergiu');
    if (this.epoca >= this.maxEpocas) return this.finalizar(registro, 'limite');

    if (this.reiniciarAoEmpacar && this.janela.observar(sse)) {
      if (this.tentativa + 1 >= MAX_TENTATIVAS) return this.finalizar(registro, 'esgotou');
      // Mínimo local: recomeça de outro sorteio, SEM aplicar o gradiente da rede antiga.
      registro.reiniciou = true;
      this.reinicios.push({ epoca: this.epoca, sse });
      this.tentativa += 1;
      this.carregarPesos();
      this.janela.zerar();
      this.epoca += 1;
      this.ultimoPasso = registro;
      return registro;
    }

    const novaRede = aplicarGradiente(
      this.rede, gradientes(this.rede, this.y, this.ativacao, propagacao), this.taxa,
    );
    this.pesos = novaRede.pesos;
    this.bias = novaRede.bias;
    this.epoca += 1;

    this.ultimoPasso = registro;
    return registro;
  }

  /**
   * Ativações de todas as camadas para estas entradas (a posição 0 é a própria entrada).
   * Atalho para a interface (`rede_visual.js` mede o brilho das conexões com isto); a conta
   * é a mesma função pura `propagar`.
   */
  propagar(entradas) {
    return propagar(this.rede, entradas, this.ativacao).ativacoes;
  }

  /** z do neurônio de saída (antes da sigmoide) num ponto. */
  zSaidaNoPonto(ponto) {
    const { somas } = propagar(this.rede, [ponto], this.ativacao);
    return somas[somas.length - 1][0][0];
  }

  /** Classe prevista: `degrau(z_saída)`, o mesmo critério do erro por época. */
  prever(ponto) {
    return degrau(this.zSaidaNoPonto(ponto));
  }

  /** Pontos mal classificados com os pesos atuais. */
  errosAtuais() {
    const { somas } = propagar(this.rede, this.X, this.ativacao);
    const zSaida = somas[somas.length - 1];
    let total = 0;
    for (let m = 0; m < this.X.length; m += 1) if (degrau(zSaida[m][0]) !== this.y[m]) total += 1;
    return total;
  }

  /**
   * Confiança com sinal da rede no ponto, para pintar a região de decisão. A saída vive em
   * [0, 1]; recentrada em 0,5 e multiplicada por 4, fica na mesma faixa de valores da distância
   * usada pelos modos de neurônio único.
   */
  valorContinuo(ponto) {
    const { ativacoes } = propagar(this.rede, [ponto], this.ativacao);
    return (ativacoes[ativacoes.length - 1][0][0] - 0.5) * 4;
  }

  /** O mesmo `valorContinuo`, para muitos pontos numa propagação só (pintura do plano). */
  valoresContinuos(pontos) {
    const { ativacoes } = propagar(this.rede, pontos, this.ativacao);
    return ativacoes[ativacoes.length - 1].map((linha) => (linha[0] - 0.5) * 4);
  }

  /** A fronteira da saída fica em z = 0 (σ = 0,5). */
  get limiar() {
    return 0;
  }

  /**
   * Saída de TODOS os neurônios sobre uma grade do plano de entrada, de uma vez só: alimenta os
   * mini-gráficos de cada neurônio. Devolve
   * { resolucao, porCamada: [[Float32Array por neurônio]...], faixaAtivacao }.
   */
  mapaDeAtivacoes(resolucao = 22, faixa = this.faixaDoPlano ?? [-0.5, 1.5]) {
    const pontos = [];
    const passo = (faixa[1] - faixa[0]) / (resolucao - 1);
    for (let linha = 0; linha < resolucao; linha += 1) {
      for (let coluna = 0; coluna < resolucao; coluna += 1) {
        const x1 = faixa[0] + coluna * passo;
        const x2 = faixa[0] + linha * passo;
        pontos.push(this.X[0].length === 1 ? [x1] : [x1, x2]);
      }
    }

    const { ativacoes } = propagar(this.rede, pontos, this.ativacao);
    const porCamada = [];
    // começa em 1 para pular a camada de entrada (que não é um neurônio)
    for (let l = 1; l < ativacoes.length; l += 1) {
      const largura = ativacoes[l][0].length;
      const neuronios = [];
      for (let j = 0; j < largura; j += 1) {
        const valores = new Float32Array(pontos.length);
        for (let p = 0; p < pontos.length; p += 1) valores[p] = ativacoes[l][p][j];
        neuronios.push(valores);
      }
      porCamada.push(neuronios);
    }
    return { resolucao, porCamada, faixaAtivacao: ATIVACOES[this.ativacao].faixa };
  }

  /** Reta de decisão de um neurônio da PRIMEIRA camada oculta (onde z = 0). */
  retaDoNeuronio(indice, faixa = this.faixaDoPlano ?? [-0.5, 1.5]) {
    if (this.X[0].length !== 2) return null;
    const w1 = this.pesos[0][0][indice];
    const w2 = this.pesos[0][1][indice];
    const b = this.bias[0][indice];
    if (Math.abs(w1) < 1e-9 && Math.abs(w2) < 1e-9) return null;
    if (Math.abs(w2) < 1e-9) {
      const x = -b / w1;
      return [{ x, y: faixa[0] }, { x, y: faixa[1] }];
    }
    return faixa.map((x) => ({ x, y: -(w1 * x + b) / w2 }));
  }

  // A ordem é a do código: mede e testa a parada ANTES de calcular o gradiente.
  static pseudocodigo = [
    { chave: 'inicio', texto: 'W, b ← sorteio de Xavier' },
    { chave: 'cabecalho', texto: 'para cada época:' },
    { chave: 'frente', texto: '  para a frente: a ← f(a · W + b), camada a camada (na saída, f = σ)', indent: 1 },
    { chave: 'erro', texto: '  SSE ← ½ Σ (y − ŷ)²', indent: 1 },
    { chave: 'meta', texto: '  se atingiu a meta: parar   (erro pequeno, ou todos os pontos certos)', indent: 1 },
    { chave: 'limite', texto: '  se chegou ao máx. de épocas: parar', indent: 1 },
    { chave: 'reinicio', texto: '  se o SSE quase não caiu em 300 épocas: sortear pesos novos (até 10 vezes)', indent: 1 },
    { chave: 'delta_saida', texto: '  δ da saída ← (ŷ − y) · σ′(ŷ)', indent: 1 },
    { chave: 'delta_oculta', texto: '  para trás: δ ← (δ · Wᵀ) · f′(a), camada a camada', indent: 1 },
    { chave: 'atualiza', texto: '  W ← W − η · (aᵀ · δ) / n   e   b ← b − η · média(δ)', indent: 1 },
  ];

  /** As linhas que a época mais recente percorreu, em ordem (ver TreinoPerceptron). */
  static sequenciaDoPasso(passo, treino) {
    const linhas = ['cabecalho', 'frente', 'erro', 'meta'];
    if (passo.estado === 'convergiu') return linhas;
    linhas.push('limite');
    if (passo.estado === 'limite') return linhas;
    if (treino.reiniciarAoEmpacar) linhas.push('reinicio');
    if (passo.estado === 'esgotou' || passo.reiniciou) return linhas;
    linhas.push('delta_saida', 'delta_oculta', 'atualiza');
    return linhas;
  }
}
