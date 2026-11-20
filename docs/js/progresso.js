/**
 * Liga os laboratórios dos atos às regras de `desafios.js`: conta tentativas, libera
 * pistas, registra as portas do Ato 1 e mostra a conquista quando o aluno resolve.
 *
 * O progresso fica só neste navegador (localStorage, com try/catch: sem ele, vale até
 * recarregar a página). Nada vai para a rede: sem nome, sem conta, sem banco (Decisão 9).
 * O botão "zerar progresso" do rodapé serve aos ensaios e às repetições da apresentação.
 */

import { PORTAS_SEPARAVEIS } from './dados.js';
import { ATIVACOES } from './treino_mlp.js';
import {
  DESAFIOS, criarEstado, normalizarEstado, pedirPista, registrarAbandono, registrarTermino,
} from './desafios.js';
import { mostrarConquista } from './notificacao.js';
import { GavetaDePistas } from './pistas.js';

const CHAVE = 'neurologica:progresso';

/** Qual desafio cada laboratório alimenta. */
const LAB_PARA_DESAFIO = { 'lab-ato1': 'ato1', 'lab-ato2': 'ato2', 'lab-ato3': 'ato3' };

const formatarNumero = (valor) => String(valor).replace('.', ',');

/** Pistas e o "por que funcionou" de cada ato (roteiro do 04_planejamento.md). */
const TEXTOS = {
  ato1: {
    pistas: [
      'Rode o XOR de novo e acompanhe a reta. A cada correção ela conserta um ponto e estraga outro. Quantos pontos erram no fim de cada época?',
      'Pegue um lápis: passe uma reta que deixe os dois pontos de uma cor de um lado e os da outra cor do outro. Repare <em>onde</em> ficam os pontos da mesma cor.',
      'Os pontos da mesma cor estão em cantos opostos do quadrado, e nenhuma reta separa dois cantos opostos dos outros dois. Não falta treino: falta reta. Para o XOR vai ser preciso <strong>mais de uma</strong>. Antes, veja se saber <em>o quanto</em> errou ajuda (Ato 2).',
    ],
    porque: 'Nas cinco portas lineares existe uma reta que separa as classes, e o Perceptron sempre a encontra. No XOR e no XNOR essa reta não existe: um neurônio só traça uma reta.',
    conquista: () => ({
      titulo: 'O Perceptron aprendeu as 5 portas lineares.',
      texto: 'AND, OR, NOT, NAND e NOR: todas resolvidas por uma reta só. Faltam o XOR e o XNOR. O que acontece com elas?',
    }),
  },
  ato2: {
    pistas: [
      'Olhe os pontos e a curva de custo. O custo parou de cair, mas num valor alto, e um ponto continua do lado errado da reta. O neurônio se acomodou num lugar ruim.',
      'O η é o tamanho do passo. Imagine descer um vale de olhos fechados: com passos longos demais você vai de um lado ao outro do vale e nunca para no fundo (veja a ilustração acima).',
      'Diminua o η e rode de novo. Com um passo menor o neurônio chega mais perto do fundo, mas leva mais tempo. Procure o maior η em que os quatro pontos ficam certos.',
    ],
    porque: 'Com o passo certo, cada correção desce um pouco o vale do erro até perto do fundo, e ali a reta separa o AND. Passo grande demais pula o fundo; passo pequeno demais chega, mas devagar.',
    conquista: ({ taxa, treino }) => ({
      titulo: 'Você achou um η que funciona.',
      texto: `O Adaline acerta o AND com η = ${formatarNumero(taxa)} em ${treino.epoca} épocas. O XOR ainda é outra história.`,
    }),
  },
  ato3: {
    pistas: [
      'Com um neurônio só, o XOR não tem solução. Troque o modelo para a <strong>rede 2-2-1</strong>: agora há dois neurônios na camada oculta, e cada um traça a sua reta.',
      'A rede treina, mas olhe a curva de erro: ela cai devagar ou trava? Dois controles mudam o ritmo: o <strong>η</strong> (o tamanho do passo) e a <strong>ativação</strong> (como cada neurônio responde).',
      'Para o erro voltar até os neurônios ocultos, a ativação precisa ter inclinação. A sigmoide achata nas pontas, e com η pequeno o passo quase some. Aumente o η (ou troque para tanh ou ReLU) e compare as curvas.',
    ],
    porque: 'Duas retas recortam a faixa do XOR, e o backpropagation só consegue ajustá-las porque a ativação é não linear e diferenciável; com passo e ativação adequados, o erro chega aos neurônios escondidos.',
    conquista: ({ porta, taxa, ativacao, treino }) => ({
      titulo: `Você resolveu o ${porta} com uma rede 2-2-1.`,
      texto: `Ativação ${ATIVACOES[ativacao]?.rotulo ?? ativacao}, η = ${formatarNumero(taxa)}, ${treino.epoca} épocas. Duas retas fizeram o que uma não conseguia.`,
    }),
  },
};

function lerEstado() {
  try {
    return normalizarEstado(JSON.parse(localStorage.getItem(CHAVE) || 'null'));
  } catch {
    return criarEstado();
  }
}

function salvarEstado(estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    // sem armazenamento (navegação privada): o progresso vale até recarregar a página
  }
}

/** As cinco portas do Ato 1, como selos que se preenchem ao serem resolvidas. */
function desenharPortasDoAto1(container, estado, nova = null) {
  if (!container) return;
  const feitas = estado.desafios.ato1.partes;
  container.innerHTML = `
    <span class="progresso-rotulo">Portas lineares resolvidas pelo Perceptron</span>
    <ul class="progresso-lista">
      ${PORTAS_SEPARAVEIS.map((porta) => `
        <li class="progresso-porta${feitas.includes(porta) ? ' progresso-porta--feita' : ''}${porta === nova ? ' progresso-porta--nova' : ''}">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.6 8.4 L6.8 11.4 L12.4 4.8"/></svg>${porta}
          <span class="sr-only">${feitas.includes(porta) ? '(resolvida)' : '(ainda não)'}</span>
        </li>`).join('')}
    </ul>
    <span class="progresso-contagem">${feitas.length}/${PORTAS_SEPARAVEIS.length}</span>
  `;
}

export function configurarProgresso() {
  let estado = lerEstado();
  const gavetas = {};

  const atualizarTudo = (novaParte = null) => {
    Object.values(gavetas).forEach((g) => g.atualizar(estado));
    desenharPortasDoAto1(document.getElementById('progresso-ato1'), estado, novaParte);
  };

  Object.keys(DESAFIOS).forEach((id) => {
    const container = document.getElementById(`pistas-${id}`);
    if (!container) return;
    gavetas[id] = new GavetaDePistas(container, {
      id,
      pistas: TEXTOS[id].pistas,
      porque: TEXTOS[id].porque,
      aoPedirPista: () => {
        estado = pedirPista(estado, id);
        salvarEstado(estado);
        atualizarTudo();
      },
    });
  });
  atualizarTudo();

  document.addEventListener('laboratorio:terminou', (evento) => {
    const id = LAB_PARA_DESAFIO[evento.target.id];
    if (!id) return;
    const detalhe = evento.detail;
    const resultado = registrarTermino(estado, id, detalhe, detalhe.treino);
    estado = resultado.estado;
    salvarEstado(estado);
    atualizarTudo(resultado.parte);
    if (resultado.conquistou) {
      const ancora = evento.target.closest('.lab-embrulho');
      mostrarConquista(ancora, TEXTOS[id].conquista(detalhe));
    }
  });

  document.addEventListener('laboratorio:abandonou', (evento) => {
    const id = LAB_PARA_DESAFIO[evento.target.id];
    if (!id) return;
    const resultado = registrarAbandono(estado, id, evento.detail, evento.detail.epocasConcluidas);
    if (!resultado.contouTentativa) return;
    estado = resultado.estado;
    salvarEstado(estado);
    atualizarTudo();
  });

  document.getElementById('zerar-progresso')?.addEventListener('click', () => {
    estado = criarEstado();
    salvarEstado(estado);
    document.querySelectorAll('.conquista').forEach((aviso) => aviso.remove());
    atualizarTudo();
    const aviso = document.getElementById('zerar-progresso-aviso');
    if (aviso) aviso.textContent = 'Progresso zerado.';
  });
}
