/**
 * Ponto de entrada: liga a tela de carregamento, o tema, as animações de entrada, as
 * fórmulas e os laboratórios da narrativa.
 */

import { PORTAS } from './dados.js';
import { iniciarCarregamento } from './carregamento.js';
import { Laboratorio } from './laboratorio.js';
import { configurarPlayFlutuante } from './play_flutuante.js';
import { configurarZoomLeve } from './zoom_leve.js';
import { montarGavetasDeAtivacao } from './ativacoes_visual.js';
import { configurarProgresso } from './progresso.js';
import { desenharSuperficieDeErro } from './superficie_erro.js';
import { configurarIndicadorDeSecao, configurarMenu } from './navegacao.js';
import { configurarDecoracao } from './decoracao.js';
import {
  configurarAtalhos,
  configurarDicaDePrimeiraVisita,
  configurarPularConteudo,
  configurarTermos,
  manterBaloesNaTela,
} from './acabamento.js';

/* ------------------------------------------------------------------ tema */

const CHAVE_TEMA = 'neurologica:tema';

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  try {
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    // Navegação privada ou dados do site bloqueados: a preferência só não persiste.
  }
  const botao = document.getElementById('botao-tema');
  if (botao) {
    const escuro = tema === 'escuro';
    botao.setAttribute('aria-label', escuro ? 'Usar tema claro' : 'Usar tema escuro');
    botao.setAttribute('aria-pressed', String(escuro));
  }
  document.dispatchEvent(new CustomEvent('neurologica:tema', { detail: { tema } }));
}

function configurarTema() {
  let salvo = null;
  try {
    salvo = localStorage.getItem(CHAVE_TEMA);
  } catch {
    salvo = null;
  }
  const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
  aplicarTema(salvo || (prefereEscuro ? 'escuro' : 'claro'));

  document.getElementById('botao-tema')?.addEventListener('click', () => {
    const atual = document.documentElement.dataset.tema;
    aplicarTema(atual === 'escuro' ? 'claro' : 'escuro');
  });
}

/* ------------------------------------------------- animações de entrada */

function configurarRevelacao() {
  const alvos = document.querySelectorAll('[data-revelar]');
  if (!alvos.length) return;

  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (semMovimento || !('IntersectionObserver' in window)) {
    alvos.forEach((alvo) => alvo.classList.add('revelado'));
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('revelado');
      observador.unobserve(entrada.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  alvos.forEach((alvo) => observador.observe(alvo));
}

/* ------------------------------------------------------------ fórmulas */

/** Renderiza com KaTeX todo elemento com `data-tex` (em bloco se tiver `data-tex-bloco`). */
function renderizarFormulas() {
  if (!window.katex) return;
  document.querySelectorAll('[data-tex]').forEach((elemento) => {
    try {
      window.katex.render(elemento.dataset.tex, elemento, {
        displayMode: elemento.hasAttribute('data-tex-bloco'),
        throwOnError: false,
      });
    } catch {
      elemento.textContent = elemento.dataset.tex;
    }
  });
}

/* --------------------------------------------------- tabelas-verdade */

/** Desenha a tabela-verdade da porta, que é literalmente o conjunto de dados. */
function montarTabelasVerdade() {
  document.querySelectorAll('[data-tabela-porta]').forEach((container) => {
    const porta = PORTAS[container.dataset.tabelaPorta];
    if (!porta) return;

    const cabecalho = porta.entradas === 2
      ? '<th>x₁</th><th>x₂</th><th>saída</th>'
      : '<th>x</th><th>saída</th>';
    const linhas = porta.X.map((entrada, i) => {
      const celulas = entrada.map((v) => `<td>${v}</td>`).join('');
      const classe = porta.y[i] === 1 ? 'saida-1' : 'saida-0';
      return `<tr>${celulas}<td class="${classe}">${porta.y[i]}</td></tr>`;
    }).join('');

    container.innerHTML = `
      <table class="tabela-verdade">
        <caption>${porta.nome}</caption>
        <thead><tr>${cabecalho}</tr></thead>
        <tbody>${linhas}</tbody>
      </table>
    `;
  });
}

/* ------------------------------------------------------- laboratórios */

/**
 * Cada ato abre o laboratório numa configuração escolhida para MOSTRAR O PROBLEMA
 * (roteiro do 04_planejamento.md): o Ato 1 no AND, que funciona, para o texto mandar
 * trocar para o XOR; o Ato 2 no AND com η = 0,7, em que o custo estabiliza com um ponto
 * errado (conferido no JS em testes/gabaritos_site.json).
 */
function montarLaboratorios() {
  const todas = Object.keys(PORTAS);
  const criados = {};

  const ato1 = document.getElementById('lab-ato1');
  if (ato1) {
    criados.ato1 = new Laboratorio(ato1, {
      modos: ['perceptron'], portas: todas, porta: 'AND', modo: 'perceptron',
    });
  }

  const ato2 = document.getElementById('lab-ato2');
  if (ato2) {
    criados.ato2 = new Laboratorio(ato2, {
      modos: ['adaline', 'perceptron'], portas: todas, porta: 'AND', modo: 'adaline', taxa: 0.7,
    });
  }

  // Ato 3: "1 neurônio" (o Adaline do Ato 2) contra a rede 2-2-1 de arquitetura fixa. A rede
  // abre com sigmoide e η = 0,1, que NÃO resolve o XOR com a semente do site (desiste na
  // época 6599, depois de 10 tentativas); subir o η (0,5 em diante) ou trocar para ReLU
  // resolve. A solução de referência é tanh com η = 2 (época 1294).
  const ato3 = document.getElementById('lab-ato3');
  if (ato3) {
    criados.ato3 = new Laboratorio(ato3, {
      modos: ['adaline', 'mlp'],
      rotulos: { adaline: '1 neurônio', mlp: 'rede 2-2-1' },
      rotuloSeletorModo: 'Modelo',
      portas: todas,
      porta: 'XOR',
      modo: 'adaline',
      camadas: [2],
      ativacao: 'sigmoide',
      taxasIniciais: { adaline: 0.1, mlp: 0.1 },
      arquiteturaEditavel: false,
    });
  }

  // Laboratório livre: os três modelos, rede editável e os controles extras. Abre na
  // configuração de referência do Ato 3 (XOR, rede [2], tanh, η = 2, semente 42 → época 1294).
  const livre = document.getElementById('lab-livre');
  if (livre) {
    criados.livre = new Laboratorio(livre, {
      modos: ['mlp', 'perceptron', 'adaline'],
      rotulos: { mlp: 'Rede multicamada' },
      rotuloSeletorModo: 'Modelo',
      portas: todas,
      porta: 'XOR',
      modo: 'mlp',
      camadas: [2],
      ativacao: 'tanh',
      arquiteturaEditavel: true,
      controlesExtras: true,
      problemas: ['portas', 'classificacao'],
      dataset: 'circulo',
    });
  }

  return criados;
}

/* ------------------------------------- "Aplicar parâmetros" dos desafios */

/**
 * Cada gaveta de desafio de classificação tem um botão com a configuração da solução em
 * `data-parametros` (JSON). Clicar leva o laboratório livre a ela e rola até ele; o treino
 * só começa quando o leitor aperta ▶.
 */
function configurarBotoesDeParametros(livre) {
  const botoes = document.querySelectorAll('[data-parametros]');
  if (!livre) {
    botoes.forEach((botao) => { botao.hidden = true; });
    return;
  }
  botoes.forEach((botao) => {
    botao.addEventListener('click', () => {
      let parametros;
      try {
        parametros = JSON.parse(botao.dataset.parametros);
      } catch {
        return;
      }
      if (!livre.aplicarConfiguracao(parametros)) return;
      const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      livre.container.closest('.lab-embrulho')?.scrollIntoView({
        behavior: reduzido ? 'auto' : 'smooth', block: 'start',
      });
    });
  });
}

/* ------------------------------------------------------------- navegação */

function configurarNavegacao() {
  const cabecalho = document.querySelector('.cabecalho');
  if (cabecalho) {
    const aoRolar = () => {
      cabecalho.classList.toggle('cabecalho--rolado', window.scrollY > 12);
    };
    window.addEventListener('scroll', aoRolar, { passive: true });
    aoRolar();
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (evento) => {
      const alvo = document.querySelector(link.getAttribute('href'));
      if (!alvo) return;
      evento.preventDefault();
      alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ----------------------------------------------------------------- início */

function iniciar() {
  configurarTema();
  configurarNavegacao();
  configurarMenu();
  montarTabelasVerdade();
  renderizarFormulas();
  montarGavetasDeAtivacao(document.getElementById('gavetas-ativacao'));
  desenharSuperficieDeErro(document.getElementById('superficie-ato2'));
  configurarProgresso();
  const laboratorios = montarLaboratorios();
  configurarPlayFlutuante(Object.values(laboratorios));
  configurarBotoesDeParametros(laboratorios.livre);
  configurarTermos();
  manterBaloesNaTela();
  configurarAtalhos();
  configurarDicaDePrimeiraVisita();
  configurarPularConteudo();
  configurarDecoracao();
  configurarRevelacao();
  configurarIndicadorDeSecao();
  configurarZoomLeve();
  iniciarCarregamento();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}
