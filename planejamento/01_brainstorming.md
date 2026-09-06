# Brainstorming — Trabalho Final de Redes Neurais

**Nome do projeto: NeuroLógica** (Neuro + Lógica, referência às portas lógicas — trocadilho sonoro com "neurológica").

## Ideia inicial (atualizada)

Uma animação (em formato de website/página interativa) que mostra, lado a lado, **o algoritmo rodando** (pesos, regra de atualização, época atual) e **o efeito geométrico no gráfico** (hiperplano se movendo), cobrindo **todas as 7 portas lógicas** do Tópico 2 (`Topicos/02_neuronio_mcp_portas_logicas.md`): AND, OR, NOT (básicas) e NAND, NOR, XOR, XNOR (derivadas).

A progressão de complexidade acompanha exatamente a progressão do material do curso:

1. **Um único neurônio treinável** resolve a maioria das portas.
2. Algumas portas **precisam de dois ou mais neurônios compostos em pequena rede**.
3. As portas que exigem separação não linear (**XOR e XNOR**) forçam a virada para uma **MLP** — o que, por sua vez, exige **trocar a função de ativação degrau por uma diferenciável** (ex.: sigmoide) e **treinar com gradiente descendente/backpropagation**, já que o degrau tem derivada nula quase em toda parte e não permite gradiente.

Ponto forte da ideia: é visual, didática, interativa (bate direto com o pedido do enunciado de "facilitar a exposição e troca de experiência... interação com sistemas locais ou remotos") e tem uma progressão narrativa natural e **tecnicamente precisa** (1 neurônio resolve quase tudo → 1 neurônio não basta para tudo → por que, exatamente, é preciso mudar de arquitetura *e* de função de ativação *e* de regra de treino) que prende a atenção da turma.

## Descoberta importante ao revisar o material (Tópico 2 + Tópico 15 + Tópico 18)

Vale a pena expor essa nuance na apresentação, porque é sutil e o professor provavelmente vai gostar de ver que o grupo percebeu:

| Porta | Linearmente separável? | Com neurônio MCP (pesos fixos ±1, Tópico 2) | Com Perceptron/Adaline (pesos aprendidos) |
|---|---|---|---|
| AND | Sim | 1 neurônio ($\theta=2$) | 1 neurônio (treinável) |
| OR | Sim | 1 neurônio ($\theta=1$) | 1 neurônio (treinável) |
| NOT | Sim | 1 neurônio (entrada inibitória) | 1 neurônio (treinável) |
| NOR | Sim | 1 neurônio (duas entradas inibitórias) | 1 neurônio (treinável) |
| **NAND** | **Sim** | **2 neurônios** (AND depois NOT — o veto do MCP não constrói NAND direto) | **1 neurônio** (treinável — NAND é linearmente separável, só o MCP de pesos fixos precisa da composição) |
| **XOR** | **Não** | Impossível | **Impossível com 1 neurônio** — exige MLP (≥2 neurônios ocultos + 1 de saída) |
| **XNOR** | **Não** | Impossível | Impossível com 1 neurônio — exige MLP |

Isso dá um terceiro "ato" à história, além do clássico "perceptron falha no XOR":

- **Ato 1:** um neurônio (com pesos aprendidos) já resolve *mais portas do que o neurônio MCP original resolvia sozinho* — mostra o ganho de ter pesos ajustáveis (conecta com a diferença MCP → Perceptron do Tópico 2, seção 2.3).
- **Ato 2:** ainda assim, existe um limite estrutural que nenhuma quantidade de ajuste de pesos supera em um único neurônio — XOR/XNOR.
- **Ato 3:** a solução não é "mais treino", é **mais arquitetura**: 2 neurônios ocultos + ativação não linear + gradiente descendente. E dá pra usar a construção exata do Tópico 18 (seção 5): $\text{XOR} = \text{AND}(\text{OR}(x_1,x_2),\ \text{NAND}(x_1,x_2))$ — ou seja, um neurônio oculto aprende OR, o outro aprende NAND, e o neurônio de saída combina os dois com AND. Dá pra visualizar isso como **duas retas** (uma de cada neurônio oculto) cuja interseção forma a região convexa que separa as classes do XOR.

## Questões orientadoras (decidido: Opção A)

1. **Q2 — Por que o Perceptron não resolve todo tipo de problema preditivo?**
   O ponto de virada da história: mesmo com pesos livres, um único neurônio não separa XOR/XNOR.
2. **Q4 — Por que existem diferentes funções de ativação?**
   Justifica tecnicamente a troca degrau → sigmoide ao passar do Perceptron/Adaline (lineares) para a MLP — sem uma ativação diferenciável não dá pra usar gradiente descendente/backprop.
3. **Q5 — Como o Gradiente Descendente encontra uma solução?**
   Cobre a evolução Perceptron (correção de erro discreta) → Adaline (gradiente descendente sobre erro contínuo, Tópico 15) → MLP com backpropagation (gradiente generalizado via regra da cadeia).

"Como um neurônio aprende" (Q1) e "como uma rede aprende funções difíceis" (Q3) continuam aparecendo naturalmente na narrativa, sem serem uma das 3 perguntas oficiais do trabalho.

## Stack técnica (decidido: eu escolho, priorizando ficar bonito e rodar suave)

- **HTML/CSS/JS puro, sem build/backend** — cada porta lógica tem só 4 pontos, então o treino roda instantaneamente; o desafio real não é performance de cálculo, é a qualidade da animação e a sincronia entre as duas colunas.
- **D3.js** (via CDN) para o painel gráfico: escalas, eixos, e principalmente as `transitions` suaves da reta/retas de decisão a cada passo de treino — é a ferramenta certa para "hiperplano se movendo ao vivo" sem reinventar interpolação/easing na mão.
- **KaTeX** (via CDN) para renderizar ao vivo a equação do hiperplano com os pesos atuais plugados (ex.: $0.8x_1 + 1.2x_2 - 1.5 = 0$), deixando a coluna do algoritmo com aparência de "matemática de verdade" em vez de números soltos.
- Lógica de treino (perceptron rule, regra delta, backprop) implementada à mão em JS puro — são poucas linhas cada uma e é justamente isso que o grupo precisa demonstrar domínio (o enunciado pede para "disponibilizar a implementação").
- Hospedagem: repositório no GitHub + GitHub Pages (estático, grátis, e atende diretamente ao item "disponibilização da implementação... indicando repositório no github" das instruções) — link único também serve como a mídia de apoio da apresentação.

## Estrutura da animação (o que ela precisaria mostrar)

**Layout geral: duas colunas lado a lado (conforme pedido)**

- **Coluna esquerda — "algoritmo":** pesos atuais ($w_1, w_2, \dots, b$), a equação do hiperplano montada com os valores atuais (via KaTeX), qual regra está sendo aplicada (perceptron / delta / backprop), o ponto sendo avaliado na iteração atual, e o erro resultante. Se possível, destacar a linha de pseudocódigo correspondente ao passo atual (tipo "modo debugger").
- **Coluna direita — "gráfico":** plano 2D (D3) com os pontos da porta lógica (coloridos por classe) e a(s) reta(s) de decisão sendo redesenhada(s) com transição suave conforme os pesos mudam na coluna da esquerda.

**Modo 1a — Perceptron clássico (cobre AND, OR, NOT, NOR, NAND)**

- Seletor de porta lógica entre as 5 linearmente separáveis.
- Regra de aprendizagem clássica do perceptron: erro discreto pós-ativação $(y-\hat{y})$, ajuste só quando há classificação errada.
- Controles: taxa de aprendizado, inicialização dos pesos (aleatória vs. fixa), play/pause/step, reset.
- Gráfico auxiliar: contagem de pontos mal classificados por época (erro "em degraus", característico do perceptron).

**Modo 1b — Adaline (mesmas 5 portas, para comparar a regra de treino)**

- Mesma arquitetura de neurônio único, mas erro contínuo pré-ativação $(y-z)$ e regra delta (Tópico 15) — gradiente descendente sobre o SSE/MSE.
- Comparar lado a lado (ou em sequência) com o Modo 1a: mesma porta lógica, mesma inicialização, mas trajetória da reta mais suave/gradual no Adaline vs. "correção abrupta só quando erra" no Perceptron.
- Gráfico auxiliar: curva de erro quadrático (SSE) caindo suavemente — contraste direto com o gráfico "em degraus" do Modo 1a. Esse contraste é o gancho natural para a Q5 (gradiente descendente).

**Transição — tentando XOR/XNOR com 1 neurônio só (Perceptron ou Adaline, tanto faz)**

- Momento de clímax: a reta "gira sem parar" e nunca separa os 4 pontos — o erro nunca zera, só oscila, em nenhuma das duas regras. Gancho natural para perguntar à turma "por que será que não converge, em nenhum dos dois casos?" antes de revelar a resposta (não separabilidade linear — o problema é da arquitetura, não da regra de treino).

**Modo 2 — MLP com backpropagation, para XOR/XNOR**

- Arquitetura simples de propósito (treina rápido e dá pra acompanhar visualmente): 2 neurônios ocultos + 1 neurônio de saída, ativação sigmoide em vez de degrau.
- Mostrar as **duas retas** (uma por neurônio oculto) se formando simultaneamente, e como o neurônio de saída combina as duas regiões (interseção convexa, Tópico 18 seção 4) para finalmente separar o XOR.
- Curva de erro por época descendo via backpropagation — fecha a progressão Perceptron → Adaline → MLP como três variações do mesmo princípio (gradiente descendente), reforçando a Q5.
- Destacar explicitamente, na coluna do algoritmo, a troca da função de ativação (degrau → sigmoide) como pré-requisito técnico para isso funcionar — reforça a Q4.

## Backlog (só se sobrar tempo, deixado para o final)

- **Modo 0 — homenagem ao neurônio MCP original:** um modo "manual" onde o usuário ajusta $\theta$ e escolhe conexões excitatórias/inibitórias à mão (como no Tópico 2), reproduzindo a configuração original de McCulloch-Pitts para AND/OR/NOT/NOR, e mostrando que NAND ali exige encadear dois neurônios (AND → NOT). Dá o contraste histórico "pesos fixos, configurados à mão" vs. "pesos aprendidos automaticamente", reforçando por que o Perceptron foi um avanço — mas não é essencial para responder as 3 questões orientadoras escolhidas, por isso fica para o final da lista.

## Trabalhos relacionados (pesquisa de prior art)

Herik encontrou o [TensorFlow Playground](https://playground.tensorflow.org/) (Google, Daniel Smilkov e Shan Carter) durante pesquisa de "já existe algo parecido?". Conferido ao vivo em 2026-09-06:

- É uma ferramenta genérica de exploração de MLPs: datasets **contínuos e ruidosos** (círculo, gaussiana, espiral, e um padrão em xadrez que lembra XOR mas não é booleano), features extras (x1², x2², x1x2, sin), ativação selecionável (ReLU/Tanh/Sigmoid/Linear), learning rate e nº de camadas/neurônios ajustáveis.
- Pesos são mostrados só como espessura/cor das linhas de conexão; **não há equação do hiperplano exibida, não há pseudocódigo do algoritmo, não há distinção Perceptron vs. Adaline**, e não há qualquer ligação com portas lógicas booleanas ou com o neurônio MCP.
- É um sandbox livre, sem narrativa fixa — o usuário mexe nos parâmetros por conta própria, não é guiado por uma história pedagógica.

**Conclusão:** não invalida a ideia, valida que o tema (visualizar fronteira de decisão se ajustando) é reconhecidamente didático e bem estabelecido. A diferenciação do nosso projeto continua clara: narrativa fechada e guiada pela progressão do curso (MCP → Perceptron → Adaline → MLP), as 7 portas lógicas booleanas específicas do Tópico 2, equação do hiperplano e estado do algoritmo visíveis ao vivo (coluna esquerda), e a descoberta específica sobre NAND (1 neurônio com pesos aprendidos vs. 2 neurônios MCP encadeados) — nada disso está no Playground. Vale citar o Playground no documento de texto como referência de trabalho relacionado/inspiração, não como algo a evitar.

**Segunda busca (2026-09-06), termos "perceptron animation logic gates" e "McCulloch-Pitts neuron logic gates visualization"** trouxe um achado bem mais próximo do nosso escopo: o **[Perceptron Educational Lab](https://dp-dei.vlabs.ac.in/exp/perceptron/simulation/interactive/index.html)** (Virtual Labs), conferido ao vivo. Tem 5 telas: "Inside a Perceptron" (soma ponderada + ativação Step/Sigmoid), "Decision Boundary" (reta com sliders de peso/bias sobre AND/OR/XOR), "Training Animation" (play/step/reset, taxa de aprendizado, log — **quase idêntico ao nosso Modo 1a**), "Convergence vs Failure" (OR converge, XOR oscila para sempre, lado a lado — **quase idêntico à nossa "Transição"**) e "Perceptron vs MLP" (comparação lado a lado com MLP resolvendo XOR).

O que essa ferramenta **não** cobre, e que segue sendo o diferencial real do nosso projeto:
- Só 3 portas (AND, OR, XOR) — nada de NOT, NAND, NOR, XNOR, nenhuma ligação com o neurônio MCP nem com a nuance "NAND cabe em 1 neurônio com pesos aprendidos, mas precisa de 2 com pesos fixos" (Tópico 2).
- Ativação é só um toggle Step/Sigmoid, sem explicar **por que** existem funções de ativação diferentes — não responde a Q4 de fato.
- **Não tem Adaline**: pula direto do Perceptron (regra discreta) para MLP com backprop, sem a ponte via gradiente descendente sobre erro contínuo (Tópico 15) — nossa resposta à Q5 fica mais completa.
- Sem narrativa fechada nem ligação com as questões orientadoras — é uma ferramenta de exploração livre, em inglês.

**Ação recomendada:** como essa ferramenta é muito parecida estruturalmente (mesmo layout conceitual: reta se movendo + comparação convergência/falha + perceptron vs. MLP), é importante citá-la explicitamente na apresentação e no documento como trabalho relacionado direto, e deixar claro logo no início qual é o valor agregado específico do nosso projeto (7 portas do curso + ponte Adaline/gradiente descendente + explicação real de por que a ativação muda + conexão com o neurônio MCP), em vez de deixar a plateia notar a semelhança sem contexto.

## Possíveis extensões (se der tempo/fôlego)

- Contexto histórico: McCulloch & Pitts (1943) → Rosenblatt (1958) → Minsky & Papert (1969, prova da limitação do XOR) → "inverno da IA" → retomada com MLP e backpropagation. Bom material para a parte de "aplicação e relevância atual / histórico" pedida no documento de texto.
- Deixar a turma "jogar": alguém escolhe pesos iniciais e tenta prever se/quando o neurônio converge (ou não), antes de rodar a animação.
- Completude funcional (Tópico 2, seção 3.4): comentar que {NAND} sozinho já é funcionalmente completo — curiosidade rápida, não precisa de visualização própria.

## Como isso se encaixa nos produtos exigidos pelo trabalho

- **Documento de texto:** fundamentação teórica (regra de aprendizagem do neurônio único, separabilidade linear, por que XOR/XNOR exigem MLP, por que a ativação precisa mudar para treinar com gradiente) + histórico do desenvolvimento do site.
- **Slides/mídia:** o próprio website interativo pode servir como a mídia de apoio da apresentação (dispensando slides tradicionais, com declaração explicando a escolha, conforme permitido nas instruções).
- **Apresentação oral (15+ min):** demonstração ao vivo, com a turma interagindo (escolhendo porta lógica, pesos iniciais, tentando prever o resultado, incluindo o momento de virada para MLP).

## Perguntas em aberto / decisões pendentes

- **Tamanho do grupo e divisão de tarefas** (implementação da animação, fundamentação teórica, roteiro da apresentação) — única decisão que ainda depende de vocês para fechar o planejamento.

## Riscos

- Escopo é grande (7 portas, 3 modos de treino — Perceptron/Adaline/MLP —, layout de duas colunas sincronizadas) para os 15+ minutos de apresentação — o "core" obrigatório é: neurônio único (Modo 1a+1b) nas 5 portas separáveis + XOR/XNOR com MLP (Modo 2); o Modo 0 (MCP manual) é bônus de backlog.
- Implementar backpropagation "do zero" e de forma visualizável é a parte tecnicamente mais pesada do projeto — vale prototipar essa parte cedo para não descobrir problemas de última hora.
- Interatividade ao vivo com a turma depende de sala com boa conexão/telão — vale ter um plano B gravado (GIF/vídeo) caso algo falhe no dia.
