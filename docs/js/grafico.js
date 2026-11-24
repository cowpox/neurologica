/**
 * Painel gráfico: o plano de decisão e a curva de erro.
 *
 * Divisão de trabalho entre as duas tecnologias, que é o ponto técnico deste
 * arquivo: a REGIÃO de decisão (milhares de células coloridas, redesenhadas a cada
 * frame) vai para um `<canvas>`, porque criar milhares de elementos SVG e
 * atualizá-los seria lento; tudo o mais — eixos, pontos, retas, rótulos — vai para
 * um `<svg>` sobreposto, onde o D3 cuida das escalas e das transições suaves.
 *
 * A região é desenhada numa grade pequena (60×60) e depois esticada com suavização
 * do próprio navegador, o que dá o degradê contínuo de graça.
 */

import { densidadeSegura } from './zoom_leve.js';

/** Faixa padrão do plano: a das portas lógicas (entradas 0/1, com folga). */
export const FAIXA_PORTAS = [-0.5, 1.5];
const RESOLUCAO_REGIAO = 60;

/** Lê as cores do tema atual direto das variáveis CSS, para o canvas acompanhar
 *  a troca claro/escuro sem duplicar a paleta em JavaScript. */
function coresDoTema(elemento) {
  const estilo = getComputedStyle(elemento);
  const ler = (nome) => estilo.getPropertyValue(nome).trim();
  return {
    classe1: d3.color(ler('--cor-classe-1')),
    classe0: d3.color(ler('--cor-classe-0')),
    superficie: d3.color(ler('--cor-superficie')),
    borda: ler('--cor-borda'),
    suave: ler('--cor-suave'),
    tinta: ler('--cor-tinta'),
    primaria: ler('--cor-primaria'),
    realce: ler('--grafico-realce') || '#ffd60a',
  };
}

export class PlanoDeDecisao {
  constructor(container, { entradas = 2, resolucao = RESOLUCAO_REGIAO } = {}) {
    this.container = container;
    this.entradas = entradas;
    this.resolucao = resolucao;
    this.faixa = FAIXA_PORTAS;
    this.escalaRotulo = null; // conjuntos de classificação: rótulos dos eixos na escala original
    this.nuvem = false;       // muitos pontos: desenho compacto, sem rótulo por ponto
    this.container.classList.add('plano-decisao');

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'plano-canvas';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // canvas auxiliar, em baixa resolução, onde a região é calculada célula a célula
    this.canvasRegiao = document.createElement('canvas');
    this.canvasRegiao.width = resolucao;
    this.canvasRegiao.height = resolucao;
    this.ctxRegiao = this.canvasRegiao.getContext('2d');
    this.imagemRegiao = this.ctxRegiao.createImageData(resolucao, resolucao);

    this.svg = d3.select(container).append('svg').attr('class', 'plano-svg');
    this.gEixos = this.svg.append('g').attr('class', 'plano-eixos');
    this.gRetas = this.svg.append('g').attr('class', 'plano-retas');
    this.gPontos = this.svg.append('g').attr('class', 'plano-pontos');
    // anel e legenda do ponto mais próximo da reta (só quando o treino termina)
    this.gRealce = this.svg.append('g').attr('class', 'plano-realce').attr('pointer-events', 'none');

    this.redimensionar();
    this._observador = new ResizeObserver(() => {
      this.redimensionar();
      if (this.ultimoTreino) this.desenhar(this.ultimoTreino, this.ultimasOpcoes);
    });
    this._observador.observe(container);
  }

  destruir() {
    this._observador.disconnect();
  }

  /**
   * Troca o tipo de dado mostrado: as portas (faixa [−0,5; 1,5], 4 pontos grandes com
   * rótulo) ou um conjunto de classificação (faixa própria, centenas de pontos pequenos e
   * eixos rotulados na escala original, `escala` vezes a da rede).
   */
  definirDados({ faixa = FAIXA_PORTAS, escala = null, nuvem = false } = {}) {
    const mudou = this.faixa !== faixa || this.nuvem !== nuvem;
    this.faixa = faixa;
    this.escalaRotulo = escala;
    this.nuvem = nuvem;
    if (mudou) {
      this.gPontos.selectAll('*').remove();
      this.redimensionar();
    }
  }

  redimensionar() {
    const largura = this.container.clientWidth || 360;
    const altura = this.container.clientHeight || largura;
    const lado = Math.max(120, Math.min(largura, altura));
    this.lado = lado;

    // densidade da tela ao carregar (nunca a atual: com zoom ela sobe e o canvas virava
    // dezenas de milhões de pixels), no máximo 2, e no máximo ~1000 px por lado
    const dpr = Math.min(densidadeSegura(2), 1000 / lado);
    this.canvas.width = Math.round(lado * dpr);
    this.canvas.height = Math.round(lado * dpr);
    this.canvas.style.width = `${lado}px`;
    this.canvas.style.height = `${lado}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.svg.attr('width', lado).attr('height', lado);

    this.escalaX = d3.scaleLinear().domain(this.faixa).range([0, lado]);
    this.escalaY = d3.scaleLinear().domain(this.faixa).range([lado, 0]);
  }

  /**
   * Pinta a região de decisão. `valorContinuo(ponto)` devolve um número com sinal:
   * negativo puxa para a classe 0, positivo para a classe 1, e o módulo indica a
   * confiança — é o que produz a faixa clara de "indecisão" junto à fronteira.
   */
  desenharRegiao(treino, cores, rapido = false) {
    // A resolução alta (laboratório livre no PC) custa até ~90 ms numa rede grande: com o
    // treino rodando, a grade volta para a leve; parado, a fronteira sai nítida.
    const resolucao = rapido ? Math.min(RESOLUCAO_REGIAO, this.resolucao) : this.resolucao;
    if (this.canvasRegiao.width !== resolucao) {
      this.canvasRegiao.width = resolucao;
      this.canvasRegiao.height = resolucao;
      this.imagemRegiao = this.ctxRegiao.createImageData(resolucao, resolucao);
    }
    const dados = this.imagemRegiao.data;
    const faixa = this.faixa;
    const passo = (faixa[1] - faixa[0]) / (resolucao - 1);

    // todos os pontos da grade de uma vez: a rede calcula em lote (bem mais rápido com a
    // resolução maior); os neurônios únicos usam o valorContinuo ponto a ponto
    const pontos = new Array(resolucao * resolucao);
    for (let linha = 0; linha < resolucao; linha += 1) {
      // a imagem cresce para baixo, o eixo x2 cresce para cima: daí a inversão
      const x2 = faixa[1] - linha * passo;
      for (let coluna = 0; coluna < resolucao; coluna += 1) {
        const x1 = faixa[0] + coluna * passo;
        pontos[linha * resolucao + coluna] = this.entradas === 1 ? [x1] : [x1, x2];
      }
    }
    const valores = typeof treino.valoresContinuos === 'function'
      ? treino.valoresContinuos(pontos)
      : pontos.map((ponto) => treino.valorContinuo(ponto));

    // mistura das duas cores feita à mão, em números (antes, um d3.interpolateRgb e um
    // d3.color por célula, que leem texto: caro demais para a grade maior)
    const c0 = d3.rgb(cores.classe0);
    const c1 = d3.rgb(cores.classe1);

    for (let k = 0; k < valores.length; k += 1) {
      // achata o valor em [-1,1] de forma suave: perto da fronteira a cor fica
      // quase neutra, longe dela satura na cor da classe
      const intensidade = Math.tanh(valores[k] * 2.2) || 0;
      const mistura = (intensidade + 1) / 2;

      const posicao = k * 4;
      dados[posicao] = c0.r + (c1.r - c0.r) * mistura;
      dados[posicao + 1] = c0.g + (c1.g - c0.g) * mistura;
      dados[posicao + 2] = c0.b + (c1.b - c0.b) * mistura;
      // opacidade menor perto da fronteira: deixa o papel aparecer e evita que o
      // fundo compita com os pontos de dados
      dados[posicao + 3] = 60 + Math.abs(intensidade) * 150;
    }

    this.ctxRegiao.putImageData(this.imagemRegiao, 0, 0);
    this.ctx.clearRect(0, 0, this.lado, this.lado);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.drawImage(this.canvasRegiao, 0, 0, this.lado, this.lado);
  }

  desenharEixos(cores) {
    const { escalaX, escalaY, lado } = this;
    this.gEixos.selectAll('*').remove();

    if (this.escalaRotulo) {
      this.desenharEixosDeClassificacao(cores);
      return;
    }

    // grade discreta em 0 e 1, que são os únicos valores que as portas usam
    [0, 1].forEach((valor) => {
      this.gEixos.append('line')
        .attr('x1', escalaX(valor)).attr('x2', escalaX(valor))
        .attr('y1', 0).attr('y2', lado)
        .attr('stroke', cores.borda).attr('stroke-dasharray', '2 4').attr('opacity', 0.7);
      if (this.entradas === 2) {
        this.gEixos.append('line')
          .attr('x1', 0).attr('x2', lado)
          .attr('y1', escalaY(valor)).attr('y2', escalaY(valor))
          .attr('stroke', cores.borda).attr('stroke-dasharray', '2 4').attr('opacity', 0.7);
      }
    });

    this.gEixos.append('text')
      .attr('x', lado - 6).attr('y', lado - 8)
      .attr('text-anchor', 'end').attr('class', 'plano-rotulo-eixo')
      .attr('fill', cores.suave).text('x₁');
    if (this.entradas === 2) {
      this.gEixos.append('text')
        .attr('x', 8).attr('y', 16)
        .attr('class', 'plano-rotulo-eixo')
        .attr('fill', cores.suave).text('x₂');
    }
  }

  /**
   * Eixos dos conjuntos de classificação: grade a cada 2 unidades da escala original
   * (−6 a 6, como no Playground), eixos em 0 mais marcados, e números pequenos na borda.
   */
  desenharEixosDeClassificacao(cores) {
    const { escalaX, escalaY, lado } = this;
    const escala = this.escalaRotulo;
    const marcas = [-4, -2, 0, 2, 4];
    marcas.forEach((original) => {
      const valor = original / escala;
      const eixo = original === 0;
      this.gEixos.append('line')
        .attr('x1', escalaX(valor)).attr('x2', escalaX(valor)).attr('y1', 0).attr('y2', lado)
        .attr('stroke', cores.borda).attr('stroke-dasharray', eixo ? null : '2 4')
        .attr('opacity', eixo ? 0.9 : 0.6);
      this.gEixos.append('line')
        .attr('x1', 0).attr('x2', lado).attr('y1', escalaY(valor)).attr('y2', escalaY(valor))
        .attr('stroke', cores.borda).attr('stroke-dasharray', eixo ? null : '2 4')
        .attr('opacity', eixo ? 0.9 : 0.6);
      if (eixo) return;
      const texto = String(original).replace('-', '−');
      this.gEixos.append('text')
        .attr('x', escalaX(valor)).attr('y', lado - 6)
        .attr('text-anchor', 'middle').attr('class', 'plano-rotulo-eixo')
        .attr('fill', cores.suave).text(texto);
      this.gEixos.append('text')
        .attr('x', 6).attr('y', escalaY(valor) + 4)
        .attr('class', 'plano-rotulo-eixo')
        .attr('fill', cores.suave).text(texto);
    });
  }

  /**
   * Desenha os pontos. Para as portas, os 4 (ou 2) pontos da tabela-verdade, grandes e com
   * rótulo; para um conjunto de classificação, centenas de pontos pequenos, sem rótulo,
   * com o contorno escuro marcando quem está do lado errado.
   */
  desenharPontos(X, y, cores, destaque = -1, previsoes = null) {
    if (this.nuvem) {
      this.desenharNuvem(X, y, cores, previsoes);
      return;
    }
    const { escalaX, escalaY, entradas } = this;
    const pontos = X.map((x, i) => ({
      x: x[0],
      y: entradas === 1 ? 0.5 : x[1],
      coordenadas: x,
      rotulo: y[i],
      indice: i,
      errado: previsoes ? previsoes[i] !== y[i] : false,
    }));

    const selecao = this.gPontos.selectAll('g.ponto').data(pontos, (d) => d.indice);
    const entrada = selecao.enter().append('g').attr('class', 'ponto');
    entrada.append('circle').attr('class', 'ponto-halo');
    entrada.append('circle').attr('class', 'ponto-corpo');
    entrada.append('text').attr('class', 'ponto-rotulo');

    const todos = entrada.merge(selecao);
    todos.attr('transform', (d) => `translate(${escalaX(d.x)}, ${escalaY(d.y)})`);

    todos.select('.ponto-halo')
      .attr('r', (d) => (d.indice === destaque ? 20 : 13))
      .attr('fill', 'none')
      .attr('stroke', cores.realce)
      .attr('stroke-width', 2.8)
      // contorno escuro suave: o amarelo continua legível sobre o rosa, o ciano e o papel
      .style('filter', 'drop-shadow(0 0 1.5px rgba(0, 0, 0, 0.85))')
      .attr('opacity', (d) => (d.indice === destaque ? 1 : 0))
      // o anel em destaque responde ao mouse na área toda (e não só no traço fino), para o
      // título abaixo aparecer; os anéis apagados não interceptam nada
      .style('pointer-events', (d) => (d.indice === destaque ? 'all' : 'none'))
      .style('cursor', (d) => (d.indice === destaque ? 'help' : null));

    // Título (dica nativa do navegador) do ponto em avaliação: explica o que é o anel amarelo.
    todos.select('title').remove();
    todos.filter((d) => d.indice === destaque).append('title').text('Exemplo em avaliação neste passo');

    todos.select('.ponto-corpo')
      .attr('r', 9)
      .attr('fill', (d) => (d.rotulo === 1 ? cores.classe1 : cores.classe0))
      .attr('stroke', (d) => (d.errado ? cores.tinta : cores.superficie))
      .attr('stroke-width', (d) => (d.errado ? 2.5 : 2))
      .attr('stroke-dasharray', (d) => (d.errado ? '3 2' : null));

    todos.select('.ponto-rotulo')
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .attr('fill', cores.tinta)
      .text((d) => d.rotulo);

    selecao.exit().remove();
  }

  desenharNuvem(X, y, cores, previsoes) {
    const { escalaX, escalaY } = this;
    const raio = Math.max(3, Math.min(4.6, this.lado / 90));
    const selecao = this.gPontos.selectAll('circle.ponto-nuvem').data(X, (_, i) => i);
    selecao.exit().remove();
    selecao.enter().append('circle').attr('class', 'ponto-nuvem')
      .merge(selecao)
      .attr('cx', (d) => escalaX(d[0]))
      .attr('cy', (d) => escalaY(d[1]))
      .attr('r', raio)
      .attr('fill', (_, i) => (y[i] === 1 ? cores.classe1 : cores.classe0))
      .attr('stroke', (_, i) => (previsoes && previsoes[i] !== y[i] ? cores.tinta : cores.superficie))
      .attr('stroke-width', (_, i) => (previsoes && previsoes[i] !== y[i] ? 1.6 : 1));
  }

  /**
   * Desenha as retas de decisão. Cada item de `retas` é
   * { pontos: [{x,y},{x,y}], cor, tracejada, rotulo }.
   */
  desenharRetas(retas, cores) {
    const { escalaX, escalaY } = this;
    const selecao = this.gRetas.selectAll('line.reta').data(retas.filter((r) => r.pontos));

    const entrada = selecao.enter().append('line').attr('class', 'reta');
    const todos = entrada.merge(selecao);

    todos
      .attr('stroke', (d) => d.cor || cores.tinta)
      .attr('stroke-width', (d) => d.espessura || 2.5)
      .attr('stroke-dasharray', (d) => (d.tracejada ? '6 4' : null))
      .attr('stroke-linecap', 'round')
      .attr('opacity', (d) => d.opacidade ?? 1)
      // Sem transição: a reta vai para a posição exata no MESMO quadro em que o fundo
      // colorido é redesenhado. Antes ela "deslizava" por 140 ms, e nas velocidades rápida
      // e turbo (quadros a cada poucos ms) ficava sempre atrasada em relação às cores.
      .interrupt()
      .attr('x1', (d) => escalaX(d.pontos[0].x))
      .attr('y1', (d) => escalaY(d.pontos[0].y))
      .attr('x2', (d) => escalaX(d.pontos[1].x))
      .attr('y2', (d) => escalaY(d.pontos[1].y));

    selecao.exit().remove();
  }

  desenhar(treino, opcoes = {}) {
    this.ultimoTreino = treino;
    this.ultimasOpcoes = opcoes;
    const cores = coresDoTema(this.container);

    this.desenharRegiao(treino, cores, opcoes.rapido);
    this.desenharEixos(cores);
    this.desenharRetas(opcoes.retas || [], cores);

    const previsoes = treino.X.map((x) => treino.prever(x));
    this.desenharPontos(treino.X, treino.y, cores, opcoes.destaque ?? -1, previsoes);
    this.desenharRealce(opcoes.realce ?? null, treino, cores);
  }

  /**
   * Anel pulsando em volta do ponto mais próximo da reta e, ao lado dele, um botão "?" que abre
   * um balão com a explicação e a distância (`realce = { indice, titulo, paragrafos }`).
   * Resolve a dúvida de quem vê a reta passando rente a um ponto: de que lado ele está, e por
   * quê. O balão fica aberto até o leitor fechar (clicar no "?" de novo, fora dele ou Esc).
   */
  desenharRealce(realce, treino, cores) {
    const grupo = this.gRealce;
    grupo.selectAll('*').remove();
    if (!realce || this.nuvem || !treino.X[realce.indice]) {
      this.fecharBalaoRealce();
      this.realceAberto = false;
      return;
    }
    if (this.indiceDoRealce !== realce.indice) this.realceAberto = false;
    this.indiceDoRealce = realce.indice;

    const ponto = treino.X[realce.indice];
    const px = this.escalaX(ponto[0]);
    const py = this.entradas === 1 ? this.escalaY(0.5) : this.escalaY(ponto[1]);

    // contorno escuro por baixo: o anel amarelo continua legível sobre o rosa, o ciano e o papel
    grupo.append('circle')
      .attr('cx', px).attr('cy', py).attr('r', 17)
      .attr('fill', 'none').attr('stroke', 'rgba(0, 0, 0, 0.55)').attr('stroke-width', 5.5);
    grupo.append('circle').attr('class', 'plano-realce-anel')
      .attr('cx', px).attr('cy', py).attr('r', 17)
      .attr('fill', 'none').attr('stroke', cores.realce).attr('stroke-width', 2.8);

    // o botão "?": canto de cima à direita do ponto, ou do outro lado perto da borda
    const bx = Math.max(14, Math.min(this.lado - 14, px + (px > this.lado - 40 ? -26 : 26)));
    const by = Math.max(14, Math.min(this.lado - 14, py - 24));
    const botao = grupo.append('g').attr('class', 'plano-realce-botao')
      .attr('role', 'button').attr('tabindex', 0)
      .attr('aria-label', 'Por que a reta fica rente a este ponto? Abrir a explicação')
      .attr('aria-expanded', String(!!this.realceAberto))
      .style('pointer-events', 'all')
      .on('click', (evento) => { evento.stopPropagation(); this.alternarBalaoRealce(realce, bx, by); })
      .on('keydown', (evento) => {
        if (evento.key === 'Enter' || evento.key === ' ') {
          evento.preventDefault();
          this.alternarBalaoRealce(realce, bx, by);
        }
      });
    botao.append('circle').attr('class', 'plano-realce-botao-fundo').attr('cx', bx).attr('cy', by).attr('r', 11);
    botao.append('text').attr('class', 'plano-realce-botao-texto').attr('x', bx).attr('y', by)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central').text('?');

    if (this.realceAberto) this.mostrarBalaoRealce(realce, bx, by);
    else this.fecharBalaoRealce();
  }

  alternarBalaoRealce(realce, bx, by) {
    this.realceAberto = !this.realceAberto;
    this.gRealce.select('.plano-realce-botao').attr('aria-expanded', String(this.realceAberto));
    if (this.realceAberto) this.mostrarBalaoRealce(realce, bx, by);
    else this.fecharBalaoRealce();
  }

  fecharBalaoRealce() {
    this.balaoRealce?.remove();
    this.balaoRealce = null;
    if (this._fecharFora) {
      document.removeEventListener('pointerdown', this._fecharFora, true);
      document.removeEventListener('keydown', this._fecharEsc, true);
      this._fecharFora = null;
    }
    this.gRealce?.select('.plano-realce-botao').attr('aria-expanded', 'false');
  }

  mostrarBalaoRealce(realce, bx, by) {
    this.fecharBalaoRealce();
    const balao = document.createElement('div');
    balao.className = 'plano-balao';
    balao.setAttribute('role', 'dialog');
    balao.innerHTML = `<strong>${realce.titulo}</strong>${realce.paragrafos.map((t) => `<p>${t}</p>`).join('')}`;
    this.container.appendChild(balao);
    this.balaoRealce = balao;

    const largura = Math.min(300, this.lado - 12);
    balao.style.width = `${largura}px`;
    const altura = balao.offsetHeight;
    const esquerda = Math.max(6, Math.min(this.lado - largura - 6, bx - largura / 2));
    // abre para o lado com mais espaço e NUNCA cobre o botão: só a horizontal é limitada ao
    // quadro, na vertical o balão pode passar da borda (ele é maior que o espaço que sobra)
    const abaixo = by < this.lado / 2;
    const topo = abaixo ? by + 18 : by - 18 - altura;
    balao.style.left = `${Math.round(esquerda)}px`;
    balao.style.top = `${Math.round(topo)}px`;

    // fecha ao clicar fora do balão e do botão, ou com Esc
    this._fecharFora = (evento) => {
      if (balao.contains(evento.target) || evento.target.closest?.('.plano-realce-botao')) return;
      this.realceAberto = false;
      this.fecharBalaoRealce();
    };
    this._fecharEsc = (evento) => {
      if (evento.key !== 'Escape') return;
      this.realceAberto = false;
      this.fecharBalaoRealce();
    };
    document.addEventListener('pointerdown', this._fecharFora, true);
    document.addEventListener('keydown', this._fecharEsc, true);
    this.gRealce.select('.plano-realce-botao').attr('aria-expanded', 'true');
  }
}

/**
 * Curva de erro por época.
 *
 * O formato dela é parte do conteúdo: o Perceptron produz uma escada (contagem
 * inteira de erros), o Adaline e a rede produzem uma curva contínua descendo.
 */
export class GraficoDeErro {
  constructor(container) {
    this.container = container;
    this.svg = d3.select(container).append('svg').attr('class', 'grafico-erro-svg');
    this.gLinha = this.svg.append('g');
    this.gEixos = this.svg.append('g');
    // leitura sob o cursor: linha-guia, ponto na curva e uma caixinha com época e valor
    this.gLeitura = this.svg.append('g').attr('class', 'erro-leitura').style('display', 'none').attr('pointer-events', 'none');
    this.gLeitura.append('line').attr('class', 'erro-leitura-guia');
    this.gLeitura.append('circle').attr('class', 'erro-leitura-ponto').attr('r', 4);
    const caixa = this.gLeitura.append('g').attr('class', 'erro-leitura-caixa');
    caixa.append('rect').attr('rx', 6).attr('ry', 6);
    caixa.append('text').attr('class', 'erro-leitura-epoca');
    caixa.append('text').attr('class', 'erro-leitura-valor');
    this.cursorX = null; // posição do cursor dentro da área do gráfico (px), ou null
    this.alvoDoCursor = this.svg.append('rect').attr('class', 'erro-alvo').attr('fill', 'transparent');
    this.alvoDoCursor
      .on('pointermove pointerdown', (evento) => {
        this.cursorX = d3.pointer(evento, this.gLinha.node())[0];
        this.atualizarLeitura();
      })
      .on('pointerleave pointercancel', (evento) => {
        // No toque, o navegador manda "leave" logo depois de soltar o dedo: a leitura fica
        // na tela até um toque fora do gráfico (abaixo) ou outro toque nele.
        if (evento.pointerType && evento.pointerType !== 'mouse' && evento.type === 'pointerleave') return;
        this.cursorX = null;
        this.atualizarLeitura();
      });
    this._fecharLeituraFora = (evento) => {
      if (this.cursorX === null || this.container.contains(evento.target)) return;
      this.cursorX = null;
      this.atualizarLeitura();
    };
    document.addEventListener('pointerdown', this._fecharLeituraFora, true);

    this._observador = new ResizeObserver(() => this.redimensionar());
    this._observador.observe(container);
    this.redimensionar();
  }

  destruir() {
    this._observador.disconnect();
    document.removeEventListener('pointerdown', this._fecharLeituraFora, true);
  }

  redimensionar() {
    this.largura = this.container.clientWidth || 300;
    this.altura = this.container.clientHeight || 130;
    this.svg.attr('width', this.largura).attr('height', this.altura);
    if (this.ultimoHistorico) this.desenhar(this.ultimoHistorico, this.ultimoTipo);
  }

  desenhar(historico, tipoErro) {
    this.ultimoHistorico = historico;
    this.ultimoTipo = tipoErro;
    const cores = coresDoTema(this.container);
    // espaço em cima para o nome do eixo vertical e embaixo para o do horizontal
    const margem = { topo: 18, direita: 8, baixo: 30, esquerda: 34 };
    const largura = this.largura - margem.esquerda - margem.direita;
    const altura = this.altura - margem.topo - margem.baixo;

    if (largura <= 0 || altura <= 0) return;

    const maxEpoca = Math.max(4, d3.max(historico, (d) => d.epoca) ?? 4);
    // contagem de pontos errados: o eixo vai pelo menos até 1, em números inteiros
    const maxValor = tipoErro?.discreto
      ? Math.max(1, d3.max(historico, (d) => d.valor) ?? 1)
      : Math.max(1e-6, d3.max(historico, (d) => d.valor) ?? 1);

    const epocaInicial = historico[0]?.epoca ?? 0;
    const x = d3.scaleLinear().domain([epocaInicial, maxEpoca]).range([0, largura]);
    const yEscala = d3.scaleLinear().domain([0, maxValor * 1.12]).range([altura, 0]);

    this.gLinha.attr('transform', `translate(${margem.esquerda}, ${margem.topo})`);
    this.gEixos.attr('transform', `translate(${margem.esquerda}, ${margem.topo})`);

    // Épocas e contagens são inteiras: marcas só em números inteiros (antes, com poucas
    // épocas ou com erro máximo 1, o eixo repetia rótulos arredondados, como "0, 1, 1").
    const inteiras = (escala, quantas) => escala.ticks(quantas).filter((v) => Number.isInteger(v));
    this.gEixos.selectAll('*').remove();
    this.gEixos.append('g')
      .attr('transform', `translate(0, ${altura})`)
      .call(d3.axisBottom(x).tickValues(inteiras(x, 4)).tickFormat(d3.format('d')).tickSizeOuter(0));
    this.gEixos.append('g')
      .call(tipoErro?.discreto
        ? d3.axisLeft(yEscala).tickValues(inteiras(yEscala, 3)).tickFormat(d3.format('d')).tickSizeOuter(0)
        : d3.axisLeft(yEscala).ticks(3).tickSizeOuter(0).tickFormat(d3.format('.2f')));
    this.gEixos.selectAll('text').attr('fill', cores.suave).style('font-size', '10px');
    this.gEixos.selectAll('path, line').attr('stroke', cores.borda);

    // o que cada eixo é, bem pequeno: "época" embaixo à direita e a medida em cima à esquerda
    this.gEixos.append('text')
      .attr('class', 'erro-eixo-nome')
      .attr('x', largura)
      .attr('y', altura + 27)
      .attr('text-anchor', 'end')
      .attr('fill', cores.suave)
      .text('época →');
    this.gEixos.append('text')
      .attr('class', 'erro-eixo-nome')
      .attr('x', -margem.esquerda + 2)
      .attr('y', -7)
      .attr('text-anchor', 'start')
      .attr('fill', cores.suave)
      .text(`↑ ${nomeDoEixoY(tipoErro)}`);

    this.escalas = { x, y: yEscala, largura, altura, margem, cores };

    // O perceptron muda de erro em saltos (é uma contagem inteira), então a linha
    // usa degraus; os demais são contínuos e usam uma curva suave.
    const gerador = d3.line()
      .x((d) => x(d.epoca))
      .y((d) => yEscala(d.valor))
      .curve(tipoErro?.discreto ? d3.curveStepAfter : d3.curveMonotoneX);

    const area = d3.area()
      .x((d) => x(d.epoca))
      .y0(altura)
      .y1((d) => yEscala(d.valor))
      .curve(tipoErro?.discreto ? d3.curveStepAfter : d3.curveMonotoneX);

    const dadosArea = this.gLinha.selectAll('path.erro-area').data([historico]);
    dadosArea.enter().append('path').attr('class', 'erro-area')
      .merge(dadosArea)
      .attr('d', area)
      .attr('fill', cores.primaria)
      .attr('opacity', 0.14);

    const dadosLinha = this.gLinha.selectAll('path.erro-linha').data([historico]);
    dadosLinha.enter().append('path').attr('class', 'erro-linha')
      .merge(dadosLinha)
      .attr('d', gerador)
      .attr('fill', 'none')
      .attr('stroke', cores.primaria)
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round');

    // Gráfico em branco (antes de apertar ▶ e depois de ↺): os eixos ficam, e uma dica
    // ocupa o lugar da curva, para a área nunca parecer um buraco na página.
    this.gLinha.selectAll('text.erro-dica').remove();
    if (historico.length === 0) {
      // em telas estreitas o texto não cabe em uma linha: quebra em duas e encolhe um pouco
      const estreito = largura < 330;
      const linhas = estreito
        ? ['a curva do erro aparece aqui', 'quando o treino começa']
        : ['a curva do erro aparece aqui quando o treino começa'];
      const dica = this.gLinha.append('text')
        .attr('class', 'erro-dica')
        .attr('x', largura / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', cores.suave)
        .style('font-size', estreito ? '11.5px' : null);
      linhas.forEach((texto, i) => {
        dica.append('tspan').attr('x', largura / 2)
          .attr('y', altura / 2 + (i - (linhas.length - 1) / 2) * 15).text(texto);
      });
    }

    // a área que recebe o cursor cobre o gráfico INTEIRO (inclusive margens e eixos): o
    // usuário pode apontar para qualquer lugar, não só para a curva; a leitura acompanha a
    // época mais próxima na horizontal
    this.alvoDoCursor
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.largura)
      .attr('height', this.altura);
    this.atualizarLeitura();
  }

  /** Mostra (ou esconde) a leitura da época mais próxima do cursor. */
  atualizarLeitura() {
    const historico = this.ultimoHistorico ?? [];
    const e = this.escalas;
    if (this.cursorX === null || !e || historico.length === 0) {
      this.gLeitura.style('display', 'none');
      return;
    }
    const epocaNoCursor = e.x.invert(Math.max(0, Math.min(e.largura, this.cursorX)));
    const i = d3.bisector((d) => d.epoca).center(historico, epocaNoCursor);
    const ponto = historico[i];
    if (!ponto) return;

    const px = e.x(ponto.epoca);
    const py = e.y(ponto.valor);
    this.gLeitura
      .style('display', null)
      .attr('transform', `translate(${e.margem.esquerda}, ${e.margem.topo})`);
    this.gLeitura.select('.erro-leitura-guia')
      .attr('x1', px).attr('x2', px).attr('y1', 0).attr('y2', e.altura)
      .attr('stroke', e.cores.suave);
    this.gLeitura.select('.erro-leitura-ponto')
      .attr('cx', px).attr('cy', py)
      .attr('fill', e.cores.primaria);

    const caixa = this.gLeitura.select('.erro-leitura-caixa');
    const textoEpoca = caixa.select('.erro-leitura-epoca').text(`época ${ponto.epoca}`).attr('x', 8).attr('y', 15);
    const textoValor = caixa.select('.erro-leitura-valor').text(formatarValorDoErro(ponto.valor, this.ultimoTipo)).attr('x', 8).attr('y', 31);
    const larguraTexto = Math.max(textoEpoca.node().getComputedTextLength(), textoValor.node().getComputedTextLength());
    const larguraCaixa = Math.ceil(larguraTexto) + 16;
    const alturaCaixa = 39;
    caixa.select('rect').attr('width', larguraCaixa).attr('height', alturaCaixa);
    // a caixa fica ao lado do ponto, do lado que tiver espaço, e nunca sai do gráfico
    let cx = px + 10;
    if (cx + larguraCaixa > e.largura) cx = px - 10 - larguraCaixa;
    cx = Math.max(-e.margem.esquerda + 2, cx);
    let cy = py - alturaCaixa - 8;
    if (cy < -e.margem.topo + 2) cy = Math.min(e.altura - alturaCaixa, py + 10);
    caixa.attr('transform', `translate(${Math.round(cx)}, ${Math.round(cy)})`);
  }
}

/** O nome do eixo vertical, conforme a medida de erro de cada modelo. */
function nomeDoEixoY(tipoErro) {
  if (tipoErro?.discreto) return 'pontos errados';
  if (tipoErro?.titulo?.startsWith('Custo SSE')) return 'custo SSE';
  return 'custo E';
}

/** O valor na leitura: contagem inteira, ou custo com 3 casas (4 algarismos se for < 1). */
function formatarValorDoErro(valor, tipoErro) {
  if (tipoErro?.discreto) return `${valor} ${valor === 1 ? 'ponto errado' : 'pontos errados'}`;
  const texto = Math.abs(valor) >= 1 ? valor.toFixed(3) : String(Number(valor.toPrecision(4)));
  return `${nomeDoEixoY(tipoErro)} = ${texto}`;
}
