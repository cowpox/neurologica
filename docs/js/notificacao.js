/**
 * Aviso de conquista.
 *
 * Fica NO FLUXO, logo abaixo do laboratório em que a conquista aconteceu, e não flutuando
 * por cima da página: assim não cobre o plano de decisão nem a rede, e aparece onde o
 * aluno já está olhando (o estado "resolveu" fica na barra de baixo do laboratório).
 * Anuncia por aria-live, tem botão de fechar com área de toque confortável e respeita
 * prefers-reduced-motion. Nenhuma chamada de rede: tudo acontece no navegador.
 */

const SELO = `
  <svg class="conquista-selo" viewBox="0 0 64 64" aria-hidden="true">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#rascunho-fino)">
      <circle class="selo-anel" cx="32" cy="32" r="24" pathLength="1"/>
      <circle class="selo-anel selo-anel--fino" cx="33" cy="31" r="27" pathLength="1"/>
      <path class="selo-visto" d="M21 33 L29 41 L44 23" pathLength="1"/>
    </g>
    <g class="selo-raios">
      <path d="M32 2 V8 M32 56 V62 M2 32 H8 M56 32 H62 M10.8 10.8 L15 15 M49 49 L53.2 53.2 M53.2 10.8 L49 15 M15 49 L10.8 53.2"/>
    </g>
  </svg>`;

function semMovimento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Mostra (ou troca) o aviso de conquista logo depois de `ancora`.
 * `conteudo` = { titulo, texto }.
 */
export function mostrarConquista(ancora, { titulo, texto }) {
  if (!ancora) return null;
  ancora.parentElement.querySelectorAll(':scope > .conquista').forEach((antiga) => antiga.remove());

  const aviso = document.createElement('div');
  aviso.className = 'conquista';
  aviso.setAttribute('role', 'status');
  aviso.setAttribute('aria-live', 'polite');
  aviso.innerHTML = `
    ${SELO}
    <div class="conquista-texto">
      <p class="conquista-rotulo">Conquista</p>
      <p class="conquista-titulo"></p>
      <p class="conquista-corpo"></p>
    </div>
    <button type="button" class="conquista-fechar" aria-label="Fechar aviso de conquista">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6 L18 18 M18 6 L6 18"/></svg>
    </button>
  `;
  aviso.querySelector('.conquista-titulo').textContent = titulo;
  aviso.querySelector('.conquista-corpo').textContent = texto;
  aviso.querySelector('.conquista-fechar').addEventListener('click', () => {
    aviso.classList.add('conquista--saindo');
    setTimeout(() => aviso.remove(), 260);
  });
  ancora.after(aviso);

  const gsap = window.gsap;
  if (gsap && !semMovimento()) {
    const tracos = aviso.querySelectorAll('.selo-anel, .selo-visto');
    gsap.set(tracos, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.timeline()
      .fromTo(aviso, { opacity: 0, y: 12, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' })
      .to(tracos, { strokeDashoffset: 0, duration: 0.5, stagger: 0.12, ease: 'power2.inOut' }, '-=0.2')
      .fromTo(aviso.querySelector('.selo-raios'), { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.5)' }, '-=0.15');
  } else {
    aviso.classList.add('conquista--estatica');
  }
  return aviso;
}
