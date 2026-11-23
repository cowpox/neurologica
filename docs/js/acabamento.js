/**
 * Detalhes de acabamento: nada aqui muda os gráficos nem o treino.
 *
 * - Termos difíceis ganham um botão (?) com uma explicação curta, o mesmo componente
 *   usado nos laboratórios.
 * - Atalhos de teclado: Espaço toca/pausa e → avança um passo, no laboratório que
 *   estiver na tela.
 * - Dica da primeira visita: uma seta desenhada aponta para o ▶ do Ato 1 e some no
 *   primeiro toque; o navegador lembra que ela já foi vista.
 * - Balões de ajuda nunca saem da tela (em telas largas; no telefone eles já são uma
 *   faixa presa ao rodapé).
 * - "Pular para o conteúdo" leva o foco do teclado para o início do Ato 1.
 */

import { criarAjuda } from './rede_visual.js';

/* --------------------------------------------------------- termos difíceis */

const TERMOS = {
  fronteira: [
    'Fronteira de decisão',
    'A linha que divide o plano em duas regiões: de um lado o neurônio responde 1, do ' +
    'outro responde 0. Com mais entradas ela vira um plano (ou hiperplano), mas a ideia ' +
    'é a mesma. Treinar é mover essa linha.',
  ],
  vies: [
    'Viés (bias)',
    'Um número somado ao resultado antes da decisão. Ele desloca a reta para longe da ' +
    'origem: sem ele, toda fronteira teria de passar pelo ponto (0, 0).',
  ],
  separavel: [
    'Linearmente separável',
    'Quando existe pelo menos uma reta que deixa todos os pontos de uma classe de um lado ' +
    'e todos os da outra do outro. AND, OR, NAND e NOR são; XOR e XNOR não são.',
  ],
  epoca: [
    'Época',
    'Uma passada completa por todos os exemplos de treino. Nas portas lógicas, uma época é ' +
    'olhar os 4 pontos da tabela-verdade uma vez cada.',
  ],
  gradiente: [
    'Gradiente descendente',
    'Um jeito de achar bons pesos descendo sempre na direção em que o erro diminui: a cada passo, ' +
    'cada peso é ajustado levemente no sentido que mais reduz o erro.',
  ],
  derivada: [
    'Derivada',
    'Mede o quanto uma saída muda quando a entrada muda um pouquinho. É ela que diz para ' +
    'que lado ajustar cada peso; se ela é zero, o treino não sabe para onde ir.',
  ],
  backprop: [
    'Backpropagation',
    'O algoritmo que calcula, de trás para a frente, quanto cada peso da rede contribuiu ' +
    'para o erro final, usando a regra da cadeia do cálculo. Com isso cada camada sabe ' +
    'como se corrigir.',
  ],
};

export function configurarTermos() {
  document.querySelectorAll('.termo[data-termo]').forEach((termo) => {
    const definicao = TERMOS[termo.dataset.termo];
    if (!definicao || termo.nextElementSibling?.classList.contains('ajuda--termo')) return;
    const ajuda = criarAjuda(definicao[0], definicao[1]);
    ajuda.classList.add('ajuda--termo');
    termo.after(ajuda);
  });
}

/* ------------------------------------------ balões de ajuda dentro da tela */

/**
 * Em telas largas o balão abre centralizado no botão; perto de uma borda ele sairia da
 * tela. Depois que o balão abre, mede-se a posição e ele é empurrado para dentro pela
 * margem esquerda (e não por `translate`: o deslocamento por transformação não reduz a
 * largura rolável do documento, e a página ganhava uma barra horizontal).
 */
export function manterBaloesNaTela() {
  const largo = window.matchMedia('(min-width: 721px)');
  // fase de captura: o botão de ajuda interrompe a propagação do clique
  document.addEventListener('click', (evento) => {
    const botao = evento.target.closest?.('.ajuda-botao');
    if (!botao) return;
    const balao = botao.parentElement?.querySelector('.ajuda-balao');
    if (!balao) return;
    balao.style.marginLeft = '';
    if (!largo.matches) return;
    requestAnimationFrame(() => {
      const caixa = balao.getBoundingClientRect();
      const margem = 8;
      let deslocamento = 0;
      if (caixa.right > window.innerWidth - margem) deslocamento = window.innerWidth - margem - caixa.right;
      if (caixa.left + deslocamento < margem) deslocamento = margem - caixa.left;
      if (deslocamento) balao.style.marginLeft = `${Math.round(deslocamento)}px`;
    });
  }, true);
}

/* ------------------------------------------------------ atalhos de teclado */

function laboratorioNaTela() {
  let melhor = null;
  let maiorArea = 0;
  for (const lab of document.querySelectorAll('.laboratorio')) {
    const caixa = lab.getBoundingClientRect();
    const visivel = Math.min(caixa.bottom, window.innerHeight) - Math.max(caixa.top, 0);
    if (visivel > maiorArea) {
      maiorArea = visivel;
      melhor = lab;
    }
  }
  // exige que uma parte razoável do laboratório esteja à vista
  return maiorArea > Math.min(240, window.innerHeight * 0.3) ? melhor : null;
}

export function configurarAtalhos() {
  document.addEventListener('keydown', (evento) => {
    if (evento.defaultPrevented || evento.altKey || evento.ctrlKey || evento.metaKey) return;
    if (evento.key !== ' ' && evento.key !== 'ArrowRight') return;
    // dentro de botões, links, campos e gavetas, a tecla mantém o comportamento normal
    if (evento.target.closest?.('input, select, textarea, button, a, summary, [contenteditable]')) return;

    const lab = laboratorioNaTela();
    if (!lab) return;
    evento.preventDefault();
    lab.querySelector(evento.key === ' ' ? '[data-acao="tocar"]' : '[data-acao="passo"]')?.click();
  });
}

/* ------------------------------------------------- dica da primeira visita */

const CHAVE_DICA = 'neurologica:dica-vista';

export function configurarDicaDePrimeiraVisita() {
  let vista = false;
  try {
    vista = localStorage.getItem(CHAVE_DICA) === 'sim';
  } catch {
    // sem localStorage (navegação privada): a dica aparece, e some ao tocar
  }
  if (vista) return;

  const lab = document.getElementById('lab-ato1');
  const transporte = lab?.querySelector('.lab-transporte');
  if (!transporte) return;

  const dica = document.createElement('div');
  dica.className = 'dica-inicio';
  dica.setAttribute('aria-hidden', 'true');
  dica.innerHTML = `
    <svg viewBox="0 0 72 58">
      <path d="M62 12 C 44 8, 22 16, 16 44"/>
      <path d="M9 36 L16 46 L24 38"/>
    </svg>
    <span>comece por aqui</span>
  `;
  transporte.appendChild(dica);
  lab.classList.add('laboratorio--dica');

  const dispensar = () => {
    document.removeEventListener('click', aoClicar, true);
    lab.classList.remove('laboratorio--dica');
    dica.classList.add('dica-inicio--saindo');
    setTimeout(() => dica.remove(), 320);
    try {
      localStorage.setItem(CHAVE_DICA, 'sim');
    } catch {
      // idem: sem onde guardar, só não é lembrada
    }
  };
  function aoClicar(evento) {
    if (evento.target.closest?.('[data-acao="tocar"], [data-acao="passo"]')) dispensar();
  }
  document.addEventListener('click', aoClicar, true);
}

/* ------------------------------------------------- pular para o conteúdo */

export function configurarPularConteudo() {
  const link = document.querySelector('.pular-conteudo');
  const destino = document.querySelector('#ato1 h2');
  if (!link || !destino) return;
  link.addEventListener('click', () => {
    destino.setAttribute('tabindex', '-1');
    // espera a rolagem suave começar antes de mover o foco
    setTimeout(() => destino.focus({ preventScroll: true }), 50);
  });
}
