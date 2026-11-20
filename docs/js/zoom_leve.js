/**
 * Zoom sem travar o celular.
 *
 * Ao dar zoom com os dedos, alguns navegadores de celular aumentam o `devicePixelRatio`
 * (Firefox, Samsung Internet) e refazem a rasterização de tudo que tem filtro, sombra
 * grande ou animação, na escala nova. Um canvas dimensionado por esse valor chegava a
 * dezenas de milhões de pixels, e a tela congelava. Duas defesas:
 *
 *  1. `densidadeSegura()`: a densidade de pixels dos canvases vem do valor que a tela tinha
 *     ao carregar a página (antes de qualquer zoom), com um teto. Dar zoom nunca aumenta a
 *     resolução do desenho.
 *  2. `configurarZoomLeve()`: enquanto a página está com zoom (visualViewport.scale > 1),
 *     a classe `zoom-ativo` fica no <html>. O CSS desliga filtros, tremido de lápis e
 *     reflexos, e o desenho da superfície de erro pausa. Ao voltar ao normal, tudo retoma.
 */

const DENSIDADE_AO_CARREGAR = window.devicePixelRatio || 1;

/** Densidade de pixels para um canvas: a da tela ao carregar, limitada a `maximo`. */
export function densidadeSegura(maximo = 2) {
  return Math.max(1, Math.min(DENSIDADE_AO_CARREGAR, maximo));
}

/** Lado máximo (em pixels reais) de um canvas quadrado, qualquer que seja a densidade. */
export function ladoSeguro(ladoCss, maximo = 2, pixelsMaximos = 1000) {
  const densidade = densidadeSegura(maximo);
  return { densidade: Math.min(densidade, pixelsMaximos / Math.max(1, ladoCss)), lado: ladoCss };
}

export function paginaComZoom() {
  return document.documentElement.classList.contains('zoom-ativo');
}

export function configurarZoomLeve() {
  const vv = window.visualViewport;
  if (!vv) return;
  let agendado = false;
  const atualizar = () => {
    agendado = false;
    const comZoom = vv.scale > 1.05;
    const raiz = document.documentElement;
    if (raiz.classList.contains('zoom-ativo') === comZoom) return;
    raiz.classList.toggle('zoom-ativo', comZoom);
    document.dispatchEvent(new CustomEvent('neurologica:zoom', { detail: { comZoom } }));
  };
  const agendar = () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(atualizar);
  };
  vv.addEventListener('resize', agendar, { passive: true });
  atualizar();
}
