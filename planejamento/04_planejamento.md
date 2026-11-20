# Planejamento — do protótipo em Python ao site (projeto NeuroLógica)

Planejamento de execução do projeto descrito em `01_brainstorming.md`, cobrindo as duas fases de desenvolvimento, a divisão de trabalho e o cronograma do grupo. É o **planejamento único** do projeto.

> **Atualização (2026-10-09).** Entre 27 e 29/09, o Herik construiu uma demo completa (repositório `HerikDR/Neurologica-2`, commit `87f0795`, acessível pelo remote git `demo`) para provar que a ideia era viável. Este documento incorpora o que ela ensinou. A demo é **referência e gabarito**, não fonte de cópia: cada marco é refeito aqui, em sua própria branch, revisado por PR, com os números dela como meta a conferir. As etapas originais continuam as mesmas (Fase 1 em 4 marcos, depois o site); mudaram o grupo (agora com **três integrantes**), a hospedagem (**Vercel**), a divisão da Fase 2 em branches menores, os critérios de pronto e o cronograma. A demo é referência, não requisito: adaptamos onde o projeto pedir. Trechos alterados trazem a data; o resto é o texto original. Referências à demo aparecem como "(Decisão N da demo)" ou "(Aprendizado N da demo)" e remetem ao `06_detalhes_implementacao.md` e ao `05_aprendizados_obtidos.md` do repositório da demo.

## Equipe (2026-10-09)

| Integrante | Papel |
|---|---|
| Adriano Lúcio Uchôa Brandão | Back-end e verificações do código; apresentação; revisa PRs quando puder |
| Heitor Oliveira Nunes | Front-end e suporte |
| Herik Daurizio Ricardo | Back-end e verificações do código; integração com o front-end; apresentação |

**(2026-11-10)** O front-end deixou de ficar com o Heitor e passou ao **Herik**. Onde este documento atribui ao Heitor uma branch ou peça de interface (tabela de branches da Fase 2, "Quem faz" das pistas e conquistas), leia-se Herik. O front-end reaproveita o da demo (mesmos SVGs, `DESIGN.md`, escalas e módulos), adaptado à API nova dos treinos (Decisão 11 do `06`) e à narrativa por perguntas.

**Estado do front-end (2026-11-10):** esqueleto pronto (`fase2-base`: `docs/` com `vendor/` e licenças, `css/`, `assets/`, `DESIGN.md` na raiz, `vercel.json`, `.vercelignore`) e Atos 1 e 2 funcionando (`fase2-laboratorio`). Conferido em Chrome headless: sem erros de console, sem rolagem horizontal de 320 a 1440 px nos dois temas, e os gabaritos aparecem na própria interface (Ato 1: AND na época 7 e XOR parando na 40; Ato 2: Adaline no AND com η = 0,7 estabiliza na época 12 com 1 erro, com 0,3 resolve, com 1,2 diverge; XOR estaciona com 3 erros). Os laboratórios já emitem os eventos `laboratorio:terminou` e `laboratorio:abandonou`, que as pistas e as conquistas vão consumir.

**Atualização (2026-11-10, fim do dia): front-end completo, exceto o deploy.** Ato 3 (`fase2-rede-mlp`: "1 neurônio × rede 2-2-1", rede fixa, gavetas das cinco ativações, época 1358), desafios, pistas e conquistas (Decisões 9 e 12; camada 6 da conferência), laboratório livre (`fase2-laboratorio-livre`: rede editável, semente, reinício, máximo de épocas; 1358 na configuração de referência) e a ilustração da superfície de erro do Ato 2 (`fase2-estetica`). Abertura, menu, indicador de seção, atalhos, termos com (?) e dica de primeira visita vieram da demo (`fase2-acabamento`). Pendências: **deploy no Vercel** (seção "Vercel"), **testes em celular de verdade** (a conferência foi em Chrome headless emulando 320 e 390 px), confirmar as **datas da linha do tempo** nos Tópicos do curso. **(Feito depois, 2026-11-10)** os **datasets de classificação** do laboratório livre (Decisão 13 do `06`), junto com a matemática determinística entre navegadores (Aprendizado 15).

**Prazos**: a apresentação do grupo será em **25/11/2026** (a outra data da turma é 26/11). A data de entrega do documento ainda não foi definida pelo professor; o grupo trabalha para concluir **antes** da apresentação. **O código congela em 14/11**: depois dessa data só entram correções de bugs, e o tempo restante vai para o documento de texto, o ensaio e testes em celular.

## Metodologia: 2 fases

**Fase 1 — Protótipos em Python (validar a matemática).** Cada modo de treino vira um script Python independente, rodando localmente com `matplotlib`, mostrando a animação do hiperplano se ajustando. Objetivo: garantir que o algoritmo (Perceptron, Adaline, backprop) está correto e o resultado visual é o esperado, antes de lidar com JS/D3/KaTeX/layout. Progressão do mais simples para o mais difícil, testando e aprimorando a cada passo, só avançando quando o anterior estiver validado. Os resultados são **verificados manualmente** (como já foi feito no Marco 1) antes de cada marco ser dado como pronto.

**Fase 2 — Website (produto final).** A **lógica de treino** só é portada para JS depois que os 4 marcos da Fase 1 estiverem validados: ela é reimplementada em JS (tradução, não redesenho) pelo Herik, que confere se os resultados batem com o Python. O restante da Fase 2 (esqueleto do site, bibliotecas, Vercel e interface) **pode andar em paralelo** à Fase 1, a cargo do Heitor — é a alternativa de "dividir por fase" prevista na seção "Divisão de tarefas". O esforço se concentra na qualidade da animação (D3), na equação ao vivo (KaTeX) e no layout de duas colunas.

**Stack (2026-10-09)**: **JavaScript puro** (módulos ES), sem build e sem TypeScript. TypeScript exigiria um passo de compilação, o que contradiz o site estático servido direto pelo Vercel (sem `buildCommand`). Verificação de tipos leve é opcional, via `// @ts-check` e JSDoc nos módulos de lógica.

## Estrutura do repositório (decidido em 2026-09-06; atualizado em 2026-10-09)

Repositório único, organizado assim:

```
NeuroLogica/
├── README.md
├── requirements.txt
├── .gitignore
├── .vercelignore           # (2026-10-09) o que o Vercel não precisa receber
├── vercel.json             # (2026-10-09) aponta docs/ como saída, sem build
├── docs/                   # o SITE (Fase 2) — publicado no Vercel
├── prototipos/             # scripts Python da Fase 1
├── testes/                 # (2026-10-09) conferência da lógica em JS contra o Python (Node)
├── planejamento/           # notas de processo (este arquivo e os demais numerados)
│   └── material-fonte/     # prints originais do professor (fora do git — ver abaixo)
└── entrega/                # documento de texto final a enviar no Classroom
```

**Por que `docs/` é o site, e não a documentação**: o plano original era o GitHub Pages, que publica nativamente a partir da pasta `/docs` de um repositório (bastando escolher isso em Settings → Pages, sem precisar de workflow do GitHub Actions). Decidimos priorizar essa solução simples em vez de manter `docs/` com o significado "intuitivo" de documentação — trade-off consciente: menos peças técnicas para manter (sem CI/CD), ao custo do nome da pasta ser um pouco contraintuitivo para quem abrir o repositório pela primeira vez (mitigado pelo README explicando a estrutura). **(2026-10-09)** A hospedagem passou a ser o **Vercel** (Decisão 3 da demo), que também publica a partir de `docs/` (Output Directory `docs`, sem build), então a pasta não muda de nome. Ele gera uma URL de preview por Pull Request, o que combina com o fluxo de branches do `README.md`.

**Prints do professor (`Instrucoes para o trabalho_parte1/2.png`, `Questoes_orientadores_parte1/2.png`)**: movidos para `planejamento/material-fonte/` e adicionados ao `.gitignore` — não vão para o repositório público, já que o conteúdo já está transcrito em `planejamento/instrucoes_para_trabalho_final.md`. Ficam só localmente, como material de apoio.

**`entrega/`** existe separado de `planejamento/` para deixar claro o que é rascunho/processo (pode ficar bagunçado, é registro histórico) vs. o que é o artefato final a ser submetido.

**Visibilidade (2026-10-09)**: o repositório é privado hoje e **vira público antes da entrega**. Antes do primeiro commit de `docs/vendor/`, conferir as licenças de D3, KaTeX, GSAP e das fontes.

**Ajustes de infraestrutura (2026-10-09)**, cada um na branch indicada:

| Arquivo | Mudança | Branch |
|---|---|---|
| `.gitignore` | `.venv/`, `venv/` | `marco3-xor-falha` (primeira branch de código depois do Marco 2) |
| `.gitignore` | `node_modules/` (só serve para baixar as bibliotecas) e `.vercel` (liga a pasta ao projeto da hospedagem) | `fase2-base` |
| `.vercelignore` | criar: `node_modules/`, `docs/package*.json`, `prototipos/`, `testes/`, `.venv/`, `venv/`, `__pycache__/`, `*.pyc`, `requirements.txt`, `planejamento/`, `entrega/` | `fase2-base` |
| `vercel.json` | criar: `outputDirectory: "docs"`, framework, `buildCommand` e `installCommand` nulos, e `Cache-Control: public, max-age=31536000, immutable` para `/vendor/(.*)` | `fase2-base` |
| `requirements.txt` | sem mudança (numpy e matplotlib bastam) | — |
| `README.md` | nota sobre Python 3.11 e ambiente virtual (`.venv` criado localmente por cada um, fora do git); os comandos do Marco 2 já foram acrescentados pelo Adriano | `marco3-xor-falha` |
| `README.md` | comando do Marco 3 | `marco3-xor-falha` |
| `README.md` | comando do Marco 4 e opções (`--taxa`, `--epocas`, `--quiet`, `--ocultos`, `--ativacao`, `--testar-sementes`) | `marco4-mlp` |
| `README.md` | site: GitHub Pages → Vercel; "D3 + KaTeX via CDN" → bibliotecas em `docs/vendor/`; seção de como rodar o site local; Heitor em "Autores" | `fase2-base` |
| `README.md` | link do site publicado | primeiro deploy oficial |

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

A demo já tem uma versão de cada script e serve de **gabarito** (números a esperar, armadilhas já encontradas), lida com `git show demo/main:<caminho>`. Os números abaixo foram medidos nela e são **conferidos de novo aqui**: se diferirem, vale o medido no oficial, com uma frase no `05_aprendizados_obtidos.md` dizendo o que a demo tinha.

### Convenções de código dos protótipos (observadas nos Marcos 1 e 2, 2026-10-12)

Os scripts de cada marco seguem as mesmas práticas, para que o leitor (e o port para JS) reconheça a mesma estrutura em todos. **Os Marcos 3 e 4 mantêm estas convenções**; quando uma delas não se aplicar (ver "Pontos de atenção"), a exceção é registrada no docstring e numa decisão do `06_detalhes_implementacao.md`.

**Estrutura do arquivo**
- Nome `NN_descricao.py` (`01_perceptron_gates.py`, `02_adaline_gates.py`), em português, `snake_case`. Docstring de módulo no formato: "Marco N do projeto NeuroLógica: <nome> (Modo ...)", a regra de aprendizagem com a fórmula e o Tópico do curso, as portas em que roda e um bloco `Uso:` com exemplos de linha de comando.
- Imports em três grupos: biblioteca padrão (`argparse`, `sys`, `importlib`), terceiros (`matplotlib.animation`, `matplotlib.pyplot`, `numpy as np`) e `from utils_plot import (...)`, com os nomes em ordem alfabética, um por linha.
- Constantes em `MAIÚSCULAS` logo depois dos imports, com um comentário dizendo **por que** o valor existe: `PORTAS_VALIDAS` (lista de nomes de porta aceitos pelo marco), `TOLERANCIA_ZERO = 1e-9`, `TOLERANCIA_SSE_POR_TAXA = 1e-3` (a tolerância de parada do Adaline é proporcional ao η).
- Ordem das funções: funções de ativação ou classificação (`degrau`), gerador de treino (`treinar_<modelo>`), formatador de log do marco (se não for o de `utils_plot`), `animar_2d`, `animar_1d`, resumo, `main()` e `if __name__ == "__main__": main()`.
- Reaproveitar código de outro marco por `importlib.import_module("01_perceptron_gates")` (um módulo cujo nome começa com dígito não se importa com `import`), usando `perceptron.degrau` e `perceptron.treinar_perceptron`, sem duplicar. O Marco 3 usa exatamente os treinos dos Marcos 1 e 2 desse modo.
- Funções que só servem a um marco ficam no próprio script (como `formatar_linhas_log_adaline`); só sobem para `utils_plot.py` o que mais de um script usa ou o que o plano já pede lá (`draw_network_diagram`, no Marco 4).

**Nomes (português, sem abreviações novas)**
- Dados: `X` (entradas, matriz), `y` (classes **0/1**, vêm de `get_gate`), `x` (um exemplo), `y_real`, `y_previsto`, `z` (soma ponderada, antes da ativação), `erro`, `pesos` (vetor), `bias`, `n_entradas`, `n_exemplos`.
- Hiperparâmetros: `taxa_aprendizado` (nos parâmetros da função), `max_epocas`, `semente`, `pesos_iniciais`, `bias_inicial`, `tolerancia_sse`. Na linha de comando, `--taxa`, `--epocas`, `--semente`, `--pesos-iniciais`, `--bias-inicial`. O símbolo $\eta$ só aparece em texto (logs, títulos e comentários), nunca como nome de variável.
- Contadores: `epoca` começa em **1**; `indice` (posição do exemplo dentro da época) começa em **0**. Aleatoriedade: `rng = np.random.default_rng(semente)`.
- Custo: `sse` e `sse_anterior`. O `sse` do Adaline é $E = \tfrac12 \sum (\text{alvo}-z)^2$ (o $E(w,b)$ do Tópico 15), calculado **no fim da época com os pesos finais**, e é isso que o log e o gráfico chamam de "SSE".

**Representação dos valores (0/1, −1/+1 e limiares)**
- **As classes são sempre 0/1** em `y`, nas tabelas-verdade, nos gráficos (azul = 0, vermelho = 1) e nas mensagens. Nenhum script altera o `y` de `get_gate`.
- **Alvos bipolares (−1/+1) só existem dentro do treino do Adaline**: `alvos = 2 * y - 1` (classe 0 → −1, classe 1 → +1), com `alvo` no singular, impresso com `:+d`. É uma tradução interna; o `passo` entregue à animação continua trazendo `y_real` em 0/1 e `alvo` à parte.
- **Decisão de classe**: `degrau(z)` do Marco 1 (`1 se z >= 0`, com `TOLERANCIA_ZERO`), reaproveitado sem cópia pelo Marco 2. Todo teste "z está sobre a fronteira?" usa essa tolerância (Aprendizado 4).
- Com alvos bipolares a fronteira do Adaline é $z = 0$, a mesma do Perceptron; é isso que torna a comparação lado a lado justa. (Com alvos 0/1 a conta é equivalente, com $z_{bip} = 2z - 1$ e limiar 0,5, mas os valores de $w$, $b$ e do custo mudam de escala; **os números da demo não são gabarito direto**.)

**Gerador de treino**
- Assinatura: `treinar_<modelo>(X, y, taxa_aprendizado=..., max_epocas=..., semente=42, verbose=True, pesos_iniciais=None, bias_inicial=0.0, ...)`. É um **gerador**: um `yield` por exemplo processado, com um dicionário `passo`. A animação e o resumo consomem a lista inteira (`list(treinar_...)`).
- Chaves do `passo` comuns: `epoca`, `indice`, `x`, `y_real`, `y_previsto`, `z`, `pesos` (**cópia**, já depois do ajuste), `bias`, `houve_atualizacao`. **`erros_na_epoca` existe nos dois treinos, só no último exemplo de cada época, e significa a mesma coisa: quantos pontos ficam mal classificados com os pesos finais da época**, calculado pela mesma função `contar_erros` (em `01_perceptron_gates.py`). O Perceptron acrescenta `correcoes_na_epoca` (correções feitas até ali na época; é o critério de parada: época sem correção). O Adaline acrescenta `alvo` e `erro`, e, no último exemplo da época, `sse`.
- Inicialização: `rng.uniform(-0.5, 0.5, size=n_entradas)`, bias em `bias_inicial` (0.0). A mesma `semente` gera os mesmos pesos iniciais em todos os marcos, e é isso que permite comparar modelos. `pesos_iniciais` de tamanho errado levanta `ValueError` com a mesma mensagem ("--pesos-iniciais precisa ter exatamente N valor(es) ..."), e `main()` imprime "Erro: ..." e sai com `sys.exit(1)`.
- Parada: o Perceptron para na primeira época sem erros; o Adaline, quando $|\Delta \text{SSE}| < 10^{-3}\eta$ entre duas épocas (proporcional ao η; vale $10^{-4}$ com $\eta = 0{,}1$), no limite de épocas ou ao divergir (`not np.isfinite(sse) or sse > 1e6`). O gerador **retorna** (`return`) ao parar, e o resumo distingue convergiu, não estabilizou e divergiu.
- Padrões: `--taxa 0.1`, `--semente 42`; épocas 20 (Marco 1) e 100 (Marco 2); `--intervalo` 400 e 120 ms.

**Log do console (`verbose`)**
- Cabeçalho entre linhas de 72 `=`: "MARCO N — NOME", hiperparâmetros, origem dos pesos iniciais, a regra de atualização escrita com a fórmula e, no Adaline, os alvos e o custo monitorado.
- Uma linha por iteração, com os números substituídos: `[iteração i] x=... | z = (w1)*x1 + ... + (b) = ... | erro = ... | ŷ = ...`, seguida das linhas `-> w1: antigo + η * (erro) * x = novo` e `-> b : ...`. Linha de `--- Época k ---` e de `>> Fim da época k: ...`. Mensagens finais entre `***` (CONVERGIU, ESTABILIZOU, DIVERGIU, ou o aviso de limite de épocas).
- Formatação: pesos com `.3f` (iterações) e `np.round(pesos, 4)` (resumos); erro com `{erro:+.3f}`; alvo com `{alvo:+d}`.
- `--quiet` desliga o log; com `--comparar` o log detalhado também se desliga (dois logs intercalados ficariam ilegíveis), e o resumo de uma linha é impresso: "Porta X (Modelo): N passos ao longo de K época(s) | SSE final = ... | M mal classificado(s) no fim".

**Animação**
- `animar_2d(nome_porta, X, y, passos, intervalo)`, `animar_1d(...)` (NOT) e, para comparações, `animar_comparacao(...)`. Figura em grade: diagrama do neurônio, plano de decisão e gráfico de erro na linha de cima; painel de log (`setup_log_panel`) embaixo. `FuncAnimation(..., blit=False, repeat=False)`, depois `plt.tight_layout()`, `plt.show()` e `return anim`.
- Cores fixas: classe 0 azul, classe 1 vermelho, reta de decisão verde, vetor normal roxo (`purple`), erro por época laranja, SSE verde. Elementos novos (por exemplo as duas retas dos neurônios ocultos) pegam cores distintas dessas.
- Títulos e rótulos em português, com os símbolos $\eta$, Σ, ŷ, ½.

**Linha de comando (`argparse`)**
- Opções comuns, nesta ordem: `--porta` (com `choices=PORTAS_VALIDAS`), `--taxa`, `--epocas`, `--intervalo`, `--semente`, `--pesos-iniciais` (`nargs="+"`), `--bias-inicial`, opções do marco (`--comparar`), `--quiet`. Textos de ajuda em português, "(eta)" para a taxa. Validações no `main()`, com mensagem e `sys.exit(1)`.

**Documentação e commit de cada marco**
- Um Aprendizado novo no `05_aprendizados_obtidos.md` para cada achado, uma Decisão nova no `06_detalhes_implementacao.md` (demanda → opções → escolha → motivo) para cada escolha não trivial (no Marco 2, a Decisão 3 trata dos alvos bipolares e a 4, da versão online e da parada), uma entrada no `02_diario.md` com o nome de quem fez e a linha de comando no `README.md`.
- Mensagem de commit em português, no imperativo, com o marco no título e a lista do que entrou no corpo: "Implementa Marco 2: Adaline (regra delta) nas 5 portas linearmente separaveis".
- Verificação padrão antes de dar o marco por pronto: conferência à mão em aritmética exata (AND com `--pesos-iniciais 0 0 --bias-inicial 0`), as portas do marco com `--quiet`, e pelo menos um quadro da animação renderizado.

**Pontos de atenção para os Marcos 3 e 4**
1. **`erros_na_epoca` é homogêneo nos dois treinos (resolvido em 2026-10-12, Decisão 5 do `06`).** Antes, o do Perceptron era acumulado durante a época (com os pesos ainda mudando) e o do Adaline valia com os pesos finais; agora os dois entregam o veredito com os pesos finais, pela mesma `contar_erros`, e o Perceptron guarda as correções à parte (`correcoes_na_epoca`), que continuam sendo o critério de parada. O comportamento do Perceptron não mudou (trajetórias idênticas). O Marco 3 usa a chave direto, sem recalcular. **A MLP (Marco 4) não usa `contar_erros`** (a classificação dela é outra), mas deve entregar `erros_na_epoca` com o mesmo significado: último exemplo da época, pesos finais, classe decidida por `degrau(z_saída)`.
2. **O Marco 3 não precisa mexer no `02_adaline_gates.py`**: ele chama `treinar_perceptron` e `treinar_adaline` por `importlib`, e a lista `PORTAS_VALIDAS` do `02` (só as 5 separáveis) vale para a linha de comando dele, não para as funções.
3. **Marco 4: representação do alvo e do limiar (decidido em 2026-10-12, Decisão 6 do `06`).** Saída **sigmoide**, **alvos 0/1** e a classe decidida por **`degrau(z_saída)`**, onde `z_saída` é a soma ponderada do neurônio de saída antes da sigmoide (como $\sigma(z) \ge 0{,}5 \iff z \ge 0$, é o mesmo critério de $a \ge 0{,}5$). Isso **preserva a padronização**: a classe continua decidida pelo mesmo `degrau` e pela mesma `TOLERANCIA_ZERO` dos Marcos 1 e 2, `y` continua 0/1 em tudo e os alvos 0/1 só entram no erro e no gradiente. Diferença consciente em relação ao Adaline: o erro da MLP é medido **depois** da ativação da saída (como no Perceptron), porque o backpropagation precisa da derivada da sigmoide; o do Adaline é medido antes (saída linear). O −1/+1 fica restrito aos alvos do Adaline.
4. **Marco 4: definir o custo.** O Adaline usa $E = \tfrac12 \sum (\text{alvo}-z)^2$ chamado `sse`; a demo usava o erro quadrático médio com limiares ($0{,}01$ de convergência e $3\times10^{-3}$ por janela) calibrados nele. Recomendação: manter o nome e a definição `sse` ($\tfrac12\sum$) e **converter os limiares da demo para essa escala**, anotando a conversão no docstring; ou usar `mse` com esse nome, explícito, e dizê-lo no cabeçalho do log. O que não pode é reaproveitar os números da demo sem checar a definição.
5. **Marco 4: inicialização.** Usar `rng = np.random.default_rng(semente)`, como nos outros marcos; a amplitude do sorteio (`rng.uniform(-escala, escala, ...)`, com `--escala-init` na demo) precisa de decisão e de registro, e a simetria (pesos iguais) deve ser quebrada pelo sorteio.

### Marco 1 — Perceptron clássico (Modo 1a) — *concluído*
- Regra de aprendizagem: correção de erro discreta pós-ativação $(y-\hat{y})$.
- Rodar nas 5 portas linearmente separáveis: AND, OR, NOT, NOR, NAND (seletor por parâmetro/CLI, ex.: `python 01_perceptron_gates.py --porta AND`).
- Animação (`matplotlib.animation.FuncAnimation`): pontos coloridos por classe + reta de decisão se movendo a cada época + contador de época + nº de pontos mal classificados.
- **Critério de pronto**: as 5 portas convergem visivelmente e o código está limpo o suficiente para servir de referência direta na hora de escrever a versão em JS.
- **Estado (2026-10-09)**: pronto e na `main` (`5388e31`), com tolerância numérica `TOLERANCIA_ZERO = 1e-9` na função `degrau` (Aprendizado 4). O script da demo é idêntico a este.
- **(2026-10-12)** `erros_na_epoca` passou a ser o veredito com os pesos finais da época (função `contar_erros`, usada também pelo Adaline), e as correções feitas durante a época ficam em `correcoes_na_epoca`, que segue sendo o critério de parada. Conferido: pesos, bias e épocas idênticos aos de antes (5 portas × 3 taxas × 2 inicializações). Efeito visível: o gráfico pode mostrar zero erros uma época antes da convergência (a reta já acerta tudo, e falta a época sem correções para confirmar).

### Marco 2 — Adaline (Modo 1b) — *concluído* — **Adriano** (commit `ab5ed35`, 2026-10-12)
- Mesma arquitetura de neurônio único, mesmas 5 portas, mas erro contínuo pré-ativação $(\text{alvo}-z)$ e regra delta (gradiente descendente sobre o custo $E = \tfrac12\sum(\text{alvo}-z)^2$), versão **online** (um ajuste por exemplo, mesma granularidade da animação do Marco 1).
- **Escolhas do Adriano** (Decisões 3 e 4 do `06_detalhes_implementacao.md`; Aprendizados 6 a 8 do `05_aprendizados_obtidos.md`): **alvos bipolares** (classe 0 → −1, classe 1 → +1) com o **mesmo `degrau` ($z \ge 0$)** do Marco 1; custo medido no fim de cada época com os pesos finais; parada quando $|\Delta E| < 10^{-4}$ com η = 0,1 (o Adaline nunca chega a erro zero; em 2026-10-12 a tolerância passou a ser proporcional ao η, $10^{-3}\eta$, porque um valor fixo parava antes da hora com η pequeno, e com η = 0,1 os resultados são os mesmos), com máximo de 100 épocas e detecção de divergência; `--comparar` (Perceptron e Adaline lado a lado, mesmos pesos iniciais e η); reaproveita o Marco 1 por `importlib` (`perceptron.degrau`, `perceptron.treinar_perceptron`).
- **Relação com a demo.** A demo treinou com alvos 0/1 e limiar $z = 0{,}5$. As duas convenções são equivalentes ($z_{bip} = 2z - 1$) e dão a **mesma fronteira**, mas o custo e os pesos mudam de escala (o custo com alvos −1/+1 é 4 vezes o da demo, e o $\tfrac12$ divide por 2); portanto **os números de SSE da demo não valem como gabarito aqui**. A demo também media o SSE acumulado durante a época, que fica acima do mínimo e sobe com o η; o custo no fim da época é a métrica mais limpa, e o Aprendizado 8 (revisto em 2026-10-12: o Adaline online, com a ordem fixa dos exemplos, converge a um ponto fixo que se afasta do mínimo quando η cresce, e não por ultrapassar $2/\lVert\tilde{x}\rVert^2$) é o resultado correspondente.
- **Critério de pronto (cumprido)**: dá pra rodar Perceptron e Adaline lado a lado (mesma porta, mesma inicialização, `--comparar`) e ver a diferença de trajetória — reta "aos saltos" vs. reta suave — que é o gancho visual da Q5 (o erro contínuo permite corrigir a cada passo, e o gradiente aponta o caminho). A troca do degrau pela saída linear é, aqui, só o ponto de partida da Q4, respondida no Ato 3.
- **Gabarito (script do Adriano, semente 42, η = 0,1, até 100 épocas; conferido em 2026-10-12)**: as 5 portas terminam com **0 mal classificados** e o custo estabiliza; épocas e custo final: AND 43 (0,5061), OR 61 (0,5105), NAND 44 (0,5060), NOR 64 (0,5105) e NOT 85 (0,0011); primeira época com tudo certo: 3, 9, 4, 12 e 7. O mínimo teórico do custo nas portas de 2 entradas é **0,5** (4 pontos para 3 parâmetros, conferido por mínimos quadrados), e na NOT o custo tende a 0 (2 pontos e 2 parâmetros), então o valor final da NOT depende da tolerância de parada.
- **Risco (a manter em mente)**: confundir erro de ajuste (o custo) com erro de classificação (quantos pontos caem do lado errado de $z = 0$). O Adaline continua ajustando depois de classificar tudo certo (AND: certo na época 3, para na 43).

### Marco 3 — Tentando XOR/XNOR com 1 neurônio só (Transição) — *concluído* — **Herik** (branch `marco3-xor-falha`)
- Roda o mesmo código dos Marcos 1 e 2 nas portas XOR/XNOR, sem nenhuma mudança de arquitetura: o `03_perceptron_xor_falha.py` usa `treinar_perceptron` e `treinar_adaline` por `importlib`, segue as convenções da seção acima e não altera os Marcos 1 e 2 (Decisão 8 do `06`). Mostra os dois lado a lado (animação) e imprime um relatório com o veredito de cada treino.
- **Critério de pronto (cumprido)**: fica visualmente claro que o **Perceptron** nunca se estabiliza (a reta oscila e os erros nunca zeram), o que confirma experimentalmente a não separabilidade linear antes de partir pra MLP.
- **(2026-10-12)** O **Adaline** se comporta de outro jeito: ele **converge**, mas para (perto da) função **constante** que melhor aproxima o XOR no sentido de mínimos quadrados, e fica parado num lugar inútil (Aprendizado 7 da demo, Aprendizado 10 daqui). Com os alvos bipolares do Marco 2, essa constante é **0** (o ponto médio de −1 e +1; na convenção 0/1 da demo era 0,5), e o custo mínimo é $E = 2{,}0$ (conferido por duas vias). Isso fecha o argumento pelo outro lado: não faltou treino, o limite é da **arquitetura**. **Precisão da revisão manual:** o ponto de chegada real do Adaline online (η finito e exemplos sempre na mesma ordem) não é exatamente a constante: é um ponto fixo com uma pequena inclinação ($z \approx \eta\,[1;\,0;\,-1;\,-2]$ no XOR), que não depende da inicialização. O lado em que cada ponto cai depende dessa inclinação, não de uma separação: **no limite, XOR com 2 pontos errados e XNOR com 3**; na época em que o custo estaciona (estado transitório) o veredito varia de 1 a 3 com a semente e com η, **nunca 0** (a demo registrava 3 dos 4, um caso particular).
- **Gabarito (η = 0,1, semente 42, até 50 épocas; conferido em 2026-10-12)**:
  - **Perceptron**: não converge em nenhuma das 120 execuções (20 sementes × 3 taxas × 2 portas, 200 épocas); os pesos de fim de época entram em ciclo (XOR a partir da época 4, XNOR da 3, período de 1 época); mal classificados com os pesos finais: XOR entre 2 e 3, XNOR sempre 2; o melhor que qualquer reta faz é acertar 3 dos 4 pontos.
  - **Adaline**: na época de parada, XOR para na época **12** com $E = 2{,}0218$, $z = [-0{,}005;\ -0{,}090;\ -0{,}084;\ -0{,}169]$ e classes $[0,0,0,0]$, **2 errados**; XNOR para na época **14** com $E = 2{,}0342$, $z = [-0{,}076;\ -0{,}016;\ 0{,}144;\ 0{,}204]$ e classes $[0,0,1,1]$, **2 errados**. **Ponto de chegada** (limite do treino, calculado exatamente pelo mapa de uma época e confirmado por treino longo em 10 sementes): XOR $z = [0{,}111;\ 0;\ -0{,}111;\ -0{,}222]$, $E = 2{,}037$, classes $[1,1,0,0]$, **2 errados**; XNOR $z = [-0{,}111;\ 0;\ 0{,}111;\ 0{,}222]$, classes $[0,1,1,1]$, **3 errados**, o mesmo para η = 0,05 e 0,2. O ponto $(0,1)$ tem $z$ exatamente 0, então a classe depende da tolerância do `degrau` (Aprendizado 4): com $z \ge 0$ simples o ruído de ponto flutuante ($z = -1{,}7\cdot10^{-13}$) daria classe 0 e um erro a mais.
  - **Conta à mão** (XOR, pesos iniciais 0 0, bias 0, η = 0,1, aritmética exata): Perceptron, 3 correções e 2 erros no fim da época 1, com $w = (-0{,}1;\ 0)$ e $b = -0{,}1$; Adaline, erros $[-1;\ 1{,}1;\ 0{,}99;\ -1{,}318]$, $w = (-0{,}0328;\ -0{,}0218)$, $b = -0{,}0228$ e $E = 2{,}005796$.
- **Risco**: dois erros que a demo cometeu no relatório do script e corrigiu — afirmar que o Adaline "convergiu" quando só bateu no limite de épocas, e reportar o acumulador de erros da época (somado com os pesos ainda mudando) em vez do veredito da reta final. O relatório do `03` diz "convergiu" só quando houve convergência de fato e conta os erros **com os pesos finais** nos dois treinos (Decisão 5 do `06`). E não reaproveita o `resumo_adaline` do Marco 2, que diria "η grande demais" ao ver o Adaline parar com pontos errados, o que seria falso no XOR.

### Marco 4 — MLP com backpropagation (Modo 2) — branch `marco4-mlp` — **Adriano**
- Arquitetura mínima: 2 neurônios ocultos (ativação sigmoide) + 1 neurônio de saída.
- Backprop implementado à mão (regra da cadeia), sem frameworks (nem PyTorch/TensorFlow) — é o que o trabalho pede para "disponibilizar a implementação" com domínio real do algoritmo.
- Animação: as duas retas dos neurônios ocultos se formando + região combinada (interseção convexa) separando as classes do XOR + curva de erro por época.
- **(2026-10-09)** Ativação selecionável (sigmoide, tanh, ReLU), com **sigmoide como padrão** no Python. No site, o Ato 3 começa com **tanh** (η = 2) e deixa o usuário trocar de ativação (a ativação não mudou por capricho: sem derivada não há backpropagation; é a resposta à Q4, dada no Ato 3, junto do seletor). Registrar, com `--testar-sementes`, a taxa de sucesso e a mediana de épocas de **cada** ativação (sigmoide, tanh e ReLU); esses números são a base do texto do Ato 3 e das gavetas das funções de ativação. Acrescentar `draw_network_diagram()` a `utils_plot.py` (conexões com espessura proporcional a |peso| e cor pelo sinal) e o modo `--testar-sementes N`, que mede a taxa de sucesso sem abrir a animação. A inicialização é aleatória (pesos iguais manteriam os neurônios ocultos idênticos para sempre).
- **(2026-10-09) Mínimos locais e reinício.** A MLP 2-2-1 tem mínimos locais reais: sem reinício, com sigmoide e η = 0,5, só 14 de 20 sementes convergiram na demo; com 3 ocultos a convergência foi de 100%, mas o `04` já proibia "adicionar neurônios só pra forçar". Trocar o erro quadrático por entropia cruzada não ajudou (teto ~83% com 2 ocultos), ou seja, o problema é a paisagem de erro, não a função de perda (Aprendizado 8 da demo). A solução é **reinício automático** ao detectar estagnação, mantendo os 2 ocultos da narrativa — e mostrá-lo na animação, porque torna visível que o gradiente descendente é um método local.
- **(2026-10-09) Detector de estagnação por janela.** No mínimo local o erro não trava: ele "rasteja" (~$2{,}5\times10^{-6}$ por época), então comparar com o melhor erro já visto zerava o contador para sempre e a rede ficava presa (Aprendizado 9 da demo). O detector mede o progresso numa **janela fixa**: se em 300 épocas o erro não caiu pelo menos $3\times10^{-3}$, reinicia. O Python usa a mesma regra do site (na demo, o Python ainda usava a regra antiga).
- **Critério de pronto**: XOR e XNOR convergem de forma confiável com a arquitetura mínima escolhida — se não convergir de forma consistente, ajustar inicialização/learning rate antes de seguir pra Fase 2 (não adicionar mais neurônios só pra "forçar" convergência sem entender por quê). **(2026-10-09)** "De forma confiável" significa **100% das sementes testadas** com o reinício automático (a demo mediu 40/40 em XOR e em XNOR); o número de épocas não é critério, só é registrado (a demo teve mediana de ~300).
- **(2026-10-12)** Seguir as convenções de código da seção acima. **Decidido** (Decisão 6 do `06`): saída sigmoide, alvos 0/1, classe por `degrau(z_saída)` e `erros_na_epoca` com o mesmo significado dos Marcos 1 e 2. **A registrar no `06` quando for implementado**: a definição do custo (`sse` com $\tfrac12$, com os limiares da demo convertidos, ou `mse` explícito) e a amplitude da inicialização.
- **Risco**: subir para 3 ocultos para "resolver"; simetria de pesos; reiniciar cedo demais e esconder o aprendizado em vez de mostrá-lo.

## Fase 2 — Website

A lógica de treino só é portada depois dos 4 marcos da Fase 1; o esqueleto e a interface podem começar antes (ver "Metodologia"). Estrutura (stack decidida no brainstorming, ajustada em 2026-10-09: HTML/CSS/**JavaScript puro** + D3 + KaTeX + GSAP, **sem build**, bibliotecas copiadas do npm para `docs/vendor/`, sem CDN, para o site funcionar offline mesmo numa sala com conexão ruim — Decisão 5 da demo):

```
docs/                      # nome definido pela estrutura do repositório (ver README.md) —
  index.html                # é o site, não "documentação"; publicado no Vercel a partir de /docs
  css/
    tokens.css             # variáveis de design (cores, tipografia, espaçamento)
    estilo.css
  assets/logo.svg          # logotipo original do projeto
  vendor/                  # d3, katex, gsap e fontes (Source Serif 4, Inter, JetBrains Mono), ~1 MB
  package.json             # só registra de onde vêm as bibliotecas
  js/
    dados.js               # as 7 portas, degrau com tolerância, gerador com semente
    treino_perceptron.js   # port do Marco 1
    treino_adaline.js      # port do Marco 2
    treino_mlp.js          # port do Marco 4 (generalizado para várias camadas)
    grafico.js             # painel D3 (coluna direita): plano de decisão e curva de erro
    algoritmo.js           # painel KaTeX + estado/pseudocódigo (coluna esquerda)
    laboratorio.js         # componente reutilizado nos 3 atos e no laboratório livre
    rede_visual.js         # rede como um único SVG, mini-gráficos, botões +/− (só no laboratório livre)
    principal.js           # liga os modos, seletor de porta lógica, controles
    carregamento.js        # tela de abertura
    decoracao.js           # desenhos de margem
    navegacao.js           # menu móvel e indicador de seção
    acabamento.js          # atalhos, termos com (?), dica de primeira visita
    desafios.js            # (2026-11-10) regra de conquista (função pura), configuração inicial e constantes dos desafios
    pistas.js              # (2026-11-10) gaveta de pistas progressivas e contagem de tentativas
    notificacao.js         # (2026-11-10) aviso de conquista (toast)
```

Nessa fase o trabalho principal é de UI/animação (D3 transitions, KaTeX, sincronia entre as duas colunas), não de algoritmo — a lógica de treino já vem pronta e validada da Fase 1. Servidor local: `python -m http.server 5500` dentro de `docs/` (Decisão 6 da demo; abrir o `index.html` direto bloqueia módulos ES).

### Narrativa: cada ato responde uma pergunta (decidido em 2026-10-11; ordem Q2 → Q5 → Q4 confirmada em 2026-10-12)

A demo organizava a história por **modelo** (Ato 1: Perceptron e Adaline; Ato 2: os dois falhando no XOR; Ato 3: rede multicamada). Para a apresentação, o site passa a ser organizado por **pergunta orientadora**, da mais elementar à mais complexa e em ordem histórica: **Q2 → Q5 → Q4**. O histórico e a justificativa estão em "Por que Q2 → Q5 → Q4", abaixo. O mesmo componente de laboratório é reaproveitado, só mudando a configuração. A demo é referência, não requisito: onde a pergunta pedir algo diferente dela, adaptamos.

| Ato | Pergunta | Modelo | Laboratório | Aproveita da demo |
|---|---|---|---|---|
| **1** | **Q2** — por que o Perceptron não resolve todo tipo de problema? | Perceptron | modo Perceptron, 7 portas: as 5 separáveis convergem; XOR e XNOR falham | Ato 1 (parte Perceptron), Ato 2 (parte Perceptron) e o card do NAND |
| **2** | **Q5** — como o gradiente descendente encontra uma solução? | Adaline | modos Adaline (padrão) e Perceptron, 7 portas; a ilustração da superfície de erro (o vale) | Ato 1 (parte Adaline) e o card do Adaline que "converge para a constante" no XOR |
| **3** | **Q4** — por que existem diferentes funções de ativação? | MLP 2-2-1 com backpropagation (o Adaline como ponto de comparação) | modos **"1 neurônio" (Adaline) e "rede 2-2-1" (MLP)** no mesmo laboratório, 7 portas, rede fixa, seletor de ativação e de η; antes do laboratório, o card matemático e as gavetas das ativações | Ato 3 sem os botões +/−, com o card do mínimo local e do reinício |
| **Bônus obrigatório** | — | rede livre | modos Perceptron, Adaline e MLP **editável**, 7 portas, ativação, η e demais parâmetros | Ato 3 completo da demo |

**Como cada ato responde** (resposta em uma frase, que vira o fecho do ato e o roteiro da fala):
- **Q2:** um neurônio só traça uma reta, e XOR/XNOR não têm reta que os separe; o Perceptron corrige um ponto e estraga outro, e nunca para.
- **Q5:** o gradiente aponta para onde o erro cai mais depressa. O Adaline mede o erro antes da decisão, na saída linear, e dá um passo nessa direção a cada iteração, com o η controlando o tamanho do passo; encontra o melhor ajuste possível, mesmo quando ele é inútil (no XOR, uma constante: 0 com os alvos −1/+1 do Marco 2, o ponto médio entre as classes). A mesma ideia atravessa camadas no Ato 3.
- **Q4:** para o gradiente atravessar camadas, a ativação precisa ser **não linear** (uma composição de funções lineares é linear: $W_2(W_1x+b_1)+b_2=(W_2W_1)x+(W_2b_1+b_2)$, uma reta só) e **diferenciável** (o degrau tem derivada zero, e a regra da cadeia anula o gradiente). Sigmoide, tanh e ReLU atendem, e diferem em faixa de saída, saturação e velocidade de convergência (números medidos no Marco 4).

**Elementos novos em relação à demo** (só HTML, texto e gráficos estáticos, a cargo do Heitor): mapa das três perguntas no topo da página, com cada uma apontando para o seu ato (avisando que a ordem de apresentação, Q2, Q5 e Q4, difere da numeração do curso); selo "Respondendo à Q_" no início de cada ato; a resposta em uma frase no fim; um **resumo final** com as três respostas, antes de "Trabalhos relacionados"; no Ato 2, a ilustração da superfície de erro; e, no Ato 3, o card matemático, as gavetas das funções de ativação e o seletor "1 neurônio × rede 2-2-1", descritos abaixo. **(2026-11-10)** Em todos os atos entram também a **gaveta de pistas progressivas** e a **notificação de conquista**, que levam um pouco de JavaScript além do HTML (ver "Roteiro de texto dos atos" e "Pistas progressivas e conquistas").

**Card matemático do Ato 3 (Q4).** Três passos curtos em KaTeX, nos dois temas, sem laboratório: (1) a composição de funções lineares é linear, com a conta acima; (2) a derivada do degrau é 0 onde existe e indefinida em 0, então a regra da cadeia zera o gradiente que chegaria às camadas anteriores; (3) as derivadas das ativações usadas: sigmoide $\sigma' = \sigma(1-\sigma)$, tanh $1-\tanh^2$ e ReLU 0 ou 1. Demonstrar por conta, e não por experimento no laboratório, foi decisão do grupo.

**Gavetas das funções de ativação (Ato 3, decididas em 2026-10-11).** Logo abaixo do card matemático, antes do laboratório, cinco `<details class="gaveta">` fechadas por padrão: degrau, linear (identidade, a saída do Adaline), sigmoide, tanh e ReLU. Cada gaveta traz o nome, a **fórmula e a derivada em KaTeX**, uma frase sobre o que a função faz e o seu limite (degrau: decide, mas o gradiente é zero; linear: permite corrigir sempre, mas só gera retas; sigmoide: saída em $(0,1)$ e saturação nas pontas; tanh: saída em $(-1,1)$, centrada em zero; ReLU: sem saturação para $z>0$, com o risco do "neurônio morto" que a demo já documenta) e, **embaixo, o gráfico** de $f(z)$ e de $f'(z)$. É viável e barato, porque a demo já tem os ingredientes: gavetas `<details>` (Decisão 12 da demo), KaTeX, D3 e o objeto `ATIVACOES` em `treino_mlp.js`, com `f` e `derivadaDaSaida` de tanh, sigmoide e ReLU. O gráfico deve usar **as mesmas funções do treino** (fonte única: o que se vê é o que treina), calculando $f'(z)$ como `derivadaDaSaida(f(z))`; degrau e linear não são usadas pela MLP e ficam definidos no módulo das gavetas (o `degrau` já existe em `dados.js`). Cuidados: o degrau tem salto em $z=0$ e derivada indefinida, então o gráfico mostra o ponto como aberto e a derivada como zero fora da origem; as cores vêm das variáveis `--grafico-*`; sem rolagem horizontal a 320 px; os gráficos são estáticos, sem animação nem `<canvas>`. Opcional, sem exigência: ao escolher uma ativação no seletor do laboratório, destacar (ou ligar por âncora) a gaveta correspondente.

**Seletor "1 neurônio × rede 2-2-1" no Ato 3 (decidido em 2026-10-12).** O laboratório do Ato 3 oferece dois modos no mesmo componente, trocando entre eles sem recarregar a página: "1 neurônio" (o Adaline do Ato 2) e "rede 2-2-1" (a MLP de duas retas, com arquitetura fixa). A sugestão é abrir no XOR, no modo "1 neurônio", que falha (converge para a constante), para o usuário trocar para a rede e ver as duas retas resolverem (gabarito: época 1358 com tanh e η = 2). É viável com o que a demo já tem: o `Laboratorio` recebe uma lista de modos por configuração, como o Ato 1 da demo fazia com Perceptron e Adaline. A alternativa descartada foi pôr o seletor no Ato 2, o que levaria a rede e o backpropagation para o ato do Adaline antes de a ativação ter sido explicada e esvaziaria o clímax (o XOR resolvido) do Ato 3.

**Ressalva do Ato 2: nomear a saída linear (decidida em 2026-10-12).** O Adaline já usa, no Ato 2, uma função diferente da do Perceptron (a saída linear no lugar do degrau) antes de a Q4 ser respondida. Deixar essa troca sem nome seria um salto sem explicação. O texto do Ato 2 deve **nomeá-la**, por exemplo: "repare no que mudou: o Perceptron aprende olhando a saída depois do degrau; o Adaline, antes dele, na saída linear, e é isso que lhe diz o quanto errou". Deve também **anunciar que o porquê dessa escolha, e por que a linear sozinha não basta, é a pergunta do Ato 3**. O Ato 2 não pode depender da regra da cadeia nem de derivadas: usa "inclinação" e "o quanto errou".

**Por que Q2 → Q5 → Q4 (decidido em 2026-10-11, confirmado em 2026-10-12).** O histórico: a ordem Q2 → Q4 → Q5 foi a primeira proposta; em 2026-10-11 foi trocada por Q2 → Q5 → Q4; em 2026-10-12 uma resposta foi lida como Q2 → Q4 → Q5 e o plano chegou a ser reescrito assim, por engano, e o grupo confirmou o mesmo dia a ordem **Q2 → Q5 → Q4**, mantendo a ressalva acima. Os motivos: (1) **dependência lógica**: o argumento da Q4 (a ativação precisa de derivada, e a regra da cadeia anula o gradiente do degrau) pressupõe a ideia de gradiente, que a Q5 introduz com o Adaline; (2) o aluno chega ao Ato 3 já sabendo o que é o gradiente, e a pergunta "e se a ativação não tiver derivada?" surge sozinha quando se tenta ensinar uma rede de duas camadas; (3) **ordem histórica**: Perceptron, Adaline e, por fim, o backpropagation com ativações diferenciáveis (datas a conferir nos Tópicos do curso); (4) o Ato 3 junta a Q4 à rede e ao XOR resolvido, que é o clímax, e termina no laboratório livre. A ordem de apresentação (Q2, Q5, Q4) difere da numeração do curso (Q2, Q4, Q5), e o mapa das perguntas deve avisar. **Riscos:** a Q5 só se completa no Ato 3 (o gradiente atravessando camadas), então o texto do Ato 3 deve retomá-la; e a troca de função no Ato 2 fica sem explicação completa até o Ato 3, que é o que a ressalva acima trata.

**Pontes entre os atos (roteiro oral).** Cada ato termina com a pergunta que abre o seguinte:
- **Ato 1 → Ato 2:** "O Perceptron só sabe se errou ou acertou, e só muda quando erra. E se, em vez de só 'errou', ele soubesse o quanto errou? Isso muda o jeito de aprender: é a pergunta do gradiente."
- **Ato 2 → Ato 3:** "O Adaline também falha no XOR: o limite não é o treino, é a arquitetura. Duas retas resolveriam, mas como o erro chega ao neurônio escondido? Só se a função de ativação permitir. Por que existem diferentes funções de ativação?"
- **Fecho:** repetir as três respostas em uma frase cada e convidar para o laboratório livre.

**Dependências entre as respostas (a ter em mente ao escrever o texto)**: o Adaline é a ponte. No Ato 2 ele introduz o gradiente e a saída linear (nomeada, com o porquê adiado); o Ato 3 mostra que, para o gradiente atravessar camadas, a ativação importa. O texto do Ato 2 deve terminar apontando para essa pergunta ("como o erro volta por uma camada?"), e o card do mínimo local no fim do Ato 3 deve dizer que ele também fecha a Q5 (o gradiente é um método local).

**Ponto fraco conhecido (Q5)**: no Ato 2, a descida do gradiente é mostrada pela curva de erro e pela reta que desliza, e a "ladeira" (o erro como superfície) é apenas sugerida. É mitigado pela **ilustração da superfície de erro**, descrita a seguir.

**Ilustração da superfície de erro (Ato 2, decidido em 2026-10-11).** Desenho de fundo no estilo de uma função de perda em 3D: malha em perspectiva só com **linhas** (sem mapa de calor), na paleta e no traço da página, com uma trilha que desce até o fundo e, projetadas no piso, as curvas de nível. Serve a dois objetivos: dar à página uma parte estética e mostrar visualmente a ideia de função de perda e de descida, sem criar um componente novo de interface. Ressalvas que valem registrar:
- **É uma ilustração, não o gráfico real do laboratório.** A legenda deve dizer isso ("ilustração: o erro de um neurônio em função dos pesos"). Mostrar a perda de verdade exigiria calcular o SSE do laboratório sobre uma grade de pesos e marcar nela os pesos atuais; isso é uma versão com dados, descrita em "Ideias fora do escopo".
- **A forma importa para a Q5.** O SSE de um neurônio linear é quadrático nos pesos: uma **única bacia, sem mínimos locais**. Por isso a superfície do Ato 2 é um **vale suave**, e não a superfície irregular com várias bacias da figura de referência. Essa, sim, representa a rede multicamada, e o seu lugar natural é o card do mínimo local do Ato 3 (uso **opcional**: a mesma superfície com duas trilhas, uma que trava numa bacia rasa e outra que, após o reinício, chega ao fundo). Em ambos os casos é uma metáfora de poucas dimensões, e a legenda deve avisar.
- **Desenho próprio.** A figura de referência é só inspiração de forma e de composição; o desenho é gerado por nós, na estética da página.
- **Como fazer (viável com o que já está no projeto).** Uma função `z(x, y)` avaliada numa grade pequena, projetada em perspectiva e desenhada em SVG com D3 (as curvas de nível do piso saem de `d3.contours`, que faz parte do D3 em `vendor/`). Para as linhas de trás ficarem escondidas, desenhar as células de trás para a frente, preenchidas com a cor do papel e com traço de linha. Gerar **uma vez** (na carga, no redimensionamento e na troca de tema), nunca a cada quadro. Se a função for um parâmetro, a mesma peça serve para o vale do Ato 2, para a superfície irregular do Ato 3 e, se algum dia valer a pena, para o SSE real.
- **A visualização vence a estética** (regra herdada da demo): a ilustração fica atrás do texto, fora do laboratório, com baixo contraste, e o texto sobre ela mantém contraste mínimo de 4,5:1 (medido). Em telas estreitas, entra no fluxo ou some, como as demais ilustrações de margem da demo.

**Laboratório livre (bônus obrigatório)**: seção no fim da mesma página, depois do Ato 3, com os modos Perceptron, Adaline e rede, e a rede editável (1 a 4 camadas ocultas e 1 a 6 neurônios por camada, limites da demo, mantidos por legibilidade) e controle sobre porta (qualquer das 7), ativação, taxa de aprendizado e velocidade — que a demo já tem — mais **semente, reinício automático ligado/desligado e máximo de épocas**, que o `TreinoMLP` já aceita mas a demo não expõe na interface. É um bônus no sentido de não bloquear a narrativa, mas **obrigatório** no sentido de que entra no escopo e deve estar pronto antes do congelamento.

**Modos "portas lógicas" e "classificação" no laboratório livre (ideia registrada em 2026-11-10, ainda não executada).** O laboratório livre ganha um seletor de modo:
- **Portas lógicas**: o que já está previsto, com as 7 portas.
- **Classificação**: datasets 2D prontos, no estilo do TensorFlow Playground, para a turma montar a rede (camadas, neurônios, ativação, η) e ver até onde ela consegue separar as classes.

Os datasets de referência são quatro, cada um com duas classes e ~200 pontos no quadrado [−6, 6]²:
1. **Círculo**: um aglomerado no centro, cercado por um anel da outra classe.
2. **XOR em quadrantes**: a versão "com ruído" da porta, ligando à narrativa.
3. **Duas gaussianas**: separáveis por uma reta. Serve de controle, porque até um neurônio só resolve.
4. **Espiral dupla**: o caso difícil, que pede mais camadas e neurônios. É o que justifica a rede customizável.

Os pontos são **gerados pelo nosso código**, com o gerador com semente (`mulberry32`), para serem reprodutíveis. As figuras do Playground são só referência visual. Cores das classes: laranja-terracota e azul, as mesmas dos gráficos.

Pontos a resolver quando for implementar:
- **Escala dos gráficos:** o plano, as retas e as miniaturas hoje usam a faixa [−0,5; 1,5]. A faixa passa a ser um parâmetro do dataset.
- **Escala das entradas:** a entrada da rede deve ser normalizada (por exemplo, dividida por 6), para a inicialização de Xavier e o η continuarem fazendo sentido.
- **Critério de parada:** "SSE abaixo do limiar" pode nunca acontecer em dados com ruído ou classes sobrepostas. É preciso decidir se a parada passa a ser por acurácia ou por estabilização do custo, e recalibrar a janela de reinício (medir).
- **Custo por época:** passa de 4 para ~200 pontos por época. O gradiente continua em lote, mas é preciso medir no celular. Se pesar, reduzir o número de pontos ou mostrar menos quadros.
- **Opcionais, como no Playground:** controles de ruído e de quantidade de pontos, e a separação treino/teste.

**Conferência:** a matemática da MLP não muda, então os testes da `fase2-logica` continuam valendo. Os geradores ganham testes próprios: determinismo com a semente, equilíbrio entre as classes, pontos dentro da faixa, e um treino de referência por dataset (convergir nas gaussianas com um neurônio; registrar arquitetura e épocas que resolvem o círculo, o XOR e a espiral).

**Prioridade:** depois de tudo o que é obrigatório no laboratório livre. Com o congelamento em 14/11, entra só se sobrar tempo, sem atrasar os três atos.

**Tudo o que a demo tem entra no escopo** (decisão de 2026-10-09): rede editável com mini-gráfico por neurônio, tela de abertura, menu móvel, indicador de seção e acabamento. O que muda é a posição de cada coisa; a rede editável saiu do Ato 3 e foi para o laboratório livre.

**Ideias fora do escopo** (não existem na demo; ficam registradas e só voltam ao plano se sobrar tempo no ponto de controle de 06/11): a **ladeira do erro com dados reais** — o SSE da porta escolhida calculado numa grade de pesos (com o viés fixo) e um marcador, com trilha, nos pesos atuais do laboratório. Reaproveita a mesma função de desenho da ilustração, trocando a superfície inventada pela real; o custo extra é o cálculo da grade e a ligação com o treino (viés e projeção a decidir).

**Também fora do escopo (2026-11-10): mural de conquistas compartilhado.** Pedir o nome na entrada e mostrar "João resolveu o XOR!" na tela dos demais exigiria um serviço externo (um banco em tempo real como Firebase ou Supabase, ou funções da Vercel com Redis, já que a Vercel não mantém conexão aberta), regras de segurança, moderação de nomes e cuidado com dados de alunos num site público. O grupo preferiu **não depender de conexão nem de banco**: a conquista vira uma notificação local (ver "Pistas progressivas e conquistas"; Decisão 9 do `06`). Se o tema voltar, uma variação barata é uma rota só de projetor, mas ela também precisaria do banco.

### Roteiro de texto dos atos (decidido em 2026-11-10)

O site será apresentado em sala: o link segue por QR code para a turma e para o professor, e cada pessoa mexe nos parâmetros no próprio celular. Por isso o texto precisa conduzir sozinho, sem depender de quem fala, e fazer sentido na ordem em que as ideias surgiram na história. A lógica de cada ato é **mostrar o problema primeiro** (uma configuração que não resolve) e **só depois dar pistas** (próxima seção), para a turma mexer nos controles até resolver.

**Estrutura fixa de cada ato** (a mesma ordem nos três, para a turma reconhecer o ritmo):

1. **Pergunta**: o selo "Respondendo à Q_" e a pergunta em uma linha.
2. **Contexto histórico**: duas ou três frases dizendo quem propôs, quando e o que prometia.
3. **O problema, mostrado no próprio laboratório**: nos Atos 2 e 3 o laboratório já abre numa configuração que **não resolve**; no Ato 1 abre no AND (que funciona, para calibrar) e o texto manda trocar para o XOR.
4. **Convite a mexer**: uma pergunta curta ("o que você mudaria?"), nunca a resposta.
5. **Pistas**: a gaveta de pistas progressivas.
6. **Conquista e fecho**: a notificação, a resposta em uma frase e a ponte para o ato seguinte (as pontes já estão em "Pontes entre os atos").

**Cronologia.** Rosenblatt e o Perceptron (1958) → Widrow e Hoff e o Adaline (1960) → Minsky e Papert mostram o limite do neurônio único (1969) → Rumelhart, Hinton e Williams e o backpropagation (1986). A ordem dos atos acompanha essa linha: o Ato 1 fica em 1958, o Ato 2 em 1960 e o Ato 3 conta o intervalo de 1969 a 1986 (o limite aparece, a área esfria, e a solução vem com a regra da cadeia atravessando camadas). **Datas e nomes a conferir nos Tópicos do curso**, a mesma pendência de "Por que Q2 → Q5 → Q4"; o que não for confirmado sai do texto (o ano é omitido, não adivinhado).

**Regras de escrita** (valem para os três atos):

- Um conceito novo por vez, usando só o que os atos anteriores já introduziram. Termo difícil entra com uma frase de definição e (?) (acabamento da demo). O Ato 2 não usa regra da cadeia nem derivada ("inclinação", "o quanto errou") e mantém a ressalva de nomear a saída linear.
- Segunda pessoa ("você"), frases curtas, voz ativa.
- O texto só descreve o que o laboratório realmente mostra, e todo número citado vem de um gabarito medido (a regra de "números medidos valem mais que os da demo").
- O texto fixo do ato nunca entrega a solução. Quem aponta o caminho são as pistas, da mais vaga à mais clara.

**O que cada ato mostra, pede e premia:**

| | Ato 1 (Q2) | Ato 2 (Q5) | Ato 3 (Q4) |
|---|---|---|---|
| **Problema mostrado** | AND converge (época 7); ao trocar para XOR a reta oscila e sempre sobra erro | Adaline no AND com **η = 0,7**: o custo "estabiliza", mas **1 ponto continua errado** (Aprendizado 8) | modo "1 neurônio" no XOR falha (fica parado na constante); na rede 2-2-1, a configuração inicial **não resolve** (a definir, abaixo) |
| **O que o aluno muda** | a porta (separáveis × XOR/XNOR) | o η | o modo (neurônio × rede), a ativação e o η |
| **Conquista** | o Perceptron converge, 4/4, nas **5 portas separáveis** | o Adaline converge no AND com **0 mal classificados** | a rede resolve o **XOR** (0 erros) |
| **A pista final aponta para** | uma reta só não basta → Ato 2 | o limite é a arquitetura → Ato 3 | o laboratório livre |

Nos Atos 1 e 2 o XOR **nunca** entra nas conquistas, de propósito: um neurônio só não o resolve (Marco 3). A falha nele é justamente o que alimenta as pistas que apontam para o ato seguinte.

**A medir na `fase2-logica` antes de fixar os textos** (para o "problema mostrado" ser verdadeiro, e não suposto): (a) o **η = 0,7 do Ato 2** vem do Python (Aprendizado 8: o ponto fixo não depende dos pesos iniciais, E = 4,583 e 1 mal classificado), e precisa ser conferido no JS; o mesmo vale para o limite que o resolve (a tabela do Aprendizado 8 dá 0 mal classificados até η = 0,4 e 1 a partir de 0,5); (b) a **configuração inicial do Ato 3**: ela deve não resolver dentro do limite de épocas, e deve existir uma mudança de ativação ou de η que resolva. O candidato é um η baixo demais, porque ReLU não é confiável como "falha" (a referência Python deu 32/40). A solução de referência continua sendo tanh, η = 2, **época 1358**.

**Medido (2026-11-10), com a semente do site no XOR, rede 2-2-1:** a configuração inicial do Ato 3 é **sigmoide com η = 0,1**, que desiste na época 6599 depois de 10 tentativas. Resolvem: subir o η com a sigmoide (0,5 → época 6537; 2 → 2539; 5 → 656), trocar para tanh com η ≥ 0,5 (η = 2 → 1358) ou trocar para **ReLU mantendo η = 0,1** (época 4710). As duas alavancas da Q4 (ativação e η) resolvem, o que torna o desafio honesto. Tanh com η ≤ 0,1 também não resolve em 20 000 épocas. Ressalva de texto: com η pequeno, o reinício dispara porque o erro rasteja num platô, e não necessariamente num mínimo local; por isso o log diz "o erro quase não caiu em 300 épocas — empacou" e o desfecho diz "mínimo local ou platô".

**Rascunho das pistas** (para o grupo revisar; as pistas aparecem nesta ordem e só depois das tentativas, ver a seção seguinte):

*Ato 1 (liberadas por tentativas no XOR/XNOR):*
1. "Rode o XOR de novo e acompanhe a reta. A cada correção ela conserta um ponto e estraga outro. Quantos pontos erram no fim de cada época?"
2. "Pegue um lápis: passe uma reta que deixe os dois pontos de uma cor de um lado e os da outra cor do outro. Repare onde ficam os pontos da mesma cor."
3. "Os pontos da mesma cor estão em cantos opostos do quadrado, e nenhuma reta separa dois cantos opostos dos outros dois. Não falta treino: falta reta. Para o XOR vai ser preciso mais do que uma. Antes, veja se saber *o quanto* errou ajuda (Ato 2)."

*Ato 2 (liberadas por tentativas no AND com η alto):*
1. "Olhe os pontos e a curva de custo. O custo parou de cair, mas num valor alto, e um ponto continua do lado errado da reta. O neurônio se acomodou num lugar ruim."
2. "O η é o tamanho do passo. Imagine descer um vale de olhos fechados: com passos longos demais você vai de um lado ao outro do vale e nunca para no fundo (veja a ilustração da superfície de erro)."
3. "Diminua o η e rode de novo. Com um passo menor o neurônio chega mais perto do fundo, mas leva mais tempo. Procure o maior η em que os quatro pontos ficam certos."

*Ato 3 (liberadas por tentativas no XOR):*
1. "Com um neurônio só o XOR não tem solução. Troque para a **rede 2-2-1**: agora existem dois neurônios na camada oculta, e cada um traça a sua reta."
2. "A rede treina, mas olhe a curva de erro: ela cai devagar ou trava? Dois controles mudam o ritmo: o η (tamanho do passo) e a ativação (como cada neurônio responde)."
3. "Para o erro voltar até os neurônios ocultos, a ativação precisa ter inclinação (derivada). A sigmoide achata nas pontas e a inclinação quase some; a tanh é centrada em zero; a ReLU pode deixar um neurônio 'morto'. Troque a ativação e aumente o η, e compare as curvas."

**Textos das notificações de conquista** (rascunho; o trecho entre chaves vem do treino real): Ato 1, ao completar a quinta porta: "O Perceptron aprendeu as 5 portas lineares. Faltam o XOR e o XNOR. O que acontece com elas?"; Ato 2: "Você achou um η que funciona: o Adaline acerta o AND com η = {taxa} em {épocas} épocas. O XOR ainda é outra história."; Ato 3: "Você resolveu o XOR com uma rede 2-2-1 ({ativação}, η = {taxa}, {épocas} épocas). Duas retas fizeram o que uma não conseguia."

### Pistas progressivas e conquistas (decidido em 2026-11-10)

**Escopo: tudo local, sem nome, sem conta e sem banco.** A ideia de mostrar as conquistas de cada aluno na tela dos colegas foi avaliada e **descartada** (Decisão 9 do `06`): exigiria um serviço externo, e o site precisa continuar estático e funcionando offline. Cada celular guarda só o seu progresso, e nada sai do navegador.

**Quando uma conquista dispara.** A regra fica numa função pura, sem DOM, em `desafios.js` (testável em Node). Todas as condições valem **no instante em que o treino termina**:

1. `treino.convergiu` é verdadeiro e `treino.esgotou` é falso.
2. **Recontagem independente**: `treino.errosAtuais() === 0`. "Convergiu" não basta: o Adaline "convergiu" com 1 ponto errado quando o η é grande (Aprendizado 8, η = 0,7 no AND), e isso não é resolver.
3. A configuração é a do desafio do ato: Ato 1, modo Perceptron numa porta separável; Ato 2, modo Adaline na porta AND; Ato 3, modo rede 2-2-1 na porta XOR ou XNOR. Fora disso o laboratório continua livre para explorar, só não conta conquista.
4. É o treino que está na tela. Mudar porta, modo ou parâmetro reinicia o treino (como na demo, `construirTreino`) e zera a contagem. Um reinício automático dentro do treino não atrapalha: conta o estado final.
5. **Uma vez por conquista e por navegador**, guardada em `localStorage` com `try/catch` (sem ele, vale até recarregar a página). A conquista do Ato 1 acumula as portas resolvidas num conjunto e dispara quando fecha as cinco; o progresso ("3/5") aparece junto do laboratório.

**Não dispara** por: pausar, "parou sem resolver", rede com pontos ainda errados, qualquer treino de neurônio único no XOR/XNOR (ele nunca zera os erros: Aprendizado 10 e Marco 3), nem modo ou porta fora do desafio.

**Notificação.**
- Faixa curta (toast) que **não cobre o plano nem a rede**, fora da área de desenho; some sozinha em cerca de 8 s ou ao fechar (alvo de toque de pelo menos 44 px).
- `role="status"` e `aria-live="polite"` para leitores de tela; respeita `prefers-reduced-motion`; animação com GSAP, que já está no projeto.
- Mostra o que funcionou, com os valores reais (ativação, η, épocas), porque é isso que a turma leva para o próximo ato.
- Nenhuma chamada de rede. Sem som.

**Gaveta de pistas** (por ato):
- `<details class="gaveta">` fechada por padrão (Decisão 12 da demo), perto dos controles. Três pistas por ato, cada uma mais específica que a anterior: (1) o que olhar, (2) por que acontece, (3) o que mudar.
- **Libera por tentativas**: `TENTATIVAS_POR_PISTA = 2` (a 1ª pista depois de 2 tentativas sem resolver, a 2ª depois de 4, a 3ª depois de 6). Uma **tentativa** é um treino que termina sem resolver (esgotou, ou convergiu sem zerar os erros) **ou** que o aluno abandona (muda parâmetro ou reinicia) depois de um mínimo de progresso (`EPOCAS_MINIMAS_TENTATIVA`: 3 épocas em neurônio único, 300 na rede), para um clique acidental não contar. As três constantes são valores iniciais, ajustados no ensaio.
- O resumo mostra "Pistas · 1 de 3 liberadas"; as bloqueadas aparecem com a condição ("libera depois de mais 2 tentativas"), **sem o texto**. Quando uma libera, só o contador do resumo reage (e `aria-live` anuncia); a gaveta **não abre sozinha** nem empurra o laboratório.
- Depois da conquista, todas as pistas ficam abertas, com um item final "Por que funcionou" (a resposta em uma frase do ato).
- Opcional, a decidir no ensaio: botão "Estou travado", que libera a próxima pista depois de uma espera curta (20 s), para ninguém ficar parado numa sala com tempo corrido.
- Estado das pistas e das conquistas em `localStorage`, com um botão discreto "zerar progresso" no rodapé (para ensaios e repetições da apresentação).
- Sem rolagem horizontal de 320 a 1440 px, como o resto do site.

**Quem faz** (proposta, a combinar com o grupo): `desafios.js` (regra pura, configurações iniciais dos desafios, constantes) e os testes ficam com o **Herik**, na `fase2-logica`; a gaveta (`pistas.js`), a notificação (`notificacao.js`) e os textos finais ficam com o **Heitor**, nas branches de cada ato; o Herik integra. O rascunho acima é o ponto de partida do texto.

**Pronto quando** (por branch):
- `fase2-logica`: `desafios.js` passa na **camada 6** da conferência (abaixo).
- `fase2-laboratorio` (Atos 1 e 2): o Ato 1 abre no AND e o Ato 2 abre com η = 0,7 (que **não** resolve); as pistas liberam pelas tentativas; a notificação dispara ao resolver e **não** dispara no XOR; o progresso "n/5" do Ato 1 funciona e persiste ao recarregar.
- `fase2-rede-mlp` (Ato 3): o modo "1 neurônio" no XOR nunca dispara conquista; a rede com a configuração inicial não resolve, e com uma mudança de ativação ou de η resolve e dispara; as pistas do Ato 3 liberam por tentativas.
- `fase2-laboratorio-livre`: sem conquistas do desafio; opcionalmente conquistas extras ("resolveu o XNOR", "resolveu com cada uma das três ativações"), só se sobrar tempo.

**Ordem de corte** (o congelamento é em 14/11): primeiro entram a regra de conquista e a notificação (pouco código, e já respondem ao pedido de parabenizar); depois as pistas por tentativas; depois o botão "Estou travado" e as conquistas extras. Se o tempo apertar, o texto dos atos e as pistas fixas (liberadas por ordem, sem contagem) valem mais do que a contagem de tentativas.

### Arquitetura que a demo já provou (adotar desde o primeiro commit)

- **`<canvas>` para a região de decisão e `<svg>` por cima** (Decisão 9 da demo). A região é calculada numa grade pequena (60×60; miniaturas dos neurônios, 22×22) e esticada pelo navegador, o que mantém 60 quadros por segundo; eixos, pontos e retas ficam em SVG, com transição suave do D3.
- **Região pintada pela distância geométrica** $z/\lVert w \rVert$, e não pelo $z$ cru (Decisão 8 da demo): o $z$ depende da escala dos pesos e deixava o plano lavado no começo do treino. Na MLP, a saída em $[0,1]$ é recentrada em 0,5 e reescalada.
- **Rede como um único SVG com `viewBox`** (Decisão 10 da demo). A primeira versão da demo usava neurônios em HTML com conexões em SVG sobreposto e teve três defeitos no telefone: zoom do neurônio que não desfazia, linhas descoladas ao adicionar camadas e barra de rolagem horizontal. Com um só sistema de coordenadas, a linha não sai do lugar do neurônio e a rede sempre cabe. Ampliar por **clique**; `:hover` só em `@media (hover: hover)`, porque em tela de toque ele "gruda"; conexões em curva (Bézier); botões +/− em HTML (área de toque e acessibilidade), alinhados às colunas por `getScreenCTM`.
- **Rede estilo TensorFlow Playground** (Decisão 7 da demo): mini-gráfico (heatmap 2D) por neurônio mostrando a fronteira que ele aprendeu, conexões com espessura proporcional a |peso|, cor pelo sinal e brilho proporcional ao sinal que realmente atravessa o fio (ativação da origem × |peso|), e botões (?) explicando o mini-gráfico e as linhas.
- **Tema aplicado por script bloqueante no `<head>`** (Decisão 11 da demo), antes da primeira pintura, para não haver flash do tema claro; `try/catch` no `localStorage`.
- **Pseudocódigo e log em gavetas `<details>`** (Decisão 12 da demo), com o pseudocódigo fechado por padrão e o resumo mostrando o passo atual; no telefone, o gráfico vem antes do painel.
- **Cores dos gráficos separadas da interface desde o início** (Decisão 15 da demo, feita melhor): `grafico.js` e `rede_visual.js` leem variáveis de cor próprias (`--grafico-*`, inclusive `--grafico-reta-1` a `4` para as retas dos ocultos), independentes das da interface. Na demo foi preciso redeclarar as variáveis dentro de cada contêiner e criar aliases `--tema-*` para não vazar cor para os botões; aqui a regra "a estética não muda a visualização" nasce como propriedade da estrutura.

### Estética e acabamento (adotar a da demo como está — decisão de 2026-10-09)

O Heitor reconstrói a identidade visual da demo: estilo editorial com fontes substitutas gratuitas e logotipo original (Decisão 4), grão de papel e traço a lápis feitos com filtros SVG, sem imagens (Decisão 13), paleta verde inspirada na UEL com camada decorativa de rabisco só em elementos avulsos (Decisão 14), gráficos mantendo laranja-terracota e azul (Decisão 15), tela de abertura animada com GSAP, desenhos de margem dimensionados por medição do texto, celular em primeiro lugar, menu móvel, indicador de seção, atalhos, termos com (?) e dica de primeira visita (Decisão 16). O `DESIGN.md` da demo é a referência e entra reescrito na raiz em `fase2-estetica`. Limitações medidas na demo, a ter em mente: o verde `#00864a` dá 4,42:1 sobre o papel (abaixo dos 4,5:1; texto verde pequeno usa `#006b3b`), laranja e azul ficam em ~2,8–3,0:1 no tema claro, e verde e azul se confundem em escala de cinza. Regra de precedência: **a visualização vence a estética**; filtros de deslocamento nunca são aplicados a nada que se redesenha a cada quadro.

### Branches da Fase 2 (2026-10-09)

O site da demo tem 13 módulos JS e um PR único seria grande demais para revisar; a divisão também separa lógica (conferida número a número) de estética (decisão de gosto).

| Branch | Escopo | Responsável | Depende de |
|---|---|---|---|
| `fase2-base` | esqueleto, `vendor/`, `vercel.json`, `.vercelignore`, tema sem piscar | Heitor (Vercel: Herik) | — (pode começar já) |
| `fase2-logica` | `dados.js`, `treino_*.js`, `desafios.js` (regra de conquista e configuração inicial dos desafios) + script de conferência em `testes/` | Herik | Marcos 1 a 4 |
| `fase2-laboratorio` | `laboratorio.js`, `grafico.js`, `algoritmo.js`, `principal.js` e os textos dos Atos 1 e 2 (neurônio único, Q2 e Q5), com a ressalva de nomear a saída linear, mapa das perguntas, selos, resposta em uma frase, a regra de um laboratório rodando por vez, **a gaveta de pistas e a notificação de conquista** (`pistas.js`, `notificacao.js`) e o roteiro de texto dos Atos 1 e 2 | Heitor; Herik integra | `fase2-base`, `fase2-logica` |
| `fase2-rede-mlp` | `rede_visual.js` e o Ato 3 (Q4) com **rede fixa 2-2-1** (mini-gráficos, conexões com brilho), o seletor "1 neurônio × rede 2-2-1", o seletor de ativação e de η, o card matemático, as gavetas das funções de ativação, o resumo final e **as pistas e a conquista do Ato 3** (roteiro de texto incluído) | Heitor; Herik integra | `fase2-laboratorio` |
| `fase2-laboratorio-livre` | laboratório livre (bônus obrigatório): botões +/−, controles extras (semente, reinício, máximo de épocas) | Heitor (interface); Herik (controles e integração) | `fase2-rede-mlp` |
| `fase2-estetica` | abertura, decoração, logotipo, `DESIGN.md` e a ilustração da superfície de erro (Ato 2: o vale; opcionalmente também a superfície irregular no card do mínimo local do Ato 3) | Heitor | `fase2-base` |
| `fase2-acabamento` | menu móvel, indicador de seção, atalhos, termos com (?), dica de primeira visita | Heitor | `fase2-laboratorio` |

**`fase2-base`**
- Pronto quando: `python -m http.server 5500` dentro de `docs/` abre a página sem erros de console e funciona sem internet; primeiro deploy no Vercel só depois de resolvidas as pendências da seção "Vercel".

**`fase2-logica`**
- Pontos a entender: `TOLERANCIA_ZERO = 1e-9` no `degrau` (Aprendizado 4); gerador `mulberry32`, porque `Math.random()` não aceita semente e a reprodutibilidade importa para repetir experimentos ao vivo; MLP generalizada para várias camadas, porque a arquitetura será editável no laboratório livre; reinício por janela (Aprendizado 9 da demo).
- Pronto quando passa a **etapa de conferência Python → JavaScript** (seção abaixo) e, em particular, um script em Node (`testes/`, mantido pelo Herik) roda as 7 portas e mostra: Perceptron e Adaline com o mesmo desfecho do Python para a mesma porta e os mesmos pesos iniciais (a época pode diferir em casos de fronteira, Aprendizado 4); o `treino_adaline.js` **segue as convenções do Marco 2** (alvos −1/+1, `degrau` em $z \ge 0$ com tolerância, custo $\tfrac12\sum$ no fim da época e parada em $10^{-3}\eta$), e a versão da demo, que usava alvos 0/1 e limiar 0,5, deve ser adaptada, não copiada; MLP convergindo nas arquiteturas que a demo testou (`[2]`, `[4]`, `[4,2]`, `[4,2,2]`); reinício disparando no XOR quando a rede empaca. Até lá nenhum módulo de interface é mesclado sobre ele.
- Risco: **os números de referência do site (épocas 7, 40 e 1358; 1357 na demo) vêm do gerador `mulberry32` com semente 42, que não sorteia os mesmos pesos iniciais que o `numpy` com semente 42** (no Python, o Perceptron do AND converge em 3 épocas, não em 7). Por isso a conferência Python × JS usa **pesos iniciais manuais** idênticos nos dois lados, e os números do site valem só para o JS; se o gerador mudar, os gabaritos de época mudam.

**`fase2-laboratorio`**
- Pronto quando, com semente 42 (determinístico): **Ato 1** (Perceptron, AND, η = 0,1) converge na **época 7**, 4/4, e (Perceptron, XOR) para na **época 40** sem resolver; **Ato 2** reproduz os números do Python dos Marcos 2 e 3 (Adaline nas 5 portas com 0 mal classificados, por exemplo AND em 43 épocas com custo 0,5061 e η = 0,1, e no XOR o custo estaciona com $z \approx 0$ nos quatro pontos: no Python, época 12, $E = 2{,}0218$ e $z$ entre −0,17 e −0,005, com η = 0,1 e semente 42; os números do JS saem do gerador do site, então a conferência Python × JS usa pesos iniciais manuais), e o contraste Perceptron × Adaline (erro em escada × curva contínua) é visível trocando o modo no mesmo laboratório; sem rolagem horizontal a 320, 390, 820 e 1440 px.
- Pronto quando o **mapa das perguntas**, os **selos** e a **resposta em uma frase** de cada ato existem e as âncoras do mapa levam ao ato certo.
- Pronto quando **iniciar um laboratório pausa os outros**, cada um preservando o seu estado e retomando de onde parou (regra do componente `Laboratorio`, que vale também para o Ato 3 e para o laboratório livre; os labs da demo já começam pausados).

**`fase2-rede-mlp`**
- Pronto quando: **Ato 3** (XOR, rede `[2]`, tanh, η = 2) converge na **época 1358** (1357 na demo, antes da correção do reinício), 4/4, com o reinício automático visível na curva de erro; a rede **não tem botões +/−** (arquitetura fixa); folga de **0 px** entre a ponta de cada conexão e o neurônio a 390 px; nenhuma barra de rolagem na rede; ampliar um neurônio por toque e desfazer com outro toque (ou toque fora); os botões (?) da rede e do laboratório que a demo tinha existem e abrem dentro da tela (na demo, dois deles sumiram na reescrita para SVG único sem que nenhum teste percebesse — o teste deve listar o que **deve existir**, não só o que não deve quebrar); o seletor de ativação troca entre sigmoide, tanh e ReLU, e a convergência de cada uma bate com a tabela medida no Marco 4; o **seletor "1 neurônio × rede 2-2-1"** troca de modo no mesmo laboratório e sem recarregar a página, com o XOR falhando no modo "1 neurônio" e convergindo na época 1358 na rede; o **card matemático** e as **cinco gavetas** (degrau, linear, sigmoide, tanh, ReLU) existem, cada uma com fórmula e derivada em KaTeX nos dois temas e o gráfico de $f(z)$ e $f'(z)$ embaixo; o gráfico das três ativações da MLP usa o mesmo `ATIVACOES` do treino, e valores de conferência batem ($\sigma(0)=0{,}5$, $\tanh(0)=0$, $\mathrm{ReLU}(-1)=0$); sem rolagem horizontal a 320 px; o **resumo final** com as três respostas está antes de "Trabalhos relacionados".
- Risco: reconstruir a rede como HTML com SVG por cima traz de volta os três defeitos da Decisão 10.

**`fase2-laboratorio-livre`**
- Pronto quando: é possível adicionar e remover camadas (1 a 4) e neurônios (1 a 6) e escolher porta (as 7), ativação, η, velocidade, semente, reinício automático ligado ou desligado e máximo de épocas; com a configuração do Ato 3 (rede `[2]`, tanh, η = 2, semente 42, XOR), o resultado é o mesmo do Ato 3 (**época 1358**); os modos Perceptron, Adaline e rede podem ser escolhidos; com 3 camadas a 390 px, folga de **0 px** entre conexões e neurônios e nenhuma barra de rolagem.
- Risco: a demo só rodou 3 laboratórios na mesma página e este seria o quarto. A regra de **um laboratório rodando por vez** (ver `fase2-laboratorio`) elimina o custo de animações simultâneas; sobra o custo de manter 4 laboratórios montados, que é pequeno com todos pausados. Mesmo assim, medir rapidamente no celular antes de mesclar. Se ainda pesar, o laboratório livre vira uma página própria (linkada do fim do Ato 3).

**`fase2-estetica` e `fase2-acabamento`**
- Pronto quando os números dos três atos e do laboratório livre continuam exatamente iguais aos das branches anteriores: a estética nunca muda o que o gráfico desenha.
- Pronto quando a **ilustração da superfície de erro** do Ato 2 existe só com linhas (sem mapa de calor), na paleta da página nos dois temas, com legenda que a declara ilustração; o vale tem uma só bacia; é gerada uma vez (não a cada quadro); não cria rolagem horizontal de 320 a 1440 px; e o texto do Ato 2 sobre ela mantém contraste de pelo menos 4,5:1.

### Etapa de conferência Python → JavaScript (2026-11-04)

**Princípio.** O Python (Marcos 1 a 4) é a **referência**; o JavaScript (`fase2-logica`) é uma tradução, e só vale se reproduzir os números. A conferência é um **portão**: nenhum módulo de interface (`fase2-laboratorio` e seguintes) é mesclado antes de ela passar. A demo é o motivo: dois defeitos dela só um teste numérico pega (a convenção 0/1 do Adaline e o passo de gradiente calculado com a rede antiga depois de um reinício), e a tolerância do `degrau` (Aprendizado 4) é o tipo de detalhe que o JS pode perder sem ninguém notar.

**Estrutura** (pasta `testes/` na raiz, listada no `.vercelignore`; Node sem dependências, só `node:assert`):

```
testes/
  gerar_referencias.py     # roda os protótipos e grava referencias/*.json (só quando o Python muda)
  referencias/*.json       # saídas de referência do Python, versionadas
  conferir_js.mjs          # reexecuta o JS e compara; sai com código ≠ 0 se algo falhar
  gabaritos_site.json      # números do próprio site (mulberry32, semente 42), travados na 1ª aprovação
```
Comandos: `python testes/gerar_referencias.py` e `node testes/conferir_js.mjs`.

**Pesos iniciais (resolvido em 2026-11-10, sem mudar o Python).** `mulberry32` e `numpy` sorteiam pesos diferentes com a mesma semente, então a comparação usa **pesos injetados**. Perceptron e Adaline já aceitam `pesos_iniciais` e `bias_inicial`. Na MLP não foi preciso criar uma fonte injetável no `treinar_mlp`: os pesos da tentativa *k* são `inicializar_pesos(..., default_rng(semente + 1000·k))`, então o `gerar_referencias.py` grava os pesos de cada tentativa chamando a mesma função, e o JS os recebe por `fontePesos(tentativa)`.

**Estado (2026-11-10): `fase2-logica` com a conferência passando** (`node testes/conferir_js.mjs`: 238 verificações, 0 falhas). Perceptron e Adaline reproduzem o Python **bit a bit** (63 e 65 trajetórias). Na MLP o JS não tem como reproduzir o numpy bit a bit (FMA e tanh próprios); a conferência compara um passo a partir do estado do Python (≤ 2,2·10⁻¹⁶), reexecuta as decisões sobre o SSE do Python e confere os marcos do treino livre, que coincidem em todos os casos (curvas de SSE a no máximo 5·10⁻¹⁵ uma da outra). Decisão 10 do `06`; Aprendizados 11 a 14 do `05`.

**Camadas de conferência** (cada uma com critério):

1. **Contas à mão, em aritmética exata.** Casos redondos, com resultado conhecido. Perceptron, AND, pesos 0 0, η = 0,1: converge na **época 6** (sem a tolerância do `degrau` daria 4; Aprendizado 4). Adaline, AND, pesos 0 0: E = 1,75914116 na época 1, com w = (0,0632; 0,0542) e b = −0,1268, e para na **época 44** com SSE 0,5061 e pesos (1,0575; 0,9998; −1,4817). (Corrigido em 2026-11-10: o plano dizia "SSE 1,0 na época 1 e 0,6872 na 2", valores que não são da convenção do Marco 2; Aprendizado 14.) Adaline, XOR, pesos 0 0: erros [−1; 1,1; 0,99; −1,318] e E = 2,00579556 na época 1. Perceptron, XOR, pesos 0 0: 3 correções e 2 erros na época 1, com w = (−0,1; 0) e b = −0,1. MLP com todos os pesos zero: δ₂ = ±0,125 e todos os gradientes nulos. Rede AND(OR, NAND) com pesos ±20 e 30: saídas ≈ [0, 1, 1, 0]. Valores discretos exatos; reais com erro ≤ 10⁻¹².
2. **Trajetórias contra o Python.** Para cada caso, o JS reexecuta com os mesmos pesos iniciais e compara passo a passo. Perceptron (5 portas, XOR e XNOR; η = 0,05, 0,1 e 0,2): época, índice, pesos, bias, classe, correções e `erros_na_epoca` (pesos com erro ≤ 10⁻¹²). Adaline: pesos, z, erro, SSE, época de parada, estado e `erros_na_epoca` (≤ 10⁻⁹). MLP (sigmoide, tanh e ReLU): SSE e pesos nas primeiras 300 épocas (≤ 10⁻⁹) e, depois, só os marcos discretos (época de convergência, número e época dos reinícios, estado final), porque erros de arredondamento se acumulam em treinos longos. **(2026-11-10)** Substituído por uma conferência que não deixa o arredondamento se acumular (Decisão 10 do `06`): em todas as primeiras 300 épocas e depois a cada 25, o JS dá **um passo a partir do estado exato do Python** (≤ 10⁻¹³ relativo; medido 2,2·10⁻¹⁶); as decisões de parada e de reinício são reexecutadas sobre o SSE de todas as épocas do Python; e o treino livre tem que bater nos marcos discretos. Marco 3: ponto fixo do Adaline online e época em que o ciclo do Perceptron começa.
3. **Propriedades independentes do Python.** Gradiente por diferenças finitas (≤ 10⁻⁸) nas três ativações; z = −1,7·10⁻¹³ classificado como 1 pela tolerância; `erros_na_epoca` igual a uma recontagem independente; custo do Adaline nunca abaixo do mínimo de mínimos quadrados.
4. **Estatística no JS** (gerador do site). XOR e XNOR com sigmoide e tanh, 40 sementes, com reinício: **100% convergem**. A ReLU é só registrada (a referência Python deu 32/40; o JS pode variar, e não é critério). Sem reinício também só é registrado (no Python, 15/20 com sigmoide). **(2026-11-10)** Com 6 tentativas o XNOR com sigmoide dava 39/40 no JS (semente 2: as 6 tentativas presas); `MAX_TENTATIVAS` passou a **10** no Python e no JS (Aprendizado 13). Medido com η = 2: JS, XOR sigmoide 40/40 (mediana 1396 épocas), tanh 40/40 (278), ReLU 39/40; XNOR sigmoide 40/40 (1363), tanh 40/40 (333), ReLU 38/40; XOR sigmoide sem reinício 34/40. Python (`--testar-sementes 40`): sigmoide e tanh 40/40 nas duas portas (medianas 1418 e 479 no XOR, 1485 e 320 no XNOR).
5. **Gabaritos do site (regressão).** Os números da demo (Ato 1: AND no Perceptron na época 7 e XOR na 40; Ato 3: XOR, rede `[2]`, tanh, η = 2, semente 42, na **época 1357**) são conferidos com o JS novo na primeira execução. Se não baterem, vale a regra de divergência da demo: descobrir **qual dos dois está certo** antes de ajustar qualquer coisa, e registrar no `05`. Depois de aprovados, ficam travados em `gabaritos_site.json`. **(2026-11-10)** Ato 1 confere (7 e 40). O Ato 3 passou de 1357 para **1358**: a diferença vem inteira da correção (c) abaixo (a demo, rodada com essa correção, também dá 1358; Aprendizado 12). Gravados em `testes/gabaritos_site.json` junto com os do Ato 2 (Adaline no AND: η = 0,1 estabiliza na época 43 com 0 erros; η = 0,7 estabiliza na época 12 com **1 erro**, confirmando o desafio do Ato 2; XOR estaciona com 3 erros).
6. **Desafios dos atos (2026-11-10).** Contra o `desafios.js`, com semente 42 e pesos iniciais manuais: (a) a **configuração inicial** de cada ato **não resolve** (Ato 2: Adaline no AND com η = 0,7 termina com 1 mal classificado; Ato 3: a rede inicial não zera os erros no limite de épocas); (b) **existe** uma configuração que resolve (Ato 2: η menor; Ato 3: tanh com η = 2, época 1358); (c) `avaliarConquista` devolve **falso** para treino que esgotou, para treino que "convergiu" com `errosAtuais() > 0`, para XOR/XNOR em Perceptron e Adaline, e para modo ou porta fora do desafio; devolve **verdadeiro** para os casos do item (b); (d) a recontagem de erros da regra coincide com a recontagem independente da camada 3.

**Divergências conhecidas e decididas** (para não virarem falso alarme): (a) os pesos iniciais, tratados pela injeção; (b) a primeira janela do reinício mede 299 atualizações e as seguintes 300, nos dois lados, como na demo; (c) depois de um reinício **não** se aplica o passo de gradiente da rede antiga (a demo aplicava, e é isso que muda o gabarito do Ato 3 de 1357 para 1358); (d) a classe vem de `degrau(z)` com tolerância, e `erros_na_epoca` é medido com os pesos finais, nos dois lados.

**Regra de paridade.** Toda mudança que altere números num dos lados (Python ou JS) regenera as referências e roda `node testes/conferir_js.mjs` **no mesmo PR**; a saída do comando é colada na descrição do PR.

**Responsáveis e ordem.** O Herik escreve e mantém `testes/`; o Adriano, dono do Marco 4, valida as referências da MLP. Ordem: (1) pré-requisito no Python; (2) `gerar_referencias.py`; (3) portar e conferir **módulo a módulo** (`dados.js`, depois Perceptron, Adaline e MLP), sem esperar o conjunto todo; (4) o portão final: `node testes/conferir_js.mjs` passa com código 0; (5) só então a `fase2-laboratorio` pode ser mesclada. Proposta de data: conferência pronta até **08/11**, para sobrar a semana de 08 a 14/11 para a integração.

**Pronto quando:** as camadas 1 a 4 e a 6 passam, a camada 5 está registrada e travada, a lista de divergências conhecidas está atualizada e a saída do comando está na descrição do PR da `fase2-logica`. **Riscos:** tolerâncias frouxas demais escondem bugs (relaxar só com justificativa escrita); a versão do Node precisa suportar módulos ES (o diário da demo registra Node v24 na máquina do Herik; nas outras, a verificar).

### Vercel (2026-10-09)

- **O que a demo fez**: `vercel.json` e `.vercelignore` como descritos em "Ajustes de infraestrutura"; deploy pelo CLI (`npx vercel --prod`), **sem conectar o repositório**; só a URL curta (`neurologica.vercel.app`) é pública, as URLs de cada deploy ficam atrás do login.
- **Problema registrado**: um deploy foi bloqueado com "commit author doesn't have permission to create deployments". O Vercel anexa os metadados do git ao deploy; o último commit era de outro autor que não o dono do projeto (a conta `herikdr`). O contorno foi publicar uma cópia de `docs/` sem `.git` — **não serve como solução para o oficial**, onde os commits serão dos três.
- **Responsável**: o **Herik** cuida da conta e da ligação com o GitHub.
- **A verificar antes do primeiro deploy**: se o deploy funciona com commits de colaboradores diferentes do dono do projeto, e com repositório privado de outra conta (o repositório está privado até virar público).
- **A demo** (`neurologica.vercel.app`) continua no ar como plano B até o oficial ter os três atos funcionando; depois, o endereço passa a apontar para o projeto oficial.

## Divisão de tarefas (2026-10-09)

Antes proposta para discussão com o Herik; agora definida para os três integrantes:

- **Fase 1**: o **Marco 2** foi feito pelo **Adriano** (ele já o tinha implementado, sem commit, quando o plano foi escrito; commit `ab5ed35`). O **Herik** faz o Marco 3 (a falha do XOR com neurônio único) e o **Adriano** faz o Marco 4 (MLP/backprop, o mais pesado). As duas frentes andam em paralelo. Cada marco é implementado em Python e verificado manualmente antes de ser dado como pronto.
- **Fase 2, em paralelo à Fase 1**: o **Heitor** monta o esqueleto, a interface e o visual. O Herik porta a lógica de treino para JS **depois** de os Marcos 3 e 4 estarem validados (o 2 já está) (começando por Perceptron e Adaline, e a MLP quando o Marco 4 fechar), e confere se os resultados batem com o Python; ele também faz a integração entre lógica e interface, os controles extras do laboratório livre (semente, reinício, máximo de épocas) e cuida do Vercel.
- **Revisão (2026-10-11)**: criar branches, dividir tarefas e revisar PRs são **boas práticas, não obrigações**; ninguém fica bloqueado esperando outra pessoa. Quem tiver disponibilidade revisa (o Adriano, quando puder, mas qualquer integrante serve). Se não houver revisor a tempo, o **autor pode mesclar o próprio PR**, desde que antes confira o critério de pronto da sua branch, descreva o que mudou no PR e avise o grupo. Mudanças de plano (este arquivo) e de escopo entre integrantes continuam sendo combinadas entre os três. O fluxo de branches e PR do `README.md` continua valendo, para manter o histórico organizado.
- **Registro**: cada branch atualiza o `05_aprendizados_obtidos.md`, o `06_detalhes_implementacao.md` (no formato demanda / opções / escolha / motivo) e o `02_diario.md` com o que aplicou ou descobriu. **Cada integrante registra o próprio trabalho no diário, com o nome na entrada** (ex.: "2026-10-09 — Herik: …"). Os números medidos aqui valem mais que os da demo.
- **Documento de texto final**: escrito por **Adriano e Herik**; o **Heitor** revisa e dá suporte (figuras, parte de front-end e design). A fundamentação teórica pode ser escrita em paralelo, à medida que cada marco vai sendo validado (aproveitando o que já está registrado em `01_brainstorming.md` e nos Tópicos do curso).
- **Apresentação**: Adriano e Herik apresentam, com o Heitor no suporte. Como dividir a fala fica para depois do site pronto.

## Cronograma (proposta, 2026-10-09)

Prazo interno: código congelado em **14/11**; apresentação em **25/11**.

| Período | Atividades |
|---|---|
| 09–16/10 | PR do plano (`docs-plano-importacao`); Marco 2 concluído (Adriano, `ab5ed35`); `marco3-xor-falha` (Herik) e `marco4-mlp` (Adriano) começam; Heitor começa `fase2-base` |
| 16–23/10 | `marco3-xor-falha` pronto; `marco4-mlp` em andamento; `fase2-base` mesclada |
| 23–30/10 | Marcos 3 e 4 prontos (**Fase 1 validada**); `fase2-logica` (Herik), começando por Perceptron e Adaline; `fase2-laboratorio` (Heitor) começa |
| 30/10–06/11 | `fase2-laboratorio` e `fase2-rede-mlp` (os três atos, com as perguntas); integração; conferência JS contra Python |
| 06–14/11 | `fase2-laboratorio-livre` (bônus obrigatório), `fase2-estetica` e `fase2-acabamento`; testes no celular; primeiro deploy oficial no Vercel; **congelamento do código em 14/11** |
| 14–25/11 | Documento de texto, ensaio da apresentação, correção de bugs |

Pontos de controle: **30/10** (Fase 1 validada) e **06/11** (três atos funcionando). Como o escopo é "tudo o que a demo tem", é nesses pontos que o grupo decide, com o código na mão, o que fazer se algum item estiver atrasado. O laboratório livre é obrigatório mas vem por último na fila de desenvolvimento, porque não bloqueia a narrativa: se faltar tempo, os três atos já estão completos. É também em 06/11 que se decide se alguma das "ideias fora do escopo" cabe. **(2026-11-04)** A conferência Python → JavaScript é um portão entre a `fase2-logica` e a `fase2-laboratorio`; com o código congelando em 14/11, a proposta é tê-la pronta até 08/11.

## Ordem de execução, dependências e riscos (2026-10-09)

```
docs-plano-importacao
   ├─ marco2 [concluído] ─ marco3-xor-falha ┐
   ├─ marco4-mlp ───────────────────────────┴─ fase2-logica ─┐
   └─ fase2-base ─┬──────────────────────────────────────────┴─ fase2-laboratorio ─ fase2-rede-mlp ─ fase2-laboratorio-livre
                  ├─ fase2-estetica                              └─ fase2-acabamento
```

- `marco3-xor-falha` depende do Marco 2 (já na `main`); `fase2-logica` depende dos três marcos; `fase2-base` e `fase2-estetica` não dependem dos marcos e andam em paralelo; o **deploy** depende de resolver o Vercel.
- **Se uma branch descobrir algo que contradiz a demo** (um número que não bate, um comportamento diferente): (1) não ajustar o código até "bater com a demo" — primeiro descobrir **qual dos dois está certo**, como foi feito no Aprendizado 4 com a conta à mão; (2) registrar a divergência no `05_aprendizados_obtidos.md`, dizendo o que a demo tinha e o que foi medido aqui; (3) se afetar um gabarito usado por branches seguintes (por exemplo as épocas 7, 40 e 1358), atualizar este documento no mesmo PR.
- **Riscos gerais**: virar cópia (o PR traz arquivos inteiros da demo sem que o autor saiba explicar cada parte — quem revisa, ou o próprio autor ao se autorrevisar, pergunta o porquê de trechos não óbvios); estourar o prazo (a demo levou três dias de uma pessoa, mas boa parte foi estética e acabamento; os pontos de controle servem para isso); números de referência que dependem de semente, gerador aleatório, ordem das operações e velocidade da animação (se qualquer um mudar, os gabaritos de época mudam — não é defeito, mas tem que ser explicado).

## Sequência de marcos (visão geral)

1. Marco 1 — Perceptron clássico (5 portas) — *concluído*
2. Marco 2 — Adaline (5 portas, comparação) — *concluído*
3. Marco 3 — Falha do XOR/XNOR com 1 neurônio
4. Marco 4 — MLP + backprop resolvendo XOR/XNOR
5. Fase 2 — Website (D3 + KaTeX + layout final), em 7 branches: três atos (Q2, Q4, Q5) e laboratório livre
6. Documento de texto + roteiro da apresentação (em paralelo, desde o Marco 1)

Ver também `01_brainstorming.md` (decisões de escopo e stack), `02_diario.md` (log cronológico) e `03_referencias.md` (diferenciais frente a ferramentas semelhantes já existentes).
