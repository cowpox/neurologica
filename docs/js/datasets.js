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
 *
 * Os pontos vivem em [−6, 6]² (como no Playground), mas a rede recebe as coordenadas
 * divididas por 6, isto é, em [−1, 1]: assim a inicialização de Xavier e as taxas de
 * aprendizado continuam fazendo sentido. O plano de decisão mostra os eixos na escala
 * original. Os conjuntos são gerados SEM sobreposição entre as classes, para que "acertar
 * todos os pontos" seja possível e sirva de critério de parada.
 *
 * Classes 0/1, como nas portas: 1 = laranja, 0 = azul (as cores dos dados).
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
