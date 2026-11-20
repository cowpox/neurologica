/**
 * Botão de play flutuante (só em telas estreitas, onde o laboratório vira uma coluna só).
 *
 * No telefone o play fica no alto do cartão do laboratório, e o log, a curva e o plano de
 * decisão ficam abaixo dele: quem quer acompanhar o log de um treino em andamento precisava
 * apertar o play, descer depressa e torcer para ver algo antes do fim. Este botão fica
 * preso no canto da tela enquanto o leitor rola pelo laboratório de um ato (o cartão está
 * na tela, mas o play de verdade já ficou para trás, acima) e some nos trechos que só têm texto ou
 * figuras. Toca e pausa o mesmo treino do play do cartão, e acompanha o estado dele.
 */

const TELA_ESTREITA = '(max-width: 899px)';
const MINIMO_DO_CARTAO = 140;   // px do cartão que precisam estar na tela para o botão aparecer
const ALTURA_DO_CABECALHO = 72; // o cabeçalho fixo cobre o alto da tela

export function configurarPlayFlutuante(laboratorios) {
  const labs = laboratorios.filter((lab) => lab?.container && lab.botaoTocar);
  if (!labs.length) return;

  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'play-flutuante';
  botao.setAttribute('aria-label', 'Iniciar treino');
  botao.setAttribute('aria-hidden', 'true');
  botao.tabIndex = -1;
  botao.innerHTML = `
    <svg viewBox="0 0 24 24" class="icone-tocar" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>
    <svg viewBox="0 0 24 24" class="icone-pausar" aria-hidden="true"><path d="M7 5h3.2v14H7zm6.8 0H17v14h-3.2z"/></svg>`;
  document.body.appendChild(botao);

  const mediaTela = window.matchMedia(TELA_ESTREITA);
  let ativo = null;     // o laboratório que o botão controla agora
  let agendado = false;

  /** O laboratório em que o leitor está: cartão na tela e play de verdade acima da tela. */
  function escolher() {
    const altura = window.innerHeight;
    let melhor = null;
    let maior = 0;
    for (const lab of labs) {
      const cartao = lab.container.getBoundingClientRect();
      const visivelDoCartao = Math.min(cartao.bottom, altura) - Math.max(cartao.top, ALTURA_DO_CABECALHO);
      if (visivelDoCartao < MINIMO_DO_CARTAO) continue;
      // só quando o play de verdade já passou para CIMA da tela (o leitor desceu por ele). Se
      // ele ainda está abaixo (o cartão acabou de entrar), o botão apareceria e sumiria logo
      // depois, quando o play chegasse à tela.
      const play = lab.botaoTocar.getBoundingClientRect();
      if (play.bottom > ALTURA_DO_CABECALHO) continue;
      if (visivelDoCartao > maior) {
        maior = visivelDoCartao;
        melhor = lab;
      }
    }
    return melhor;
  }

  function sincronizarEstado() {
    const rodando = !!ativo && ativo.container.classList.contains('laboratorio--rodando');
    botao.classList.toggle('play-flutuante--rodando', rodando);
    botao.setAttribute('aria-label', rodando ? 'Pausar treino' : 'Iniciar treino');
  }

  function atualizar() {
    agendado = false;
    const novo = mediaTela.matches ? escolher() : null;
    ativo = novo ?? ativo;
    const mostrar = !!novo;
    botao.classList.toggle('play-flutuante--visivel', mostrar);
    botao.setAttribute('aria-hidden', String(!mostrar));
    botao.tabIndex = mostrar ? 0 : -1;
    sincronizarEstado();
  }

  const agendar = () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(atualizar);
  };

  botao.addEventListener('click', () => {
    if (!ativo) return;
    ativo.alternarReproducao();
    sincronizarEstado();
  });

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar, { passive: true });
  mediaTela.addEventListener('change', agendar);
  // o estado de cada laboratório (rodando/pausado) vem do próprio cartão: segue a classe dele
  const observador = new MutationObserver(sincronizarEstado);
  labs.forEach((lab) => observador.observe(lab.container, { attributes: true, attributeFilter: ['class'] }));
  // o cartão cresce e encolhe (abas, avisos): reavalia
  if (typeof ResizeObserver === 'function') {
    const medidor = new ResizeObserver(agendar);
    labs.forEach((lab) => medidor.observe(lab.container));
  }
  atualizar();
}
