/**
 * Ilustração da superfície de erro (Ato 2, Q5): um terreno de erro desenhado só com CURVAS
 * DE NÍVEL, cada uma erguida na sua própria altura, e visto por uma câmera que flutua
 * devagar sobre ele. Como as curvas estão em alturas diferentes, o movimento da câmera faz
 * as linhas deslizarem umas sobre as outras em paralaxe: a sensação é de sobrevoar o
 * terreno. Uma bolinha repete em laço a descida do gradiente: os passos são calculados de
 * verdade sobre este mesmo terreno, de uma encosta até o fundo de um vale.
 *
 * O terreno tem vários vales e montanhas (uma tigela larga somada a morros e depressões
 * gaussianos) para ser bonito de sobrevoar; é uma ilustração da ideia de "descer ladeira
 * abaixo", não o custo exato do Adaline.
 *
 * Por que canvas ao vivo, e não um GIF ou vídeo pré-gerado: o GIF tem 256 cores e pesa
 * vários MB, nenhum dos dois acompanha o tema claro/escuro nem fica nítido em telas de alta
 * densidade. Aqui as curvas são calculadas UMA vez (d3.contours); cada quadro só as projeta,
 * agrupadas por intensidade (poucas dezenas de traços), e a taxa de quadros é limitada
 * (mais baixa no celular). A animação pausa fora da tela e com a aba escondida, e quem pede
 * menos movimento recebe um quadro parado.
 */

import { densidadeSegura, paginaComZoom } from './zoom_leve.js';

// ---------------------------------------------------------------- o terreno

const DOMINIO = 1.6;                 // pesos de -1,6 a 1,6 nos dois eixos
const ALTURA = 0.7;                  // escala vertical do erro
const QUANTAS_CURVAS = 46;
const SIMPLIFICACAO = 0.03;          // distância mínima entre pontos de uma curva

/** Morros (amplitude > 0) e vales (< 0): [centro u, centro v, largura, amplitude]. */
const RELEVO = [
  [-0.95, 0.75, 0.36, 0.9], [0.8, 0.95, 0.3, 0.75], [0.15, -1.05, 0.46, 0.42],
  [-1.15, -0.65, 0.3, 0.6], [1.2, -0.35, 0.28, 0.55], [-0.2, 1.25, 0.3, 0.5],
  [0.05, 0.1, 0.4, -0.66], [0.9, 0.1, 0.24, -0.45], [-0.75, -0.1, 0.28, -0.5],
  [0.4, 0.75, 0.22, -0.35], [-0.5, -1.05, 0.25, -0.35],
];

function erro(u, v) {
  let h = 0.03 * (u * u + v * v);
  for (const [x, y, s, a] of RELEVO) h += a * Math.exp(-((u - x) ** 2 + (v - y) ** 2) / (2 * s * s));
  return h;
}

function gradiente(u, v) {
  const e = 1e-4;
  return [(erro(u + e, v) - erro(u - e, v)) / (2 * e), (erro(u, v + e) - erro(u, v - e)) / (2 * e)];
}

// ---------------------------------------------------------------- a câmera

const DISTANCIA = 7.5;               // distância da câmera ao centro (perspectiva suave)
const AZIMUTE_BASE = 0.55;           // rad
const AZIMUTE_AMPLITUDE = 0.5;       // a câmera oscila ±29° em volta do terreno
const PERIODO_AZIMUTE = 110000;      // ms: bem devagar
const ELEVACAO_BASE = 0.42;          // rad acima do horizonte: vista mais deitada, quase rasante
const ELEVACAO_AMPLITUDE = 0.07;
const PERIODO_ELEVACAO = 73000;      // ms (fora de fase com o azimute: o trajeto não se repete igual)

const QUADROS_POR_SEGUNDO = 12;      // taxa baixa de propósito: o movimento é lento, 12/s já é fluido
const QUADROS_NO_CELULAR = 8;

// ---------------------------------------------------------------- a descida

const DURACAO_DA_DESCIDA = 24000;    // ms por volta da bolinha
const INICIO_DA_DESCIDA = 0.05;
const FIM_DA_DESCIDA = 0.74;
const COMECO_DO_FADE = 0.9;
const FIM_DO_FADE = 0.97;
const PASSOS = 16;
const TAXA = 0.12;
const PARTIDA = [0.9, -0.55];

const FAIXAS_DE_INTENSIDADE = 8;    // traços agrupados por opacidade (poucas chamadas por quadro)

/**
 * As curvas de nível (d3.contours sobre uma grade do terreno), em pedaços contínuos com
 * coordenadas (u, v). Os trechos que correm pela borda da grade são descartados: eles não
 * são curvas de nível, só o contorno do recorte.
 */
function construirCurvas(resolucao) {
  const M = resolucao;
  const passo = (2 * DOMINIO) / M;
  const valores = new Array((M + 1) * (M + 1));
  let minimo = Infinity;
  let maximo = -Infinity;
  for (let j = 0; j <= M; j += 1) {
    for (let i = 0; i <= M; i += 1) {
      const h = erro(-DOMINIO + i * passo, -DOMINIO + j * passo);
      valores[j * (M + 1) + i] = h;
      minimo = Math.min(minimo, h);
      maximo = Math.max(maximo, h);
    }
  }
  const niveis = Array.from({ length: QUANTAS_CURVAS }, (_, k) => minimo + ((k + 0.5) / QUANTAS_CURVAS) * (maximo - minimo));
  const contornos = window.d3.contours().size([M + 1, M + 1]).thresholds(niveis)(valores);
  const naBorda = ([i, j]) => i <= 0.5 || j <= 0.5 || i >= M + 0.5 || j >= M + 0.5;
  const curvas = [];
  contornos.forEach((contorno) => {
    const pedacos = [];
    contorno.coordinates.forEach((poligono) => poligono.forEach((anel) => {
      let atual = [];
      let pulado = null; // o último ponto pulado pela simplificação, se houver
      const fechar = () => {
        // o último ponto de cada trecho entra SEMPRE: sem isso, um anel fechado perdia o
        // ponto que o fecha e ficava com uma falha no lugar
        if (pulado) atual.push(pulado);
        if (atual.length > 1) pedacos.push(atual);
        atual = [];
        pulado = null;
      };
      anel.forEach((ponto) => {
        if (naBorda(ponto)) {
          fechar();
        } else {
          const u = -DOMINIO + (ponto[0] - 0.5) * passo;
          const v = -DOMINIO + (ponto[1] - 0.5) * passo;
          // simplifica: pula pontos colados ao anterior (metade dos pontos, mesmo desenho)
          const ultimo = atual.at(-1);
          if (!ultimo || Math.hypot(u - ultimo[0], v - ultimo[1]) > SIMPLIFICACAO) {
            atual.push([u, v, ...normal(u, v)]);
            pulado = null;
          } else {
            pulado = [u, v, ...normal(u, v)];
          }
        }
      });
      fechar();
    }));
    // anéis minúsculos (topos de morro, fundos de vale) viram polígonos serrilhados depois de
    // simplificados: ficam de fora
    const comprimento = (p) => p.reduce((l, q, i) => (i ? l + Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) : 0), 0);
    for (let k = pedacos.length - 1; k >= 0; k -= 1) if (comprimento(pedacos[k]) < 0.25) pedacos.splice(k, 1);
    curvas.push({ nivel: contorno.value, pedacos });
  });
  return curvas;
}

/** A normal do terreno desenhado (com a escala vertical), unitária. */
function normal(u, v) {
  const [gu, gv] = gradiente(u, v);
  const nx = -gu * ALTURA;
  const ny = -gv * ALTURA;
  const n = Math.hypot(nx, ny, 1);
  return [nx / n, ny / n, 1 / n];
}

/** A trilha: passos de verdade de gradiente descendente sobre o mesmo terreno. */
function construirTrilha() {
  const trilha = [];
  let [u, v] = PARTIDA;
  for (let k = 0; k < PASSOS; k += 1) {
    trilha.push([u, v, erro(u, v)]);
    const [gu, gv] = gradiente(u, v);
    u -= TAXA * gu;
    v -= TAXA * gv;
  }
  return trilha;
}

/**
 * Os instantes (frações do laço) em que a bolinha chega a cada passo: o tempo de cada trecho
 * cresce com a raiz do seu comprimento, então os passos grandes não passam num piscar e,
 * perto do fundo, ela desacelera.
 */
function instantesDeChegada(trilha) {
  const pesos = [0];
  for (let k = 1; k < trilha.length; k += 1) {
    const [u0, v0, h0] = trilha[k - 1];
    const [u1, v1, h1] = trilha[k];
    pesos.push(pesos[k - 1] + Math.sqrt(Math.hypot(u1 - u0, v1 - v0, (h1 - h0) * ALTURA)));
  }
  const total = pesos.at(-1) || 1;
  return pesos.map((p) => INICIO_DA_DESCIDA + (p / total) * (FIM_DA_DESCIDA - INICIO_DA_DESCIDA));
}

const suavizar = (x) => x * x * (3 - 2 * x);
const limitar = (x, a, b) => Math.min(b, Math.max(a, x));

/** Onde está a bolinha (posição contínua ao longo da trilha) e quantos passos já foram feitos. */
function estadoDaDescida(fase, trilha, chegadas) {
  if (fase <= chegadas[0]) return { indice: 0, ponto: trilha[0] };
  for (let k = 1; k < trilha.length; k += 1) {
    if (fase <= chegadas[k]) {
      const s = suavizar((fase - chegadas[k - 1]) / (chegadas[k] - chegadas[k - 1]));
      const a = trilha[k - 1];
      const b = trilha[k];
      const u = a[0] + (b[0] - a[0]) * s;
      const v = a[1] + (b[1] - a[1]) * s;
      return { indice: k - 1, ponto: [u, v, erro(u, v)] };
    }
  }
  return { indice: trilha.length - 1, ponto: trilha.at(-1) };
}

function opacidadeDoLaco(fase) {
  if (fase < COMECO_DO_FADE) return 1;
  if (fase < FIM_DO_FADE) return 1 - (fase - COMECO_DO_FADE) / (FIM_DO_FADE - COMECO_DO_FADE);
  return 0;
}

// ---------------------------------------------------------------- cores do tema

function lerCores(figura) {
  const estilo = getComputedStyle(figura);
  const token = (nome) => estilo.getPropertyValue(nome).trim();
  const secao = figura.closest('section');
  let fundo = secao ? getComputedStyle(secao).backgroundColor : '';
  if (!fundo || fundo === 'rgba(0, 0, 0, 0)' || fundo === 'transparent') fundo = token('--cor-superficie');
  return {
    linha: token('--cor-primaria'),
    linhaForte: token('--cor-primaria-forte'),
    texto: token('--cor-texto'),
    fundo,
    escuro: luminancia(fundo) < 0.4,
    serif: token('--fonte-serif') || 'Georgia, serif',
  };
}

/** Lê uma cor CSS (hex ou rgb) em [r, g, b]. */
function lerRgb(cor) {
  const texto = String(cor).trim();
  if (texto.startsWith('#')) {
    const h = texto.length === 4 ? texto.slice(1).split('').map((c) => c + c).join('') : texto.slice(1, 7);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  const numeros = texto.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  return numeros.slice(0, 3);
}

const luminancia = (cor) => {
  const [r, g, b] = lerRgb(cor);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

const comAlfa = (cor, alfa) => {
  const [r, g, b] = lerRgb(cor);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alfa)).toFixed(3)})`;
};

// ---------------------------------------------------------------- o desenho

export function desenharSuperficieDeErro(figura) {
  const canvas = figura?.querySelector('canvas');
  if (!canvas || !canvas.getContext || !window.d3) return;
  figura._superficie?.parar();

  const ctx = canvas.getContext('2d');
  const celular = window.matchMedia('(max-width: 720px)').matches;
  const curvas = construirCurvas(celular ? 80 : 110);
  const elevadas = curvas.flatMap((c) => c.pedacos.map((p) => ({ pontos: p, altura: c.nivel * ALTURA })));
  const trilha = construirTrilha();
  const chegadas = instantesDeChegada(trilha);
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
  const intervalo = 1000 / (celular ? QUADROS_NO_CELULAR : QUADROS_POR_SEGUNDO);

  let cores = lerCores(figura);
  let largura = 0;
  let altura = 0;
  let densidade = 1;
  let emCamada = false; // PC: a figura é uma camada atrás do texto, com degradê à esquerda
  let fimDoTexto = 0;
  let quadro = null;
  let ultimoQuadro = 0;
  let visivel = false;
  let inicio = performance.now();
  let pausadoEm = null;

  function medir() {
    const caixa = canvas.getBoundingClientRect();
    // o que pesa é rasterizar: densidade 1 no PC (linhas finas de 1 px continuam nítidas) e
    // no máximo 1,5 no celular, que tem tela pequena
    densidade = Math.min(densidadeSegura(celular ? 1.5 : 1), 1400 / Math.max(1, caixa.width));
    largura = Math.max(1, caixa.width);
    altura = Math.max(1, caixa.height);
    canvas.width = Math.round(largura * densidade);
    canvas.height = Math.round(altura * densidade);
    emCamada = getComputedStyle(figura).position === 'absolute';
    // onde o texto termina, medido a partir da borda esquerda do canvas (para o degradê)
    const texto = figura.parentElement?.querySelector('.texto-coluna');
    fimDoTexto = emCamada && texto ? texto.getBoundingClientRect().right - caixa.left : 0;
  }

  /** Projeção em perspectiva para a câmera de agora. Devolve [x, y, profundidade, escala]. */
  function criarProjecao(azimute, elevacao) {
    const ca = Math.cos(azimute);
    const sa = Math.sin(azimute);
    const ce = Math.cos(elevacao);
    const se = Math.sin(elevacao);
    // no PC o terreno fica à direita (a esquerda some no degradê sob o texto); no telefone e
    // no tablet, centralizado
    const escala = Math.min(largura * (emCamada ? 0.3 : 0.37), altura * 0.62);
    const cx = largura * (emCamada ? 0.62 : 0.5);
    const cy = altura * 0.52;
    const projetar = (u, v, z) => {
      const xr = u * ca - v * sa;
      const yr = u * sa + v * ca;
      const telaY = z * ce + yr * se;           // o que está longe sobe na tela
      const prof = yr * ce - z * se;            // > 0: mais longe da câmera
      const p = DISTANCIA / (DISTANCIA + prof);
      return [cx + xr * p * escala, cy - telaY * p * escala, prof, p];
    };
    // direção (no mundo) de quem olha: serve para achar as encostas vistas de raspão
    projetar.paraCamera = [-ce * sa, -ce * ca, se];
    return projetar;
  }

  /**
   * Intensidade de cada trecho: neblina pela profundidade (é o que dá corpo à paralaxe) e
   * um esmaecer nas bordas do terreno, que assim termina sem recorte.
   */
  function intensidade(prof, u, v, raspao) {
    const neblina = limitar(0.95 - (prof + 1.6) * 0.24, 0.12, 0.95);
    const r = Math.hypot(u, v) / DOMINIO;
    const borda = 1 - suavizar(limitar((r - 0.5) / 0.45, 0, 1));
    // encosta vista de raspão: as curvas se amontoam na tela e virariam uma mancha clara
    const frente = 0.34 + 0.66 * suavizar(limitar((raspao - 0.1) / 0.5, 0, 1));
    return neblina * borda * frente;
  }

  /** Junta os segmentos por faixa de intensidade e desenha cada faixa num traço só. */
  function tracarCurvas(projetar) {
    const faixas = Array.from({ length: FAIXAS_DE_INTENSIDADE }, () => new Path2D());
    const [cu, cv, cz] = projetar.paraCamera;
    for (const { pontos, altura: h } of elevadas) {
      let anterior = null;
      let uAnterior = 0;
      let vAnterior = 0;
      for (const [u, v, nx, ny, nz] of pontos) {
        const atual = projetar(u, v, h);
        if (anterior) {
          const raspao = nx * cu + ny * cv + nz * cz;
          const alfa = intensidade((anterior[2] + atual[2]) / 2, (u + uAnterior) / 2, (v + vAnterior) / 2, raspao);
          // Antes, trechos abaixo de 4% eram descartados, e nas encostas vistas de raspão
          // isso abria falhas no MEIO das linhas. Agora todo trecho é desenhado (no mínimo
          // na faixa mais fraca); só a borda do terreno, já quase transparente, fica de fora.
          if (alfa > 0.008) {
            const f = faixas[Math.max(0, Math.round(alfa * (FAIXAS_DE_INTENSIDADE - 1)))];
            f.moveTo(anterior[0], anterior[1]);
            f.lineTo(atual[0], atual[1]);
          }
        }
        anterior = atual;
        uAnterior = u;
        vAnterior = v;
      }
    }
    ctx.strokeStyle = cores.linha;
    ctx.lineWidth = celular ? 0.9 : 1.05;
    faixas.forEach((caminho, i) => {
      ctx.globalAlpha = (i + 0.5) / FAIXAS_DE_INTENSIDADE;
      ctx.stroke(caminho);
    });
    ctx.globalAlpha = 1;
  }

  function tracarPolilinha(pontos, projetar) {
    ctx.beginPath();
    pontos.forEach(([u, v, h], i) => {
      const [x, y] = projetar(u, v, h * ALTURA + 0.012);
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    });
    ctx.stroke();
  }

  function rotulo(texto, x, y, alinhamento = 'left') {
    ctx.font = `italic ${largura < 480 ? 14 : 16}px ${cores.serif}`;
    // nunca sai do quadro: perto da borda direita, o rótulo passa para o outro lado do ponto
    if (alinhamento === 'left' && x + ctx.measureText(texto).width > largura - 6) {
      alinhamento = 'right';
      x -= 24;
    }
    ctx.textAlign = alinhamento;
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = cores.fundo;
    ctx.strokeText(texto, x, y);
    ctx.fillStyle = cores.texto;
    ctx.fillText(texto, x, y);
  }

  function desenhar(agora) {
    const t = agora - inicio;
    const parado = semMovimento.matches;
    const azimute = AZIMUTE_BASE + (parado ? 0 : AZIMUTE_AMPLITUDE * Math.sin((2 * Math.PI * t) / PERIODO_AZIMUTE));
    const elevacao = ELEVACAO_BASE + (parado ? 0 : ELEVACAO_AMPLITUDE * Math.sin((2 * Math.PI * t) / PERIODO_ELEVACAO));
    const projetar = criarProjecao(azimute, elevacao);

    ctx.setTransform(densidade, 0, 0, densidade, 0, 0);
    ctx.clearRect(0, 0, largura, altura);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1) as curvas de nível, cada uma na sua altura
    tracarCurvas(projetar);

    // 2) a trilha percorrida, os passos e a bolinha
    const fase = parado ? 1 : (t % DURACAO_DA_DESCIDA) / DURACAO_DA_DESCIDA;
    const descida = parado ? { indice: trilha.length - 1, ponto: trilha.at(-1) } : estadoDaDescida(fase, trilha, chegadas);
    const opacidade = parado ? 1 : opacidadeDoLaco(fase);
    if (opacidade > 0) {
      const percorridos = trilha.slice(0, descida.indice + 1);
      ctx.save();
      ctx.globalAlpha = opacidade;
      ctx.strokeStyle = cores.linhaForte;
      ctx.lineWidth = 2.6;
      tracarPolilinha([...percorridos, descida.ponto], projetar);

      percorridos.forEach(([u, v, h]) => {
        const [x, y, , p] = projetar(u, v, h * ALTURA + 0.012);
        ctx.beginPath();
        ctx.arc(x, y, 3.2 * p, 0, Math.PI * 2);
        ctx.fillStyle = cores.fundo;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      const [bx, by, , bp] = projetar(descida.ponto[0], descida.ponto[1], descida.ponto[2] * ALTURA + 0.012);
      desenharBrilho(projetar, percorridos.at(-1), [bx, by, bp], fase, t, opacidade);
      ctx.globalAlpha = opacidade;
      ctx.fillStyle = cores.linhaForte;
      ctx.shadowColor = cores.linha;
      ctx.shadowBlur = (cores.escuro ? 14 : 8) * opacidade;
      ctx.beginPath();
      ctx.arc(bx, by, 7.5 * bp, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = cores.fundo;
      ctx.stroke();
      // o miolo: um ponto claro no centro, como uma luz
      ctx.globalAlpha = 0.85 * opacidade;
      ctx.fillStyle = cores.escuro ? '#eafff3' : '#ffffff';
      ctx.beginPath();
      ctx.arc(bx - 1.6 * bp, by - 1.6 * bp, 2.2 * bp, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3) rótulos, presos ao terreno (andam com a câmera)
    desenharRotulos(projetar);

    // 4) o degradê à esquerda, feito no próprio canvas (uma máscara CSS faria o navegador
    //    recompor a camada inteira a cada quadro): quase transparente sob o texto, pleno depois
    if (emCamada) {
      const degrade = ctx.createLinearGradient(0, 0, Math.min(largura, fimDoTexto + 240), 0);
      const fracaoTexto = Math.max(0, fimDoTexto) / Math.max(1, Math.min(largura, fimDoTexto + 240));
      degrade.addColorStop(0, 'rgba(0,0,0,0)');
      degrade.addColorStop(fracaoTexto, 'rgba(0,0,0,0.22)');
      degrade.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = degrade;
      ctx.fillRect(0, 0, largura, altura);
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  /**
   * Brilho da bolinha: um halo verde que pulsa devagar e um rastro de luz no trecho que ela
   * acabou de percorrer. Forte enquanto ela desce, mais discreto parada no fundo. No tema
   * escuro a luz é somada ao fundo ('lighter'), como num brilho de cinema; no claro, que
   * não tem como clarear o papel, ela vira uma aura suave.
   */
  function desenharBrilho(projetar, anterior, [bx, by, bp], fase, t, opacidade) {
    const descendo = fase > INICIO_DA_DESCIDA && fase < FIM_DA_DESCIDA;
    const forca = opacidade * (descendo ? 1 : 0.5);
    if (forca <= 0) return;
    const pulso = 1 + 0.14 * Math.sin(t / 240);
    ctx.save();
    ctx.globalCompositeOperation = cores.escuro ? 'lighter' : 'source-over';

    // rastro: do último passo até a bolinha, mais largo e desfocado
    if (descendo && anterior) {
      const [ax, ay] = projetar(anterior[0], anterior[1], anterior[2] * ALTURA + 0.012);
      const rastro = ctx.createLinearGradient(ax, ay, bx, by);
      rastro.addColorStop(0, comAlfa(cores.linha, 0));
      rastro.addColorStop(1, comAlfa(cores.linha, 0.55 * forca));
      ctx.strokeStyle = rastro;
      ctx.lineWidth = 7 * bp;
      ctx.lineCap = 'round';
      ctx.shadowColor = cores.linha;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // halo: luz radial que pulsa
    const raio = (cores.escuro ? 52 : 40) * bp * pulso;
    const halo = ctx.createRadialGradient(bx, by, 0, bx, by, raio);
    halo.addColorStop(0, comAlfa(cores.linha, (cores.escuro ? 0.6 : 0.42) * forca));
    halo.addColorStop(0.28, comAlfa(cores.linha, (cores.escuro ? 0.24 : 0.18) * forca));
    halo.addColorStop(1, comAlfa(cores.linha, 0));
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(bx, by, raio, 0, Math.PI * 2);
    ctx.fill();

    // um anel fino que se expande e some, como uma onda de luz, a cada ~1,6 s
    const onda = (t % 1600) / 1600;
    ctx.globalAlpha = (1 - onda) * 0.5 * forca;
    ctx.strokeStyle = cores.linha;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(bx, by, (9 + onda * 26) * bp, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function desenharRotulos(projetar) {
    const [xi, yi] = projetar(trilha[0][0], trilha[0][1], trilha[0][2] * ALTURA);
    rotulo('começo', xi + 12, yi - 10);
    const fim = trilha.at(-1);
    const [xf, yf] = projetar(fim[0], fim[1], fim[2] * ALTURA);
    rotulo('fundo do vale', xf, yf + 30, 'center');
  }

  // taxa de quadros limitada: o movimento é lento, e assim o celular não esquenta
  function laco(agora) {
    if (agora - ultimoQuadro >= intervalo - 1) {
      ultimoQuadro = agora;
      desenhar(agora);
    }
    quadro = requestAnimationFrame(laco);
  }

  function tocar() {
    // com zoom nos dedos o navegador rasteriza tudo de novo na escala nova: o desenho para
    if (quadro !== null || semMovimento.matches || !visivel || document.hidden || paginaComZoom()) return;
    if (pausadoEm !== null) {
      inicio += performance.now() - pausadoEm; // retoma de onde parou
      pausadoEm = null;
    }
    quadro = requestAnimationFrame(laco);
  }

  function pausar() {
    if (quadro === null) return;
    cancelAnimationFrame(quadro);
    quadro = null;
    pausadoEm = performance.now();
  }

  const redesenharParado = () => desenhar(pausadoEm ?? performance.now());

  medir();
  redesenharParado();

  const aoRedimensionar = new ResizeObserver(() => { medir(); redesenharParado(); });
  aoRedimensionar.observe(canvas);

  const observador = new IntersectionObserver((entradas) => {
    visivel = entradas.some((e) => e.isIntersecting);
    if (visivel) tocar(); else pausar();
  }, { threshold: 0.05 });
  observador.observe(figura);

  const aoMudarZoom = () => { if (paginaComZoom()) pausar(); else tocar(); };
  document.addEventListener('neurologica:zoom', aoMudarZoom);

  const aoMudarVisibilidade = () => { if (document.hidden) pausar(); else tocar(); };
  document.addEventListener('visibilitychange', aoMudarVisibilidade);

  const aoMudarMovimento = () => { if (semMovimento.matches) { pausar(); redesenharParado(); } else tocar(); };
  semMovimento.addEventListener('change', aoMudarMovimento);

  // troca de tema (botão do cabeçalho ou preferência do sistema): relê as cores
  const aoMudarTema = () => requestAnimationFrame(() => { cores = lerCores(figura); redesenharParado(); });
  const temaDoSistema = window.matchMedia('(prefers-color-scheme: dark)');
  document.addEventListener('neurologica:tema', aoMudarTema);
  temaDoSistema.addEventListener('change', aoMudarTema);
  // a fonte dos rótulos pode chegar depois do primeiro quadro
  document.fonts?.ready?.then(redesenharParado);

  figura._superficie = {
    parar() {
      pausar();
      aoRedimensionar.disconnect();
      observador.disconnect();
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
      document.removeEventListener('neurologica:zoom', aoMudarZoom);
      semMovimento.removeEventListener('change', aoMudarMovimento);
      document.removeEventListener('neurologica:tema', aoMudarTema);
      temaDoSistema.removeEventListener('change', aoMudarTema);
      figura._superficie = null;
    },
  };
}
