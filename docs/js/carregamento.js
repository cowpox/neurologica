/**
 * Tela de carregamento: "o caderno abre", agora com acabamento de abertura de cinema.
 *
 * Em menos de três segundos, a animação conta a mesma coisa que o site inteiro explica:
 *   1. um brilho verde fraco acende ao fundo e fica respirando (CSS);
 *   2. o anel de órbita é riscado à mão, e um "cometa" de luz percorre a órbita uma vez;
 *   3. os colchetes de mira entram de fora e enquadram o centro;
 *   4. o neurônio é desenhado: dendritos, e pulsos de sinal correndo por eles até a soma;
 *   5. a soma "dispara": hachura que vira disco, um clarão e uma onda de choque;
 *   6. o sinal sai pelo axônio até as duas saídas;
 *   7. o nome surge letra por letra, saindo do desfoque, e "Lógica" ganha um leve brilho.
 * Um risco embaixo acompanha o progresso REAL da linha do tempo (não há porcentagem
 * inventada). Na saída, o conteúdo se aproxima um pouco e desfoca enquanto a tela some.
 *
 * Além do papel estético, ela cobre o instante em que as fontes ainda estão carregando:
 * sem ela, o título apareceria primeiro numa fonte de sistema e depois saltaria para a
 * serifa, que é justamente o tipo de tremor que se quer evitar numa apresentação ao vivo.
 *
 * Salvaguardas: a tela some sozinha depois de um tempo máximo, mesmo que algo falhe
 * (ninguém fica preso na abertura); espera as fontes; e vira um simples aparecer quando o
 * sistema pede menos movimento.
 */

const DURACAO_MINIMA = 1000;
const DURACAO_MAXIMA = 4200;

function prefereMenosMovimento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Prepara um traço para ser "desenhado": iguala o tracejado ao comprimento
 *  total e depois anima o deslocamento até zero. */
function prepararTraco(elemento) {
  const comprimento = elemento?.getTotalLength?.();
  if (!comprimento) return null;
  elemento.style.strokeDasharray = `${comprimento}`;
  elemento.style.strokeDashoffset = `${comprimento}`;
  return comprimento;
}

/** Quebra o texto de cada parte do nome em letras (para entrarem uma a uma). */
function separarLetras(nome) {
  if (!nome) return [];
  nome.setAttribute('aria-label', nome.textContent.trim());
  const letras = [];
  nome.querySelectorAll('.marca-neuro, .marca-logica').forEach((parte) => {
    const texto = parte.textContent;
    parte.textContent = '';
    [...texto].forEach((caractere) => {
      const letra = document.createElement('span');
      letra.className = 'letra';
      letra.setAttribute('aria-hidden', 'true');
      letra.textContent = caractere;
      parte.appendChild(letra);
      letras.push(letra);
    });
  });
  return letras;
}

export function iniciarCarregamento() {
  const tela = document.getElementById('carregamento');
  if (!tela) return Promise.resolve();

  const inicio = performance.now();
  const logo = tela.querySelector('.carregamento-logo');
  const tracos = logo ? [...logo.querySelectorAll('.logo-tracos path')] : [];
  const pontas = logo ? [...logo.querySelectorAll('.logo-pontas circle')] : [];
  const soma = logo?.querySelector('.logo-soma');
  const somaHachurada = logo?.querySelector('.logo-soma-hachurada');
  const contornoSoma = logo?.querySelector('.logo-soma-contorno');
  const halo = logo?.querySelector('.logo-halo');
  const onda = logo?.querySelector('.logo-onda');
  const sinaisEntrada = logo ? [...logo.querySelectorAll('.logo-sinal--entrada')] : [];
  const sinaisSaida = logo ? [...logo.querySelectorAll('.logo-sinal--saida')] : [];
  const aneis = [...tela.querySelectorAll('.anel-externo')];
  const anelInterno = tela.querySelector('.anel-traco--interno');
  const cometa = tela.querySelector('.anel-cometa');
  const mira = [...tela.querySelectorAll('.anel-mira path')];
  const nome = tela.querySelector('.carregamento-nome');
  const progresso = tela.querySelector('.carregamento-progresso path');
  const status = tela.querySelector('.carregamento-status');

  const emLoop = []; // animações sem fim (giro do anel, respiração da soma): param na saída

  const encerrar = () => {
    if (tela.dataset.encerrado) return;
    tela.dataset.encerrado = 'sim';
    tela.classList.add('carregamento--saindo');
    document.body.classList.remove('carregando');
    setTimeout(() => {
      emLoop.forEach((animacao) => animacao.kill());
      tela.remove();
    }, 680);
  };

  if (prefereMenosMovimento() || !window.gsap) {
    tela.classList.add('carregamento--simples', 'carregamento--preparado');
    setTimeout(encerrar, DURACAO_MINIMA);
    return Promise.resolve();
  }

  const gsap = window.gsap;
  [...aneis, ...mira, ...tracos, contornoSoma].forEach(prepararTraco);
  const comprimentoProgresso = prepararTraco(progresso);
  const letras = separarLetras(nome);

  // estados iniciais do que entra "de fora" (aplicados antes do primeiro quadro)
  gsap.set(mira, { opacity: 0, scale: 1.35, svgOrigin: '120 120' });
  gsap.set([...sinaisEntrada, ...sinaisSaida], { opacity: 0 });
  gsap.set(letras, { opacity: 0, y: 18, filter: 'blur(10px)' });
  if (status) gsap.set(status, { opacity: 0, y: 6 });

  const linha = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // 1. a órbita é riscada (duas passadas, como caneta passada duas vezes) ...
  linha.to(aneis, { strokeDashoffset: 0, duration: 1.05, stagger: 0.14, ease: 'power3.inOut' }, 0);
  if (anelInterno) {
    linha.fromTo(anelInterno, { opacity: 0, scale: 0.9, svgOrigin: '120 120' },
      { opacity: 0.8, scale: 1, duration: 0.9, ease: 'expo.out' }, 0.3);
  }
  // ... e um cometa de luz dá uma volta por ela
  if (cometa) {
    linha
      .fromTo(cometa, { rotation: -90, svgOrigin: '120 120', strokeDashoffset: 0 },
        { strokeDashoffset: -100, duration: 1.5, ease: 'power2.inOut' }, 0.15)
      .fromTo(cometa, { opacity: 0 }, { opacity: 0.95, duration: 0.25, ease: 'power1.out' }, 0.15)
      .to(cometa, { opacity: 0, duration: 0.45, ease: 'power1.in' }, 1.25);
  }

  // 2. colchetes de mira entram de fora e se desenham
  linha
    .to(mira, { opacity: 0.7, scale: 1, duration: 0.6, stagger: 0.05, ease: 'expo.out' }, 0.45)
    .to(mira, { strokeDashoffset: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out' }, 0.45);

  // 3. dendritos e os pontos de entrada
  linha
    .to(tracos.slice(0, 3), { strokeDashoffset: 0, duration: 0.42, stagger: 0.06, ease: 'power2.out' }, 0.6)
    .fromTo(pontas.slice(0, 3), { scale: 0, transformOrigin: '50% 50%' },
      { scale: 1, duration: 0.32, stagger: 0.05, ease: 'back.out(2.4)' }, 0.72);

  // 4. pulsos de sinal correm pelos dendritos até a soma
  sinaisEntrada.forEach((sinal, i) => {
    const t = 0.95 + i * 0.06;
    linha
      .to(sinal, { opacity: 1, duration: 0.08, ease: 'none' }, t)
      .to(sinal, { attr: { cx: 15, cy: 24 }, duration: 0.34, ease: 'power2.in' }, t)
      .to(sinal, { opacity: 0, duration: 0.1, ease: 'none' }, t + 0.3);
  });

  // 5. a soma dispara: hachura, contorno, disco cheio, clarão e onda de choque
  const disparo = 1.32;
  linha
    .fromTo(somaHachurada, { scale: 0.2, opacity: 0, transformOrigin: '50% 50%' },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }, disparo - 0.18)
    .to(contornoSoma, { strokeDashoffset: 0, duration: 0.3, ease: 'power1.inOut' }, disparo - 0.12)
    .fromTo(soma, { opacity: 0 }, { opacity: 1, duration: 0.16, ease: 'none' }, disparo)
    .to([soma, somaHachurada], {
      scale: 1.2, duration: 0.14, yoyo: true, repeat: 1, transformOrigin: '50% 50%', ease: 'power2.inOut',
    }, disparo)
    .fromTo(halo, { opacity: 0, scale: 0.3, transformOrigin: '50% 50%' },
      { opacity: 1, scale: 1.5, duration: 0.22, ease: 'power2.out' }, disparo)
    .to(halo, { opacity: 0.55, scale: 1, duration: 0.7, ease: 'power2.out' }, disparo + 0.22)
    .fromTo(onda, { opacity: 0.9, scale: 1, transformOrigin: '50% 50%' },
      { opacity: 0, scale: 4.2, duration: 0.85, ease: 'expo.out' }, disparo + 0.04);

  // 6. o sinal sai pelo axônio e se divide nas duas saídas
  const saida = disparo + 0.16;
  linha.to(tracos.slice(3, 4), { strokeDashoffset: 0, duration: 0.24, ease: 'power2.out' }, saida)
    .to(tracos.slice(4), { strokeDashoffset: 0, duration: 0.26, stagger: 0.04, ease: 'power2.out' }, saida + 0.18);
  sinaisSaida.forEach((sinal, i) => {
    const destino = i === 0 ? { cx: 43.5, cy: 18.5 } : { cx: 43.5, cy: 29.5 };
    linha
      .to(sinal, { opacity: 1, duration: 0.06, ease: 'none' }, saida)
      .to(sinal, { attr: { cx: 37, cy: 24 }, duration: 0.22, ease: 'power1.in' }, saida)
      .to(sinal, { attr: destino, duration: 0.22, ease: 'power1.out' }, saida + 0.22)
      .to(sinal, { opacity: 0, duration: 0.12, ease: 'none' }, saida + 0.38);
  });
  linha.fromTo(pontas.slice(3), { scale: 0, transformOrigin: '50% 50%' },
    { scale: 1, duration: 0.3, stagger: 0.05, ease: 'back.out(2.6)' }, saida + 0.4);

  // 7. o nome surge letra por letra, saindo do desfoque; "Lógica" acende de leve
  if (letras.length) {
    linha.to(letras, {
      opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.04, ease: 'expo.out',
      clearProps: 'filter',
    }, 1.45);
    linha.call(() => nome.classList.add('nome--aceso'), null, 2.0);
  }
  if (status) {
    linha.call(() => { status.textContent = 'traçando os eixos…'; }, null, 1.0);
    linha.to(status, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.0);
  }

  // o risco de progresso acompanha o progresso real da linha do tempo
  if (progresso && comprimentoProgresso) {
    linha.eventCallback('onUpdate', () => {
      progresso.style.strokeDashoffset = `${comprimentoProgresso * (1 - linha.progress())}`;
    });
  }

  // fora da linha do tempo (senão ela nunca terminaria): o anel interno gira devagar e,
  // depois do disparo, o clarão da soma respira até a tela sair
  if (anelInterno) {
    emLoop.push(gsap.to(anelInterno, { rotation: 360, svgOrigin: '120 120', duration: 40, ease: 'none', repeat: -1 }));
  }
  if (halo) {
    linha.call(() => {
      emLoop.push(gsap.to(halo, {
        opacity: 0.85, scale: 1.12, transformOrigin: '50% 50%', duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1,
      }));
    }, null, disparo + 0.95);
  }

  // os estados iniciais já foram aplicados: agora o conteúdo pode aparecer
  tela.classList.add('carregamento--preparado');

  const pronto = Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((resolve) => { linha.eventCallback('onComplete', resolve); }),
  ]);

  // rede de segurança: nunca prender o usuário na abertura
  const limite = setTimeout(encerrar, DURACAO_MAXIMA);

  return pronto.then(() => {
    clearTimeout(limite);
    // um respiro curto depois do último traço, para a abertura não "cortar" seca
    const restante = Math.max(350, DURACAO_MINIMA - (performance.now() - inicio));
    setTimeout(encerrar, restante);
  });
}
