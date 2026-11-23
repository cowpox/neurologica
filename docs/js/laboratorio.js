/**
 * O laboratório interativo: controles + plano de decisão + coluna do algoritmo.
 *
 * O mesmo componente é usado nos três atos da narrativa, só mudando a
 * configuração — quais portas ficam disponíveis e quais modos de treino podem ser
 * escolhidos. Isso evita três telas quase iguais com código triplicado, e faz com
 * que a turma reencontre sempre a mesma interface, prestando atenção no que muda
 * de fato: os dados e o algoritmo.
 */

import { PORTAS, TOLERANCIA_ZERO } from './dados.js';
import { CHAVES_DATASETS, DATASETS, gerarDataset } from './datasets.js';
import { PainelAlgoritmo, formatar, linhaLogContinuo, linhaLogDiscreto } from './algoritmo.js';
import { FAIXA_PORTAS, GraficoDeErro, PlanoDeDecisao } from './grafico.js';
import { RedeVisual, criarAjuda } from './rede_visual.js';
import { TreinoAdaline } from './treino_adaline.js';
import { ATIVACOES, TreinoMLP } from './treino_mlp.js';
import { TreinoPerceptron } from './treino_perceptron.js';

/**
 * Os três modos de treino. `maxEpocas` é o limite de cada um na interface (os gabaritos
 * do site dependem deles: Perceptron 40, Adaline 300, rede 20 000), e `taxas` são as
 * opções do seletor de η. Na lista do neurônio único entram 0,7 (o desafio do Ato 2:
 * estabiliza com um ponto errado) e 1,2 (acima de ~1,0 o Adaline online diverge).
 */
const MODOS = {
  perceptron: {
    rotulo: 'Perceptron', classe: TreinoPerceptron, passosPorSegundo: 6, taxaPadrao: 0.1, maxEpocas: 40,
    taxas: [0.01, 0.05, 0.1, 0.3, 0.5, 0.7, 1, 1.2],
  },
  adaline: {
    rotulo: 'Adaline', classe: TreinoAdaline, passosPorSegundo: 14, taxaPadrao: 0.1, maxEpocas: 300,
    taxas: [0.01, 0.05, 0.1, 0.3, 0.5, 0.7, 1, 1.2],
  },
  mlp: {
    rotulo: 'Rede multicamada', classe: TreinoMLP, passosPorSegundo: 260, taxaPadrao: 2, maxEpocas: 20000,
    taxas: [0.05, 0.1, 0.5, 1, 2, 3, 5],
  },
};

/**
 * Títulos do gráfico de erro. Os rótulos da interface são em caixa alta, e a caixa alta
 * estraga a matemática (η vira "H", z vira "Z"): a fórmula vai num <span class="sem-caixa">.
 */
const TITULOS_ERRO = {
  perceptron: 'Pontos mal classificados',
  adaline: 'Custo <span class="sem-caixa">E = ½ Σ (alvo − z)²</span>',
  mlp: 'Custo <span class="sem-caixa">SSE = ½ Σ (alvo − saída)²</span>',
};

/** Escreve um rótulo protegendo da caixa alta as letras gregas. */
function escreverRotulo(elemento, texto) {
  // um único filho com o texto: o rótulo é flex (para o (?) ficar ao lado), e cada nó
  // de texto solto viraria um item separado, com espaço entre eles
  const conteudo = document.createElement('span');
  texto.split(/([ηΣσ])/).forEach((parte) => {
    if (!parte) return;
    if (/^[ηΣσ]$/.test(parte)) {
      const grego = document.createElement('span');
      grego.className = 'sem-caixa';
      grego.textContent = parte;
      conteudo.appendChild(grego);
    } else {
      conteudo.appendChild(document.createTextNode(parte));
    }
  });
  elemento.replaceChildren(conteudo);
}

/** Distância (no espaço dos dados, onde os pontos distam 1) abaixo da qual a reta "encostou" no ponto. */
const DISTANCIA_RENTE = 0.08;

const formatarTaxa = (valor) => String(valor).replace('.', ',');

let contadorDeListas = 0;
const TAXA_MAXIMA = 100;

/**
 * Animação das linhas do algoritmo. No "próximo passo", cada linha fica acesa
 * MS_POR_LINHA_PASSO_MANUAL. Com o treino rodando, o tempo de um passo é dividido entre as
 * linhas dele; se cada uma ficaria acesa menos que MS_MINIMO_POR_LINHA (pisca sem dar para
 * ler), a linha vai direto ao fim do passo. Valores para ajustar no teste.
 */
const MS_POR_LINHA_PASSO_MANUAL = 220;
const MS_MINIMO_POR_LINHA = 25;
const EPOCAS_MAXIMAS = 1000000;

/**
 * Lê um número digitado: ignora espaços, aceita vírgula ou ponto como separador decimal.
 * Devolve null se não for um número (vazio, letras, "1,2,3").
 */
function lerNumero(texto) {
  const limpo = String(texto).replace(/[\s ]/g, '').replace(',', '.');
  if (!/^\d*\.?\d+$|^\d+\.$/.test(limpo)) return null;
  const valor = Number(limpo);
  return Number.isFinite(valor) ? valor : null;
}

/** Como `lerNumero`, para contagens: "20.000" e "20 000" valem 20000; "1,5" arredonda para 2. */
function lerInteiro(texto) {
  const semEspacos = String(texto).replace(/[\s ]/g, '');
  const milhar = /^\d{1,3}(\.\d{3})+$/.test(semEspacos) ? semEspacos.replace(/\./g, '') : semEspacos;
  const valor = lerNumero(milhar);
  return valor === null ? null : Math.round(valor);
}
/**
 * Campo que junta as duas coisas: digitar qualquer valor OU escolher um predefinido numa lista.
 * O <datalist> do navegador não serve: ele filtra as sugestões pelo texto já escrito, então com
 * o valor atual no campo só sobra uma opção. Esta lista mostra sempre todos os predefinidos.
 *
 * `confirmar(texto)` recebe o que o usuário digitou ou escolheu; ao terminar, o campo é
 * reescrito com `valorAtual()`, o que também desfaz uma entrada inválida.
 */
function criarCampoComLista({ valores, valorAtual, formatar, inputMode, rotuloLista, confirmar }) {
  const embrulho = document.createElement('div');
  embrulho.className = 'campo-combo';

  const entrada = document.createElement('input');
  entrada.type = 'text';
  entrada.inputMode = inputMode;
  entrada.autocomplete = 'off';
  entrada.className = 'campo-controle campo-controle--digitavel';
  entrada.setAttribute('role', 'combobox');
  entrada.setAttribute('aria-autocomplete', 'none');
  entrada.setAttribute('aria-expanded', 'false');
  entrada.value = formatar(valorAtual());

  const seta = document.createElement('button');
  seta.type = 'button';
  seta.className = 'campo-combo-seta';
  seta.tabIndex = -1;
  seta.setAttribute('aria-label', rotuloLista);

  const lista = document.createElement('ul');
  lista.className = 'campo-combo-lista';
  lista.setAttribute('role', 'listbox');
  lista.setAttribute('aria-label', rotuloLista);
  lista.hidden = true;
  entrada.setAttribute('aria-controls', (lista.id = `combo-${++contadorDeListas}`));

  const itens = valores.map((valor) => {
    const item = document.createElement('li');
    item.className = 'campo-combo-opcao';
    item.setAttribute('role', 'option');
    item.textContent = formatar(valor);
    item.addEventListener('mousedown', (evento) => evento.preventDefault()); // não tira o foco do campo
    item.addEventListener('click', (evento) => {
      evento.preventDefault(); // o <label> do campo não deve redirecionar este clique
      entrada.value = item.textContent;
      fechar();
      aplicar();
    });
    lista.appendChild(item);
    return item;
  });

  let ativo = -1;
  const destacar = (indice) => {
    ativo = indice;
    itens.forEach((item, i) => {
      item.classList.toggle('campo-combo-opcao--ativa', i === ativo);
      item.setAttribute('aria-selected', String(i === ativo));
    });
    if (ativo >= 0) itens[ativo].scrollIntoView({ block: 'nearest' });
  };
  const marcarAtual = () => {
    const atual = formatar(valorAtual());
    itens.forEach((item) => item.classList.toggle('campo-combo-opcao--atual', item.textContent === atual));
  };
  const abrir = () => {
    if (!lista.hidden) return;
    marcarAtual();
    lista.hidden = false;
    embrulho.classList.add('campo-combo--aberto');
    entrada.setAttribute('aria-expanded', 'true');
    destacar(-1);
  };
  function fechar() {
    lista.hidden = true;
    embrulho.classList.remove('campo-combo--aberto');
    entrada.setAttribute('aria-expanded', 'false');
  }
  function aplicar() {
    confirmar(entrada.value);
    entrada.value = formatar(valorAtual());
  }

  seta.addEventListener('mousedown', (evento) => evento.preventDefault());
  seta.addEventListener('click', (evento) => {
    evento.preventDefault();
    if (lista.hidden) { entrada.focus(); abrir(); } else fechar();
  });
  entrada.addEventListener('focus', () => entrada.select());
  entrada.addEventListener('click', () => abrir());
  entrada.addEventListener('blur', () => { fechar(); aplicar(); });
  entrada.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault();
      abrir();
      const passo = evento.key === 'ArrowDown' ? 1 : -1;
      destacar((ativo + passo + itens.length) % itens.length);
    } else if (evento.key === 'Enter') {
      evento.preventDefault();
      if (!lista.hidden && ativo >= 0) entrada.value = itens[ativo].textContent;
      fechar();
      entrada.blur();
    } else if (evento.key === 'Escape' && !lista.hidden) {
      evento.preventDefault();
      fechar();
    }
  });

  embrulho.append(entrada, seta, lista);
  return embrulho;
}

const plural = (n, singular, pluralTexto) => `${n} ${n === 1 ? singular : pluralTexto}`;

/** Todos os laboratórios montados: iniciar um pausa os outros (cada um guarda o seu estado). */
const LABORATORIOS = new Set();

export class Laboratorio {
  constructor(container, config = {}) {
    this.container = container;
    this.config = {
      modos: ['perceptron', 'adaline'],
      portas: Object.keys(PORTAS),
      porta: 'AND',
      modo: 'perceptron',
      camadas: [2],
      ativacao: 'tanh',
      taxa: null,          // η inicial; null = o padrão do modo
      taxasIniciais: {},   // η inicial por modo, ao trocar de modo (ex.: { mlp: 0.1 })
      rotulos: {},         // rótulos próprios dos modos neste laboratório (ex.: '1 neurônio')
      arquiteturaEditavel: true,
      controlesExtras: false, // semente, reinício automático e máximo de épocas (laboratório livre)
      semente: 42,
      problemas: ['portas'], // ['portas', 'classificacao'] no laboratório livre
      dataset: 'circulo',
      ...config,
    };
    this.problema = this.config.problemas[0];
    this.dataset = this.config.dataset;
    this.cacheDatasets = {};
    this.semente = this.config.semente;
    this.reinicio = true;
    this.maxEpocasPorModo = {};

    this.modo = this.config.modo;
    this.porta = this.config.porta;
    this.camadas = [...this.config.camadas];
    this.ativacao = this.config.ativacao;
    this.taxa = this.config.taxa ?? this.taxaInicial(this.modo);
    this.velocidade = 1;
    this.rodando = false;
    this.acumulador = 0;
    this.ultimoTempo = 0;

    LABORATORIOS.add(this);
    this.montar();
    this.construirTreino();

    // Troca de tema (botão do cabeçalho ou preferência do sistema): os gráficos leem as
    // cores no momento de desenhar, então é preciso redesenhar. Sem isso, ao passar do
    // escuro para o claro com o treino parado, a reta continuava branca (e o fundo e a
    // rede com as cores antigas) até o próximo passo.
    this.aoMudarTema = () => requestAnimationFrame(() => { if (this.treino) this.renderizar(null); });
    document.addEventListener('neurologica:tema', this.aoMudarTema);
    this.temaDoSistema = window.matchMedia('(prefers-color-scheme: dark)');
    this.temaDoSistema.addEventListener('change', this.aoMudarTema);
  }

  /**
   * Os dados do treino atual: a porta lógica escolhida ou o conjunto de classificação
   * (gerado uma vez, com a semente fixa dos dados, e guardado).
   */
  dadosAtuais() {
    if (this.problema !== 'classificacao') return PORTAS[this.porta];
    if (!this.cacheDatasets[this.dataset]) this.cacheDatasets[this.dataset] = gerarDataset(this.dataset);
    return this.cacheDatasets[this.dataset];
  }

  /** Muitos pontos (classificação): log só por época e desenho compacto. */
  get emNuvem() {
    return this.problema === 'classificacao';
  }

  taxaInicial(modo) {
    return this.config.taxasIniciais[modo] ?? MODOS[modo].taxaPadrao;
  }

  /**
   * Põe o laboratório numa configuração pronta (usada pelo botão "Aplicar parâmetros" das
   * gavetas de desafio): problema, conjunto de dados ou porta, modelo, arquitetura,
   * ativação, taxa e velocidade. Reinício automático desligado, semente 42 e limite de épocas
   * padrão, que são as condições em que os números das gavetas foram medidos. Não inicia o
   * treino: quem aperta o ▶ é o leitor.
   */
  aplicarConfiguracao({
    problema = 'portas', dataset = this.dataset, porta = this.porta, modo = this.modo,
    camadas = this.camadas, ativacao = this.ativacao, taxa = null, velocidade = 1,
  } = {}) {
    if (!this.config.modos.includes(modo) || !this.config.problemas.includes(problema)) return false;
    this.pausar();
    this.problema = problema;
    this.dataset = dataset;
    this.porta = porta;
    this.modo = modo;
    this.camadas = [...camadas];
    this.ativacao = ativacao;
    this.taxa = taxa ?? this.taxaInicial(modo);
    this.velocidade = velocidade;
    this.semente = 42;
    this.reinicio = false;
    this.maxEpocasPorModo = {};
    this.montarCampos();
    this.construirTreino();
    return true;
  }

  rotuloDoModo(chave) {
    return this.config.rotulos[chave] ?? MODOS[chave].rotulo;
  }

  /**
   * Avisa quem estiver ouvindo (pistas e conquistas) sobre o que aconteceu no treino. A
   * configuração enviada é a do TREINO (guardada quando ele foi criado), e não a dos
   * controles: ao abandonar um treino porque o modo mudou, o evento descreve o treino
   * antigo, não o novo.
   */
  emitir(nome, detalhe = {}) {
    this.container.dispatchEvent(new CustomEvent(`laboratorio:${nome}`, {
      bubbles: true,
      detail: { laboratorio: this, treino: this.treino, ...this.contexto, ...detalhe },
    }));
  }

  // ---------------------------------------------------------------- estrutura

  montar() {
    this.container.classList.add('laboratorio');
    this.container.innerHTML = `
      <div class="lab-grade">
        <!-- Coluna da esquerda: seletores, aviso e o painel do algoritmo. A da direita sobe até
             o topo do cartão (a rede, quando existe, abre essa coluna), em vez de começar
             embaixo de uma faixa de seletores que deixava o canto direito vazio. -->
        <div class="lab-coluna lab-coluna--esquerda">
          <div class="lab-controles">
            <div class="lab-campos"></div>
            <div class="lab-controles-linha lab-controles-linha--secundaria"></div>
          </div>
          <div class="lab-aviso" hidden></div>
          <div class="lab-coluna--algoritmo"></div>
        </div>
        <div class="lab-coluna lab-coluna--grafico">
          <div class="lab-rede-embrulho" hidden>
            <div class="lab-secao-titulo">
              <span>A rede</span>
              <span class="lab-legenda-conexoes">
                <span class="amostra amostra--positiva"></span> peso positivo
                <span class="amostra amostra--negativa"></span> peso negativo
              </span>
            </div>
            <div class="lab-rede"></div>
          </div>
          <!-- Botões do treino e estado juntos, logo acima do plano: o ▶ fica ao lado do
               que ele faz mudar, e a época e os acertos ficam à vista durante o treino. -->
          <div class="lab-painel-treino">
            <div class="lab-transporte">
              <button type="button" class="botao-tocar" data-acao="tocar" aria-label="Iniciar treino"
                      aria-keyshortcuts="Space" title="Tocar / pausar (Espaço)">
                <svg viewBox="0 0 24 24" class="icone-tocar" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>
                <svg viewBox="0 0 24 24" class="icone-pausar" aria-hidden="true"><path d="M7 5h3.2v14H7zm6.8 0H17v14h-3.2z"/></svg>
              </button>
              <button type="button" class="botao-secundario" data-acao="passo" aria-label="Avançar um passo"
                      aria-keyshortcuts="ArrowRight" title="Avançar um passo (→)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5.5v13l9-6.5z"/><path d="M17 5h2v14h-2z"/></svg>
              </button>
              <button type="button" class="botao-secundario" data-acao="reiniciar" aria-label="Reiniciar treino" title="Recomeçar">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2L8 6l4 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>
              </button>
            </div>
            <div class="lab-estado" aria-live="polite"></div>
          </div>
          <div class="lab-plano-embrulho">
            <div class="lab-plano"></div>
          </div>
          <div class="lab-erro-embrulho">
            <div class="lab-secao-titulo lab-secao-titulo--erro">
              <span class="lab-erro-titulo">Erro por época</span>
            </div>
            <div class="lab-erro"></div>
          </div>
        </div>
      </div>
    `;

    this.elCampos = this.container.querySelector('.lab-campos');
    this.elSecundaria = this.container.querySelector('.lab-controles-linha--secundaria');
    this.elAviso = this.container.querySelector('.lab-aviso');
    this.elRedeEmbrulho = this.container.querySelector('.lab-rede-embrulho');
    this.elRede = this.container.querySelector('.lab-rede');
    this.elEstado = this.container.querySelector('.lab-estado');
    this.elErroTitulo = this.container.querySelector('.lab-erro-titulo');
    this.botaoTocar = this.container.querySelector('[data-acao="tocar"]');

    this.botaoTocar.addEventListener('click', () => this.alternarReproducao());
    this.container.querySelector('[data-acao="passo"]').addEventListener('click', () => {
      this.pausar();
      this.avancarUmPasso();
    });
    this.container.querySelector('[data-acao="reiniciar"]').addEventListener('click', () => {
      this.pausar();
      this.construirTreino();
    });

    this.painel = new PainelAlgoritmo(this.container.querySelector('.lab-coluna--algoritmo'));
    // Laboratório livre num PC (mouse e tela larga): região de decisão com 3× a resolução
    // (180 em vez de 60 células por lado), para a fronteira não ficar serrilhada. No celular
    // e nos atos continua 60, que é leve.
    const pcComTelaLarga = window.matchMedia?.('(pointer: fine) and (min-width: 900px)').matches;
    this.plano = new PlanoDeDecisao(this.container.querySelector('.lab-plano'), {
      resolucao: this.config.controlesExtras && pcComTelaLarga ? 180 : undefined,
    });
    this.grafico = new GraficoDeErro(this.container.querySelector('.lab-erro'));

    this.montarCampos();
    this.montarLegendaErro();
    this.montarAjudaDaRede();
  }

  /**
   * Os dois botões (?) que explicam o mini-gráfico de cada neurônio e as linhas entre
   * eles (pedidos desde a Decisão 7). Tinham sumido quando a rede foi reescrita como um
   * SVG único, sem que os testes percebessem. Os textos descrevem as cores dos gráficos,
   * que são rosa e ciano (a paleta dos dados).
   */
  montarAjudaDaRede() {
    const titulo = this.container.querySelector('.lab-rede-embrulho .lab-secao-titulo');
    const rotulo = titulo?.firstElementChild;
    const legenda = titulo?.querySelector('.lab-legenda-conexoes');
    if (!titulo || !rotulo || !legenda) return;

    const ajudaMiniatura = criarAjuda(
      'O mini-gráfico',
      'Cada quadradinho mostra a saída daquele neurônio em todo o plano de entrada: ' +
      'rosa onde ele responde alto, ciano onde responde baixo. É o recorte que aquele ' +
      'neurônio sozinho aprendeu. O da saída é a resposta final da rede. Toque para ' +
      'ampliar e toque de novo para voltar.',
    );
    // fica perto da borda esquerda: o balão abre alinhado à esquerda para não ser cortado
    ajudaMiniatura.classList.add('ajuda--alinhada-esquerda');
    rotulo.after(ajudaMiniatura);

    const ajudaLinhas = criarAjuda(
      'As linhas entre neurônios',
      'A espessura é o tamanho do peso. Rosa é peso positivo e ciano é peso negativo. ' +
      'O brilho é a ativação real do neurônio de origem: linha apagada, neurônio calado.',
    );
    // fica junto à borda direita: o balão abre alinhado à direita para não ser cortado
    ajudaLinhas.classList.add('ajuda--alinhada-direita');
    legenda.appendChild(ajudaLinhas);
  }

  montarLegendaErro() {
    const titulo = this.container.querySelector('.lab-secao-titulo--erro');
    titulo.appendChild(criarAjuda(
      'A curva de erro',
      'Mostra o quanto a rede ainda erra a cada época. O formato dela conta a ' +
      'história: o Perceptron faz uma escada, porque conta pontos errados (número ' +
      'inteiro); o Adaline e a rede fazem uma curva lisa, porque medem um erro ' +
      'contínuo e podem melhorar um pouquinho de cada vez.',
    ));
  }

  criarCampo(rotulo, elemento) {
    const embrulho = document.createElement('label');
    embrulho.className = 'campo';
    const texto = document.createElement('span');
    texto.className = 'campo-rotulo';
    escreverRotulo(texto, rotulo);
    // O <select> ganha um invólucro só para ancorar a seta desenhada que substitui a
    // nativa (ver "Seletores do laboratório" em estilo.css). Não muda o comportamento.
    if (elemento.tagName === 'SELECT') {
      const seletor = document.createElement('span');
      seletor.className = 'campo-seletor';
      seletor.appendChild(elemento);
      embrulho.append(texto, seletor);
    } else {
      embrulho.append(texto, elemento);
    }
    return embrulho;
  }

  montarCampos() {
    this.elCampos.innerHTML = '';

    // tipo de problema (só no laboratório livre): portas lógicas ou classificação
    if (this.config.problemas.length > 1) {
      const seletorProblema = document.createElement('select');
      seletorProblema.className = 'campo-controle';
      [['portas', 'Portas lógicas'], ['classificacao', 'Classificação']].forEach(([valor, rotulo]) => {
        if (!this.config.problemas.includes(valor)) return;
        const opcao = document.createElement('option');
        opcao.value = valor;
        opcao.textContent = rotulo;
        seletorProblema.appendChild(opcao);
      });
      seletorProblema.value = this.problema;
      seletorProblema.addEventListener('change', (evento) => {
        this.problema = evento.target.value;
        // Nos conjuntos de classificação o erro cai devagar e por muito tempo, e a janela de
        // reinício confundiria isso com estar preso: ali o reinício começa desligado.
        this.reinicio = this.problema === 'portas';
        this.pausar();
        this.montarCampos();
        this.construirTreino();
      });
      const campoProblema = this.criarCampo('Problema', seletorProblema);
      campoProblema.querySelector('.campo-rotulo').appendChild(criarAjuda(
        'Portas lógicas ou classificação',
        'As portas são tabelas-verdade de 4 pontos. Na classificação, são 200 pontos em ' +
        'formatos clássicos (círculo, XOR em quadrantes, duas nuvens, espiral, meias-luas, xadrez e yin-yang): a ' +
        'mesma rede, problemas maiores. Lá o treino para quando acerta todos os pontos.',
      ));
      this.elCampos.appendChild(campoProblema);
    }

    if (this.problema === 'classificacao') {
      // seletor de conjunto de dados
      const seletorDados = document.createElement('select');
      seletorDados.className = 'campo-controle';
      CHAVES_DATASETS.forEach((chave) => {
        const opcao = document.createElement('option');
        opcao.value = chave;
        opcao.textContent = DATASETS[chave].nome;
        seletorDados.appendChild(opcao);
      });
      seletorDados.value = this.dataset;
      seletorDados.addEventListener('change', (evento) => {
        this.dataset = evento.target.value;
        this.pausar();
        this.construirTreino();
      });
      this.elCampos.appendChild(this.criarCampo('Conjunto de dados', seletorDados));
    } else {
      // seletor de porta lógica
      const seletorPorta = document.createElement('select');
      seletorPorta.className = 'campo-controle';
      this.config.portas.forEach((nome) => {
        const opcao = document.createElement('option');
        opcao.value = nome;
        opcao.textContent = nome;
        seletorPorta.appendChild(opcao);
      });
      seletorPorta.value = this.porta;
      seletorPorta.addEventListener('change', (evento) => {
        this.porta = evento.target.value;
        this.pausar();
        this.construirTreino();
      });
      this.elCampos.appendChild(this.criarCampo('Porta lógica', seletorPorta));
      this.seletorPorta = seletorPorta;
    }

    // seletor de modo de treino
    if (this.config.modos.length > 1) {
      const seletorModo = document.createElement('select');
      seletorModo.className = 'campo-controle';
      this.config.modos.forEach((chave) => {
        const opcao = document.createElement('option');
        opcao.value = chave;
        opcao.textContent = this.rotuloDoModo(chave);
        seletorModo.appendChild(opcao);
      });
      seletorModo.value = this.modo;
      seletorModo.addEventListener('change', (evento) => {
        this.modo = evento.target.value;
        this.taxa = this.taxaInicial(this.modo);
        this.pausar();
        this.montarCampos();
        this.construirTreino();
      });
      this.elCampos.appendChild(this.criarCampo(this.config.rotuloSeletorModo ?? 'Regra de treino', seletorModo));
    }

    // ativação (só faz sentido na rede)
    if (this.modo === 'mlp') {
      const seletorAtivacao = document.createElement('select');
      seletorAtivacao.className = 'campo-controle';
      Object.keys(ATIVACOES).forEach((chave) => {
        const opcao = document.createElement('option');
        opcao.value = chave;
        opcao.textContent = ATIVACOES[chave].rotulo;
        seletorAtivacao.appendChild(opcao);
      });
      seletorAtivacao.value = this.ativacao;
      seletorAtivacao.addEventListener('change', (evento) => {
        this.ativacao = evento.target.value;
        this.pausar();
        this.construirTreino();
      });
      const campo = this.criarCampo('Ativação', seletorAtivacao);
      campo.querySelector('.campo-rotulo').appendChild(criarAjuda(
        'Por que trocar a ativação',
        'O degrau do Perceptron tem derivada zero em toda parte, então não há ' +
        'gradiente para propagar, e o backpropagation simplesmente não existiria. ' +
        'Trocar por uma função diferenciável não é preferência estética: é o que ' +
        'torna o treino possível.',
      ));
      this.elCampos.appendChild(campo);
    }

    // taxa de aprendizado
    // campo digitável: aceita 0,3 / 0.3 / " 0 , 3 "; as sugestões (datalist) são as taxas prontas
    // Só no laboratório livre (controlesExtras) o campo é digitável; nos atos é uma gaveta
    // (<select>) com as taxas prontas.
    const digitavel = this.config.controlesExtras;
    const taxasProntas = [...new Set([...MODOS[this.modo].taxas, this.taxa])].sort((a, b) => a - b);
    let seletorTaxa;
    if (digitavel) {
      seletorTaxa = criarCampoComLista({
        valores: MODOS[this.modo].taxas,
        valorAtual: () => this.taxa,
        formatar: formatarTaxa,
        inputMode: 'decimal',
        rotuloLista: 'Taxas de aprendizado prontas',
        confirmar: (texto) => {
          const valor = lerNumero(texto);
          if (valor === null || valor <= 0 || valor > TAXA_MAXIMA || valor === this.taxa) return;
          this.taxa = valor;
          this.pausar();
          this.construirTreino();
        },
      });
    } else {
      seletorTaxa = document.createElement('select');
      seletorTaxa.className = 'campo-controle';
      taxasProntas.forEach((valor) => {
        const opcao = document.createElement('option');
        opcao.value = String(valor);
        opcao.textContent = formatarTaxa(valor);
        seletorTaxa.appendChild(opcao);
      });
      seletorTaxa.value = String(this.taxa);
      seletorTaxa.addEventListener('change', (evento) => {
        this.taxa = Number(evento.target.value);
        this.pausar();
        this.construirTreino();
      });
    }
    const campoTaxa = this.criarCampo('Taxa (η)', seletorTaxa);
    campoTaxa.querySelector('.campo-rotulo').appendChild(criarAjuda(
      'Taxa de aprendizado (η)',
      'O tamanho de cada correção. Pequena demais, o treino anda devagar; grande demais, os ' +
      'pesos passam do ponto e o neurônio converge para uma solução ruim, ou o erro diverge.',
    ));
    this.elCampos.appendChild(campoTaxa);
    this.seletorTaxa = seletorTaxa;

    if (this.config.controlesExtras) this.montarCamposExtras();

    // velocidade da animação
    const seletorVelocidade = document.createElement('select');
    seletorVelocidade.className = 'campo-controle';
    [['0.5', 'lenta'], ['1', 'normal'], ['3', 'rápida'], ['8', 'turbo']].forEach(([valor, rotulo]) => {
      const opcao = document.createElement('option');
      opcao.value = valor;
      opcao.textContent = rotulo;
      seletorVelocidade.appendChild(opcao);
    });
    seletorVelocidade.value = String(this.velocidade);
    seletorVelocidade.addEventListener('change', (evento) => {
      this.velocidade = Number(evento.target.value);
    });
    this.elCampos.appendChild(this.criarCampo('Velocidade', seletorVelocidade));
  }

  /**
   * Controles do laboratório livre: a semente do sorteio dos pesos, o reinício automático
   * (só na rede) e o limite de épocas. O `TreinoMLP` sempre aceitou os três; a demo só não
   * os mostrava.
   */
  montarCamposExtras() {
    const seletor = (opcoes, valor, aoMudar) => {
      const s = document.createElement('select');
      s.className = 'campo-controle';
      opcoes.forEach(([v, rotulo]) => {
        const opcao = document.createElement('option');
        opcao.value = String(v);
        opcao.textContent = rotulo;
        s.appendChild(opcao);
      });
      s.value = String(valor);
      s.addEventListener('change', (evento) => {
        aoMudar(evento.target.value);
        this.pausar();
        this.construirTreino();
      });
      return s;
    };

    const semente = document.createElement('input');
    semente.type = 'number';
    semente.inputMode = 'numeric';
    semente.min = '0';
    semente.max = '9999';
    semente.step = '1';
    semente.className = 'campo-controle campo-controle--numero';
    semente.value = String(this.semente);
    semente.addEventListener('change', () => {
      const valor = Math.round(Number(semente.value));
      this.semente = Number.isFinite(valor) ? Math.min(9999, Math.max(0, valor)) : 42;
      semente.value = String(this.semente);
      this.pausar();
      this.construirTreino();
    });
    const campoSemente = this.criarCampo('Semente', semente);
    campoSemente.querySelector('.campo-rotulo').appendChild(criarAjuda(
      'Semente',
      'O número que sorteia os pesos iniciais. A mesma semente dá sempre o mesmo treino, para ' +
      'repetir um experimento; outra semente, outro ponto de partida.',
    ));
    this.elCampos.appendChild(campoSemente);

    if (this.modo === 'mlp') {
      const campoReinicio = this.criarCampo('Reinício automático', seletor(
        [['sim', 'ligado'], ['nao', 'desligado']], this.reinicio ? 'sim' : 'nao',
        (v) => { this.reinicio = v === 'sim'; },
      ));
      campoReinicio.querySelector('.campo-rotulo').appendChild(criarAjuda(
        'Reinício automático',
        'Se em 300 épocas o erro quase não cai, a rede interrompe aquela tentativa e sorteia ' +
        'pesos novos. Desligue para ver a rede presa num mínimo local ou num platô.',
      ));
      this.elCampos.appendChild(campoReinicio);
    }

    const limites = {
      perceptron: [10, 20, 40, 100, 200],
      adaline: [50, 100, 300, 1000],
      mlp: [1000, 5000, 20000, 50000],
    }[this.modo];
    const limiteAtual = () => this.maxEpocasPorModo[this.modo] ?? MODOS[this.modo].maxEpocas;
    const campoLimite = criarCampoComLista({
      valores: limites,
      valorAtual: limiteAtual,
      formatar: (v) => v.toLocaleString('pt-BR'),
      inputMode: 'numeric',
      rotuloLista: 'Limites de épocas prontos',
      confirmar: (texto) => {
        const valor = lerInteiro(texto);
        if (valor === null || valor < 1 || valor > EPOCAS_MAXIMAS || valor === limiteAtual()) return;
        this.maxEpocasPorModo[this.modo] = valor;
        this.pausar();
        this.construirTreino();
      },
    });
    const campoEpocas = this.criarCampo('Máx. de épocas', campoLimite);
    this.elCampos.appendChild(campoEpocas);
  }

  // ------------------------------------------------------------------- treino

  construirTreino() {
    // Um treino trocado no meio (parâmetro, porta ou modo mudou, ou ↺) é uma tentativa
    // abandonada; quem conta tentativas para liberar pistas precisa saber disso.
    const anterior = this.treino;
    if (anterior && !anterior.terminou && anterior.historicoErro.length > 0) {
      this.emitir('abandonou', { treino: anterior, epocasConcluidas: anterior.historicoErro.length });
    }

    const porta = this.dadosAtuais();
    const comum = {
      X: porta.X, y: porta.y, taxa: this.taxa, semente: this.semente,
      maxEpocas: this.maxEpocasPorModo[this.modo] ?? MODOS[this.modo].maxEpocas,
    };

    if (this.modo === 'mlp') {
      this.treino = new TreinoMLP({
        ...comum, camadas: this.camadas, ativacao: this.ativacao, reiniciarAoEmpacar: this.reinicio,
        // classificação: "resolveu" é acertar todos os pontos (datasets.js gera sem sobreposição)
        pararQuando: this.emNuvem ? 'acertos' : 'erro',
      });
      // os mini-gráficos e as retas dos neurônios usam a mesma faixa do plano
      if (porta.faixa) this.treino.faixaDoPlano = porta.faixa;
    } else if (this.modo === 'adaline') {
      this.treino = new TreinoAdaline(comum);
    } else {
      this.treino = new TreinoPerceptron(comum);
    }
    this.contexto = {
      modo: this.modo, porta: this.emNuvem ? this.dataset : this.porta, taxa: this.taxa,
      ativacao: this.ativacao, camadas: [...this.camadas], problema: this.problema,
    };
    this.plano.definirDados({ faixa: porta.faixa ?? FAIXA_PORTAS, escala: porta.escala ?? null, nuvem: this.emNuvem });

    const Classe = MODOS[this.modo].classe;
    this.painel.definirPseudocodigo(Classe.pseudocodigo);
    this.painel.limparLog();
    this.elErroTitulo.innerHTML = TITULOS_ERRO[this.modo];

    // o plano precisa saber se o espaço é 1D (NOT) ou 2D
    if (this.plano.entradas !== porta.entradas) {
      this.plano.entradas = porta.entradas;
    }

    if (this.modo === 'mlp') {
      this.elRedeEmbrulho.hidden = false;
      if (!this.redeVisual) {
        this.redeVisual = new RedeVisual(this.elRede, {
          aoMudarArquitetura: (camadas) => {
            this.camadas = camadas;
            this.pausar();
            this.construirTreino();
          },
          editavel: this.config.arquiteturaEditavel,
        });
      }
      this.redeVisual.definirTreino(this.treino);
    } else {
      this.elRedeEmbrulho.hidden = true;
    }

    this.atualizarAviso();
    this.renderizar(null);
    // treino novo: os pesos acabaram de ser sorteados, a execução está na primeira linha
    this.painel.destacarLinha('inicio');
    this.atualizarEstado();
  }

  atualizarAviso() {
    const porta = this.dadosAtuais();
    const neuronioUnico = this.modo !== 'mlp';

    if (neuronioUnico && !porta.separavel) {
      this.elAviso.hidden = false;
      this.elAviso.className = 'lab-aviso lab-aviso--atencao';
      this.elAviso.innerHTML =
        `<strong>${porta.nome} não é linearmente separável.</strong> ` +
        'Este modo tem um neurônio só, ou seja, uma reta só, e nenhuma reta separa ' +
        'estas classes. Execute assim mesmo: o que interessa aqui é ver COMO ele falha.';
    } else {
      this.elAviso.hidden = true;
    }
  }

  // ---------------------------------------------------------------- animação

  alternarReproducao() {
    if (this.rodando) this.pausar();
    else this.tocar();
  }

  tocar() {
    // Um laboratório rodando por vez: os outros pausam e guardam o próprio estado.
    LABORATORIOS.forEach((outro) => { if (outro !== this && outro.rodando) outro.pausar(); });
    if (this.treino.terminou) this.construirTreino();
    this.rodando = true;
    this.container.classList.add('laboratorio--rodando');
    this.botaoTocar.setAttribute('aria-label', 'Pausar treino');
    this.ultimoTempo = performance.now();
    this.acumulador = 0;
    this.laco(this.ultimoTempo);
  }

  pausar() {
    const estavaRodando = this.rodando;
    this.rodando = false;
    this.container.classList.remove('laboratorio--rodando');
    this.botaoTocar?.setAttribute('aria-label', 'Iniciar treino');
    if (this.quadro) cancelAnimationFrame(this.quadro);
    // o último quadro do treino saiu na grade leve: redesenha parado, com a resolução cheia
    if (estavaRodando && this.plano.resolucao > 60) {
      requestAnimationFrame(() => { if (!this.rodando && this.treino) this.renderizar(null); });
    }
  }

  laco(agora) {
    if (!this.rodando) return;
    const decorrido = Math.min(120, agora - this.ultimoTempo);
    this.ultimoTempo = agora;

    // Nos modos de neurônio único um passo é UM exemplo: com 200 pontos, uma época levaria
    // meio minuto. Ali a velocidade cresce com o número de pontos (a mesma cadência de épocas
    // das portas, que têm 4).
    const porExemplo = this.modo !== 'mlp' ? Math.max(1, this.treino.X.length / 4) : 1;
    const porSegundo = MODOS[this.modo].passosPorSegundo * this.velocidade * porExemplo;
    this.acumulador += (decorrido / 1000) * porSegundo;

    // teto de passos por quadro: sem isso, uma aba que volta do segundo plano
    // tentaria recuperar todo o tempo parado de uma vez e travaria a página
    let passos = Math.min(Math.floor(this.acumulador), 400);
    this.acumulador -= Math.floor(this.acumulador);

    let ultimo = null;
    let dados = 0;
    while (passos > 0 && !this.treino.terminou) {
      ultimo = this.avancarUmPasso(false);
      passos -= 1;
      dados += 1;
    }

    // A animação das linhas do algoritmo cabe no intervalo até o próximo passo; com mais de
    // um passo no mesmo quadro não há intervalo nenhum, e a linha vai direto ao fim.
    if (ultimo) this.renderizar(ultimo, { msDoPasso: dados === 1 ? 1000 / porSegundo : 0 });
    this.atualizarEstado();

    if (this.treino.terminou) {
      this.pausar();
      this.registrarDesfecho();
      return;
    }
    this.quadro = requestAnimationFrame((t) => this.laco(t));
  }

  avancarUmPasso(renderizar = true) {
    if (this.treino.terminou) return null;
    const passo = this.treino.passo();
    this.registrarLog(passo);
    if (renderizar) {
      // "próximo passo": sem pressa, cada linha fica acesa o bastante para ser lida
      this.renderizar(passo, { msPorLinha: MS_POR_LINHA_PASSO_MANUAL });
      this.atualizarEstado();
      if (this.treino.terminou) this.registrarDesfecho();
    }
    return passo;
  }

  registrarLog(passo) {
    if (!passo) return;
    // com centenas de pontos, uma linha por exemplo afogaria o log: só o resumo de cada época
    if (this.emNuvem && this.modo !== 'mlp' && !passo.fimDeEpoca) return;
    if (this.modo === 'perceptron') {
      if (!this.emNuvem) {
        this.painel.adicionarLog(linhaLogDiscreto(passo), passo.houveAtualizacao ? 'log-linha--mudou' : '');
      }
      if (passo.fimDeEpoca) {
        // erros contados com os pesos FINAIS da época (Decisão 5); as correções, durante ela
        this.painel.adicionarLog(
          `fim da época ${passo.epoca}: ${plural(passo.correcoesNaEpoca, 'correção', 'correções')} · ` +
          `${plural(passo.errosNaEpoca, 'errado', 'errados')}`,
          'log-linha--epoca',
        );
      }
    } else if (this.modo === 'adaline') {
      if (!this.emNuvem) this.painel.adicionarLog(linhaLogContinuo(passo));
      if (passo.fimDeEpoca) {
        this.painel.adicionarLog(
          `fim da época ${passo.epoca}: E = ${formatar(passo.sse, 4)} · ` +
          `${plural(passo.errosNaEpoca, 'errado', 'errados')}`,
          'log-linha--epoca',
        );
      }
    } else {
      if (passo.reiniciou) {
        this.painel.adicionarLog(
          // A janela só vê que o erro quase não caiu em 300 épocas: pode ser um mínimo
          // local ou um platô (passo pequeno, ativação saturada). Não afirma qual.
          `⟳ época ${passo.epoca}: o erro quase não caiu em 300 épocas (SSE ${formatar(passo.sse, 4)}). ` +
          'Estagnou: sorteando pesos novos.', 'log-linha--reinicio',
        );
      } else if (passo.epoca % 25 === 0) {
        const total = passo.saidas.length;
        // com 4 pontos, as 4 saídas cabem na linha; com 200, só a contagem de acertos
        const detalhe = this.emNuvem
          ? `acertos=${total - passo.errosNaEpoca}/${total}`
          : `erros=${passo.errosNaEpoca} · saídas=[${passo.saidas.map((s) => formatar(s)).join(', ')}]`;
        this.painel.adicionarLog(
          `ép ${String(passo.epoca).padStart(5)} · SSE=${formatar(passo.sse, 5)} · ${detalhe}`,
        );
      }
    }
  }

  /**
   * Como o treino terminou, em uma frase. "Convergiu" do Adaline quer dizer que o custo
   * estabilizou, e não que acertou tudo (com η grande ele estabiliza com pontos errados,
   * Aprendizado 8): por isso a mensagem olha os erros com os pesos finais.
   */
  descreverDesfecho() {
    const treino = this.treino;
    const erros = treino.errosAtuais();
    const total = treino.X.length;
    const epoca = treino.epoca;
    if (this.modo === 'perceptron') {
      return treino.convergiu
        ? { texto: `✓ convergiu na época ${epoca}: uma época inteira sem correções, ${total}/${total} certos.`, resolveu: true }
        : { texto: `✗ parou sem resolver: acabaram as ${treino.maxEpocas} épocas com ${plural(erros, 'ponto errado', 'pontos errados')}.`, resolveu: false };
    }
    if (this.modo === 'adaline') {
      if (treino.divergiu) return { texto: `✗ divergiu na época ${epoca}: o custo divergiu, porque o η é grande demais.`, resolveu: false };
      if (treino.convergiu && erros === 0) return { texto: `✓ o custo estabilizou na época ${epoca} com os ${total} pontos certos.`, resolveu: true };
      if (treino.convergiu) return { texto: `≈ o custo estabilizou na época ${epoca}, mas ${plural(erros, 'ponto continua errado', 'pontos continuam errados')}.`, resolveu: false };
      // Limite de épocas com o custo ainda caindo devagar: o que importa para o aluno é a
      // classificação. Se todos os pontos estão certos, o Adaline resolveu (só não "poliu" o custo).
      if (erros === 0) {
        return { texto: `✓ acertou os ${total} pontos; o custo ainda caía devagar quando acabaram as ${treino.maxEpocas} épocas.`, resolveu: true };
      }
      return { texto: `✗ acabaram as ${treino.maxEpocas} épocas antes de o custo estabilizar, com ${plural(erros, 'ponto errado', 'pontos errados')}.`, resolveu: false };
    }
    if (treino.estado === 'convergiu') return { texto: `✓ convergiu na época ${epoca}: ${total}/${total} certos.`, resolveu: erros === 0 };
    if (treino.estado === 'esgotou') {
      return {
        texto: `✗ interrompido na época ${epoca}: em ${treino.reinicios.length + 1} tentativas seguidas o erro estagnou ` +
          '(mínimo local ou platô).',
        resolveu: false,
      };
    }
    return { texto: `✗ acabaram as ${treino.maxEpocas} épocas sem convergir.`, resolveu: false };
  }

  registrarDesfecho() {
    const { texto, resolveu } = this.descreverDesfecho();
    this.painel.adicionarLog(texto, resolveu ? 'log-linha--sucesso' : 'log-linha--falha');
    this.emitir('terminou', { resolveu, erros: this.treino.errosAtuais() });
  }

  // --------------------------------------------------------------- desenho

  retasAtuais() {
    // As cores vêm de --grafico-reta-*, e não das variáveis da interface: os gráficos
    // mantêm a paleta antiga, e este contêiner é o do laboratório inteiro (interface,
    // agora verde), onde --cor-acerto e --cor-primaria-forte viraram o mesmo verde.
    const cores = getComputedStyle(this.container);
    const paleta = [1, 2, 3, 4].map((n) => cores.getPropertyValue(`--grafico-reta-${n}`).trim());
    const corTinta = paleta[0];

    if (this.modo === 'mlp') {
      // uma reta por neurônio da primeira camada oculta: é onde cada um "corta" o plano.
      // A faixa vai explícita (a do plano atual): com a faixa errada, a reta saía cortada
      // no meio nos conjuntos de classificação, que usam [−1,1; 1,1] e não [−0,5; 1,5].
      const faixa = this.dadosAtuais().faixa ?? FAIXA_PORTAS;
      return this.camadas[0] <= 4
        ? Array.from({ length: this.camadas[0] }, (_, i) => ({
          pontos: this.treino.retaDoNeuronio(i, faixa),
          cor: paleta[i % paleta.length],
          tracejada: true,
          espessura: 2,
          opacidade: 0.85,
        })).filter((r) => r.pontos)
        : [];
    }

    const pesos = this.treino.pesos;
    const bias = this.treino.bias - this.treino.limiar;
    const dados = this.dadosAtuais();
    const faixa = dados.faixa ?? FAIXA_PORTAS;
    if (dados.entradas === 1) {
      const x = Math.abs(pesos[0]) > 1e-9 ? -bias / pesos[0] : 0;
      return [{ pontos: [{ x, y: faixa[0] }, { x, y: faixa[1] }], cor: corTinta, espessura: 2.5 }];
    }
    const [w1, w2] = pesos;
    if (Math.abs(w1) < 1e-9 && Math.abs(w2) < 1e-9) return [];
    const pontos = Math.abs(w2) < 1e-9
      ? [{ x: -bias / w1, y: faixa[0] }, { x: -bias / w1, y: faixa[1] }]
      : faixa.map((x) => ({ x, y: -(w1 * x + bias) / w2 }));
    return [{ pontos, cor: corTinta, espessura: 2.5 }];
  }

  /**
   * O ponto mais próximo da reta, quando o treino de um neurônio termina com tudo certo e
   * esse ponto fica rente à fronteira. A reta encostada num ponto confunde (ele está dentro ou
   * fora?); a legenda diz de que lado ele está. Fora disso (reta longe de todos os pontos, ou
   * treino em andamento) não aparece nada.
   */
  realceDoPontoRente() {
    const t = this.treino;
    if (!t || !t.terminou || this.modo === 'mlp' || this.emNuvem || t.errosAtuais() !== 0) return null;
    const pesos = t.pesos;
    const bias = t.bias - t.limiar;
    const norma = Math.hypot(...pesos);
    if (norma < 1e-9) return null;
    let melhor = null;
    t.X.forEach((x, i) => {
      const z = pesos.reduce((soma, w, j) => soma + w * x[j], 0) + bias;
      const distancia = Math.abs(z) / norma;
      if (!melhor || distancia < melhor.distancia) melhor = { indice: i, z, distancia, x };
    });
    if (!melhor || melhor.distancia >= DISTANCIA_RENTE) return null;

    const virgula = (n) => String(n).replace('.', ',');
    const rotulo = `(${melhor.x.map((v) => v.toFixed(0)).join(', ')})`;
    const classe = t.y[melhor.indice];
    const distancia = virgula(melhor.distancia.toFixed(3));
    const titulo = 'A reta está quase em cima deste ponto';
    const regra = 'O Perceptron para na primeira reta que acerta tudo, mesmo encostada num ponto: ele só corrige quando erra, e não há motivo para afastar a reta de um ponto que já está certo.';
    if (Math.abs(melhor.z) < TOLERANCIA_ZERO) {
      return {
        indice: melhor.indice,
        titulo: 'A reta passa exatamente sobre este ponto',
        paragrafos: [
          `O ponto ${rotulo} está <strong>exatamente sobre a reta</strong>: z = 0, distância ${distancia}.`,
          `Por convenção, o degrau devolve 1 quando z ≥ 0. Como a classe dele é ${classe}, a classificação está certa.`,
          regra,
        ],
      };
    }
    const sinal = melhor.z > 0 ? '+' : '−';
    const z = Math.abs(melhor.z) < 0.0005 ? Math.abs(melhor.z).toExponential(1) : Math.abs(melhor.z).toFixed(3);
    return {
      indice: melhor.indice,
      titulo,
      paragrafos: [
        `O ponto ${rotulo} tem z = ${sinal}${virgula(z)}. Ele está a <strong>${distancia}</strong> da reta (os pontos distam 1 entre si), do lado da classe ${classe}: está certo.`,
        regra,
      ],
    };
  }

  /**
   * Desenha o estado atual. Com um `passo`, também anima as linhas do algoritmo que ele
   * percorreu: `msPorLinha` fixo (próximo passo) ou `msDoPasso`, o tempo até o próximo passo
   * do treino rodando, dividido entre as linhas. Sem `passo` (troca de tema, redesenho), a
   * linha acesa não muda.
   */
  renderizar(passo, { msPorLinha = null, msDoPasso = 0 } = {}) {
    this.plano.desenhar(this.treino, {
      retas: this.retasAtuais(),
      // O anel do ponto em avaliação some quando o treino termina: nesse momento o único anel
      // na tela deve ser o do ponto rente à reta (realce), senão os dois se confundem.
      destaque: passo && !this.treino.terminou && this.modo !== 'mlp' && !this.emNuvem ? passo.indice : -1,
      realce: this.realceDoPontoRente(),
      rapido: this.rodando,
    });

    // sempre desenha, até com o histórico vazio: o gráfico em branco mostra os eixos e uma
    // dica, e um ↺ limpa a curva antiga em vez de deixá-la na tela
    this.grafico.desenhar(this.treino.historicoErro, this.treino.tipoErro);

    if (this.modo === 'mlp') {
      this.painel.renderizarEquacaoRede(this.treino);
      this.painel.renderizarPesosRede(this.treino);
      this.redeVisual?.atualizar();
    } else {
      this.painel.renderizarEquacaoNeuronio(
        this.treino.pesos, this.treino.bias, this.treino.limiar,
      );
      this.painel.renderizarPesosNeuronio(
        this.treino.pesos, this.treino.bias, passo?.houveAtualizacao,
      );
    }

    // As linhas do algoritmo que este passo percorreu, na ordem. A última é onde a execução
    // está agora: ao terminar, é a condição de parada que disparou.
    if (passo) {
      const linhas = MODOS[this.modo].classe.sequenciaDoPasso(passo, this.treino);
      let ms = msPorLinha ?? msDoPasso / linhas.length;
      if (ms < MS_MINIMO_POR_LINHA) ms = 0; // rápido demais para ler: acende direto a última
      this.painel.animarLinhas(linhas, ms);
    }
  }

  atualizarEstado() {
    const treino = this.treino;
    const erros = treino.errosAtuais();
    const total = treino.X.length;

    let estado = 'treinando';
    let classe = 'estado--treinando';
    if (treino.terminou) {
      const { resolveu } = this.descreverDesfecho();
      if (resolveu) {
        estado = 'resolveu';
        classe = 'estado--sucesso';
      } else if (treino.divergiu) {
        estado = 'divergiu';
        classe = 'estado--falha';
      } else if (treino.convergiu) {
        estado = 'estabilizou com erros';
        classe = 'estado--falha';
      } else {
        estado = 'parou sem resolver';
        classe = 'estado--falha';
      }
    } else if (!this.rodando) {
      estado = treino.historicoErro.length ? 'pausado' : 'pronto';
      classe = 'estado--pronto';
    }

    const epoca = treino.epoca;
    this.elEstado.innerHTML = `
      <span class="estado-item"><span class="estado-chave">Época</span> ${epoca}</span>
      <span class="estado-item"><span class="estado-chave">Acertos</span> ${total - erros}/${total}</span>
      <span class="estado-pilula ${classe}">${estado}</span>
    `;
  }

  destruir() {
    LABORATORIOS.delete(this);
    document.removeEventListener('neurologica:tema', this.aoMudarTema);
    this.temaDoSistema?.removeEventListener('change', this.aoMudarTema);
    this.pausar();
    this.plano.destruir();
    this.grafico.destruir();
    this.redeVisual?.destruir();
  }
}
