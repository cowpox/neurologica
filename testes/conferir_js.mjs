/**
 * Conferência Python → JavaScript (o "portão" da `fase2-logica`, ver `04_planejamento.md`).
 *
 * Reexecuta a lógica de treino do site (`docs/js/`) e compara com as referências gravadas pelo
 * Python (`testes/referencias/*.json`, geradas por `python testes/gerar_referencias.py`).
 * Node puro, sem dependências. Sai com código 1 se qualquer verificação falhar.
 *
 *     node testes/conferir_js.mjs                      # tudo
 *     node testes/conferir_js.mjs --gravar-gabaritos   # (re)grava gabaritos_site.json
 *
 * Camadas (as do planejamento):
 *   1. contas à mão, com resultado conhecido;
 *   2. trajetórias contra o Python, com os mesmos pesos iniciais;
 *   3. propriedades que não dependem do Python;
 *   4. estatística da MLP com o gerador do site;
 *   5. gabaritos do site (regressão).
 *
 * Arredondamento na MLP (Decisão 10 do `06`): o numpy usa FMA nas multiplicações de matriz e
 * uma tanh própria, então o JS não reproduz o Python bit a bit, e num treino longo a diferença
 * de 1 ulp pode crescer. A camada 2 da MLP não depende disso: (a) em cada época gravada, o JS dá
 * UM passo partindo do estado exato do Python, e a diferença tem que ficar em poucos ulps (o
 * erro não tem como se acumular); (b) as decisões de parada e de reinício do JS são
 * reexecutadas sobre a sequência de SSE do Python e têm que cair nas mesmas épocas; (c) o
 * treino livre do JS é comparado só nos marcos discretos, e a distância máxima entre as curvas
 * de SSE é relatada.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  PORTAS, TOLERANCIA_ZERO, contarErros, criarAleatorio, degrau, produtoEscalar,
} from '../docs/js/dados.js';
import { TreinoPerceptron } from '../docs/js/treino_perceptron.js';
import { TreinoAdaline } from '../docs/js/treino_adaline.js';
import {
  ATIVACOES, JanelaDeReinicio, MAX_TENTATIVAS, TreinoMLP, aplicarGradiente, custoSSE, epocaDeGradiente,
  formatoDaRede, gradientes, inicializarXavier, propagar,
} from '../docs/js/treino_mlp.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ARQUIVO_GABARITOS = path.join(AQUI, 'gabaritos_site.json');
const GRAVAR_GABARITOS = process.argv.includes('--gravar-gabaritos');

const ler = (nome) => JSON.parse(readFileSync(path.join(AQUI, 'referencias', nome), 'utf8'));

// --------------------------------------------------------------------------------- relatório

let falhas = 0;
let aprovadas = 0;

function secao(titulo) {
  console.log(`\n== ${titulo}`);
}

/** Registra uma verificação. Só as falhas são detalhadas; o resumo diz quantas passaram. */
function checar(descricao, ok, detalhe = '') {
  if (ok) {
    aprovadas += 1;
  } else {
    falhas += 1;
    console.log(`  ✗ ${descricao}${detalhe ? ` — ${detalhe}` : ''}`);
  }
  return ok;
}

function informar(texto) {
  console.log(`  · ${texto}`);
}

/** |a − b| relativo a max(1, |a|, |b|): "poucos ulps" vira algo como 1e-15. */
function diferencaRelativa(a, b) {
  return Math.abs(a - b) / Math.max(1, Math.abs(a), Math.abs(b));
}

const perto = (a, b, tolerancia) => Math.abs(a - b) <= tolerancia;
const arredondar = (valor, casas) => Number(valor.toFixed(casas));

function rodar(treino, limite = 1e7) {
  const passos = [];
  while (!treino.terminou && passos.length < limite) passos.push(treino.passo());
  return passos;
}

const porta = (nome) => ({ X: PORTAS[nome].X, y: PORTAS[nome].y });

// -------------------------------------------------------------------- 1. contas à mão

secao('1. Contas à mão (resultado conhecido em aritmética exata)');
{
  // Perceptron, AND, pesos 0 0, η = 0,1: converge na época 6 (sem a tolerância do degrau
  // daria 4; Aprendizado 4).
  const t = new TreinoPerceptron({ ...porta('AND'), taxa: 0.1, pesosIniciais: [0, 0], biasInicial: 0 });
  rodar(t);
  checar('Perceptron AND (pesos 0 0): converge na época 6', t.convergiu && t.epoca === 6, `época ${t.epoca}`);
  checar('Perceptron AND: w = (0,2; 0,1) e b = −0,3',
    perto(t.pesos[0], 0.2, 1e-12) && perto(t.pesos[1], 0.1, 1e-12) && perto(t.bias, -0.3, 1e-12),
    `w = ${t.pesos}, b = ${t.bias}`);

  // Perceptron, XOR, pesos 0 0: 3 correções e 2 erros na época 1, w = (−0,1; 0), b = −0,1.
  const x = new TreinoPerceptron({ ...porta('XOR'), taxa: 0.1, pesosIniciais: [0, 0], biasInicial: 0, maxEpocas: 50 });
  const fim1 = rodar(x).find((p) => p.fimDeEpoca);
  checar('Perceptron XOR (pesos 0 0), época 1: 3 correções e 2 erros',
    fim1.correcoesNaEpoca === 3 && fim1.errosNaEpoca === 2,
    `correções ${fim1.correcoesNaEpoca}, erros ${fim1.errosNaEpoca}`);
  checar('Perceptron XOR, época 1: w = (−0,1; 0) e b = −0,1',
    perto(fim1.pesos[0], -0.1, 1e-12) && perto(fim1.pesos[1], 0, 1e-12) && perto(fim1.bias, -0.1, 1e-12));

  // Adaline, AND, pesos 0 0, η = 0,1, alvos [−1, −1, −1, +1]. Época 1, à mão:
  //   (0,0): z = 0, erro = −1           → b = −0,1
  //   (0,1): z = −0,1, erro = −0,9      → w₂ = −0,09, b = −0,19
  //   (1,0): z = −0,19, erro = −0,81    → w₁ = −0,081, b = −0,271
  //   (1,1): z = −0,442, erro = 1,442   → w = (0,0632; 0,0542), b = −0,1268
  //   fim da época: z = [−0,1268; −0,0726; −0,0636; −0,0094], E = ½ · 3,51828232 = 1,75914116
  // (o plano dizia "SSE 1,0 na época 1 e 0,6872 na 2", valores que não são desta convenção).
  // Depois, para na época 44 com SSE 0,5061 e pesos (1,0575; 0,9998; −1,4817).
  const a = new TreinoAdaline({ ...porta('AND'), taxa: 0.1, pesosIniciais: [0, 0], biasInicial: 0 });
  const fins = rodar(a).filter((p) => p.fimDeEpoca);
  checar('Adaline AND (pesos 0 0), época 1: w = (0,0632; 0,0542), b = −0,1268',
    perto(fins[0].pesos[0], 0.0632, 1e-12) && perto(fins[0].pesos[1], 0.0542, 1e-12) && perto(fins[0].bias, -0.1268, 1e-12),
    `w = ${fins[0].pesos}, b = ${fins[0].bias}`);
  checar('Adaline AND, época 1: E = 1,75914116', perto(fins[0].sse, 1.75914116, 1e-12), `${fins[0].sse}`);
  checar('Adaline AND: estabiliza na época 44 com SSE 0,5061',
    a.convergiu && a.epoca === 44 && arredondar(fins.at(-1).sse, 4) === 0.5061,
    `época ${a.epoca}, SSE ${fins.at(-1).sse}`);
  checar('Adaline AND: pesos (1,0575; 0,9998; −1,4817)',
    arredondar(a.pesos[0], 4) === 1.0575 && arredondar(a.pesos[1], 4) === 0.9998
    && arredondar(a.bias, 4) === -1.4817, `w = ${a.pesos}, b = ${a.bias}`);

  // Adaline, XOR, pesos 0 0: erros [−1; 1,1; 0,99; −1,318] na época 1, terminando em
  // w = (−0,0328; −0,0218), b = −0,0228, z = [−0,0228; −0,0446; −0,0556; −0,0774] e
  // E = ½ · 4,01159112 = 2,00579556 (o plano arredondava para 2,005796).
  const ax = new TreinoAdaline({ ...porta('XOR'), taxa: 0.1, pesosIniciais: [0, 0], biasInicial: 0, maxEpocas: 50 });
  const primeira = [ax.passo(), ax.passo(), ax.passo(), ax.passo()];
  const esperado = [-1, 1.1, 0.99, -1.318];
  checar('Adaline XOR (pesos 0 0), época 1: erros [−1; 1,1; 0,99; −1,318]',
    primeira.every((p, i) => perto(p.erro, esperado[i], 1e-12)), primeira.map((p) => p.erro).join('; '));
  checar('Adaline XOR, época 1: E = 2,00579556', perto(primeira[3].sse, 2.00579556, 1e-12), `${primeira[3].sse}`);

  // MLP com todos os pesos zero (XOR, sigmoide): saída 0,5 em tudo, δ₂ = ±0,125 e gradientes nulos.
  const zero = { pesos: [[[0, 0], [0, 0]], [[0], [0]]], bias: [[0, 0], [0]] };
  const prop = propagar(zero, PORTAS.XOR.X, 'sigmoide');
  const saida = prop.ativacoes[2].map((l) => l[0]);
  const delta2 = saida.map((s, m) => (s - PORTAS.XOR.y[m]) * (s * (1 - s)));
  checar('MLP com pesos zero: δ₂ = ±0,125', delta2.every((d) => Math.abs(d) === 0.125), delta2.join('; '));
  const g = gradientes(zero, PORTAS.XOR.y, 'sigmoide', prop);
  const todos = [...g.pesos.flat(2), ...g.bias.flat()];
  checar('MLP com pesos zero: todos os gradientes nulos', todos.every((v) => v === 0), todos.join('; '));

  // Rede montada à mão: XOR = AND(OR, NAND), com pesos ±20 e bias −10, 30, −30.
  const xorAMao = { pesos: [[[20, -20], [20, -20]], [[20], [20]]], bias: [[-10, 30], [-30]] };
  const saidas = propagar(xorAMao, PORTAS.XOR.X, 'sigmoide').ativacoes[2].map((l) => l[0]);
  checar('Rede AND(OR, NAND) à mão: saídas ≈ [0, 1, 1, 0]',
    saidas.every((s, m) => perto(s, PORTAS.XOR.y[m], 1e-3)), saidas.map((s) => s.toFixed(5)).join('; '));
}

// -------------------------------------------------------- 2. trajetórias contra o Python

secao('2a. Dados das portas');
{
  const ref = ler('portas.json');
  for (const [nome, { X, y }] of Object.entries(ref)) {
    checar(`porta ${nome} igual à do Python`,
      JSON.stringify(PORTAS[nome].X) === JSON.stringify(X) && JSON.stringify(PORTAS[nome].y) === JSON.stringify(y));
  }
}

secao('2b. Perceptron: passo a passo, igualdade exata');
{
  const casos = ler('perceptron.json');
  let identicos = 0;
  for (const caso of casos) {
    const nome = `${caso.porta} η=${caso.taxa} (${caso.inicio})`;
    const t = new TreinoPerceptron({
      ...porta(caso.porta), taxa: caso.taxa, maxEpocas: caso.maxEpocas,
      pesosIniciais: caso.pesosIniciais, biasInicial: caso.biasInicial,
    });
    const passos = rodar(t);
    let primeiraDiferenca = null;
    if (passos.length !== caso.passos.length) primeiraDiferenca = `${passos.length} passos contra ${caso.passos.length}`;
    for (let i = 0; i < Math.min(passos.length, caso.passos.length) && !primeiraDiferenca; i += 1) {
      const p = passos[i];
      const [epoca, indice, z, yPrevisto, houve, correcoes, erros, bias, ...pesos] = caso.passos[i];
      const igual = p.epoca === epoca && p.indice === indice && p.z === z && p.yPrevisto === yPrevisto
        && p.houveAtualizacao === houve && p.correcoesNaEpoca === correcoes && p.errosNaEpoca === erros
        && p.bias === bias && p.pesos.every((w, k) => w === pesos[k]);
      if (!igual) primeiraDiferenca = `passo ${i} (época ${epoca}, exemplo ${indice})`;
    }
    if (!primeiraDiferenca && t.convergiu !== caso.convergiu) primeiraDiferenca = 'desfecho diferente';
    if (checar(`Perceptron ${nome}`, !primeiraDiferenca, primeiraDiferenca)) identicos += 1;
  }
  informar(`${identicos}/${casos.length} trajetórias idênticas ao Python, bit a bit (7 portas × 3 η × 3 inícios)`);
}

secao('2c. Adaline: passo a passo nas 2 primeiras épocas e fim de cada época, igualdade exata');
{
  const casos = ler('adaline.json');
  let identicos = 0;
  for (const caso of casos) {
    const nome = `${caso.porta} η=${caso.taxa} (${caso.inicio})${caso.nota ? ` [${caso.nota}]` : ''}`;
    const t = new TreinoAdaline({
      ...porta(caso.porta), taxa: caso.taxa, maxEpocas: caso.maxEpocas,
      pesosIniciais: caso.pesosIniciais, biasInicial: caso.biasInicial,
    });
    const passos = rodar(t);
    let diferenca = null;
    const iniciais = passos.filter((p) => p.epoca <= 2);
    if (iniciais.length !== caso.passosIniciais.length) diferenca = 'número de passos iniciais';
    iniciais.forEach((p, i) => {
      if (diferenca) return;
      const [epoca, indice, z, erro, yPrevisto, bias, ...pesos] = caso.passosIniciais[i];
      if (!(p.epoca === epoca && p.indice === indice && p.z === z && p.erro === erro && p.yPrevisto === yPrevisto
        && p.bias === bias && p.pesos.every((w, k) => w === pesos[k]))) diferenca = `passo ${i}`;
    });
    const fins = passos.filter((p) => p.fimDeEpoca);
    if (!diferenca && fins.length !== caso.fins.length) diferenca = `${fins.length} épocas contra ${caso.fins.length}`;
    fins.forEach((p, i) => {
      if (diferenca) return;
      const [epoca, sse, erros, bias, ...pesos] = caso.fins[i];
      if (!(p.epoca === epoca && p.sse === sse && p.errosNaEpoca === erros && p.bias === bias
        && p.pesos.every((w, k) => w === pesos[k]))) diferenca = `fim da época ${epoca}`;
    });
    const estado = t.convergiu ? 'convergiu' : (t.divergiu ? 'divergiu' : 'esgotou');
    if (!diferenca && estado !== caso.estado) diferenca = `estado ${estado} contra ${caso.estado}`;
    if (checar(`Adaline ${nome}`, !diferenca, diferenca)) identicos += 1;
  }
  informar(`${identicos}/${casos.length} trajetórias idênticas ao Python, bit a bit (inclui η = 0,7 e um caso que diverge)`);
}

secao('2d. Marco 3: ponto de chegada do Adaline e ciclo do Perceptron');
{
  const ref = ler('marco3.json');
  for (const pf of ref.pontosFixos) {
    // sem tolerância de parada, o treino roda até o limite e chega ao ponto fixo
    const t = new TreinoAdaline({
      ...porta(pf.porta), taxa: pf.taxa, pesosIniciais: [0, 0], biasInicial: 0, toleranciaSse: 0, maxEpocas: 4000,
    });
    rodar(t);
    const ok = t.pesos.every((w, k) => perto(w, pf.pesos[k], 1e-9)) && perto(t.bias, pf.bias, 1e-9);
    checar(`Adaline ${pf.porta} η=${pf.taxa}: chega ao ponto fixo do Python`, ok,
      `JS w=${t.pesos.map((v) => v.toFixed(6))} b=${t.bias.toFixed(6)}; Python w=${pf.pesos.map((v) => v.toFixed(6))} b=${pf.bias.toFixed(6)}`);
  }
  for (const c of ref.ciclosPerceptron) {
    const t = new TreinoPerceptron({
      ...porta(c.porta), taxa: c.taxa, maxEpocas: 200, pesosIniciais: c.pesosIniciais, biasInicial: c.biasInicial,
    });
    const fins = rodar(t).filter((p) => p.fimDeEpoca);
    // mesma regra de `detectar_ciclo` (Marco 3): estado arredondado em 9 casas
    const vistos = new Map();
    let ciclo = null;
    for (const p of fins) {
      const chave = [...p.pesos, p.bias].map((v) => (Math.round(v * 1e9) / 1e9 + 0).toString()).join('|');
      if (vistos.has(chave)) { ciclo = [vistos.get(chave), p.epoca - vistos.get(chave)]; break; }
      vistos.set(chave, p.epoca);
    }
    checar(`Perceptron ${c.porta} η=${c.taxa} (${c.inicio}): ciclo começa na mesma época`,
      ciclo && ciclo[0] === c.inicioDoCiclo && ciclo[1] === c.periodo,
      `JS ${ciclo}, Python ${c.inicioDoCiclo},${c.periodo}`);
  }
}

secao('2e. MLP: um passo a partir do estado do Python, decisões e treino livre');
{
  const casos = ler('mlp.json');
  const desachatar = (vetor) => {
    let k = 0;
    const tomar = (n) => vetor.slice(k, (k += n));
    const W1 = [tomar(2), tomar(2)];
    const b1 = tomar(2);
    const W2 = [tomar(1), tomar(1)];
    const b2 = tomar(1);
    return { pesos: [W1, W2], bias: [b1, b2] };
  };
  const plano = (rede) => [...rede.pesos[0].flat(), ...rede.bias[0], ...rede.pesos[1].flat(), ...rede.bias[1]];
  let piorPasso = 0;
  let piorSse = 0;

  for (const caso of casos) {
    const nome = `${caso.porta} ${caso.ativacao} semente ${caso.semente} η=${caso.taxa}${caso.reinicio ? '' : ' sem reinício'}`;
    const { X, y } = porta(caso.porta);

    // (a) Um passo a partir do estado exato do Python: o arredondamento não se acumula.
    const estados = new Map(caso.estados.map(([epoca, ...valores]) => [epoca, valores]));
    const reinicios = new Set(caso.reinicios);
    let pares = 0;
    let piorDoCaso = 0;
    let piorSseDoCaso = 0;
    for (const [epoca, valores] of estados) {
      const rede = desachatar(valores);
      const sseJs = custoSSE(y, propagar(rede, X, caso.ativacao).ativacoes[2]);
      piorSseDoCaso = Math.max(piorSseDoCaso, diferencaRelativa(sseJs, caso.sse[epoca]));
      if (!estados.has(epoca + 1) || reinicios.has(epoca)) continue;
      const proxima = plano(epocaDeGradiente(rede, X, y, caso.ativacao, caso.taxa));
      const esperado = estados.get(epoca + 1);
      proxima.forEach((v, k) => { piorDoCaso = Math.max(piorDoCaso, diferencaRelativa(v, esperado[k])); });
      pares += 1;
    }
    piorPasso = Math.max(piorPasso, piorDoCaso);
    piorSse = Math.max(piorSse, piorSseDoCaso);
    checar(`MLP ${nome}: ${pares} passos a partir do estado do Python, diferença ≤ 1e-13`,
      piorDoCaso <= 1e-13, `pior diferença relativa ${piorDoCaso.toExponential(2)}`);
    checar(`MLP ${nome}: SSE de cada estado gravado igual ao do Python (≤ 1e-13)`,
      piorSseDoCaso <= 1e-13, `pior ${piorSseDoCaso.toExponential(2)}`);

    // (b) Decisões de parada e de reinício reexecutadas sobre a sequência de SSE do Python,
    // com o mesmo componente (JanelaDeReinicio) e os mesmos limiares do TreinoMLP.
    const modelo = new TreinoMLP({ X, y, ativacao: caso.ativacao, taxa: caso.taxa, maxEpocas: caso.maxEpocas });
    const janela = new JanelaDeReinicio(modelo.melhoraMinimaSse);
    const eventos = { reinicios: [], estado: null, epocaFinal: null };
    let tentativa = 0;
    for (let epoca = 0; epoca < caso.sse.length; epoca += 1) {
      const sse = caso.sse[epoca];
      if (sse < modelo.limiarSse) { eventos.estado = 'convergiu'; eventos.epocaFinal = epoca; break; }
      if (epoca >= caso.maxEpocas) { eventos.estado = 'limite'; eventos.epocaFinal = epoca; break; }
      if (caso.reinicio && janela.observar(sse)) {
        if (tentativa + 1 >= MAX_TENTATIVAS) { eventos.estado = 'esgotou'; eventos.epocaFinal = epoca; break; }
        eventos.reinicios.push(epoca);
        tentativa += 1;
        janela.zerar();
      }
    }
    checar(`MLP ${nome}: decisões sobre o SSE do Python caem nas mesmas épocas`,
      eventos.estado === caso.estado && eventos.epocaFinal === caso.epocaFinal
      && JSON.stringify(eventos.reinicios) === JSON.stringify(caso.reinicios),
      `JS ${JSON.stringify(eventos)}, Python ${caso.estado} ${caso.epocaFinal} ${JSON.stringify(caso.reinicios)}`);

    // (c) Treino livre do JS com os mesmos pesos iniciais: marcos discretos iguais.
    const livre = new TreinoMLP({
      X, y, camadas: caso.camadas, ativacao: caso.ativacao, taxa: caso.taxa, maxEpocas: caso.maxEpocas,
      reiniciarAoEmpacar: caso.reinicio, fontePesos: (k) => caso.tentativas[k],
    });
    const passos = rodar(livre);
    let distancia = 0;
    passos.forEach((p, i) => { if (i < caso.sse.length) distancia = Math.max(distancia, Math.abs(p.sse - caso.sse[i])); });
    const reiniciosJs = passos.filter((p) => p.reiniciou).map((p) => p.epoca);
    checar(`MLP ${nome}: treino livre com os mesmos marcos (${caso.estado} na época ${caso.epocaFinal}, reinícios ${JSON.stringify(caso.reinicios)})`,
      livre.estado === caso.estado && passos.at(-1).epoca === caso.epocaFinal
      && JSON.stringify(reiniciosJs) === JSON.stringify(caso.reinicios)
      && passos.at(-1).errosNaEpoca === caso.errosFinal,
      `JS ${livre.estado} na época ${passos.at(-1).epoca}, reinícios ${JSON.stringify(reiniciosJs)}`);
    informar(`${nome}: treino livre, maior distância entre as curvas de SSE = ${distancia.toExponential(2)}`);
  }
  informar(`pior diferença relativa num passo a partir do Python: ${piorPasso.toExponential(2)}; no SSE: ${piorSse.toExponential(2)}`);
}

// ---------------------------------------------------- 3. propriedades independentes do Python

secao('3. Propriedades independentes do Python');
{
  // Gradiente por diferenças finitas centrais, em várias arquiteturas e nas três ativações.
  const h = 1e-6;
  for (const camadas of [[2], [4], [4, 2], [4, 2, 2]]) {
    for (const ativacao of Object.keys(ATIVACOES)) {
      const { X, y } = porta('XOR');
      const rede = inicializarXavier(formatoDaRede(2, camadas), criarAleatorio(7));
      const custoMedio = (r) => custoSSE(y, propagar(r, X, ativacao).ativacoes.at(-1)) / y.length;
      const analitico = gradientes(rede, y, ativacao, propagar(rede, X, ativacao));
      let pior = 0;
      const perturbar = (lista, indice, delta) => { lista[indice] += delta; };
      const comparar = (lista, indice, valorAnalitico) => {
        perturbar(lista, indice, h);
        const mais = custoMedio(rede);
        perturbar(lista, indice, -2 * h);
        const menos = custoMedio(rede);
        perturbar(lista, indice, h);
        pior = Math.max(pior, Math.abs((mais - menos) / (2 * h) - valorAnalitico));
      };
      rede.pesos.forEach((matriz, l) => matriz.forEach((linha, i) => linha.forEach((_, j) => comparar(linha, j, analitico.pesos[l][i][j]))));
      rede.bias.forEach((linha, l) => linha.forEach((_, j) => comparar(linha, j, analitico.bias[l][j])));
      checar(`gradiente [${camadas}] ${ativacao} confere com diferenças finitas (≤ 1e-8)`, pior <= 1e-8, `pior ${pior.toExponential(2)}`);
    }
  }

  // Exponencial e tanh próprias (dados.js): determinísticas em qualquer navegador, e precisas.
  const { exponencial, tangenteHiperbolica } = await import('../docs/js/dados.js');
  let piorExp = 0;
  let piorTanh = 0;
  let s = 7;
  for (let i = 0; i < 200000; i += 1) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const x = (s / 2147483648 - 0.5) * 60;
    const referencia = Math.exp(x);
    if (Number.isFinite(referencia) && referencia > 0) piorExp = Math.max(piorExp, Math.abs(exponencial(x) - referencia) / referencia);
    const z = (s / 2147483648 - 0.5) * 12;
    if (Math.tanh(z) !== 0) piorTanh = Math.max(piorTanh, Math.abs(tangenteHiperbolica(z) - Math.tanh(z)) / Math.abs(Math.tanh(z)));
  }
  checar('exponencial própria a no máximo 2 ulp de Math.exp', piorExp <= 2 * Number.EPSILON, piorExp.toExponential(2));
  checar('tanh própria a no máximo 6 ulp de Math.tanh', piorTanh <= 6 * Number.EPSILON, piorTanh.toExponential(2));
  checar('exponencial e tanh nos pontos especiais', exponencial(0) === 1 && tangenteHiperbolica(0) === 0
    && exponencial(-746) === 0 && exponencial(710) === Infinity && tangenteHiperbolica(30) === 1
    && tangenteHiperbolica(-30) === -1 && Number.isNaN(exponencial(NaN)));

  // A tolerância do degrau (Aprendizado 4).
  checar('degrau(−1,7·10⁻¹³) = 1 (tratado como zero)', degrau(-1.7e-13) === 1);
  checar('degrau(−10⁻⁸) = 0 (fora da tolerância)', degrau(-1e-8) === 0);
  checar('TOLERANCIA_ZERO = 1e-9, a mesma do Python', TOLERANCIA_ZERO === 1e-9);

  // errosNaEpoca = recontagem independente, com os pesos finais da época.
  const recontar = (X, y, pesos, bias) => X.reduce((total, x, m) => {
    let z = bias;
    x.forEach((v, i) => { z += v * pesos[i]; });
    const classe = Math.abs(z) < 1e-9 || z > 0 ? 1 : 0;
    return total + (classe !== y[m] ? 1 : 0);
  }, 0);
  let recontagensOk = true;
  for (const nome of Object.keys(PORTAS)) {
    for (const Classe of [TreinoPerceptron, TreinoAdaline]) {
      const t = new Classe({ ...porta(nome), taxa: 0.1, maxEpocas: 60 });
      for (const p of rodar(t)) {
        if (p.fimDeEpoca && p.errosNaEpoca !== recontar(t.X, t.y, p.pesos, p.bias)) recontagensOk = false;
      }
    }
  }
  checar('errosNaEpoca = recontagem independente (Perceptron e Adaline, 7 portas)', recontagensOk);
  const rede = new TreinoMLP({ ...porta('XOR'), ativacao: 'tanh', taxa: 2, maxEpocas: 3000 });
  let recontagemMlp = true;
  for (const p of rodar(rede)) {
    const pelaSaida = p.saidas.reduce((t, s, m) => t + ((s >= 0.5 ? 1 : 0) !== rede.y[m] ? 1 : 0), 0);
    if (pelaSaida !== p.errosNaEpoca) recontagemMlp = false;
  }
  checar('MLP: errosNaEpoca por degrau(z) = contagem por saída ≥ 0,5', recontagemMlp);

  // O custo do Adaline nunca fica abaixo do mínimo de mínimos quadrados (régua do Marco 3).
  const { custoMinimo } = ler('marco3.json');
  let acimaDoMinimo = true;
  for (const nome of Object.keys(PORTAS)) {
    for (const taxa of [0.05, 0.1, 0.2, 0.7]) {
      const t = new TreinoAdaline({ ...porta(nome), taxa });
      for (const p of rodar(t)) if (p.fimDeEpoca && p.sse < custoMinimo[nome] - 1e-12) acimaDoMinimo = false;
    }
  }
  checar('Adaline: custo nunca abaixo do mínimo de mínimos quadrados', acimaDoMinimo);

  // contarErros e produtoEscalar básicos
  checar('produtoEscalar e contarErros coerentes no AND', produtoEscalar([1, 1], [1, 1]) === 2
    && contarErros(PORTAS.AND.X, PORTAS.AND.y, [1, 1], -1.5) === 0);
  // aplicarGradiente não altera a rede original
  const original = inicializarXavier([2, 2, 1], criarAleatorio(3));
  const copia = JSON.stringify(original);
  aplicarGradiente(original, gradientes(original, PORTAS.XOR.y, 'tanh', propagar(original, PORTAS.XOR.X, 'tanh')), 2);
  checar('aplicarGradiente devolve uma rede nova sem alterar a original', JSON.stringify(original) === copia);
}

// --------------------------------------------------- 4. estatística com o gerador do site

secao('4. Estatística da MLP com o gerador do site (40 sementes, η = 2, rede [2], com reinício)');
const estatistica = {};
{
  for (const nomePorta of ['XOR', 'XNOR']) {
    for (const ativacao of ['sigmoide', 'tanh', 'relu', 'leaky', 'elu', 'swish', 'gelu']) {
      const epocas = [];
      let reinicios = 0;
      for (let semente = 0; semente < 40; semente += 1) {
        const t = new TreinoMLP({ ...porta(nomePorta), ativacao, taxa: 2, semente });
        rodar(t);
        reinicios += t.reinicios.length;
        if (t.convergiu) epocas.push(t.epoca);
      }
      epocas.sort((a, b) => a - b);
      const mediana = epocas.length ? epocas[Math.floor(epocas.length / 2)] : null;
      estatistica[`${nomePorta} ${ativacao}`] = { convergiu: epocas.length, mediana, reinicios };
      const texto = `${nomePorta} ${ativacao}: ${epocas.length}/40 convergem, mediana ${mediana} épocas, ${reinicios} reinícios`;
      if (!['sigmoide', 'tanh'].includes(ativacao)) {
        informar(`${texto} (só registrado)`);
      } else {
        informar(texto);
        // Critério do plano: 100%. Com MAX_TENTATIVAS = 6 a semente 2 do XNOR com sigmoide
        // esgotava as 6 tentativas (Aprendizado 13); por isso a constante passou a 10, nos dois lados.
        checar(`${nomePorta} ${ativacao}: 100% das sementes convergem`, epocas.length === 40,
          `${epocas.length}/40 (ver MAX_TENTATIVAS em treino_mlp.js e no 04)`);
      }
    }
  }
  // Números citados nas gavetas das ativações (docs/js/ativacoes_visual.js): reinícios no XOR
  // com dois neurônios ocultos, η = 2, 40 sementes; e a Leaky ReLU igual à ReLU.
  checar('XOR Swish: nenhum reinício nas 40 sementes (citado na gaveta)', estatistica['XOR swish'].reinicios === 0,
    `${estatistica['XOR swish'].reinicios}`);
  checar('XOR ELU: 6 reinícios nas 40 sementes (citado na gaveta)', estatistica['XOR elu'].reinicios === 6,
    `${estatistica['XOR elu'].reinicios}`);
  checar('XOR ReLU: 101 reinícios nas 40 sementes (citado na gaveta)', estatistica['XOR relu'].reinicios === 101,
    `${estatistica['XOR relu'].reinicios}`);
  checar('XOR Leaky ReLU: mediana 844 épocas, quase igual à da ReLU (843) (citado na gaveta)',
    estatistica['XOR leaky'].mediana === 844 && estatistica['XOR relu'].mediana === 843,
    `${estatistica['XOR leaky'].mediana} / ${estatistica['XOR relu'].mediana}`);
  let semReinicio = 0;
  for (let semente = 0; semente < 40; semente += 1) {
    const t = new TreinoMLP({ ...porta('XOR'), ativacao: 'sigmoide', taxa: 2, semente, reiniciarAoEmpacar: false });
    rodar(t);
    if (t.convergiu) semReinicio += 1;
  }
  informar(`XOR sigmoide SEM reinício: ${semReinicio}/40 convergem (só registrado)`);
}

// ---------------------------------------------------------------- 5. gabaritos do site

secao('5. Gabaritos do site (gerador do site, semente 42)');
{
  const medidos = {};
  const p1 = new TreinoPerceptron({ ...porta('AND'), taxa: 0.1, maxEpocas: 40 });
  rodar(p1);
  medidos.ato1_perceptron_AND = { epoca: p1.epoca, convergiu: p1.convergiu, erros: p1.errosAtuais() };
  const p2 = new TreinoPerceptron({ ...porta('XOR'), taxa: 0.1, maxEpocas: 40 });
  rodar(p2);
  medidos.ato1_perceptron_XOR = { epoca: p2.epoca, convergiu: p2.convergiu, erros: p2.errosAtuais() };
  const a1 = new TreinoAdaline({ ...porta('AND'), taxa: 0.1, maxEpocas: 300 });
  rodar(a1);
  medidos.ato2_adaline_AND_eta_0_1 = { epoca: a1.epoca, convergiu: a1.convergiu, erros: a1.errosAtuais(), sse: Number(a1.custoAtual().toFixed(4)) };
  const a2 = new TreinoAdaline({ ...porta('AND'), taxa: 0.7, maxEpocas: 300 });
  rodar(a2);
  medidos.ato2_adaline_AND_eta_0_7 = { epoca: a2.epoca, convergiu: a2.convergiu, erros: a2.errosAtuais(), sse: Number(a2.custoAtual().toFixed(4)) };
  const a3 = new TreinoAdaline({ ...porta('XOR'), taxa: 0.1, maxEpocas: 300 });
  rodar(a3);
  medidos.ato2_adaline_XOR = { epoca: a3.epoca, convergiu: a3.convergiu, erros: a3.errosAtuais(), sse: Number(a3.custoAtual().toFixed(4)) };
  const m1 = new TreinoMLP({ ...porta('XOR'), camadas: [2], ativacao: 'tanh', taxa: 2 });
  rodar(m1);
  medidos.ato3_mlp_XOR_tanh_eta_2 = { epoca: m1.epoca, estado: m1.estado, reinicios: m1.reinicios.map((r) => r.epoca), erros: m1.errosAtuais() };

  for (const [chave, valor] of Object.entries(medidos)) informar(`${chave}: ${JSON.stringify(valor)}`);

  if (GRAVAR_GABARITOS) {
    writeFileSync(ARQUIVO_GABARITOS, `${JSON.stringify(medidos, null, 2)}\n`);
    informar(`gabaritos gravados em ${path.relative(process.cwd(), ARQUIVO_GABARITOS)}`);
  } else if (existsSync(ARQUIVO_GABARITOS)) {
    const travados = JSON.parse(readFileSync(ARQUIVO_GABARITOS, 'utf8'));
    for (const [chave, valor] of Object.entries(travados)) {
      checar(`gabarito ${chave} inalterado`, JSON.stringify(medidos[chave]) === JSON.stringify(valor),
        `medido ${JSON.stringify(medidos[chave])}, travado ${JSON.stringify(valor)}`);
    }
  } else {
    informar('gabaritos_site.json ainda não existe: rode com --gravar-gabaritos depois de aprová-los');
  }
}

// ---------------------------------------------------------------- 6. desafios dos atos

secao('6. Desafios dos atos (regra de conquista e pistas, semente 42 do site)');
{
  const {
    DESAFIOS, TENTATIVAS_POR_PISTA, avaliarConquista, criarEstado, pedirPista, pistasLiberadas,
    registrarAbandono, registrarTermino, resolveuDeVerdade, tentativasParaProximaPista,
  } = await import('../docs/js/desafios.js');
  const treinar = (Classe, nomePorta, opcoes = {}) => {
    const t = new Classe({ ...porta(nomePorta), ...opcoes });
    rodar(t);
    return t;
  };

  // (a) a configuração inicial de cada ato NÃO resolve
  const ato2Inicial = treinar(TreinoAdaline, 'AND', { taxa: 0.7, maxEpocas: 300 });
  checar('Ato 2: Adaline no AND com η = 0,7 "converge" mas não conta (1 errado)',
    ato2Inicial.convergiu && ato2Inicial.errosAtuais() === 1
    && !avaliarConquista('ato2', { modo: 'adaline', porta: 'AND' }, ato2Inicial));
  const ato3Inicial = treinar(TreinoMLP, 'XOR', { ativacao: 'sigmoide', taxa: 0.1 });
  checar('Ato 3: rede 2-2-1 com sigmoide e η = 0,1 não resolve o XOR (desiste)',
    ato3Inicial.estado === 'esgotou' && !avaliarConquista('ato3', { modo: 'mlp', porta: 'XOR' }, ato3Inicial),
    `${ato3Inicial.estado} na época ${ato3Inicial.epoca}`);
  for (const nomePorta of ['XOR', 'XNOR']) {
    const p = treinar(TreinoPerceptron, nomePorta, { taxa: 0.1, maxEpocas: 40 });
    const a = treinar(TreinoAdaline, nomePorta, { taxa: 0.1, maxEpocas: 300 });
    checar(`${nomePorta}: Perceptron e Adaline nunca contam como resolvido`,
      !resolveuDeVerdade(p) && !resolveuDeVerdade(a)
      && !avaliarConquista('ato3', { modo: 'adaline', porta: nomePorta }, a)
      && !avaliarConquista('ato1', { modo: 'perceptron', porta: nomePorta }, p));
  }

  // (b) existe configuração que resolve
  const ato2Solucao = treinar(TreinoAdaline, 'AND', { taxa: 0.3, maxEpocas: 300 });
  checar('Ato 2: com η = 0,3 o Adaline resolve o AND e conta',
    avaliarConquista('ato2', { modo: 'adaline', porta: 'AND' }, ato2Solucao));
  const ato3Tanh = treinar(TreinoMLP, 'XOR', { ativacao: 'tanh', taxa: 2 });
  checar('Ato 3: tanh com η = 2 resolve o XOR (época 1294) e conta',
    ato3Tanh.epoca === 1294 && avaliarConquista('ato3', { modo: 'mlp', porta: 'XOR' }, ato3Tanh));
  const ato3Relu = treinar(TreinoMLP, 'XOR', { ativacao: 'relu', taxa: 0.1 });
  checar('Ato 3: ReLU com o mesmo η = 0,1 também resolve e conta',
    avaliarConquista('ato3', { modo: 'mlp', porta: 'XOR' }, ato3Relu), `${ato3Relu.estado} ${ato3Relu.epoca}`);
  const ato3Sigmoide = treinar(TreinoMLP, 'XOR', { ativacao: 'sigmoide', taxa: 2 });
  checar('Ato 3: subir o η da sigmoide para 2 resolve e conta',
    avaliarConquista('ato3', { modo: 'mlp', porta: 'XOR' }, ato3Sigmoide));

  // (c) fora do desafio, esgotado ou divergente: não conta
  const divergiu = treinar(TreinoAdaline, 'AND', { taxa: 1.2, maxEpocas: 300 });
  checar('Adaline divergindo (η = 1,2) não conta', divergiu.divergiu && !resolveuDeVerdade(divergiu));
  const perceptronAnd = treinar(TreinoPerceptron, 'AND', { taxa: 0.1, maxEpocas: 40 });
  checar('modo fora do desafio não conta (Perceptron no AND para o Ato 2; rede no AND para o Ato 3)',
    !avaliarConquista('ato2', { modo: 'perceptron', porta: 'AND' }, perceptronAnd)
    && !avaliarConquista('ato3', { modo: 'mlp', porta: 'AND' }, treinar(TreinoMLP, 'AND', { ativacao: 'tanh', taxa: 2 })));
  const semTerminar = new TreinoMLP({ ...porta('XOR'), ativacao: 'tanh', taxa: 2 });
  for (let i = 0; i < 50; i += 1) semTerminar.passo();
  checar('treino que ainda não terminou não conta', !resolveuDeVerdade(semTerminar));

  // (d) a recontagem da regra é a mesma recontagem independente da camada 3
  checar('erros da regra = recontagem independente (Adaline η = 0,7)',
    ato2Inicial.errosAtuais() === contarErros(PORTAS.AND.X, PORTAS.AND.y, ato2Inicial.pesos, ato2Inicial.bias));

  // (e) máquina de estados: tentativas, pistas, partes do Ato 1 e conquista
  let estado = criarEstado();
  const xor = { modo: 'perceptron', porta: 'XOR' };
  const p2 = treinar(TreinoPerceptron, 'XOR', { taxa: 0.1, maxEpocas: 40 });
  ({ estado } = registrarTermino(estado, 'ato1', xor, p2));
  checar('1 tentativa no XOR: nenhuma pista ainda, falta 1', pistasLiberadas(estado, 'ato1') === 0
    && tentativasParaProximaPista(estado, 'ato1') === 1);
  ({ estado } = registrarTermino(estado, 'ato1', xor, p2));
  checar(`${TENTATIVAS_POR_PISTA} tentativas: 1 pista liberada`, pistasLiberadas(estado, 'ato1') === 1);
  const curto = registrarAbandono(estado, 'ato1', xor, 1);
  checar('abandono com 1 época (clique acidental) não conta', !curto.contouTentativa);
  const longo = registrarAbandono(estado, 'ato1', xor, 5);
  checar('abandono com 5 épocas conta', longo.contouTentativa);
  checar('"Estou travado" libera a próxima pista', pistasLiberadas(pedirPista(estado, 'ato1'), 'ato1') === 2);
  let conquistas = 0;
  for (const nomePorta of DESAFIOS.ato1.partes) {
    const t = treinar(TreinoPerceptron, nomePorta, { taxa: 0.1, maxEpocas: 40 });
    const r = registrarTermino(estado, 'ato1', { modo: 'perceptron', porta: nomePorta }, t);
    estado = r.estado;
    if (r.conquistou) conquistas += 1;
  }
  checar('Ato 1: conquista dispara uma vez, ao fechar as 5 portas, e libera todas as pistas',
    conquistas === 1 && estado.desafios.ato1.conquistado && pistasLiberadas(estado, 'ato1') === 3);
  const repetida = registrarTermino(estado, 'ato1', { modo: 'perceptron', porta: 'AND' }, perceptronAnd);
  checar('conquista não dispara de novo', !repetida.conquistou);
  let estado3 = criarEstado();
  const r3 = registrarTermino(estado3, 'ato3', { modo: 'mlp', porta: 'XOR' }, ato3Inicial);
  estado3 = r3.estado;
  checar('Ato 3: a configuração inicial conta como tentativa, não como conquista',
    r3.contouTentativa && !r3.conquistou);
  checar('Ato 3: resolver conta como conquista',
    registrarTermino(estado3, 'ato3', { modo: 'mlp', porta: 'XOR' }, ato3Tanh).conquistou);
}

// ------------------------------------------------- 7. conjuntos de classificação (livre)

secao('7. Conjuntos de classificação do laboratório livre (os números citados na página)');
{
  const { CHAVES_DATASETS, gerarDataset } = await import('../docs/js/datasets.js');
  for (const chave of CHAVES_DATASETS) {
    const a = gerarDataset(chave);
    const b = gerarDataset(chave);
    checar(`${chave}: a mesma semente gera os mesmos pontos`, JSON.stringify(a) === JSON.stringify(b));
    const uns = a.y.filter((v) => v === 1).length;
    checar(`${chave}: 200 pontos, 100 de cada classe`, a.X.length === 200 && uns === 100, `${a.X.length} pontos, ${uns} classe 1`);
    checar(`${chave}: todos os pontos dentro de [−1, 1]²`, a.X.every(([x, y]) => Math.abs(x) <= 1 && Math.abs(y) <= 1));
    // sem sobreposição: o ponto mais próximo da outra classe nunca é o mesmo lugar
    let menor = Infinity;
    for (let i = 0; i < a.X.length; i += 1) {
      for (let j = 0; j < a.X.length; j += 1) {
        if (a.y[i] !== a.y[j]) menor = Math.min(menor, Math.hypot(a.X[i][0] - a.X[j][0], a.X[i][1] - a.X[j][1]));
      }
    }
    checar(`${chave}: classes sem sobreposição (distância mínima entre classes > 0,01)`, menor > 0.01, `${menor.toFixed(4)}`);
  }

  const treinarRede = (chave, camadas, ativacao, taxa) => {
    const d = gerarDataset(chave);
    const t = new TreinoMLP({
      X: d.X, y: d.y, camadas, ativacao, taxa, semente: 42, maxEpocas: 20000,
      reiniciarAoEmpacar: false, pararQuando: 'acertos',
    });
    rodar(t);
    return t;
  };
  const g = gerarDataset('gaussianas');
  const perceptronGauss = new TreinoPerceptron({ X: g.X, y: g.y, taxa: 0.1, maxEpocas: 100 });
  rodar(perceptronGauss);
  checar('gaussianas: o Perceptron resolve na época 3', perceptronGauss.convergiu && perceptronGauss.epoca === 3,
    `época ${perceptronGauss.epoca}`);
  const casos = [
    ['circulo', [2], 'tanh', 2, 'limite', null],
    ['circulo', [3], 'tanh', 2, 'convergiu', 1418],
    ['circulo', [6, 6], 'relu', 2, 'convergiu', 65],
    ['quadrantes', [2], 'tanh', 2, 'limite', null],
    ['quadrantes', [3], 'tanh', 2, 'convergiu', 662],
    ['quadrantes', [6], 'tanh', 2, 'convergiu', 103],
    ['espiral', [6, 6, 6], 'tanh', 3, 'convergiu', 4113],
    ['espiral', [6, 6, 6], 'relu', 5, 'convergiu', 3721],
  ];
  for (const [chave, camadas, ativacao, taxa, estado, epoca] of casos) {
    const t = treinarRede(chave, camadas, ativacao, taxa);
    const ok = t.estado === estado && (epoca === null || t.epoca === epoca)
      && (estado !== 'convergiu' || t.errosAtuais() === 0);
    checar(`${chave} [${camadas}] ${ativacao} η=${taxa}: ${estado}${epoca ? ` na época ${epoca}` : ''}`, ok,
      `${t.estado} na época ${t.epoca}, ${200 - t.errosAtuais()}/200 certos`);
  }
  // o critério 'acertos' só muda a parada: o padrão continua o do Python
  const padrao = new TreinoMLP({ ...porta('XOR'), ativacao: 'tanh', taxa: 2 });
  rodar(padrao);
  checar('critério padrão inalterado: XOR tanh η = 2 continua na época 1294', padrao.epoca === 1294);
}

// ------------------------------------------------------------------------------- resumo

console.log(`\n${falhas === 0 ? '✓' : '✗'} ${aprovadas} verificações passaram, ${falhas} falharam.`);
process.exit(falhas === 0 ? 0 : 1);
