# Planejamento — do protótipo em Python ao site (projeto NeuroLógica)

Planejamento de execução do projeto descrito em `01_brainstorming.md`, cobrindo as duas fases de desenvolvimento e a divisão de trabalho entre o grupo.

## Metodologia: 2 fases

**Fase 1 — Protótipos em Python (validar a matemática).** Cada modo de treino vira um script Python independente, rodando localmente com `matplotlib`, mostrando a animação do hiperplano se ajustando. Objetivo: garantir que o algoritmo (Perceptron, Adaline, backprop) está correto e o resultado visual é o esperado, antes de lidar com JS/D3/KaTeX/layout. Progressão do mais simples para o mais difícil, testando e aprimorando a cada passo, só avançando quando o anterior estiver validado.

**Fase 2 — Website (produto final).** Só começa depois que os 4 marcos da Fase 1 estiverem funcionando e validados. Nessa fase, a lógica de treino já testada em Python é reimplementada em JS (tradução, não redesenho), e o esforço se concentra na qualidade da animação (D3), na equação ao vivo (KaTeX) e no layout de duas colunas.

## Estrutura do repositório (decidido em 2026-09-06)

Repositório único, organizado assim:

```
NeuroLogica/
├── README.md
├── requirements.txt
├── .gitignore
├── docs/                   # o SITE (Fase 2) — publicado via GitHub Pages
├── prototipos/             # scripts Python da Fase 1
├── planejamento/           # notas de processo (este arquivo e os demais numerados)
│   └── material-fonte/     # prints originais do professor (fora do git — ver abaixo)
└── entrega/                # documento de texto final a enviar no Classroom
```

**Por que `docs/` é o site, e não a documentação**: o GitHub Pages sabe publicar nativamente a partir da pasta `/docs` de um repositório (bastando escolher isso em Settings → Pages, sem precisar de workflow do GitHub Actions). Decidimos priorizar essa solução simples em vez de manter `docs/` com o significado "intuitivo" de documentação — trade-off consciente: menos peças técnicas para manter (sem CI/CD), ao custo do nome da pasta ser um pouco contraintuitivo para quem abrir o repositório pela primeira vez (mitigado pelo README explicando a estrutura).

**Prints do professor (`Instrucoes para o trabalho_parte1/2.png`, `Questoes_orientadores_parte1/2.png`)**: movidos para `planejamento/material-fonte/` e adicionados ao `.gitignore` — não vão para o repositório público, já que o conteúdo já está transcrito em `planejamento/instrucoes_para_trabalho_final.md`. Ficam só localmente, como material de apoio.

**`entrega/`** existe separado de `planejamento/` para deixar claro o que é rascunho/processo (pode ficar bagunçado, é registro histórico) vs. o que é o artefato final a ser submetido.

Essa separação ataca diretamente o maior risco identificado no brainstorming: "implementar backpropagation do zero e de forma visualizável é a parte tecnicamente mais pesada do projeto" — validando isso cedo, em Python, sem a complexidade extra de animação web.

## Fase 1 — Protótipos em Python

Pasta sugerida: `prototipos/`, com um script por marco (mesma numeração dos modos do brainstorming) e um módulo compartilhado para não duplicar código de plotagem entre eles:

```
prototipos/
  utils_plot.py                 # funções compartilhadas: desenhar pontos da porta lógica,
                                 # desenhar reta de decisão, atualizar gráfico de erro por época
  01_perceptron_gates.py        # Marco 1
  02_adaline_gates.py           # Marco 2
  03_perceptron_xor_falha.py    # Marco 3
  04_mlp_backprop_xor.py        # Marco 4
```

### Marco 1 — Perceptron clássico (Modo 1a)
- Regra de aprendizagem: correção de erro discreta pós-ativação $(y-\hat{y})$.
- Rodar nas 5 portas linearmente separáveis: AND, OR, NOT, NOR, NAND (seletor por parâmetro/CLI, ex.: `python 01_perceptron_gates.py --porta AND`).
- Animação (`matplotlib.animation.FuncAnimation`): pontos coloridos por classe + reta de decisão se movendo a cada época + contador de época + nº de pontos mal classificados.
- **Critério de pronto**: as 5 portas convergem visivelmente e o código está limpo o suficiente para servir de referência direta na hora de escrever a versão em JS.

### Marco 2 — Adaline (Modo 1b)
- Mesma arquitetura de neurônio único, mesmas 5 portas, mas erro contínuo pré-ativação $(y-z)$ e regra delta (gradiente descendente sobre SSE/MSE).
- Reaproveitar `utils_plot.py` do Marco 1, adicionando o gráfico de erro quadrático (SSE) por época.
- **Critério de pronto**: dá pra rodar Perceptron e Adaline lado a lado (mesma porta, mesma inicialização) e ver a diferença de trajetória — reta "aos saltos" vs. reta suave — que é o gancho visual da Q5.

### Marco 3 — Tentando XOR/XNOR com 1 neurônio só (Transição)
- Rodar o mesmo código dos Marcos 1 e 2 nas portas XOR/XNOR, sem nenhuma mudança de arquitetura.
- **Critério de pronto**: fica visualmente claro que a reta nunca se estabiliza (oscila) e o erro nunca zera — confirma experimentalmente a não separabilidade linear antes de partir pra MLP.

### Marco 4 — MLP com backpropagation (Modo 2)
- Arquitetura mínima: 2 neurônios ocultos (ativação sigmoide) + 1 neurônio de saída.
- Backprop implementado à mão (regra da cadeia), sem frameworks (nem PyTorch/TensorFlow) — é o que o trabalho pede para "disponibilizar a implementação" com domínio real do algoritmo.
- Animação: as duas retas dos neurônios ocultos se formando + região combinada (interseção convexa) separando as classes do XOR + curva de erro por época.
- **Critério de pronto**: XOR e XNOR convergem de forma confiável e rápida (poucas épocas) com a arquitetura mínima escolhida — se não convergir de forma consistente, ajustar inicialização/learning rate antes de seguir pra Fase 2 (não adicionar mais neurônios só pra "forçar" convergência sem entender por quê).

## Fase 2 — Website

Só inicia com os 4 marcos da Fase 1 prontos. Estrutura (conforme stack decidida no brainstorming: HTML/CSS/JS puro + D3 + KaTeX, sem build):

```
docs/                      # nome definido pela estrutura do repositório (ver README.md) —
  index.html                # é o site, não "documentação"; GitHub Pages publica nativamente a partir de /docs
  css/estilo.css
  js/
    treino_perceptron.js   # port do Marco 1
    treino_adaline.js      # port do Marco 2
    treino_mlp.js          # port do Marco 4
    grafico.js             # painel D3 (coluna direita)
    algoritmo.js           # painel KaTeX + estado/pseudocódigo (coluna esquerda)
    principal.js           # liga os modos, seletor de porta lógica, controles
```

Nessa fase o trabalho principal é de UI/animação (D3 transitions, KaTeX, sincronia entre as duas colunas), não de algoritmo — a lógica de treino já vem pronta e validada da Fase 1.

## Divisão de tarefas (proposta para discussão com o Herik)

Ainda em aberto (pendência já registrada em `01_brainstorming.md`), mas uma divisão natural dado o formato em marcos:

- Uma pessoa foca nos marcos de neurônio único (1, 2 e 3 — Perceptron, Adaline, falha do XOR), a outra já adianta pesquisa/rascunho do Marco 4 (MLP/backprop, que é o mais pesado) — convergindo os dois na Fase 2 (site) juntos.
- Alternativa: dividir por fase inteira (uma pessoa toca a Fase 1 até o fim, a outra já prepara a estrutura HTML/CSS/D3/KaTeX vazia da Fase 2 em paralelo, para não haver tempo ocioso esperando a Fase 1 terminar).
- Em ambos os casos, a fundamentação teórica do documento de texto pode ser escrita em paralelo, à medida que cada marco vai sendo validado (aproveitando o que já está registrado em `01_brainstorming.md` e nos Tópicos do curso).

## Sequência de marcos (visão geral)

1. Marco 1 — Perceptron clássico (5 portas)
2. Marco 2 — Adaline (5 portas, comparação)
3. Marco 3 — Falha do XOR/XNOR com 1 neurônio
4. Marco 4 — MLP + backprop resolvendo XOR/XNOR
5. Fase 2 — Website (D3 + KaTeX + layout final)
6. Documento de texto + roteiro da apresentação (em paralelo, desde o Marco 1)

Ver também `01_brainstorming.md` (decisões de escopo e stack), `02_diario.md` (log cronológico) e `03_referencias.md` (diferenciais frente a ferramentas semelhantes já existentes).
