/**
 * Navegação: menu do telefone e indicador da seção atual.
 *
 * MENU. Abaixo de 900px os links não cabem no cabeçalho. O botão de menu abre um painel
 * logo abaixo dele (o cabeçalho continua com 68px; o painel flutua por cima da página).
 * O painel fecha ao escolher um link, ao tocar fora, com Esc, e sozinho se a tela
 * passar para a largura de computador.
 *
 * INDICADOR. Enquanto o leitor rola, o link da seção em que ele está recebe
 * aria-current="location" — o CSS desenha um risco ondulado embaixo. Vale no menu do
 * computador e no painel do telefone. A seção "atual" é a que cruza uma linha
 * imaginária um pouco abaixo do cabeçalho, e não a que ocupa mais tela: assim o
 * indicador muda quando o título da próxima seção chega perto do topo, que é o que o
 * olho espera.
 */

const LARGURA_TELEFONE = '(max-width: 899px)';

export function configurarMenu() {
  const cabecalho = document.querySelector('.cabecalho');
  const botao = document.getElementById('botao-menu');
  const navegacao = document.getElementById('navegacao');
  if (!cabecalho || !botao || !navegacao) return;

  const estaAberto = () => cabecalho.classList.contains('cabecalho--menu-aberto');

  const alternar = (abrir, { devolverFoco = false } = {}) => {
    cabecalho.classList.toggle('cabecalho--menu-aberto', abrir);
    botao.setAttribute('aria-expanded', String(abrir));
    botao.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    if (abrir) {
      // leva o foco ao primeiro link, para quem navega pelo teclado seguir direto
      navegacao.querySelector('a')?.focus({ preventScroll: true });
    } else if (devolverFoco) {
      botao.focus({ preventScroll: true });
    }
  };

  botao.addEventListener('click', (evento) => {
    evento.stopPropagation();
    alternar(!estaAberto());
  });

  navegacao.addEventListener('click', (evento) => {
    if (evento.target.closest('a') && estaAberto()) alternar(false);
  });

  document.addEventListener('click', (evento) => {
    if (estaAberto() && !cabecalho.contains(evento.target)) alternar(false);
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && estaAberto()) alternar(false, { devolverFoco: true });
  });

  const telefone = window.matchMedia(LARGURA_TELEFONE);
  telefone.addEventListener('change', () => { if (estaAberto()) alternar(false); });
}

export function configurarIndicadorDeSecao() {
  const links = [...document.querySelectorAll('.navegacao a[href^="#"]')];
  const pares = links
    .map((link) => [link, document.querySelector(link.getAttribute('href'))])
    .filter(([, secao]) => secao);
  if (!pares.length) return;

  const cabecalho = document.querySelector('.cabecalho');
  let agendado = false;

  const atualizar = () => {
    agendado = false;
    const alturaCabecalho = cabecalho?.getBoundingClientRect().height ?? 68;
    const linha = alturaCabecalho + window.innerHeight * 0.25;

    let atual = null;
    for (const [link, secao] of pares) {
      const caixa = secao.getBoundingClientRect();
      if (caixa.top <= linha && caixa.bottom > linha) atual = link;
    }
    for (const link of links) {
      if (link === atual) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };

  const agendar = () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(atualizar);
  };

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar);
  atualizar();
}
