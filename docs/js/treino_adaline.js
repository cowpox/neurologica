/**
 * Adaline (regra delta, versão online): port de `prototipos/02_adaline_gates.py`.
 *
 * A arquitetura é a do Perceptron: um neurônio, os mesmos pesos, o mesmo bias e a mesma
 * decisão de classe (`degrau(z)`, fronteira em z = 0). O que muda é ONDE o erro é medido:
 *
 *     Perceptron:  erro = y − ŷ       (depois do degrau; vale −1, 0 ou +1)
 *     Adaline:     erro = alvo − z    (antes do degrau, na saída linear; qualquer número real)
 *
 * Como z quase nunca é exatamente igual ao alvo, há correção em TODA iteração, mesmo quando o
 * ponto já está classificado certo: a reta desliza em vez de saltar.
 *
 * Convenções do treino:
 *   - Alvos BIPOLARES dentro do treino: alvo = 2·y − 1 (classe 0 → −1, classe 1 → +1). Com
 *     alvos 0/1 e o degrau em z ≥ 0, o mínimo do erro quadrático classifica errado.
 *     `y` continua 0/1 fora do treino.
 *   - Custo E = ½ Σ (alvo − z)², medido no FIM da época com os pesos finais (e não acumulado
 *     durante a época, que fica acima do mínimo e depende do η).
 *   - Parada quando |ΔE| < 1e-3 · η entre duas épocas (a queda do custo por época é
 *     proporcional ao η, então uma tolerância fixa pararia cedo demais com η pequeno), no
 *     limite de épocas, ou ao divergir (E não finito ou > 1e6).
 *   - "Convergiu" significa que o custo ESTABILIZOU, e não que acertou tudo: com η grande o
 *     Adaline online estabiliza com pontos errados. Quem diz se resolveu é
 *     `errosNaEpoca` / `errosAtuais()`.
 */

import {
  contarErros, criarAleatorio, degrau, produtoEscalar, uniforme, validarPesosIniciais,
} from './dados.js';

/** Tolerância de parada por unidade de η (vale 1e-4 com η = 0,1). */
export const TOLERANCIA_SSE_POR_TAXA = 1e-3;

/** Acima disto (ou não finito) o custo explodiu: η grande demais. */
export const LIMITE_DIVERGENCIA = 1e6;

export class TreinoAdaline {
  constructor({
    X, y, taxa = 0.1, maxEpocas = 100, semente = 42,
    pesosIniciais = null, biasInicial = 0, toleranciaSse = null,
  }) {
    this.X = X;
    this.y = y;
    this.alvos = y.map((classe) => 2 * classe - 1);
    this.taxa = taxa;
    this.maxEpocas = maxEpocas;
    this.semente = semente;
    this.pesosIniciais = pesosIniciais;
    this.biasInicial = biasInicial;
    this.toleranciaSse = toleranciaSse ?? TOLERANCIA_SSE_POR_TAXA * taxa;
    if (pesosIniciais) validarPesosIniciais(pesosIniciais, X[0].length);
    this.reiniciar();
  }

  get rotulo() {
    return 'Adaline';
  }

  get tipoErro() {
    return { chave: 'sse', titulo: 'Custo E = ½ Σ (alvo − z)²', discreto: false };
  }

  reiniciar() {
    const nEntradas = this.X[0].length;
    if (this.pesosIniciais) {
      this.pesos = [...this.pesosIniciais];
    } else {
      // mesmo sorteio do Perceptron: a mesma semente dá os mesmos pesos iniciais nos dois
      const aleatorio = criarAleatorio(this.semente);
      this.pesos = Array.from({ length: nEntradas }, () => uniforme(aleatorio, 0.5));
    }
    this.bias = this.biasInicial;

    this.epoca = 1;
    this.indice = 0;
    this.sseAnterior = null;
    this.convergiu = false;
    this.divergiu = false;
    this.esgotou = false;
    this.historicoErro = [];
    this.ultimoPasso = null;
  }

  get terminou() {
    return this.convergiu || this.divergiu || this.esgotou;
  }

  /** Custo E = ½ Σ (alvo − z)² com os pesos atuais, somado na ordem dos exemplos. */
  custoAtual() {
    let soma = 0;
    for (let i = 0; i < this.X.length; i += 1) {
      const diferenca = this.alvos[i] - (produtoEscalar(this.pesos, this.X[i]) + this.bias);
      soma += diferenca * diferenca;
    }
    return 0.5 * soma;
  }

  passo() {
    if (this.terminou) return this.ultimoPasso;

    const x = this.X[this.indice];
    const alvo = this.alvos[this.indice];
    const z = produtoEscalar(this.pesos, x) + this.bias;
    const yPrevisto = degrau(z);
    const erro = alvo - z;

    const pesosAntes = [...this.pesos];
    const biasAntes = this.bias;

    // A correção acontece SEMPRE, sem "se errou": é essa ausência de condicional que
    // diferencia a regra delta da regra do Perceptron. Ordem do Python: (η · erro) · x.
    for (let i = 0; i < this.pesos.length; i += 1) {
      this.pesos[i] += this.taxa * erro * x[i];
    }
    this.bias += this.taxa * erro;

    const fimDeEpoca = this.indice === this.X.length - 1;
    const registro = {
      epoca: this.epoca,
      indice: this.indice,
      x,
      yReal: this.y[this.indice],
      alvo,
      z,
      erro,
      yPrevisto,
      houveAtualizacao: true,
      pesosAntes,
      biasAntes,
      pesos: [...this.pesos],
      bias: this.bias,
      fimDeEpoca,
    };

    this.indice += 1;
    if (fimDeEpoca) {
      const sse = this.custoAtual();
      registro.sse = sse;
      registro.errosNaEpoca = this.errosAtuais();
      this.historicoErro.push({ epoca: this.epoca, valor: sse });

      // Mesma ordem de testes do Python: divergiu, estabilizou, limite de épocas.
      if (!Number.isFinite(sse) || sse > LIMITE_DIVERGENCIA) {
        this.divergiu = true;
      } else if (this.sseAnterior !== null && Math.abs(this.sseAnterior - sse) < this.toleranciaSse) {
        this.convergiu = true;
      } else if (this.epoca >= this.maxEpocas) {
        this.esgotou = true;
      } else {
        this.sseAnterior = sse;
        this.epoca += 1;
        this.indice = 0;
      }
    }

    this.ultimoPasso = registro;
    return registro;
  }

  /** Erros de classificação com os pesos atuais (o mesmo `degrau` do Perceptron). */
  errosAtuais() {
    return contarErros(this.X, this.y, this.pesos, this.bias);
  }

  prever(ponto) {
    return degrau(produtoEscalar(this.pesos, ponto) + this.bias);
  }

  /** Distância com sinal até a fronteira z = 0, normalizada por ‖w‖ (ver treino_perceptron.js). */
  valorContinuo(ponto) {
    const z = produtoEscalar(this.pesos, ponto) + this.bias;
    const norma = Math.hypot(...this.pesos);
    return norma < 1e-9 ? 0 : z / norma;
  }

  /** Com alvos −1/+1 a fronteira fica em z = 0, a mesma do Perceptron. */
  get limiar() {
    return 0;
  }

  static pseudocodigo = [
    { chave: 'inicio', texto: 'w ← valores aleatórios pequenos;  b ← 0' },
    { chave: 'cabecalho', texto: 'para cada época:' },
    { chave: 'amostra', texto: '  para cada exemplo (x, y):', indent: 1 },
    { chave: 'alvo', texto: '    alvo ← −1 se y = 0, +1 se y = 1', indent: 2 },
    { chave: 'soma', texto: '    z ← w · x + b          (saída linear)', indent: 2 },
    { chave: 'erro', texto: '    erro ← alvo − z        (antes do degrau)', indent: 2 },
    { chave: 'atualiza', texto: '    w ← w + η·erro·x   e   b ← b + η·erro', indent: 2 },
    { chave: 'custo', texto: '  E ← ½ Σ (alvo − z)²     (com os pesos do fim da época)', indent: 1 },
    { chave: 'divergiu', texto: '  se E divergiu: parar (η grande demais)', indent: 1 },
    { chave: 'convergiu', texto: '  se E quase não mudou: parar (estabilizou)', indent: 1 },
    { chave: 'limite', texto: '  se chegou ao máx. de épocas: parar', indent: 1 },
  ];

  /** As linhas que o passo mais recente percorreu, em ordem (ver TreinoPerceptron). */
  static sequenciaDoPasso(passo, treino) {
    const linhas = passo.indice === 0 ? ['cabecalho'] : [];
    linhas.push('amostra', 'alvo', 'soma', 'erro', 'atualiza');
    if (passo.fimDeEpoca) {
      linhas.push('custo', 'divergiu');
      if (!treino.divergiu) {
        linhas.push('convergiu');
        if (!treino.convergiu) linhas.push('limite');
      }
      // nenhuma parada disparou: a execução volta ao início do laço, e é aí que fica
      if (!treino.terminou) linhas.push('cabecalho');
    }
    return linhas;
  }
}
