/**
 * Coluna do algoritmo: o que está acontecendo por dentro, em texto e em fórmula.
 *
 * É a metade do layout que o TensorFlow Playground não tem, e o principal
 * diferencial do projeto: mostrar a
 * equação do hiperplano com os pesos de agora, a linha de pseudocódigo que está
 * rodando, e o log de cada iteração.
 *
 * O pseudocódigo e o log dividem o mesmo espaço, com um seletor de duas abas ("Algoritmo" e
 * "Log de treino"): uma só fica visível, e ela ocupa a coluna inteira. Quando a aba do log
 * está aberta, o nome do passo que está rodando continua aparecendo ao lado das abas.
 */

const MAX_LINHAS_LOG = 60;

// A equação e as pílulas dos pesos mostram os MESMOS números, com as mesmas casas: com
// casas diferentes (2 na equação, 3 nos pesos) o leitor achava que os valores divergiam.
const CASAS_DOS_PESOS = 3;

function formatar(numero, casas = 2) {
  const valor = Number(numero);
  if (!Number.isFinite(valor)) return '∞';
  return valor.toFixed(casas);
}

/** Número com 3 casas e o sinal sempre presente (+0.250 / −0.250), para o log ter colunas fixas. */
function comSinal(numero) {
  const valor = Number(numero);
  if (!Number.isFinite(valor)) return ' ∞';
  return `${valor < 0 ? '−' : '+'}${Math.abs(valor).toFixed(3)}`;
}

/** Nome curto de cada passo, para aparecer ao lado das abas quando o log está aberto. */
const NOMES_DE_PASSO = {
  inicio: 'inicializando os pesos',
  cabecalho: 'início da época',
  amostra: 'lendo a amostra',
  alvo: 'definindo o alvo',
  soma: 'somando',
  frente: 'passo para a frente',
  ativacao: 'ativação',
  erro: 'medindo o erro',
  delta_saida: 'gradiente da saída',
  delta_oculta: 'propagando para trás',
  atualiza: 'corrigindo os pesos',
  custo: 'medindo o custo',
  convergiu: 'verificando o critério de parada',
  divergiu: 'verificando o critério de parada',
  meta: 'verificando o critério de parada',
  limite: 'verificando o limite de épocas',
  reinicio: 'verificando estagnação',
};

/**
 * Transforma a marcação mínima do pseudocódigo em nós do DOM (sem innerHTML):
 *   **se**   palavra de controle (negrito)
 *   *w*      variável (itálico)
 *   {(...)}  comentário (verde); pode conter variáveis
 * O resto (←, ·, +, degrau, σ...) é operação e fica no estilo normal.
 */
const MARCACAO_PSEUDO = /(\*\*[^*]+\*\*|\*[^*]+\*|\{[^}]*\})/;

function marcarPseudocodigo(texto) {
  return texto.split(MARCACAO_PSEUDO).filter(Boolean).map((parte) => {
    let classe = null;
    let conteudo = null;
    if (parte.startsWith('**')) {
      classe = 'pseudo-controle';
      conteudo = [document.createTextNode(parte.slice(2, -2))];
    } else if (parte.startsWith('*')) {
      classe = 'pseudo-variavel';
      conteudo = [document.createTextNode(parte.slice(1, -1))];
    } else if (parte.startsWith('{')) {
      const miolo = parte.slice(1, -1);
      classe = miolo.replace(/\*/g, '').length <= MAX_COMENTARIO_SEM_QUEBRA
        ? 'pseudo-comentario pseudo-bloco' : 'pseudo-comentario';
      conteudo = marcarPseudocodigo(miolo);
    } else {
      return document.createTextNode(parte);
    }
    const span = document.createElement('span');
    span.className = classe;
    span.append(...conteudo);
    return span;
  });
}

/** Atribuições curtas (até este tamanho, em caracteres) não quebram no meio, nem no celular. */
const MAX_BLOCO_SEM_QUEBRA = 34;
/** Comentários curtos também não partem ao meio; os longos quebram entre as palavras. */
const MAX_COMENTARIO_SEM_QUEBRA = 22;

/**
 * Monta uma linha do pseudocódigo para telas estreitas. Os espaços do texto que alinham
 * "cláusulas" (2 ou mais seguidos) viram uma quebra possível entre elas, e cada cláusula
 * curta vira um bloco que não quebra por dentro: `w ← w + η·erro·x` ou sai inteira ou vai
 * inteira para a linha de baixo. Um "e" solto cola na cláusula seguinte, em vez de ficar no
 * fim da linha. O que for mais longo que o limite (e os comentários) quebra normalmente.
 */
function montarLinhaDePseudocodigo(texto) {
  const clausulas = [];
  texto.split(/ {2,}/).filter(Boolean).forEach((clausula) => {
    const anterior = clausulas[clausulas.length - 1];
    if (anterior === 'e') clausulas[clausulas.length - 1] = `e ${clausula}`;
    else clausulas.push(clausula);
  });

  const nos = [];
  clausulas.forEach((clausula, i) => {
    if (i > 0) nos.push(document.createTextNode(' '));
    const conteudo = marcarPseudocodigo(clausula);
    const plano = clausula.replace(/[*{}]/g, '');
    if (clausula.includes('{') || plano.length > MAX_BLOCO_SEM_QUEBRA) {
      nos.push(...conteudo);
    } else {
      const bloco = document.createElement('span');
      bloco.className = 'pseudo-bloco';
      bloco.append(...conteudo);
      nos.push(bloco);
    }
  });
  return nos;
}

export class PainelAlgoritmo {
  constructor(container, { pseudocodigo = [], titulo = '' } = {}) {
    this.container = container;
    this.container.classList.add('painel-algoritmo');
    this.container.innerHTML = `
      <div class="painel-bloco">
        <div class="painel-rotulo painel-rotulo--reta">Fronteira de decisão</div>
        <!-- a equação e os pesos que a formam, numa caixa só -->
        <div class="painel-reta">
          <div class="painel-equacao" aria-live="polite"></div>
          <div class="painel-pesos" aria-label="Pesos"></div>
        </div>
      </div>
      <div class="painel-abas painel-bloco">
        <div class="abas" role="tablist" aria-label="Detalhes do treino">
          <button type="button" class="aba" role="tab" data-aba="algoritmo" aria-selected="true">${titulo || 'Algoritmo'}</button>
          <button type="button" class="aba" role="tab" data-aba="log" aria-selected="false" tabindex="-1">Log de treino</button>
          <span class="aba-pista" hidden></span>
        </div>
        <div class="aba-painel" role="tabpanel" data-painel="algoritmo">
          <ol class="painel-pseudocodigo"></ol>
        </div>
        <div class="aba-painel aba-painel--log" role="tabpanel" data-painel="log" hidden>
          <div class="painel-log" role="log" aria-live="polite"></div>
        </div>
      </div>
    `;

    this.elEquacao = this.container.querySelector('.painel-equacao');
    this.elPesos = this.container.querySelector('.painel-pesos');
    this.elRotuloReta = this.container.querySelector('.painel-rotulo--reta');
    this.elPseudo = this.container.querySelector('.painel-pseudocodigo');
    this.elPista = this.container.querySelector('.aba-pista');
    this.abas = [...this.container.querySelectorAll('.aba')];
    this.paineis = [...this.container.querySelectorAll('.aba-painel')];
    this.elLog = this.container.querySelector('.painel-log');

    this.definirPseudocodigo(pseudocodigo);
    this.linhasLog = [];
    this.montarAbas();

    // O log fica "colado" na última linha enquanto o leitor não rolar para cima. Se a
    // altura da caixa mudar (aba reaberta, dica da primeira visita sumindo, janela
    // redimensionada), ele volta para o fim em vez de parar no meio.
    this.logColado = true;
    this.elLog.addEventListener('scroll', () => {
      const { scrollTop, scrollHeight, clientHeight } = this.elLog;
      this.logColado = scrollHeight - scrollTop - clientHeight < 24;
    }, { passive: true });
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(() => { if (this.logColado) this.rolarLogParaOFim(); }).observe(this.elLog);
    }
  }

  /** Seletor de abas: clique, e setas ← → entre elas (o padrão WAI-ARIA de abas). */
  montarAbas() {
    this.abas.forEach((aba, i) => {
      aba.addEventListener('click', () => this.mostrarAba(aba.dataset.aba));
      aba.addEventListener('keydown', (evento) => {
        const passo = { ArrowRight: 1, ArrowLeft: -1 }[evento.key];
        if (!passo) return;
        evento.preventDefault();
        const vizinha = this.abas[(i + passo + this.abas.length) % this.abas.length];
        this.mostrarAba(vizinha.dataset.aba);
        vizinha.focus();
      });
    });
  }

  /** Mostra uma aba ('algoritmo' ou 'log') e esconde a outra. */
  mostrarAba(nome) {
    this.abas.forEach((aba) => {
      const ativa = aba.dataset.aba === nome;
      aba.setAttribute('aria-selected', String(ativa));
      aba.tabIndex = ativa ? 0 : -1;
    });
    this.paineis.forEach((painel) => { painel.hidden = painel.dataset.painel !== nome; });
    // o passo atual só aparece ao lado das abas quando o pseudocódigo está escondido
    this.elPista.hidden = nome !== 'log';
    if (nome === 'log') this.rolarLogParaOFim();
  }

  rolarLogParaOFim() {
    this.elLog.scrollTop = this.elLog.scrollHeight;
  }

  definirPseudocodigo(linhas) {
    this.pseudocodigo = linhas;
    this.elPseudo.innerHTML = '';
    linhas.forEach((linha) => {
      const item = document.createElement('li');
      item.className = 'pseudo-linha';
      item.dataset.chave = linha.chave;
      // O recuo vai para o CSS (--recuo, em caracteres), e não em espaços no texto: assim a
      // linha que quebra continua alinhada, com a continuação um pouco mais para dentro.
      const recuo = linha.texto.match(/^ */)[0].length;
      item.style.setProperty('--recuo', String(recuo));
      item.append(...montarLinhaDePseudocodigo(linha.texto.slice(recuo)));
      this.elPseudo.appendChild(item);
    });
  }

  /** Acende uma linha (e interrompe uma animação em curso). */
  destacarLinha(chave) {
    this.pararAnimacao();
    this.acenderLinha(chave);
  }

  acenderLinha(chave) {
    this.elPseudo.querySelectorAll('.pseudo-linha').forEach((item) => {
      item.classList.toggle('pseudo-linha--ativa', item.dataset.chave === chave);
    });
    if (this.elPista) this.elPista.textContent = NOMES_DE_PASSO[chave] ?? '';
  }

  /**
   * Percorre as linhas `chaves` na ordem em que o algoritmo as executou, `msPorLinha` em cada
   * uma, e termina acesa na última. Com `msPorLinha` <= 0 (ou uma linha só) acende direto a
   * última: é o caso do treino rápido, em que não haveria tempo de ler nada.
   *
   * `aoAcender(chave, i)` é chamado a cada linha acesa e `aoTerminar()` depois da última: é
   * assim que o passo a passo dos atos sincroniza o gráfico com a linha que está rodando.
   * `pararAnimacao()` cancela os dois; quem passou os ganchos cuida do que ficou pendente.
   */
  animarLinhas(chaves, msPorLinha, { aoAcender = null, aoTerminar = null } = {}) {
    this.pararAnimacao();
    if (!chaves.length) {
      aoTerminar?.();
      return;
    }
    if (msPorLinha <= 0 || chaves.length === 1) {
      chaves.forEach((chave, i) => aoAcender?.(chave, i));
      this.acenderLinha(chaves[chaves.length - 1]);
      aoTerminar?.();
      return;
    }
    let i = 0;
    const proxima = () => {
      this.acenderLinha(chaves[i]);
      aoAcender?.(chaves[i], i);
      i += 1;
      if (i < chaves.length) {
        this.temporizador = setTimeout(proxima, msPorLinha);
      } else {
        this.temporizador = null;
        aoTerminar?.();
      }
    };
    proxima();
  }

  pararAnimacao() {
    if (this.temporizador) clearTimeout(this.temporizador);
    this.temporizador = null;
  }

  limparLog() {
    this.linhasLog = [];
    this.elLog.innerHTML = '';
  }

  adicionarLog(texto, classe = '') {
    this.linhasLog.push(texto);
    const linha = document.createElement('div');
    linha.className = `log-linha ${classe}`.trim();
    linha.textContent = texto;
    this.elLog.appendChild(linha);

    while (this.elLog.childElementCount > MAX_LINHAS_LOG) {
      this.elLog.removeChild(this.elLog.firstChild);
    }
    this.logColado = true;
    this.rolarLogParaOFim();
  }

  /** Equação do hiperplano com os números de agora, em LaTeX. */
  renderizarEquacaoNeuronio(pesos, bias, limiar) {
    const termos = pesos.map((peso, i) => {
      const sinal = peso < 0 ? '-' : '+';
      const valor = formatar(Math.abs(peso), CASAS_DOS_PESOS);
      const variavel = `x_${i + 1}`;
      return `${i === 0 ? (peso < 0 ? '-' : '') : ` ${sinal} `}${valor}\\,${variavel}`;
    }).join('');

    const sinalBias = bias < 0 ? '-' : '+';
    this.elRotuloReta.textContent = 'Fronteira de decisão';
    const latex = `${termos} ${sinalBias} ${formatar(Math.abs(bias), CASAS_DOS_PESOS)} = ${formatar(limiar, CASAS_DOS_PESOS)}`;
    katex.render(latex, this.elEquacao, { throwOnError: false, displayMode: true });
  }

  renderizarEquacaoRede(treino) {
    // Na rede a fronteira não é uma equação só (é uma curva, composta de várias retas), então
    // o bloco mostra só a arquitetura; a conta de cada camada está no pseudocódigo.
    this.elRotuloReta.textContent = 'Arquitetura da rede';
    const formato = treino.formato.join(' \\rightarrow ');
    const latex = `\\Large ${formato}`;
    katex.render(latex, this.elEquacao, { throwOnError: false, displayMode: true });
  }

  renderizarPesosNeuronio(pesos, bias, destaque = false) {
    this.elPesos.innerHTML = '';
    const itens = [
      ...pesos.map((peso, i) => ({ nome: `w${i + 1}`, valor: peso })),
      { nome: 'b', valor: bias },
    ];
    itens.forEach(({ nome, valor }) => {
      const chip = document.createElement('div');
      chip.className = `peso-chip${destaque ? ' peso-chip--mudou' : ''}`;
      chip.innerHTML = `<span class="peso-nome">${nome}</span><span class="peso-valor">${formatar(valor, CASAS_DOS_PESOS)}</span>`;
      this.elPesos.appendChild(chip);
    });
  }

  renderizarPesosRede(treino) {
    this.elPesos.innerHTML = '';
    const total = treino.pesos.reduce(
      (soma, matriz) => soma + matriz.length * matriz[0].length, 0,
    ) + treino.bias.reduce((soma, vetor) => soma + vetor.length, 0);

    const resumo = document.createElement('div');
    resumo.className = 'peso-resumo';
    resumo.innerHTML =
      `<span><strong>${total}</strong> parâmetros</span>` +
      `<span><strong>${treino.camadas.length}</strong> ${treino.camadas.length === 1 ? 'camada oculta' : 'camadas ocultas'}</span>` +
      `<span>ativação <strong>${treino.ativacao}</strong></span>`;
    this.elPesos.appendChild(resumo);
  }
}

/** Uma linha de log para os modos de neurônio único com erro discreto (Perceptron). */
export function linhaLogDiscreto(passo) {
  const x = `(${passo.x.map((v) => v.toFixed(0)).join(',')})`;
  const sinal = passo.erro > 0 ? '+' : '';
  return (
    `ép ${String(passo.epoca).padStart(2)} · it ${passo.indice + 1} · ` +
    `x=${x} y=${passo.yReal} · z=${comSinal(passo.z)} · ŷ=${passo.yPrevisto} · ` +
    `erro=${sinal}${passo.erro}` +
    (passo.houveAtualizacao ? '  → corrigiu' : '  → sem correção')
  );
}

/**
 * Uma linha de log para o Adaline, cujo erro é contínuo e medido antes da ativação. O alvo
 * é bipolar (−1 para a classe 0, +1 para a classe 1).
 */
export function linhaLogContinuo(passo) {
  const x = `(${passo.x.map((v) => v.toFixed(0)).join(',')})`;
  const alvo = passo.alvo > 0 ? '+1' : '−1';
  // números com largura fixa (o sinal ocupa sempre uma casa): as colunas ficam alinhadas e
  // a linha tem sempre o mesmo comprimento, em vez de crescer quando z fica negativo
  return (
    `ép ${String(passo.epoca).padStart(2)} · it ${passo.indice + 1} · ` +
    `x=${x} alvo=${alvo} · z=${comSinal(passo.z)} · ` +
    `erro=${comSinal(passo.erro)} · ŷ=${passo.yPrevisto}`
  );
}

export { formatar };
