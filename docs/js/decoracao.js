/**
 * Tamanho e lugar dos desenhos decorativos.
 *
 * Por padrão (e sempre no telefone) os desenhos ficam NO FLUXO: a arte horizontal do
 * topo abaixo dos botões, e a de cada ato no alto da seção. Em telas largas há espaço
 * vazio ao lado do texto, e este módulo tenta usá-lo para mostrar os desenhos maiores.
 *
 * Em vez de supor onde o texto termina (o que dependeria da fonte, do tamanho da tela
 * e de como cada título quebra), ele MEDE: pega as caixas de cada linha de texto e de
 * cada bloco (laboratório, cartões), soma uma folga, e procura a maior caixa, encostada
 * na margem direita, que não cruze nenhuma delas. Se couber com um tamanho mínimo, o
 * desenho vai para a lateral; senão, continua no fluxo. Assim a decoração nunca passa
 * por cima de texto, qualquer que seja a tela.
 *
 * Também liga e desliga a classe .arte--visivel, para que o "tremido de lápis" só
 * trabalhe nos desenhos que estão na tela.
 */

const LARGURA_MINIMA_LATERAL = 1100;
const FOLGA = 28;               // distância mínima entre desenho e texto
const FOLGA_REVELACAO = 16;     // o texto ainda não revelado está 16px abaixo do lugar final

function caixaNoDocumento(retangulo) {
  return {
    left: retangulo.left + window.scrollX,
    right: retangulo.right + window.scrollX,
    top: retangulo.top + window.scrollY,
    bottom: retangulo.bottom + window.scrollY,
  };
}

/** Uma caixa por linha de texto (não por parágrafo): as linhas curtas liberam espaço. */
function linhasDeTexto(elemento) {
  const caixas = [];
  const percurso = document.createTreeWalker(elemento, NodeFilter.SHOW_TEXT);
  while (percurso.nextNode()) {
    const no = percurso.currentNode;
    if (!no.textContent.trim()) continue;
    // o texto dos balões de ajuda fica invisível até alguém abrir; não é obstáculo
    if (no.parentElement?.closest('.ajuda')) continue;
    const intervalo = document.createRange();
    intervalo.selectNodeContents(no);
    for (const r of intervalo.getClientRects()) {
      if (r.width && r.height) caixas.push(caixaNoDocumento(r));
    }
  }
  return caixas;
}

function obstaculos(raiz, seletoresTexto, seletoresBloco) {
  const lista = [];
  raiz.querySelectorAll(seletoresTexto).forEach((el) => lista.push(...linhasDeTexto(el)));
  raiz.querySelectorAll(seletoresBloco).forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width && r.height) lista.push(caixaNoDocumento(r));
  });
  return lista.map((o) => ({
    left: o.left - FOLGA,
    right: o.right + FOLGA,
    top: o.top - FOLGA - FOLGA_REVELACAO,
    bottom: o.bottom + FOLGA,
  }));
}

const cruza = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/**
 * Procura a maior caixa (largura w, altura w·proporcao) encostada em `area.right`, entre
 * `area.top` e `area.bottom`, que não cruze nenhum obstáculo. Prefere a posição mais
 * alta. Devolve { largura, topo } ou null.
 */
function maiorEspaco(area, proporcao, maximo, minimo, lista) {
  for (let largura = maximo; largura >= minimo; largura -= 8) {
    const altura = largura * proporcao;
    const esquerda = area.right - largura;
    for (let topo = area.top; topo + altura <= area.bottom; topo += 6) {
      const caixa = { left: esquerda, right: area.right, top: topo, bottom: topo + altura };
      if (!lista.some((o) => cruza(o, caixa))) return { largura, topo };
    }
  }
  return null;
}

function limpar(arte) {
  arte.classList.remove('arte-margem--lateral');
  arte.style.removeProperty('top');
  arte.style.removeProperty('right');
  arte.style.removeProperty('width');
}

function posicionarArtesDosAtos() {
  document.querySelectorAll('.secao--decorada').forEach((secao) => {
    // a arte de borda a borda (Ato 3) ocupa a largura toda no fluxo: não vai para a lateral
    if (secao.querySelector(':scope > .arte-margem--total')) return;
    const arte = secao.querySelector(':scope > .arte-margem');
    if (!arte) return;
    limpar(arte);
    if (window.innerWidth < LARGURA_MINIMA_LATERAL) return;

    const envelope = secao.querySelector(':scope > .envelope');
    const lab = secao.querySelector('.lab-embrulho');
    if (!envelope || !lab) return;

    // mede com a arte fora do fluxo, que é como ela vai ficar se couber na lateral
    arte.classList.add('arte-margem--lateral');
    const caixaSecao = caixaNoDocumento(secao.getBoundingClientRect());
    const caixaEnvelope = caixaNoDocumento(envelope.getBoundingClientRect());
    const recuo = parseFloat(getComputedStyle(envelope).paddingRight) || 0;
    const caixaLab = caixaNoDocumento(lab.getBoundingClientRect());

    const area = {
      right: caixaEnvelope.right - recuo,
      top: caixaSecao.top + 24,
      bottom: caixaLab.top - FOLGA,
    };
    // Blocos que o desenho não pode cobrir: além do laboratório, as figuras maiores que
    // existem no PC (a superfície de erro sai da coluna de texto) e os cartões.
    const lista = obstaculos(
      secao,
      '.secao-cabecalho, .texto-coluna',
      '.lab-embrulho, .superficie-erro, .cartao-matematico, .ativacoes-bloco, .progresso-portas',
    );
    const achado = maiorEspaco(area, 1, 520, 230, lista);
    if (!achado) {
      limpar(arte);
      return;
    }
    arte.style.top = `${Math.round(achado.topo - caixaSecao.top)}px`;
    arte.style.right = `${Math.round(caixaSecao.right - area.right)}px`;
    arte.style.width = `${achado.largura}px`;
  });
}

function posicionarArteDoTopo() {
  const hero = document.querySelector('.hero');
  const arte = hero?.querySelector('.hero-arte');
  if (!hero || !arte) return;

  hero.classList.remove('hero--arte-lateral');
  arte.style.removeProperty('top');
  arte.style.removeProperty('right');
  arte.style.removeProperty('width');
  if (window.innerWidth < LARGURA_MINIMA_LATERAL) return;

  // mede o texto como ele fica SEM a arte horizontal (que só existe no modo em fluxo)
  hero.classList.add('hero--arte-lateral');
  const caixaHero = caixaNoDocumento(hero.getBoundingClientRect());
  const area = {
    right: caixaHero.right - 24,
    top: caixaHero.top + 24,
    bottom: caixaHero.bottom - 24,
  };
  const lista = obstaculos(hero, '.hero-etiqueta, .hero-titulo, .hero-texto', '.hero-acoes a');
  // o desenho do topo é vertical: 300 × 560
  const achado = maiorEspaco(area, 560 / 300, 460, 230, lista);
  if (!achado) {
    hero.classList.remove('hero--arte-lateral');
    return;
  }
  arte.style.top = `${Math.round(achado.topo - caixaHero.top)}px`;
  arte.style.right = `${Math.round(caixaHero.right - area.right)}px`;
  arte.style.width = `${achado.largura}px`;
}

export function posicionarDecoracao() {
  posicionarArteDoTopo();
  posicionarArtesDosAtos();
}

function observarVisibilidade() {
  const artes = document.querySelectorAll('.hero-arte, .hero-arte-movel, .arte-margem');
  if (!('IntersectionObserver' in window)) {
    artes.forEach((a) => a.classList.add('arte--visivel'));
    return;
  }
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => e.target.classList.toggle('arte--visivel', e.isIntersecting));
  });
  artes.forEach((a) => observador.observe(a));
}

export function configurarDecoracao() {
  observarVisibilidade();

  let agendado = null;
  const agendar = () => {
    clearTimeout(agendado);
    agendado = setTimeout(posicionarDecoracao, 120);
  };

  // A largura útil muda quando a barra de rolagem aparece (ao sair da tela de
  // carregamento), quando as fontes terminam de carregar e quando a janela muda.
  const principal = document.querySelector('main');
  if (principal && 'ResizeObserver' in window) {
    new ResizeObserver(agendar).observe(principal);
  }
  window.addEventListener('resize', agendar);
  (document.fonts?.ready ?? Promise.resolve()).then(posicionarDecoracao);
  posicionarDecoracao();
}
