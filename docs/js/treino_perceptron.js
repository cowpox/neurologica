/**
 * Perceptron clássico: port de `prototipos/01_perceptron_gates.py`.
 *
 * Regra de aprendizagem: correção de erro DISCRETA, medida depois da ativação.
 *
 *     erro = y_real − ŷ            (só pode valer −1, 0 ou +1)
 *     w ← w + η · erro · x
 *     b ← b + η · erro
 *
 * Os pesos ficam parados enquanto o neurônio acerta e dão um salto quando ele erra: a reta
 * anda aos trancos, não desliza.
 *
 * O treino avança de exemplo em exemplo (`passo()`), como o gerador do Python, porque a
 * unidade didática é a iteração: qual ponto está sendo olhado agora e o que ele fez com os
 * pesos.
 *
 * Contagens por época (iguais às do Python):
 *   - `correcoesNaEpoca`: correções feitas DURANTE a época, até o exemplo atual. É o critério
 *     de parada (uma época inteira sem correção = convergiu).
 *   - `errosNaEpoca`: só no último exemplo da época; quantos pontos ficam mal classificados
 *     com os pesos FINAIS da época (`contarErros`). É o que o gráfico de erro mostra, e
 *     significa a mesma coisa no Adaline. Pode chegar a 0 uma época antes da convergência
 *     (a reta já acerta tudo, e falta a época sem correções para confirmar).
 */

import {
  contarErros, criarAleatorio, degrau, produtoEscalar, uniforme, validarPesosIniciais,
} from './dados.js';

export class TreinoPerceptron {
  constructor({
    X, y, taxa = 0.1, maxEpocas = 20, semente = 42, pesosIniciais = null, biasInicial = 0,
  }) {
    this.X = X;
    this.y = y;
    this.taxa = taxa;
    this.maxEpocas = maxEpocas;
    this.semente = semente;
    this.pesosIniciais = pesosIniciais;
    this.biasInicial = biasInicial;
    if (pesosIniciais) validarPesosIniciais(pesosIniciais, X[0].length);
    this.reiniciar();
  }

  get rotulo() {
    return 'Perceptron';
  }

  /** Tipo de erro que este modo reporta: o painel de gráfico usa para rotular o eixo. */
  get tipoErro() {
    return { chave: 'errosNaEpoca', titulo: 'Pontos mal classificados', discreto: true };
  }

  reiniciar() {
    const nEntradas = this.X[0].length;
    if (this.pesosIniciais) {
      this.pesos = [...this.pesosIniciais];
    } else {
      const aleatorio = criarAleatorio(this.semente);
      this.pesos = Array.from({ length: nEntradas }, () => uniforme(aleatorio, 0.5));
    }
    this.bias = this.biasInicial;

    this.epoca = 1;
    this.indice = 0;
    this.correcoesNaEpoca = 0;
    this.convergiu = false;
    this.esgotou = false;
    this.historicoErro = [];
    this.ultimoPasso = null;
  }

  get terminou() {
    return this.convergiu || this.esgotou;
  }

  /** Processa um exemplo e devolve o registro do que aconteceu. */
  passo() {
    if (this.terminou) return this.ultimoPasso;

    const x = this.X[this.indice];
    const yReal = this.y[this.indice];
    const z = produtoEscalar(this.pesos, x) + this.bias;
    const yPrevisto = degrau(z);
    const erro = yReal - yPrevisto;
    const houveAtualizacao = erro !== 0;

    const pesosAntes = [...this.pesos];
    const biasAntes = this.bias;

    if (houveAtualizacao) {
      // mesma ordem de operações do Python: (η · erro) · x
      for (let i = 0; i < this.pesos.length; i += 1) {
        this.pesos[i] += this.taxa * erro * x[i];
      }
      this.bias += this.taxa * erro;
      this.correcoesNaEpoca += 1;
    }

    const fimDeEpoca = this.indice === this.X.length - 1;
    const registro = {
      epoca: this.epoca,
      indice: this.indice,
      x,
      yReal,
      yPrevisto,
      z,
      erro,
      houveAtualizacao,
      pesosAntes,
      biasAntes,
      pesos: [...this.pesos],
      bias: this.bias,
      correcoesNaEpoca: this.correcoesNaEpoca,
      errosNaEpoca: fimDeEpoca ? this.errosAtuais() : null,
      fimDeEpoca,
    };

    this.indice += 1;
    if (fimDeEpoca) {
      this.historicoErro.push({ epoca: this.epoca, valor: registro.errosNaEpoca });
      // Convergência: uma época inteira sem correção. Sem correção os pesos não mudam,
      // então a reta já acerta tudo. Esse critério só existe porque o erro aqui é discreto.
      if (this.correcoesNaEpoca === 0) {
        this.convergiu = true;
      } else if (this.epoca >= this.maxEpocas) {
        this.esgotou = true;
      } else {
        this.epoca += 1;
        this.indice = 0;
        this.correcoesNaEpoca = 0;
      }
    }

    this.ultimoPasso = registro;
    return registro;
  }

  /** Erros de classificação da reta ATUAL (não as correções da época). */
  errosAtuais() {
    return contarErros(this.X, this.y, this.pesos, this.bias);
  }

  /** Classe prevista num ponto qualquer. */
  prever(ponto) {
    return degrau(produtoEscalar(this.pesos, ponto) + this.bias);
  }

  /**
   * Distância com sinal do ponto até a fronteira, para pintar a região de decisão.
   *
   * Dividir por ‖w‖ importa: o valor cru de z depende da ESCALA dos pesos,
   * e no começo do treino o plano inteiro ficaria de uma cor lavada. A distância geométrica não
   * muda quando todos os pesos são multiplicados pelo mesmo número.
   */
  valorContinuo(ponto) {
    const z = produtoEscalar(this.pesos, ponto) + this.bias;
    const norma = Math.hypot(...this.pesos);
    return norma < 1e-9 ? 0 : z / norma;
  }

  /** Deslocamento da fronteira: o Perceptron decide em z = 0. */
  get limiar() {
    return 0;
  }

  /**
   * Linhas do pseudocódigo, com a chave usada para destacar o passo atual. Marcação (ver
   * marcarPseudocodigo em algoritmo.js): **controle**, *variável*, {comentário}.
   */
  static pseudocodigo = [
    { chave: 'inicio', texto: '*w* ← valores aleatórios pequenos;  *b* ← 0' },
    { chave: 'cabecalho', texto: '**para cada** época:' },
    { chave: 'amostra', texto: '  **para cada** exemplo (*x*, *y*):', indent: 1 },
    { chave: 'soma', texto: '    *z* ← *w* · *x* + *b*', indent: 2 },
    { chave: 'ativacao', texto: '    *ŷ* ← degrau(*z*)', indent: 2 },
    { chave: 'erro', texto: '    *erro* ← *y* − *ŷ*', indent: 2 },
    { chave: 'atualiza', texto: '    **se** *erro* ≠ 0:  *w* ← *w* + *η*·*erro*·*x*   e   *b* ← *b* + *η*·*erro*', indent: 2 },
    { chave: 'convergiu', texto: '  **se** nenhuma correção na época: **parar** {(convergiu)}', indent: 1 },
    { chave: 'limite', texto: '  **se** chegou ao máx. de épocas: **parar**', indent: 1 },
  ];

  /**
   * As linhas do pseudocódigo que o passo `passo` (o último dado) percorreu, em ordem. Lê o
   * estado do treino DEPOIS do passo, então só vale para o passo mais recente.
   *
   * As linhas de parada só acendem quando a condição DISPARA: acesas a cada fim de época,
   * com o treino seguindo, davam a impressão de que ele tinha parado.
   */
  static sequenciaDoPasso(passo, treino) {
    const linhas = passo.indice === 0 ? ['cabecalho'] : [];
    linhas.push('amostra', 'soma', 'ativacao', 'erro');
    // a correção só acende quando houve correção: com erro 0 os pesos não mudam
    if (passo.houveAtualizacao) linhas.push('atualiza');
    if (passo.fimDeEpoca) {
      if (treino.convergiu) linhas.push('convergiu');
      else if (treino.terminou) linhas.push('limite');
      // nenhuma parada disparou: a execução volta ao início do laço, e é aí que fica
      else linhas.push('cabecalho');
    }
    return linhas;
  }
}
