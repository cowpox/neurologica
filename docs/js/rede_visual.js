/**
 * Editor visual da rede — implementação da Decisão 7 do planejamento.
 *
 * Três ideias, todas emprestadas do TensorFlow Playground e adaptadas à paleta do
 * projeto:
 *
 * 1. MINI-GRÁFICO POR NEURÔNIO. Cada neurônio mostra um quadradinho com a sua
 *    própria saída sobre todo o plano de entrada. É o que responde "o que ESTE
 *    neurônio aprendeu?" — e é muito mais informativo que exibir o número da
 *    ativação, porque mostra a geometria.
 *
 * 2. CONEXÕES QUE CARREGAM INFORMAÇÃO. A espessura da linha é a magnitude do peso,
 *    a cor é o sinal (terracota positivo, azul negativo) e o brilho acompanha a
 *    ativação real do neurônio de origem. O brilho não é enfeite: é calculado a
 *    partir da ativação média nos dados de treino, então uma linha apagada
 *    significa mesmo um neurônio calado.
 *
 * 3. ARQUITETURA EDITÁVEL, com botões +/- de área de toque confortável.
 *
 * NOTA DE ARQUITETURA — por que tudo isto é um SVG só.
 *
 * A primeira versão montava os neurônios como elementos HTML em colunas flex, com
 * um SVG sobreposto desenhando as conexões por cima. Isso trouxe três defeitos que
 * só apareceram no telefone: as linhas se descolavam dos neurônios quando o
 * conteúdo rolava (as caixas rolavam, o SVG não), era preciso uma barra de rolagem
 * horizontal para caber uma rede grande, e ampliar um neurônio dependia de `:hover`
 * — que em tela de toque gruda e não desgruda.
 *
 * Agora a rede inteira vive num único SVG com `viewBox`. Como neurônios e conexões
 * passam a compartilhar o mesmo sistema de coordenadas, é impossível eles saírem
 * de alinhamento; e como o `viewBox` escala sozinho, a rede sempre cabe na tela,
 * sem rolagem, qualquer que seja o tamanho dela.
 */

import { ATIVACOES } from './treino_mlp.js';

const RESOLUCAO_MINIATURA = 22;
const MAX_CAMADAS = 4;
const MAX_NEURONIOS = 6;
const MIN_NEURONIOS = 1;

/** Regerar as miniaturas custa um `toDataURL` por neurônio; 110 ms é rápido o
 *  bastante para parecer contínuo e evita fazer isso 60 vezes por segundo. */
const INTERVALO_MINIATURAS = 110;

/* --------------------------------------------------------- ajuda (popover) */

export function criarAjuda(titulo, texto) {
  const embrulho = document.createElement('span');
  embrulho.className = 'ajuda';

  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'ajuda-botao';
  botao.setAttribute('aria-label', `Ajuda: ${titulo}`);
  botao.setAttribute('aria-expanded', 'false');
  botao.textContent = '?';

  const balao = document.createElement('span');
  balao.className = 'ajuda-balao';
  balao.setAttribute('role', 'tooltip');
  balao.innerHTML = `<strong>${titulo}</strong>${texto}`;

  const fechar = () => {
    embrulho.classList.remove('ajuda--aberta');
    botao.setAttribute('aria-expanded', 'false');
  };

  botao.addEventListener('click', (evento) => {
    evento.stopPropagation();
    const aberta = embrulho.classList.toggle('ajuda--aberta');
    botao.setAttribute('aria-expanded', String(aberta));
    if (aberta) {
      document.querySelectorAll('.ajuda--aberta').forEach((outra) => {
        if (outra !== embrulho) {
          outra.classList.remove('ajuda--aberta');
          outra.querySelector('.ajuda-botao')?.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('click', fechar, { once: true });
    }
  });
  balao.addEventListener('click', (evento) => evento.stopPropagation());

  embrulho.append(botao, balao);
  return embrulho;
}

function criarBotaoContador(rotulo, simbolo, aoClicar) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'contador-botao';
  botao.setAttribute('aria-label', rotulo);
  botao.textContent = simbolo;
  botao.addEventListener('click', aoClicar);
  return botao;
}

/* ------------------------------------------------------------- componente */

export class RedeVisual {
  /**
   * `editavel: false` esconde os botões +/− (a rede fixa 2-2-1 do Ato 3); o laboratório
   * livre usa a rede editável.
   */
  constructor(container, { aoMudarArquitetura, editavel = true } = {}) {
    this.container = container;
    this.aoMudarArquitetura = aoMudarArquitetura;
    this.editavel = editavel;
    this.container.classList.add('rede-visual');
    this.container.innerHTML = '';

    this.selecionado = null;
    this.ultimoDesenhoMiniaturas = 0;
    this.canvasPorNo = new Map();

    this.barraCamadas = document.createElement('div');
    this.barraCamadas.className = 'rede-barra-camadas';
    this.container.appendChild(this.barraCamadas);

    // controles por camada: ficam em HTML (área de toque de verdade) e são
    // posicionados sobre as colunas do SVG depois de cada desenho
    this.barraColunas = document.createElement('div');
    this.barraColunas.className = 'rede-barra-colunas';
    this.container.appendChild(this.barraColunas);

    this.svg = d3.select(container).append('svg')
      .attr('class', 'rede-desenho')
      .attr('preserveAspectRatio', 'xMidYMid meet');
    this.definirDefs();
    this.gConexoes = this.svg.append('g').attr('class', 'rede-conexoes');
    // faixas invisíveis e largas sobre cada ligação: o mouse acerta até as linhas finas
    this.gAlvos = this.svg.append('g').attr('class', 'rede-alvos');
    this.gNos = this.svg.append('g').attr('class', 'rede-nos');

    // a caixinha que mostra o peso da ligação sob o mouse
    this.conexaoEmFoco = null;
    this.dicaPeso = document.createElement('div');
    this.dicaPeso.className = 'rede-dica-peso';
    this.dicaPeso.hidden = true;
    this.dicaPeso.setAttribute('role', 'status');
    this.container.appendChild(this.dicaPeso);

    // clicar no vazio desfaz a seleção
    this.svg.on('click', () => this.selecionarNo(null));

    this._observador = new ResizeObserver(() => this.posicionarControles());
    this._observador.observe(container);
  }

  destruir() {
    this._observador.disconnect();
  }

  definirDefs() {
    const defs = this.svg.append('defs');

    const filtro = defs.append('filter')
      .attr('id', 'brilho-conexao')
      .attr('x', '-40%').attr('y', '-40%')
      .attr('width', '180%').attr('height', '180%');
    filtro.append('feGaussianBlur').attr('stdDeviation', 1.8).attr('result', 'borrado');
    const junta = filtro.append('feMerge');
    junta.append('feMergeNode').attr('in', 'borrado');
    junta.append('feMergeNode').attr('in', 'SourceGraphic');
  }

  definirTreino(treino) {
    const mudouArquitetura =
      !this.treino || this.treino.camadas.join() !== treino.camadas.join();
    this.treino = treino;
    if (mudouArquitetura) {
      this.selecionado = null;
      this.canvasPorNo.clear();
    }
    this.montarControles();
    this.atualizar(true);
  }

  /* ------------------------------------------------------------ controles */

  montarControles() {
    const treino = this.treino;

    this.barraCamadas.innerHTML = '';
    if (!this.editavel) {
      // arquitetura fixa: sem botões, e as barras não ocupam espaço
      this.barraCamadas.hidden = true;
      this.barraColunas.hidden = true;
      this.barraColunas.innerHTML = '';
      this.controlesDeCamada = null;
      return;
    }
    const grupo = document.createElement('div');
    grupo.className = 'contador';
    grupo.append(
      criarBotaoContador('Remover camada oculta', '−', () => this.alterarCamadas(-1)),
      criarBotaoContador('Adicionar camada oculta', '+', () => this.alterarCamadas(1)),
    );
    const rotulo = document.createElement('span');
    rotulo.className = 'contador-rotulo';
    const n = treino.camadas.length;
    rotulo.textContent = `${n} ${n === 1 ? 'camada oculta' : 'camadas ocultas'}`;
    grupo.appendChild(rotulo);
    grupo.appendChild(criarAjuda(
      'Camadas ocultas',
      'Cada camada transforma o que a anterior enxergou. Uma camada já basta para o ' +
      'XOR; mais camadas permitem recortes mais complicados, mas também deixam o ' +
      'treino mais lento e instável nestes dados minúsculos de 4 pontos.',
    ));
    this.barraCamadas.appendChild(grupo);

    this.barraColunas.innerHTML = '';
    this.controlesDeCamada = treino.camadas.map((largura, indice) => {
      const caixa = document.createElement('div');
      caixa.className = 'rede-controle-camada';

      // O número fica ENTRE os dois botões de propósito: assim o centro visual do
      // controle coincide com o centro da coluna, e basta centralizar a caixa
      // inteira sobre a coluna para o alinhamento ficar exato.
      const contador = document.createElement('div');
      contador.className = 'contador contador--compacto';

      const texto = document.createElement('span');
      texto.className = 'rede-coluna-titulo';
      texto.textContent = String(largura);

      contador.append(
        criarBotaoContador('Remover neurônio', '−', () => this.alterarNeuronios(indice, -1)),
        texto,
        criarBotaoContador('Adicionar neurônio', '+', () => this.alterarNeuronios(indice, 1)),
      );
      caixa.appendChild(contador);

      this.barraColunas.appendChild(caixa);
      return caixa;
    });
  }

  alterarCamadas(delta) {
    const camadas = [...this.treino.camadas];
    if (delta > 0 && camadas.length < MAX_CAMADAS) camadas.push(2);
    else if (delta < 0 && camadas.length > 1) camadas.pop();
    else return;
    this.aoMudarArquitetura?.(camadas);
  }

  alterarNeuronios(indiceCamada, delta) {
    const camadas = [...this.treino.camadas];
    const novo = camadas[indiceCamada] + delta;
    if (novo < MIN_NEURONIOS || novo > MAX_NEURONIOS) return;
    camadas[indiceCamada] = novo;
    this.aoMudarArquitetura?.(camadas);
  }

  /* --------------------------------------------------------------- layout */

  /**
   * Calcula onde cada neurônio fica, num espaço de coordenadas virtual.
   *
   * O tamanho do neurônio encolhe conforme a camada cresce, de modo que a altura
   * total fique praticamente constante — assim a proporção do desenho quase não
   * muda ao editar a rede, e ele nunca precisa de rolagem para caber.
   */
  calcularLayout() {
    const colunas = [this.treino.X[0].length, ...this.treino.camadas, 1];
    const nColunas = colunas.length;
    const maxNeuronios = Math.max(...colunas);

    // Rede maior, elementos só um POUCO menores. Antes a largura virtual crescia 190
    // unidades por coluna e o neurônio caía para 20: com 4 camadas de 6, o desenho
    // inteiro encolhia para ~40% e os neurônios ficavam com ~8 px na tela. Agora o
    // espaço entre colunas encurta conforme entram camadas, e o neurônio diminui
    // devagar (42 com até 2 por camada, 32 com 6).
    const espaco = Math.max(12, 20 - (maxNeuronios - 2) * 2);
    const tamanho = Math.max(30, 42 - Math.max(0, maxNeuronios - 2) * 2.5);
    const passoColuna = Math.max(118, 230 - (nColunas - 3) * 32);

    const margemLateral = 52;
    const larguraVirtual = Math.round(passoColuna * (nColunas - 1) + margemLateral * 2);
    const alturaConteudo = maxNeuronios * tamanho + (maxNeuronios - 1) * espaco;
    const margemVertical = 34;
    const alturaVirtual = Math.round(alturaConteudo + margemVertical * 2);

    const posicoes = colunas.map((quantidade, i) => {
      const x = margemLateral + (larguraVirtual - margemLateral * 2) *
        (nColunas === 1 ? 0.5 : i / (nColunas - 1));
      const altura = quantidade * tamanho + (quantidade - 1) * espaco;
      const inicio = (alturaVirtual - altura) / 2;
      return Array.from({ length: quantidade }, (_, j) => ({
        x,
        y: inicio + j * (tamanho + espaco) + tamanho / 2,
        tamanho,
      }));
    });

    return { larguraVirtual, alturaVirtual, posicoes, tamanho, colunas };
  }

  /* ------------------------------------------------------------- desenho */

  /** Quanto cada neurônio acende, em média, sobre os dados de treino.
   *  Inclui a camada de entrada (índice 0), medida pelo valor médio das entradas —
   *  sem isso, metade das conexões teria brilho constante, que é informação nenhuma. */
  intensidades() {
    const ativacoes = this.treino.propagar(this.treino.X);
    const faixa = ATIVACOES[this.treino.ativacao].faixa;
    const escala = Math.max(Math.abs(faixa[0]), Math.abs(faixa[1])) || 1;

    return ativacoes.map((camada, l) => {
      const divisor = l === 0 ? 1 : escala;
      const largura = camada[0].length;
      return Array.from({ length: largura }, (_, j) => {
        let soma = 0;
        for (let n = 0; n < camada.length; n += 1) soma += Math.abs(camada[n][j]);
        return Math.min(1, soma / camada.length / divisor);
      });
    });
  }

  cores() {
    const estilo = getComputedStyle(this.container);
    const ler = (nome) => estilo.getPropertyValue(nome).trim();
    return {
      classe1: d3.color(ler('--cor-classe-1')),
      classe0: d3.color(ler('--cor-classe-0')),
      tinta: ler('--cor-tinta'),
      superficie: ler('--cor-superficie'),
      borda: ler('--cor-borda-forte'),
      suave: ler('--cor-suave'),
    };
  }

  /** Gera (ou reaproveita) a imagem da miniatura de um neurônio. */
  imagemDaMiniatura(chave, valores, faixa, cores) {
    let entrada = this.canvasPorNo.get(chave);
    if (!entrada) {
      const canvas = document.createElement('canvas');
      canvas.width = RESOLUCAO_MINIATURA;
      canvas.height = RESOLUCAO_MINIATURA;
      const ctx = canvas.getContext('2d');
      entrada = { canvas, ctx, imagem: ctx.createImageData(RESOLUCAO_MINIATURA, RESOLUCAO_MINIATURA) };
      this.canvasPorNo.set(chave, entrada);
    }

    const dados = entrada.imagem.data;
    const [minimo, maximo] = faixa;
    const amplitude = maximo - minimo || 1;

    for (let linha = 0; linha < RESOLUCAO_MINIATURA; linha += 1) {
      // a grade vem com x2 crescendo para cima; a imagem cresce para baixo
      const origem = RESOLUCAO_MINIATURA - 1 - linha;
      for (let coluna = 0; coluna < RESOLUCAO_MINIATURA; coluna += 1) {
        const valor = valores[origem * RESOLUCAO_MINIATURA + coluna];
        const normalizado = Math.min(1, Math.max(0, (valor - minimo) / amplitude));
        const cor = d3.color(d3.interpolateRgb(cores.classe0, cores.classe1)(normalizado));
        const p = (linha * RESOLUCAO_MINIATURA + coluna) * 4;
        dados[p] = cor.r;
        dados[p + 1] = cor.g;
        dados[p + 2] = cor.b;
        dados[p + 3] = 255;
      }
    }
    entrada.ctx.putImageData(entrada.imagem, 0, 0);
    return entrada.canvas.toDataURL();
  }

  selecionarNo(chave) {
    this.selecionado = this.selecionado === chave ? null : chave;
    this.aplicarSelecao();
  }

  /** Aplica (ou remove) a ampliação do neurônio escolhido.
   *
   *  A ampliação em si é feita pelo CSS (`.rede-no--selecionado`), usando
   *  `transform-box: fill-box`, o que dispensa calcular translações à mão e deixa
   *  a transição suave. Aqui só se marca a classe e se traz o nó para a frente,
   *  já que em SVG a ordem no documento é a ordem de empilhamento.
   *
   *  É por clique, e não por `:hover`, porque em tela de toque o hover gruda e
   *  não há como desfazer — foi exatamente o que acontecia na versão anterior. */
  aplicarSelecao() {
    const selecionado = this.selecionado;
    this.gNos.selectAll('g.rede-no').each(function (d) {
      const grupo = d3.select(this);
      const ativo = d.chave === selecionado;
      grupo.classed('rede-no--selecionado', ativo);
      if (ativo) grupo.raise();
    });
  }

  atualizar(forcarMiniaturas = false) {
    if (!this.treino) return;
    const cores = this.cores();
    const layout = this.calcularLayout();
    const { larguraVirtual, alturaVirtual, posicoes } = layout;

    this.svg.attr('viewBox', `0 0 ${larguraVirtual} ${alturaVirtual}`);

    const agora = performance.now();
    const redesenharMiniaturas =
      forcarMiniaturas || agora - this.ultimoDesenhoMiniaturas > INTERVALO_MINIATURAS;
    if (redesenharMiniaturas) this.ultimoDesenhoMiniaturas = agora;

    this.desenharConexoes(layout, cores);
    this.desenharNos(layout, cores, redesenharMiniaturas);
    this.posicionarControles(layout);
  }

  desenharConexoes(layout, cores) {
    const intensidades = this.intensidades();
    const { posicoes, tamanho } = layout;
    const raio = tamanho / 2;
    const linhas = [];

    for (let l = 0; l < posicoes.length - 1; l += 1) {
      const pesos = this.treino.pesos[l];
      if (!pesos) continue;
      for (let i = 0; i < posicoes[l].length; i += 1) {
        for (let j = 0; j < posicoes[l + 1].length; j += 1) {
          const peso = pesos[i]?.[j];
          if (peso === undefined) continue;

          const de = posicoes[l][i];
          const para = posicoes[l + 1][j];
          // quanto sinal realmente atravessa este fio: o quanto a origem acende,
          // vezes o quanto este peso amplifica
          const forca = (intensidades[l]?.[i] ?? 0) * Math.min(1, Math.abs(peso) / 1.6);

          const x1 = de.x + raio;
          const x2 = para.x - raio;
          const meio = (x1 + x2) / 2;

          linhas.push({
            chave: `${l}-${i}-${j}`,
            l, i, j, peso,
            // curva suave: a horizontal pura fica dura e, com muitos neurônios,
            // vira um emaranhado ilegível de retas sobrepostas
            caminho: `M ${x1} ${de.y} C ${meio} ${de.y}, ${meio} ${para.y}, ${x2} ${para.y}`,
            cor: peso >= 0 ? cores.classe1.formatHex() : cores.classe0.formatHex(),
            // a espessura acompanha o tamanho do nó: em unidades fixas, uma rede
            // cheia (nós pequenos) viraria um borrão de linhas grossas demais
            espessura: (tamanho / 42) * Math.min(4.6, 0.6 + Math.abs(peso) * 1.5),
            opacidade: 0.14 + forca * 0.86,
            brilha: forca > 0.58,
          });
        }
      }
    }

    const foco = this.conexaoEmFoco;
    const selecao = this.gConexoes.selectAll('path').data(linhas, (d) => d.chave);
    selecao.exit().remove();
    selecao.enter().append('path')
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round')
      .merge(selecao)
      .attr('d', (d) => d.caminho)
      .attr('stroke', (d) => d.cor)
      // a ligação sob o mouse acende; as outras recuam um pouco
      .attr('stroke-width', (d) => (d.chave === foco ? Math.max(d.espessura * 1.6, tamanho / 14) : d.espessura))
      .attr('opacity', (d) => (foco ? (d.chave === foco ? 1 : d.opacidade * 0.45) : d.opacidade))
      .attr('filter', (d) => (d.brilha && !foco ? 'url(#brilho-conexao)' : null));
    if (foco) this.gConexoes.selectAll('path').filter((d) => d.chave === foco).raise();

    // faixas invisíveis para o mouse: ~12 px de largura na tela, qualquer que seja a escala
    const larguraNaTela = this.svg.node().getBoundingClientRect().width || 1;
    const larguraDoAlvo = 12 * (layout.larguraVirtual / larguraNaTela);
    const alvos = this.gAlvos.selectAll('path').data(linhas, (d) => d.chave);
    alvos.exit().remove();
    alvos.enter().append('path')
      .attr('class', 'rede-alvo')
      .attr('fill', 'none')
      .attr('stroke', 'transparent')
      .attr('stroke-linecap', 'round')
      .on('pointerenter pointermove', (evento, d) => this.focarConexao(d, evento))
      .on('pointerleave', () => this.focarConexao(null))
      .merge(alvos)
      .attr('d', (d) => d.caminho)
      .attr('stroke-width', larguraDoAlvo);

    // durante o treino o peso muda: a caixinha acompanha o valor de agora
    if (foco) {
      const atual = linhas.find((d) => d.chave === foco);
      if (atual) this.escreverDicaPeso(atual);
      else this.focarConexao(null);
    }
  }

  /** Nome curto de um neurônio para a caixinha do peso. */
  nomeDoNo(camada, indice) {
    if (camada === 0) return `x${indice + 1}`;
    if (camada === this.treino.camadas.length + 1) return 'saída';
    return `neurônio ${indice + 1} da camada ${camada}`;
  }

  escreverDicaPeso(d) {
    const sinal = d.peso >= 0 ? 'positivo' : 'negativo';
    this.dicaPeso.innerHTML =
      `<span class="rede-dica-rota">${this.nomeDoNo(d.l, d.i)} → ${this.nomeDoNo(d.l + 1, d.j)}</span>` +
      `<span class="rede-dica-valor rede-dica-valor--${sinal}">peso = ${d.peso.toFixed(3)}</span>`;
  }

  /** Mostra (ou esconde) o peso da ligação sob o mouse, perto do cursor. */
  focarConexao(d, evento) {
    const mudou = (d?.chave ?? null) !== this.conexaoEmFoco;
    this.conexaoEmFoco = d?.chave ?? null;
    if (!d) {
      this.dicaPeso.hidden = true;
    } else {
      this.escreverDicaPeso(d);
      this.dicaPeso.hidden = false;
      if (evento) {
        const base = this.container.getBoundingClientRect();
        const largura = this.dicaPeso.offsetWidth;
        let x = evento.clientX - base.left + 14;
        if (x + largura > base.width - 4) x = evento.clientX - base.left - 14 - largura;
        const y = evento.clientY - base.top - this.dicaPeso.offsetHeight - 12;
        this.dicaPeso.style.left = `${Math.max(4, x)}px`;
        this.dicaPeso.style.top = `${Math.max(4, y)}px`;
      }
    }
    if (mudou && this.treino) this.desenharConexoes(this.calcularLayout(), this.cores());
  }

  desenharNos(layout, cores, redesenharMiniaturas) {
    const { posicoes, tamanho } = layout;
    const nEntradas = this.treino.X[0].length;
    const nCamadas = this.treino.camadas.length;

    // a faixa das miniaturas é a mesma do plano de decisão (portas ou classificação)
    const faixa = this.treino.faixaDoPlano ?? [-0.5, 1.5];
    const mapa = redesenharMiniaturas ? this.treino.mapaDeAtivacoes(RESOLUCAO_MINIATURA, faixa) : null;
    const dados = [];

    posicoes.forEach((coluna, l) => {
      coluna.forEach((pos, j) => {
        const ehEntrada = l === 0;
        const ehSaida = l === posicoes.length - 1;
        const chave = `${l}-${j}`;
        let imagem = null;
        if (!ehEntrada && mapa) {
          const valores = mapa.porCamada[l - 1]?.[j];
          if (valores) {
            // a saída é sempre sigmoide, então vive em [0,1]; as ocultas seguem
            // a faixa da função de ativação escolhida
            const faixa = ehSaida ? [0, 1] : mapa.faixaAtivacao;
            imagem = this.imagemDaMiniatura(chave, valores, faixa, cores);
          }
        }
        dados.push({
          chave, x: pos.x, y: pos.y, tamanho, ehEntrada, ehSaida, imagem,
          rotulo: ehEntrada ? `x${j + 1}` : null,
          descricao: ehEntrada
            ? `entrada x${j + 1}`
            : ehSaida ? 'saída da rede' : `neurônio ${j + 1} da camada ${l}`,
        });
      });
    });

    const selecao = this.gNos.selectAll('g.rede-no').data(dados, (d) => d.chave);
    selecao.exit().remove();

    const entrada = selecao.enter().append('g')
      .attr('class', 'rede-no')
      .attr('tabindex', 0)
      .attr('role', 'button')
      .on('click', (evento, d) => {
        evento.stopPropagation();
        if (!d.ehEntrada) this.selecionarNo(d.chave);
      })
      .on('keydown', (evento, d) => {
        if (!d.ehEntrada && (evento.key === 'Enter' || evento.key === ' ')) {
          evento.preventDefault();
          this.selecionarNo(d.chave);
        }
      });
    entrada.append('title');
    entrada.append('image').attr('class', 'rede-miniatura');
    entrada.append('rect').attr('class', 'rede-no-moldura');
    entrada.append('circle').attr('class', 'rede-no-entrada');
    entrada.append('text').attr('class', 'rede-no-rotulo');

    const todos = entrada.merge(selecao);
    const raio = tamanho / 2;

    todos.select('title').text((d) => (d.ehEntrada
      ? d.descricao
      : `Mini-gráfico da ${d.descricao}. Clique para ampliar.`));

    todos.select('.rede-miniatura')
      .attr('x', (d) => d.x - raio).attr('y', (d) => d.y - raio)
      .attr('width', tamanho).attr('height', tamanho)
      .attr('preserveAspectRatio', 'none')
      .attr('display', (d) => (d.ehEntrada ? 'none' : null))
      .each(function (d) {
        // só troca o href quando há imagem nova, para não invalidar o desenho
        if (d.imagem) d3.select(this).attr('href', d.imagem);
      });

    todos.select('.rede-no-moldura')
      .attr('x', (d) => d.x - raio).attr('y', (d) => d.y - raio)
      .attr('width', tamanho).attr('height', tamanho)
      // cantos quase retos: a miniatura por baixo é um <image> retangular, então
      // um arredondamento forte deixaria as quinas dela aparecendo fora da moldura
      .attr('rx', 3).attr('ry', 3)
      .attr('fill', 'none')
      .attr('stroke', (d) => (d.ehSaida ? cores.tinta : cores.borda))
      .attr('stroke-width', (d) => (d.ehSaida ? 2 : 1))
      .attr('display', (d) => (d.ehEntrada ? 'none' : null));

    todos.select('.rede-no-entrada')
      .attr('cx', (d) => d.x).attr('cy', (d) => d.y)
      .attr('r', raio)
      .attr('fill', cores.superficie)
      .attr('stroke', cores.borda)
      .attr('stroke-width', 1)
      .attr('display', (d) => (d.ehEntrada ? null : 'none'));

    todos.select('.rede-no-rotulo')
      .attr('x', (d) => d.x).attr('y', (d) => d.y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', Math.max(9, tamanho * 0.36))
      .attr('fill', cores.tinta)
      .text((d) => d.rotulo ?? '');

    this.aplicarSelecao();
  }

  /**
   * Coloca os controles de cada camada exatamente sobre a coluna correspondente.
   *
   * Usa a matriz de transformação do próprio SVG (`getScreenCTM`) em vez de supor
   * uma proporção fixa: assim o alinhamento continua certo mesmo quando o
   * `preserveAspectRatio` sobra margem nas laterais.
   */
  posicionarControles(layout) {
    if (!this.treino || !this.controlesDeCamada) return;
    const dados = layout || this.calcularLayout();
    const no = this.svg.node();
    const ctm = no.getScreenCTM();
    if (!ctm) return;

    // A referência tem de ser a própria barra, que é o bloco posicionado onde os
    // controles vivem — e não o contêiner externo. Medir a partir do contêiner
    // ignorava o padding e a borda dele, e jogava todos os controles 9px à
    // direita das colunas.
    const base = this.barraColunas.getBoundingClientRect();
    const ponto = no.createSVGPoint();

    this.controlesDeCamada.forEach((caixa, indice) => {
      const coluna = dados.posicoes[indice + 1];
      if (!coluna) return;
      ponto.x = coluna[0].x;
      ponto.y = 0;
      const tela = ponto.matrixTransform(ctm);
      caixa.style.left = `${tela.x - base.left}px`;
    });
  }
}
