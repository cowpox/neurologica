/**
 * Gaveta de pistas progressivas de um ato.
 *
 * Mostra primeiro o problema, depois as pistas: cada pista só aparece depois de algumas
 * tentativas sem resolver (a regra está em `desafios.js`). As bloqueadas aparecem com a
 * condição, sem o texto. Quando uma libera, só o contador do resumo reage (e o aria-live
 * anuncia): a gaveta não abre sozinha nem empurra o laboratório. Depois da conquista,
 * todas ficam abertas, mais o "Por que funcionou". O botão "Estou travado" libera a
 * próxima depois de uma espera curta, para ninguém ficar parado numa sala com tempo corrido.
 */

import {
  PISTAS_POR_ATO, TENTATIVAS_POR_PISTA, pistasLiberadas, tentativasParaProximaPista,
} from './desafios.js';

const ESPERA_ESTOU_TRAVADO = 20; // segundos

const CADEADO = `
  <svg class="pista-cadeado" viewBox="0 0 16 16" aria-hidden="true">
    <rect x="3.2" y="7" width="9.6" height="7" rx="1.6"/>
    <path d="M5.4 7 V5.2 a2.6 2.6 0 0 1 5.2 0 V7"/>
  </svg>`;

export class GavetaDePistas {
  /**
   * `config` = { id, pistas: [texto, texto, texto], porque, aoPedirPista }.
   * Os textos podem ter <strong> e <em> (são do próprio site, não de usuário).
   */
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.liberadasAntes = null;
    this.container.classList.add('pistas');
    this.container.innerHTML = `
      <details class="gaveta gaveta-pistas">
        <summary class="gaveta-resumo">
          <span class="gaveta-seta" aria-hidden="true"></span>
          <svg class="pistas-icone" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3.2 a6.2 6.2 0 0 0 -3.6 11.2 c0.7 0.5 1 1.2 1 2 V17.6 h5.2 V16.4 c0 -0.8 0.3 -1.5 1 -2 A6.2 6.2 0 0 0 12 3.2 z"/>
            <path d="M9.6 20.3 h4.8"/>
          </svg>
          <span class="gaveta-titulo">Pistas</span>
          <span class="pistas-contador"></span>
        </summary>
        <div class="pistas-corpo">
          <ol class="pistas-lista"></ol>
          <div class="pistas-acoes">
            <button type="button" class="botao-pista">Estou travado: quero uma pista</button>
            <span class="pistas-espera"></span>
          </div>
        </div>
      </details>
      <p class="sr-anuncio" aria-live="polite"></p>
    `;
    this.elContador = container.querySelector('.pistas-contador');
    this.elLista = container.querySelector('.pistas-lista');
    this.elBotao = container.querySelector('.botao-pista');
    this.elEspera = container.querySelector('.pistas-espera');
    this.elAnuncio = container.querySelector('.sr-anuncio');
    this.elBotao.addEventListener('click', () => this.esperarPista());
  }

  esperarPista() {
    if (this.relogio) return;
    let restante = ESPERA_ESTOU_TRAVADO;
    this.elBotao.disabled = true;
    const atualizar = () => {
      this.elEspera.textContent = `a próxima pista chega em ${restante} s. Enquanto isso, tente mais uma vez.`;
    };
    atualizar();
    this.relogio = setInterval(() => {
      restante -= 1;
      if (restante > 0) {
        atualizar();
        return;
      }
      clearInterval(this.relogio);
      this.relogio = null;
      this.elBotao.disabled = false;
      this.elEspera.textContent = '';
      this.config.aoPedirPista?.();
    }, 1000);
  }

  /** Redesenha a gaveta a partir do estado do desafio. */
  atualizar(estado) {
    const id = this.config.id;
    const liberadas = pistasLiberadas(estado, id);
    const conquistado = estado.desafios[id]?.conquistado === true;
    const faltam = tentativasParaProximaPista(estado, id);

    this.elContador.textContent = conquistado
      ? 'resolvido · todas abertas'
      : `${liberadas} de ${PISTAS_POR_ATO} liberadas`;

    this.elLista.innerHTML = '';
    this.config.pistas.forEach((texto, i) => {
      const item = document.createElement('li');
      if (i < liberadas) {
        item.className = 'pista pista--liberada';
        item.innerHTML = `<span class="pista-numero">Pista ${i + 1}</span><span class="pista-texto">${texto}</span>`;
      } else {
        item.className = 'pista pista--bloqueada';
        const quantas = faltam + (i - liberadas) * TENTATIVAS_POR_PISTA;
        item.innerHTML = `${CADEADO}<span class="pista-texto">Pista ${i + 1}: libera depois de mais ` +
          `${quantas} ${quantas === 1 ? 'tentativa' : 'tentativas'} sem resolver.</span>`;
      }
      this.elLista.appendChild(item);
    });
    if (conquistado) {
      const porque = document.createElement('li');
      porque.className = 'pista pista--porque';
      porque.innerHTML = `<span class="pista-numero">Por que funcionou</span><span class="pista-texto">${this.config.porque}</span>`;
      this.elLista.appendChild(porque);
    }

    this.elBotao.hidden = conquistado || liberadas >= PISTAS_POR_ATO;
    if (this.elBotao.hidden) this.elEspera.textContent = '';

    if (this.liberadasAntes !== null && liberadas > this.liberadasAntes) {
      this.elAnuncio.textContent = conquistado
        ? 'Todas as pistas foram abertas.'
        : `Pista ${liberadas} liberada. Abra a gaveta de pistas para ler.`;
      this.elContador.classList.remove('pistas-contador--nova');
      void this.elContador.offsetWidth; // reinicia a animação
      this.elContador.classList.add('pistas-contador--nova');
    }
    this.liberadasAntes = liberadas;
  }
}
