# Diário de bordo — Trabalho Final de Redes Neurais

Registro cronológico do desenvolvimento do projeto, para alimentar a seção de "histórico sobre como foi a experiência de desenvolvimento" exigida no documento de texto final.

## 2026-09-04

- Transcrição das instruções oficiais do trabalho (`Instrucoes para o trabalho_parte1.png` e `_parte2.png`) para `instrucoes_para_trabalho_final.md`, mantendo a formatação original e corrigindo apenas erros ortográficos/gramaticais pontuais (ex.: "didárica" → "didática", "expectador" → "espectador", capitalização de nomes próprios como ChatGPT/GitHub/Google Classroom).
- Leitura das 28 questões orientadoras (`Questoes_orientadores_parte1.png` e `_parte2.png`) para escolher o tema e as 3 perguntas a "casar" com ele, conforme pedido pelo professor.
- Ideia inicial proposta: animação em website mostrando um perceptron ajustando hiperplanos para resolver portas lógicas.
- Criado `01_brainstorming.md` com a exploração dessa ideia e o mapeamento com as questões orientadoras.
- Escopo ampliado a partir da revisão do material do curso (`Topicos/02_neuronio_mcp_portas_logicas.md`, `15_adaline.md`, `18_papel_camadas.md`): decidido cobrir as 7 portas lógicas (básicas: AND, OR, NOT; derivadas: NAND, NOR, XOR, XNOR), com visualização lado a lado do algoritmo e do gráfico, e progressão de complexidade em 3 modos de treino: Perceptron clássico → Adaline (regra delta) → MLP com backpropagation (para XOR/XNOR).
- Descoberta de uma nuance útil para a apresentação: com pesos fixos (neurônio MCP original) o NAND precisa de 2 neurônios encadeados (AND→NOT), mas com pesos aprendidos (Perceptron) o NAND é linearmente separável e cabe em 1 neurônio só — só XOR/XNOR realmente exigem MLP.
- Decisões fechadas no brainstorming:
  - **Questões orientadoras**: Q2 (por que o Perceptron não resolve todo problema preditivo), Q4 (por que existem diferentes funções de ativação) e Q5 (como o Gradiente Descendente encontra uma solução).
  - **Stack técnica**: HTML/CSS/JS puro (sem build/backend), D3.js para o painel gráfico (transições suaves do hiperplano), KaTeX para renderizar a equação do hiperplano ao vivo, lógica de treino implementada à mão em JS, hospedagem via GitHub Pages.
  - **Regra de aprendizagem**: progressão Perceptron clássico → Adaline → MLP/backpropagation (em vez de escolher só uma), usando redes simples o suficiente para treinar rápido e serem acompanhadas ao vivo.
  - **Modo 0** (homenagem ao neurônio MCP manual) movido para backlog — só se sobrar tempo.
- Pendência em aberto: definir tamanho do grupo e divisão de tarefas.

## 2026-09-06

- Herik Daurízio Ricardo (colega de grupo) encontrou, em pesquisa de prior art, o [TensorFlow Playground](https://playground.tensorflow.org/) — ferramenta consagrada do Google para visualizar MLPs treinando.
- Conferimos o site ao vivo: é um sandbox genérico (datasets contínuos/ruidosos, sem portas lógicas booleanas, sem equação do hiperplano visível, sem distinção Perceptron/Adaline, sem narrativa guiada).
- Conclusão registrada em `01_brainstorming.md` (seção "Trabalhos relacionados"): não invalida a ideia, reforça que o tema é bem estabelecido; nosso diferencial (narrativa fechada nas 7 portas do curso, progressão MCP→Perceptron→Adaline→MLP, coluna do algoritmo com equação/pseudocódigo ao vivo) continua de pé. Playground será citado no documento final como referência/inspiração.
- Segunda busca de prior art encontrou um achado bem mais próximo: **[Perceptron Educational Lab](https://dp-dei.vlabs.ac.in/exp/perceptron/simulation/interactive/index.html)** (Virtual Labs). Suas 5 telas ("Inside a Perceptron", "Decision Boundary", "Training Animation", "Convergence vs Failure", "Perceptron vs MLP") se sobrepõem bastante ao Modo 1a e à "Transição" que planejamos.
- Diferenciais que continuam de pé mesmo assim: essa ferramenta só cobre 3 portas (AND/OR/XOR, sem NOT/NAND/NOR/XNOR nem neurônio MCP), ativação é só um toggle Step/Sigmoid sem explicar o porquê (não responde à Q4), e **não tem Adaline** — pula direto de Perceptron para MLP/backprop, sem a ponte via gradiente descendente sobre erro contínuo (Tópico 15) que dá corpo à nossa Q5.
- Decisão: seguir com o projeto, mas citar essa ferramenta explicitamente como trabalho relacionado direto na apresentação/documento, destacando de cara os quatro diferenciais acima em vez de deixar a semelhança estrutural sem contexto.
- Renomeados `brainstorming.md` → `01_brainstorming.md`, `diario.md` → `02_diario.md`, `referencias.md` → `03_referencias.md`; adotada convenção de prefixo numérico (`NN_nome.md`) para os próximos arquivos do grupo.
- Definido o nome do projeto: **NeuroLógica**.
- Decidida a estratégia de desenvolvimento em 2 fases, antes de começar o site: **Fase 1** — prototipar cada modo de treino (Perceptron, Adaline, XOR falhando, MLP+backprop) em scripts Python separados com animação via `matplotlib`, do mais simples ao mais difícil, validando a matemática isoladamente; **Fase 2** — só depois portar a lógica já validada para o site (JS+D3+KaTeX). Criado `04_planejamento.md` com os 4 marcos da Fase 1, a estrutura de pastas de ambas as fases, e uma proposta de divisão de tarefas para discutir com o Herik.
- Definida e montada a estrutura do repositório: `docs/` (o site, aproveitando o suporte nativo do GitHub Pages a `/docs`, sem precisar de GitHub Actions), `prototipos/` (Fase 1), `planejamento/` (notas de processo, incluindo os arquivos numerados e `instrucoes_para_trabalho_final.md`), `planejamento/material-fonte/` (prints originais do professor, fora do git) e `entrega/` (documento final a submeter). Criados `README.md`, `requirements.txt` (numpy, matplotlib) e `.gitignore` na raiz. Decisão documentada em `04_planejamento.md`, seção "Estrutura do repositório".
- Pasta local movida para essa estrutura; repositório git ainda não inicializado — próximo passo é o próprio usuário rodar os comandos de `git init`/primeiro commit, com orientação passo a passo.
