/**
 * Gavetas das funções de ativação (Ato 3, Q4): degrau, linear, sigmoide, tanh, ReLU, Leaky
 * ReLU, ELU, Swish e GELU.
 *
 * Cada gaveta traz a fórmula e a derivada em KaTeX, o que a função faz, o seu limite e,
 * embaixo, o gráfico de f(z) e f′(z). Fonte única: sigmoide, tanh e ReLU vêm do MESMO
 * objeto `ATIVACOES` que o treino usa, e a derivada é calculada como
 * `derivadaDaSaida(f(z))`, exatamente como no backpropagation — o que se vê é o que
 * treina. O degrau vem de `dados.js`; a linear é a saída do Adaline.
 *
 * Os gráficos são estáticos (SVG com viewBox, sem canvas e sem animação), desenhados uma
 * vez e de novo só ao trocar o tema, porque as cores vêm das variáveis --grafico-*.
 * Descontinuidades (o salto do degrau, o canto da ReLU) são marcadas com ponto aberto e
 * ponto fechado, em vez de uma reta vertical que sugeriria valores que não existem.
 */

import { degrau } from './dados.js';
import { ATIVACOES } from './treino_mlp.js';

const FUNCOES = [
  {
    chave: 'degrau',
    nome: 'Degrau',
    uso: 'Perceptron',
    formula: 'f(z) = \\begin{cases} 1 & z \\ge 0 \\\\ 0 & z < 0 \\end{cases}',
    derivada: "f'(z) = 0 \\;\\; (z \\neq 0), \\quad \\text{indefinida em } z = 0",
    faz: 'Decide de forma seca: liga ou não liga. É a ativação do Perceptron.',
    limite: 'A inclinação é zero em toda parte (e não existe no salto): o gradiente não tem por onde passar. Serve para decidir, não para treinar uma rede.',
    f: (z) => degrau(z),
    df: () => 0,
    eixoY: [-0.3, 1.3],
    saltos: { f: [{ z: 0, aberto: 0, fechado: 1 }], df: [{ z: 0, aberto: 0 }] },
  },
  {
    chave: 'linear',
    nome: 'Linear (identidade)',
    uso: 'Adaline',
    formula: 'f(z) = z',
    derivada: "f'(z) = 1",
    faz: 'Não decide nada: devolve a própria soma. É a saída do Adaline, e é por isso que ele sabe o quanto errou.',
    limite: 'Empilhar camadas lineares dá outra função linear: uma reta só, por mais camadas que existam.',
    f: (z) => z,
    df: () => 1,
    eixoY: [-4.2, 4.2],
  },
  {
    chave: 'sigmoide',
    nome: 'Sigmoide',
    uso: 'rede',
    formula: 'f(z) = \\sigma(z) = \\dfrac{1}{1+e^{-z}}',
    derivada: "f'(z) = \\sigma(z)\\,\\bigl(1-\\sigma(z)\\bigr)",
    faz: 'Achata qualquer número para o intervalo (0, 1), que dá para ler como uma probabilidade. A saída da nossa rede é sempre uma sigmoide.',
    limite: 'Nas pontas ela fica quase plana (satura): a derivada, que no máximo vale 0,25, cai para perto de zero e o aprendizado emperra.',
    eixoY: [-0.3, 1.3],
  },
  {
    chave: 'tanh',
    nome: 'Tangente hiperbólica (tanh)',
    uso: 'rede',
    formula: 'f(z) = \\tanh(z) = \\dfrac{e^{z}-e^{-z}}{e^{z}+e^{-z}}',
    derivada: "f'(z) = 1-\\tanh^2(z)",
    faz: 'Parecida com a sigmoide, mas vai de −1 a 1 e é centrada em zero, o que costuma acelerar o treino. A derivada chega a 1.',
    limite: 'Também satura nas pontas: longe de zero, a inclinação some.',
    eixoY: [-1.3, 1.3],
  },
  {
    chave: 'relu',
    nome: 'ReLU',
    uso: 'rede',
    formula: 'f(z) = \\max(0,\\, z)',
    derivada: "f'(z) = \\begin{cases} 1 & z > 0 \\\\ 0 & z < 0 \\end{cases}",
    faz: 'Deixa passar o que é positivo e zera o resto. É barata de calcular e não satura para z > 0.',
    limite: 'Um neurônio que fica sempre na parte negativa nunca mais recebe gradiente: é o "neurônio morto". Em z = 0 a derivada não existe; o código usa 0.',
    eixoY: [-0.6, 4.2],
    saltos: { df: [{ z: 0, aberto: 1, fechado: 0 }] },
  },
  {
    chave: 'leaky',
    nome: 'Leaky ReLU',
    uso: 'rede',
    formula: 'f(z) = \\begin{cases} z & z > 0 \\\\ 0{,}01\\,z & z \\le 0 \\end{cases}',
    derivada: "f'(z) = \\begin{cases} 1 & z > 0 \\\\ 0{,}01 & z < 0 \\end{cases}",
    faz: 'A ReLU com uma correção: o lado negativo não é zerado, ganha uma inclinação pequena (aqui 0,01). Assim sobra sempre um fiozinho de gradiente.',
    limite: 'Resolve o neurônio morto, mas a inclinação (0,01) é um número escolhido à mão, e a quina em z = 0 continua. No XOR com dois neurônios ocultos ela se comporta quase igual à ReLU (η = 2: mediana de 844 épocas contra 843 da ReLU), porque aqui o que atrapalha não é o neurônio morto.',
    eixoY: [-0.6, 4.2],
    saltos: { df: [{ z: 0, aberto: 0.01, fechado: 0.01 }] },
  },
  {
    chave: 'elu',
    nome: 'ELU',
    uso: 'rede',
    formula: 'f(z) = \\begin{cases} z & z > 0 \\\\ e^{z} - 1 & z \\le 0 \\end{cases}',
    derivada: "f'(z) = \\begin{cases} 1 & z > 0 \\\\ e^{z} & z < 0 \\end{cases}",
    faz: 'Igual à ReLU para z > 0. Para z < 0 ela curva suavemente até −1, sem quina: a derivada passa de 0 a 1 sem salto.',
    limite: 'Calcular e^z custa mais que uma comparação, e para z muito negativo ela satura em −1, como a sigmoide. No laboratório (XOR, dois ocultos, η = 2, 40 sementes) ela empacou 6 vezes; a ReLU, 101.',
    eixoY: [-1.4, 4.2],
  },
  {
    chave: 'swish',
    nome: 'Swish (SiLU)',
    uso: 'rede',
    formula: 'f(z) = z\\,\\sigma(z) = \\dfrac{z}{1+e^{-z}}',
    derivada: "f'(z) = \\sigma(z)\\,\\bigl(1+z\\,(1-\\sigma(z))\\bigr)",
    faz: 'A própria entrada, multiplicada pela sigmoide dela: suave em todo lugar. Desce um pouco abaixo de zero antes de subir, e por isso a derivada passa de 1 por um instante.',
    limite: 'Não é monótona: a mesma saída pode vir de dois valores de z. Por isso a derivada não dá para escrever só pela saída, e o treino guarda o z. No laboratório (XOR, dois ocultos, η = 2, 40 sementes) ela nunca precisou de reinício.',
    eixoY: [-1, 4.2],
  },
  {
    chave: 'gelu',
    nome: 'GELU',
    uso: 'rede',
    formula: 'f(z) \\approx \\tfrac{1}{2}\\,z\\left(1+\\tanh\\!\\left(\\sqrt{2/\\pi}\\,(z+0{,}044715\\,z^{3})\\right)\\right)',
    derivada: "f'(z) = \\tfrac{1}{2}(1+t) + \\tfrac{1}{2}\\,z\\,(1-t^{2})\\sqrt{2/\\pi}\\,(1+0{,}134\\,z^{2})",
    faz: 'Parecida com a Swish, é a ativação dos modelos de linguagem atuais (os transformers). Aqui usamos a aproximação por tanh, a mais comum; na derivada, t é a tanh de dentro dos parênteses.',
    limite: 'A fórmula é mais longa, e o ganho sobre a ReLU aparece em redes grandes. Nestes dados minúsculos de 4 pontos, ela se comporta como as outras.',
    eixoY: [-1, 4.2],
  },
];

// as funções do próprio treino (todas as que existem em ATIVACOES)
FUNCOES.forEach((item) => {
  const ativacao = ATIVACOES[item.chave];
  if (!ativacao) return;
  item.f = ativacao.f;
  item.df = (z) => ativacao.derivadaDaSaida(ativacao.f(z), z);
});

const EIXO_X = [-4, 4];
const LARGURA = 340;
const ALTURA = 200;
const MARGEM = { topo: 14, direita: 14, baixo: 26, esquerda: 34 };

function lerCores() {
  const estilo = getComputedStyle(document.documentElement);
  const ler = (nome) => estilo.getPropertyValue(nome).trim();
  return {
    tinta: ler('--grafico-tinta'),
    destaque: ler('--grafico-destaque'),
    suave: ler('--grafico-suave'),
    borda: ler('--grafico-borda'),
    superficie: ler('--grafico-superficie'),
  };
}

/**
 * Pontos de uma curva, cortados onde a função salta: em vez de ligar os dois lados do
 * salto com um traço vertical, a curva vira dois pedaços.
 */
function pedacos(funcao, saltos = []) {
  const n = 321;
  const cortes = saltos.map((s) => s.z);
  const resultado = [];
  let atual = [];
  for (let k = 0; k < n; k += 1) {
    const z = EIXO_X[0] + (EIXO_X[1] - EIXO_X[0]) * (k / (n - 1));
    const anterior = atual.at(-1);
    if (anterior && cortes.some((c) => anterior.z < c && z >= c)) {
      resultado.push(atual);
      atual = [];
    }
    // no ponto exato do salto, a curva não é desenhada (o marcador mostra o valor)
    if (cortes.some((c) => Math.abs(z - c) < 1e-9)) continue;
    atual.push({ z, v: funcao(z) });
  }
  if (atual.length) resultado.push(atual);
  return resultado;
}

function desenharGrafico(svgElemento, item) {
  const cores = lerCores();
  const svg = d3.select(svgElemento);
  svg.selectAll('*').remove();
  svg.attr('viewBox', `0 0 ${LARGURA} ${ALTURA}`);

  const x = d3.scaleLinear().domain(EIXO_X).range([MARGEM.esquerda, LARGURA - MARGEM.direita]);
  const y = d3.scaleLinear().domain(item.eixoY).range([ALTURA - MARGEM.baixo, MARGEM.topo]);

  svg.append('rect')
    .attr('x', MARGEM.esquerda).attr('y', MARGEM.topo)
    .attr('width', LARGURA - MARGEM.esquerda - MARGEM.direita)
    .attr('height', ALTURA - MARGEM.topo - MARGEM.baixo)
    .attr('rx', 6)
    .attr('fill', cores.superficie)
    .attr('stroke', cores.borda);

  // grade leve e eixos que passam pela origem
  const grade = svg.append('g').attr('stroke', cores.borda).attr('stroke-width', 0.6);
  x.ticks(8).forEach((v) => grade.append('line')
    .attr('x1', x(v)).attr('x2', x(v)).attr('y1', MARGEM.topo).attr('y2', ALTURA - MARGEM.baixo));
  y.ticks(5).forEach((v) => grade.append('line')
    .attr('x1', MARGEM.esquerda).attr('x2', LARGURA - MARGEM.direita).attr('y1', y(v)).attr('y2', y(v)));
  const eixos = svg.append('g').attr('stroke', cores.suave).attr('stroke-width', 1);
  eixos.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', MARGEM.topo).attr('y2', ALTURA - MARGEM.baixo);
  if (item.eixoY[0] < 0 && item.eixoY[1] > 0) {
    eixos.append('line').attr('x1', MARGEM.esquerda).attr('x2', LARGURA - MARGEM.direita).attr('y1', y(0)).attr('y2', y(0));
  }

  const rotulos = svg.append('g')
    .attr('fill', cores.suave)
    .style('font-family', 'var(--fonte-mono)') // var() só funciona em style, não em atributo
    .style('font-size', '10px');
  x.ticks(8).filter((v) => v !== 0).forEach((v) => rotulos.append('text')
    .attr('x', x(v)).attr('y', ALTURA - MARGEM.baixo + 14).attr('text-anchor', 'middle').text(String(v).replace('-', '−')));
  y.ticks(5).forEach((v) => rotulos.append('text')
    .attr('x', MARGEM.esquerda - 6).attr('y', y(v) + 3).attr('text-anchor', 'end')
    .text(String(v).replace('-', '−').replace('.', ',')));
  rotulos.append('text').attr('x', LARGURA - MARGEM.direita).attr('y', ALTURA - 4).attr('text-anchor', 'end').text('z');

  const linha = d3.line().x((d) => x(d.z)).y((d) => y(Math.max(item.eixoY[0], Math.min(item.eixoY[1], d.v))));
  const curvas = svg.append('g').attr('fill', 'none').attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');

  // f'(z): tracejada, na cor de destaque dos gráficos
  pedacos(item.df, item.saltos?.df).forEach((pedaco) => curvas.append('path')
    .attr('class', 'curva-derivada').attr('d', linha(pedaco))
    .attr('stroke', cores.destaque).attr('stroke-width', 2.2).attr('stroke-dasharray', '5 4'));
  // f(z): cheia, na tinta dos gráficos
  pedacos(item.f, item.saltos?.f).forEach((pedaco) => curvas.append('path')
    .attr('class', 'curva-funcao').attr('d', linha(pedaco))
    .attr('stroke', cores.tinta).attr('stroke-width', 2.6));

  // marcadores de salto: aberto = o valor NÃO é atingido; fechado = é
  const marcar = (saltos = [], cor) => saltos.forEach((s) => {
    if (s.aberto !== undefined) {
      svg.append('circle').attr('cx', x(s.z)).attr('cy', y(s.aberto)).attr('r', 4)
        .attr('fill', cores.superficie).attr('stroke', cor).attr('stroke-width', 1.8);
    }
    if (s.fechado !== undefined) {
      svg.append('circle').attr('cx', x(s.z)).attr('cy', y(s.fechado)).attr('r', 4).attr('fill', cor);
    }
  });
  marcar(item.saltos?.df, cores.destaque);
  marcar(item.saltos?.f, cores.tinta);
}

function renderizarTex(elemento, tex) {
  if (!window.katex) {
    elemento.textContent = tex;
    return;
  }
  window.katex.render(tex, elemento, { displayMode: true, throwOnError: false });
}

/** Monta as gavetas (uma por função) dentro do contêiner e devolve um mapa chave → <details>. */
export function montarGavetasDeAtivacao(container) {
  if (!container) return null;
  container.classList.add('gavetas-ativacao');
  const graficos = [];
  const porChave = {};

  FUNCOES.forEach((item) => {
    const gaveta = document.createElement('details');
    gaveta.className = 'gaveta gaveta-ativacao';
    gaveta.dataset.ativacao = item.chave;
    gaveta.id = `ativacao-${item.chave}`;
    gaveta.innerHTML = `
      <summary class="gaveta-resumo">
        <span class="gaveta-seta" aria-hidden="true"></span>
        <span class="gaveta-titulo">${item.nome}</span>
        <span class="ativacao-uso ativacao-uso--${item.uso === 'rede' ? 'rede' : 'neuronio'}">${item.uso === 'rede' ? 'no laboratório' : item.uso}</span>
      </summary>
      <div class="ativacao-corpo">
        <div class="ativacao-texto">
          <div class="ativacao-formulas">
            <div class="ativacao-formula" data-papel="f"></div>
            <div class="ativacao-formula" data-papel="df"></div>
          </div>
          <p><strong>O que faz.</strong> ${item.faz}</p>
          <p class="ativacao-limite"><strong>O limite.</strong> ${item.limite}</p>
        </div>
        <figure class="ativacao-figura">
          <svg class="ativacao-grafico" role="img" aria-label="Gráfico de ${item.nome} e da sua derivada"></svg>
          <figcaption class="ativacao-legenda">
            <span class="legenda-f">f(z)</span>
            <span class="legenda-df">f′(z)</span>
          </figcaption>
        </figure>
      </div>
    `;
    renderizarTex(gaveta.querySelector('[data-papel="f"]'), item.formula);
    renderizarTex(gaveta.querySelector('[data-papel="df"]'), item.derivada);
    // o gráfico, e não o primeiro <svg> da gaveta: o KaTeX desenha o sinal de raiz com um <svg>
    const svg = gaveta.querySelector('.ativacao-grafico');
    graficos.push([svg, item]);
    container.appendChild(gaveta);
    porChave[item.chave] = gaveta;
  });

  const desenharTodos = () => graficos.forEach(([svg, item]) => desenharGrafico(svg, item));
  desenharTodos();
  // as cores vêm do tema: redesenha quando ele muda (o evento sai de principal.js)
  document.addEventListener('neurologica:tema', () => requestAnimationFrame(desenharTodos));
  return porChave;
}

/** Exportado para a conferência: as funções que os gráficos desenham. */
export const FUNCOES_DE_ATIVACAO = FUNCOES;
