/**
 * Conjuntos de dados de classificação do laboratório livre (modo "Classificação").
 *
 * Quatro problemas 2D clássicos, no estilo do TensorFlow Playground, mas GERADOS AQUI, com o
 * gerador com semente do site (`mulberry32`): a mesma semente dá sempre os mesmos pontos, o
 * que permite repetir um experimento ao vivo. As figuras do Playground foram só referência.
 *
 *   círculo          — um aglomerado no centro, cercado por um anel da outra classe
 *   XOR em quadrantes — a porta XOR "com ruído": quadrantes opostos, mesma classe
 *   duas gaussianas  — duas nuvens separáveis por uma reta (o controle: um neurônio resolve)
 *   espiral dupla    — dois braços entrelaçados; o caso difícil
 *   duas meias-luas  — dois arcos encaixados (o make_moons do sklearn)
 *   xadrez 4×4       — tabuleiro de 16 células alternadas
 *   yin-yang         — dois peixes entrelaçados, com um olho de cada cor
 *
 * Os pontos vivem em [−6, 6]² (como no Playground), mas a rede recebe as coordenadas
 * divididas por 6, isto é, em [−1, 1]: assim a inicialização de Xavier e as taxas de
 * aprendizado continuam fazendo sentido. O plano de decisão mostra os eixos na escala
 * original. Os conjuntos são gerados SEM sobreposição entre as classes, para que "acertar
 * todos os pontos" seja possível e sirva de critério de parada.
 *
 * Classes 0/1, como nas portas: 1 = rosa, 0 = ciano (as cores dos dados).
 */

import { criarAleatorio } from './dados.js';

/** Metade do lado do quadrado dos dados, na escala original. */
export const ESCALA = 6;
/** Faixa do plano de decisão, já na escala da rede (um pouco além de [−1, 1]). */
export const FAIXA_CLASSIFICACAO = [-1.1, 1.1];
export const PONTOS_PADRAO = 200;
export const SEMENTE_DOS_DADOS = 1;

/** Normal padrão por Box-Muller, a partir do gerador com semente. */
function normal(aleatorio) {
  let u = 0;
  while (u === 0) u = aleatorio();
  const v = aleatorio();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const GERADORES = {
  circulo(n, aleatorio) {
    const pontos = [];
    for (let i = 0; i < n; i += 1) {
      const centro = i < n / 2;
      const angulo = aleatorio() * 2 * Math.PI;
      // área uniforme no disco central; o anel fica entre 3,4 e 5, com folga de 1,2
      const raio = centro ? 2.2 * Math.sqrt(aleatorio()) : 3.4 + 1.6 * aleatorio();
      pontos.push({ x: raio * Math.cos(angulo), y: raio * Math.sin(angulo), classe: centro ? 0 : 1 });
    }
    return pontos;
  },
  quadrantes(n, aleatorio) {
    const pontos = [];
    const folga = 0.45; // faixa vazia junto aos eixos, para as classes não se tocarem
    const coordenada = () => {
      const valor = folga + aleatorio() * (5.5 - folga);
      return aleatorio() < 0.5 ? -valor : valor;
    };
    for (let i = 0; i < n; i += 1) {
      const x = coordenada();
      const y = coordenada();
      pontos.push({ x, y, classe: x * y > 0 ? 0 : 1 });
    }
    return pontos;
  },
  gaussianas(n, aleatorio) {
    const pontos = [];
    for (let i = 0; i < n; i += 1) {
      const classe = i < n / 2 ? 0 : 1;
      const centro = classe === 0 ? 2 : -2;
      pontos.push({ x: centro + 0.75 * normal(aleatorio), y: centro + 0.75 * normal(aleatorio), classe });
    }
    return pontos;
  },
  espiral(n, aleatorio) {
    const pontos = [];
    const porBraco = Math.floor(n / 2);
    for (let braco = 0; braco < 2; braco += 1) {
      for (let i = 0; i < porBraco; i += 1) {
        const r = (i / porBraco) * 5;
        const t = (1.75 * i / porBraco) * 2 * Math.PI + braco * Math.PI;
        const tremor = 0.08; // um tremor mínimo, sem misturar os braços
        pontos.push({
          x: r * Math.sin(t) + tremor * normal(aleatorio),
          y: r * Math.cos(t) + tremor * normal(aleatorio),
          classe: braco,
        });
      }
    }
    return pontos;
  },
  // as duas meias-luas do sklearn (make_moons), centradas e esticadas para [−4,8; 4,8]
  luas(n, aleatorio) {
    const pontos = [];
    const escala = 3.2;
    const tremor = 0.07; // na escala das luas: o vão entre elas continua vazio
    for (let i = 0; i < n; i += 1) {
      const classe = i < n / 2 ? 0 : 1;
      const t = aleatorio() * Math.PI;
      const x = classe === 0 ? Math.cos(t) : 1 - Math.cos(t);
      const y = classe === 0 ? Math.sin(t) : 0.5 - Math.sin(t);
      pontos.push({
        x: (x - 0.5 + tremor * normal(aleatorio)) * escala,
        y: (y - 0.25 + tremor * normal(aleatorio)) * escala,
        classe,
      });
    }
    return pontos;
  },
  // tabuleiro 4×4 sobre [−5,6; 5,6]²: células de 2,8, cor alternada, com uma faixa vazia de
  // 0,3 de cada lado das linhas, para as classes não se tocarem
  xadrez(n, aleatorio) {
    const pontos = [];
    const meio = 5.6;
    const celula = 2.8;
    const folga = 0.3;
    const contagem = [0, 0];
    while (pontos.length < n) {
      const x = (aleatorio() * 2 - 1) * meio;
      const y = (aleatorio() * 2 - 1) * meio;
      // distância até a linha de divisão mais próxima (em x e em y)
      const aresta = (v) => ((v + meio) % celula + celula) % celula; // posição dentro da célula
      const dx = Math.min(aresta(x), celula - aresta(x));
      const dy = Math.min(aresta(y), celula - aresta(y));
      if (dx < folga || dy < folga) continue;
      const classe = (Math.floor((x + meio) / celula) + Math.floor((y + meio) / celula)) % 2;
      if (contagem[classe] >= n / 2) continue; // 100 pontos de cada classe
      contagem[classe] += 1;
      pontos.push({ x, y, classe });
    }
    return pontos;
  },
  // yin-yang: disco de raio 5,5 dividido por uma curva em S (dois semicírculos), cada "cabeça"
  // com um olho da cor oposta. Pontos a menos de 0,3 de qualquer fronteira são descartados.
  yinyang(n, aleatorio) {
    const R = 5.5;
    const r = R / 2;
    const olho = R / 6;
    // 1 = lado esquerdo e cabeça de baixo; 0 = lado direito e cabeça de cima; olhos invertidos
    const classeDe = (x, y) => {
      if (Math.hypot(x, y) > R) return -1;
      if (Math.hypot(x, y - r) < olho) return 1;
      if (Math.hypot(x, y + r) < olho) return 0;
      if (Math.hypot(x, y - r) < r) return 0;
      if (Math.hypot(x, y + r) < r) return 1;
      return x < 0 ? 1 : 0;
    };
    const folga = 0.3;
    const pontos = [];
    const contagem = [0, 0];
    while (pontos.length < n) {
      const x = (aleatorio() * 2 - 1) * R;
      const y = (aleatorio() * 2 - 1) * R;
      const classe = classeDe(x, y);
      if (classe < 0 || contagem[classe] >= n / 2) continue;
      let liso = true;
      for (let k = 0; k < 12 && liso; k += 1) {
        const outra = classeDe(x + folga * Math.cos(k * Math.PI / 6), y + folga * Math.sin(k * Math.PI / 6));
        if (outra >= 0 && outra !== classe) liso = false;
      }
      if (!liso) continue;
      contagem[classe] += 1;
      pontos.push({ x, y, classe });
    }
    return pontos;
  },
};

export const DATASETS = {
  circulo: {
    nome: 'Círculo',
    resumo: 'Um aglomerado no centro cercado por um anel da outra classe. Nenhuma reta separa um "dentro" de um "fora".',
  },
  quadrantes: {
    nome: 'XOR em quadrantes',
    resumo: 'A porta XOR com centenas de pontos: quadrantes opostos têm a mesma classe.',
  },
  gaussianas: {
    nome: 'Duas gaussianas',
    resumo: 'Duas nuvens bem separadas. Uma reta basta: até um neurônio só resolve.',
  },
  espiral: {
    nome: 'Espiral dupla',
    resumo: 'Dois braços entrelaçados. O desafio mais difícil: pede mais camadas e mais neurônios.',
  },
  // vem DEPOIS dos quatro originais: a semente de cada conjunto depende da posição na lista,
  // e assim os pontos (e os números medidos) dos antigos não mudam
  luas: {
    nome: 'Duas meias-luas',
    resumo: 'Dois arcos que se encaixam um no outro. Nenhuma reta separa, mas a curva certa sim.',
  },
  xadrez: {
    nome: 'Xadrez 4×4',
    resumo: 'Dezesseis quadrados de cor alternada: o XOR em quadrantes levado ao extremo. Pede muitas fronteiras que se cruzam.',
  },
  yinyang: {
    nome: 'Yin-yang',
    resumo: 'Dois "peixes" entrelaçados, cada um com um olho da cor do outro: uma fronteira em S com bolsões.',
  },
};

export const CHAVES_DATASETS = Object.keys(DATASETS);

/**
 * Gera o conjunto: { nome, resumo, X (escala da rede, [−1, 1]), y (0/1), entradas: 2,
 * separavel, faixa, escala }. Os pontos saem embaralhados (com a mesma semente), para o
 * treino online do Perceptron e do Adaline não ver uma classe inteira e depois a outra.
 */
export function gerarDataset(chave, { n = PONTOS_PADRAO, semente = SEMENTE_DOS_DADOS } = {}) {
  const info = DATASETS[chave];
  if (!info) throw new RangeError(`Conjunto de dados desconhecido: ${chave}`);
  const aleatorio = criarAleatorio(semente * 7919 + CHAVES_DATASETS.indexOf(chave));
  const pontos = GERADORES[chave](n, aleatorio);
  for (let i = pontos.length - 1; i > 0; i -= 1) {
    const j = Math.floor(aleatorio() * (i + 1));
    [pontos[i], pontos[j]] = [pontos[j], pontos[i]];
  }
  // Os geradores usam Math.sin, Math.cos e Math.log, que podem diferir em 1 ulp de um
  // navegador para outro (ver dados.js). Arredondar cada coordenada para milésimos (na escala
  // original) absorve essa diferença: todo navegador recebe exatamente os mesmos pontos.
  const milesimos = (valor) => Math.round(valor * 1000) / 1000;
  return {
    chave,
    nome: info.nome,
    resumo: info.resumo,
    X: pontos.map((p) => [milesimos(p.x) / ESCALA, milesimos(p.y) / ESCALA]),
    y: pontos.map((p) => p.classe),
    entradas: 2,
    separavel: chave === 'gaussianas',
    faixa: FAIXA_CLASSIFICACAO,
    escala: ESCALA,
  };
}
