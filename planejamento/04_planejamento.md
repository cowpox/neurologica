# Planejamento — do protótipo em Python ao site (projeto NeuroLógica)

Planejamento de execução do projeto descrito em `01_brainstorming.md`, cobrindo as duas fases de desenvolvimento, a divisão de trabalho e o cronograma do grupo. É o **planejamento único** do projeto.

> **Atualização (2026-10-09).** Entre 27 e 29/09, o Herik construiu uma demo completa (repositório `HerikDR/Neurologica-2`, commit `87f0795`, acessível pelo remote git `demo`) para provar que a ideia era viável. Este documento incorpora o que ela ensinou. A demo é **referência e gabarito**, não fonte de cópia: cada marco é refeito aqui, em sua própria branch, revisado por PR, com os números dela como meta a conferir. As etapas originais continuam as mesmas (Fase 1 em 4 marcos, depois o site); mudaram o grupo (agora com **três integrantes**), a hospedagem (**Vercel**), a divisão da Fase 2 em branches menores, os critérios de pronto e o cronograma. A demo é referência, não requisito: adaptamos onde o projeto pedir. Trechos alterados trazem a data; o resto é o texto original. Referências à demo aparecem como "(Decisão N da demo)" ou "(Aprendizado N da demo)" e remetem ao `06_detalhes_implementacao.md` e ao `05_aprendizados_obtidos.md` do repositório da demo.

## Equipe (2026-10-09)

| Integrante | Papel |
|---|---|
| Adriano Lúcio Uchôa Brandão | Back-end e verificações do código; apresentação; revisa PRs quando puder |
| Heitor Oliveira Nunes | Front-end e suporte |
| Herik Daurizio Ricardo | Back-end e verificações do código; integração com o front-end; apresentação |

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
- Constantes em `MAIÚSCULAS` logo depois dos imports, com um comentário dizendo **por que** o valor existe: `PORTAS_VALIDAS` (lista de nomes de porta aceitos pelo marco), `TOLERANCIA_ZERO = 1e-9`, `TOLERANCIA_SSE = 1e-4`.
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
- Parada: o Perceptron para na primeira época sem erros; o Adaline, quando $|\Delta \text{SSE}| < 10^{-4}$ entre duas épocas, no limite de épocas ou ao divergir (`not np.isfinite(sse) or sse > 1e6`). O gerador **retorna** (`return`) ao parar, e o resumo distingue convergiu, não estabilizou e divergiu.
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
- **Escolhas do Adriano** (Decisões 3 e 4 do `06_detalhes_implementacao.md`; Aprendizados 6 a 8 do `05_aprendizados_obtidos.md`): **alvos bipolares** (classe 0 → −1, classe 1 → +1) com o **mesmo `degrau` ($z \ge 0$)** do Marco 1; custo medido no fim de cada época com os pesos finais; parada quando $|\Delta E| < 10^{-4}$ (o Adaline nunca chega a erro zero), com máximo de 100 épocas e detecção de divergência; `--comparar` (Perceptron e Adaline lado a lado, mesmos pesos iniciais e η); reaproveita o Marco 1 por `importlib` (`perceptron.degrau`, `perceptron.treinar_perceptron`).
- **Relação com a demo.** A demo treinou com alvos 0/1 e limiar $z = 0{,}5$. As duas convenções são equivalentes ($z_{bip} = 2z - 1$) e dão a **mesma fronteira**, mas o custo e os pesos mudam de escala (o custo com alvos −1/+1 é 4 vezes o da demo, e o $\tfrac12$ divide por 2); portanto **os números de SSE da demo não valem como gabarito aqui**. A demo também media o SSE acumulado durante a época, que fica acima do mínimo e sobe com o η; o custo no fim da época é a métrica mais limpa, e o Aprendizado 8 (η grande demais pode prender o treino num ciclo, em vez de fazê-lo explodir) é o resultado correspondente.
- **Critério de pronto (cumprido)**: dá pra rodar Perceptron e Adaline lado a lado (mesma porta, mesma inicialização, `--comparar`) e ver a diferença de trajetória — reta "aos saltos" vs. reta suave — que é o gancho visual da Q5 (o erro contínuo permite corrigir a cada passo, e o gradiente aponta o caminho).
- **Gabarito (script do Adriano, semente 42, η = 0,1, até 100 épocas; conferido em 2026-10-12)**: as 5 portas terminam com **0 mal classificados** e o custo estabiliza; épocas e custo final: AND 43 (0,5061), OR 61 (0,5105), NAND 44 (0,5060), NOR 64 (0,5105) e NOT 85 (0,0011); primeira época com tudo certo: 3, 9, 4, 12 e 7. O mínimo teórico do custo nas portas de 2 entradas é **0,5** (4 pontos para 3 parâmetros, conferido por mínimos quadrados), e na NOT o custo tende a 0 (2 pontos e 2 parâmetros), então o valor final da NOT depende da tolerância de parada.
- **Risco (a manter em mente)**: confundir erro de ajuste (o custo) com erro de classificação (quantos pontos caem do lado errado de $z = 0$). O Adaline continua ajustando depois de classificar tudo certo (AND: certo na época 3, para na 43).

### Marco 3 — Tentando XOR/XNOR com 1 neurônio só (Transição) — branch `marco3-xor-falha` — **Herik**
- Rodar o mesmo código dos Marcos 1 e 2 nas portas XOR/XNOR, sem nenhuma mudança de arquitetura. Depende do Marco 2 (já na `main`): usa `treinar_perceptron` e `treinar_adaline` por `importlib`, seguindo as convenções da seção acima (ver os pontos de atenção 1 e 2).
- **Critério de pronto**: fica visualmente claro que o **Perceptron** nunca se estabiliza (a reta oscila e os erros nunca zeram) — confirma experimentalmente a não separabilidade linear antes de partir pra MLP.
- **(2026-10-12)** O **Adaline** se comporta de outro jeito: ele **converge**, mas para a função **constante** que melhor aproxima o XOR no sentido de mínimos quadrados, e a reta para de se mexer num lugar inútil (Aprendizado 7 da demo). Com os alvos bipolares do Marco 2, essa constante é **0** (o ponto médio de −1 e +1; na convenção 0/1 da demo era 0,5): $z \approx 0$ nos quatro pontos, e o custo mínimo do XOR é $E = 2{,}0$ (conferido por mínimos quadrados). Isso fecha o argumento pelo outro lado: não faltou treino, o limite é da **arquitetura**. Como $z$ fica colado em 0, o lado em que cada ponto cai é decidido pelo resíduo (a demo registrou 3 dos 4 pontos errados), então o relatório deve mostrar os quatro $z$ finais. Os números do Marco 3 (época em que o custo estaciona, $z$ finais) são **medidos aqui**: a demo usou alvos 0/1 e não serve de gabarito direto.
- **Risco**: dois erros que a demo cometeu no relatório do script e corrigiu — afirmar que o Adaline "convergiu" quando só bateu no limite de épocas, e reportar o acumulador de erros da época (somado com os pesos ainda mudando) em vez do veredito da reta final. O relatório deve dizer "convergiu" só quando houve convergência de fato e contar os erros **com os pesos finais** (nos dois treinos isso já vale desde a Decisão 5 do `06`: `erros_na_epoca` é o mesmo).

### Marco 4 — MLP com backpropagation (Modo 2) — branch `marco4-mlp` — **Adriano**
- Arquitetura mínima: 2 neurônios ocultos (ativação sigmoide) + 1 neurônio de saída.
- Backprop implementado à mão (regra da cadeia), sem frameworks (nem PyTorch/TensorFlow) — é o que o trabalho pede para "disponibilizar a implementação" com domínio real do algoritmo.
- Animação: as duas retas dos neurônios ocultos se formando + região combinada (interseção convexa) separando as classes do XOR + curva de erro por época.
- **(2026-10-09)** Ativação selecionável (sigmoide, tanh, ReLU), com **sigmoide como padrão** no Python. No site, o Ato 3 começa com **tanh** (η = 2) e deixa o usuário trocar de ativação (a ativação não mudou por capricho: sem derivada não há backpropagation; é a resposta à Q4, dada no Ato 3). Registrar, com `--testar-sementes`, a taxa de sucesso e a mediana de épocas de **cada** ativação (sigmoide, tanh e ReLU); esses números são a base do texto do Ato 3 e das gavetas das funções de ativação. Acrescentar `draw_network_diagram()` a `utils_plot.py` (conexões com espessura proporcional a |peso| e cor pelo sinal) e o modo `--testar-sementes N`, que mede a taxa de sucesso sem abrir a animação. A inicialização é aleatória (pesos iguais manteriam os neurônios ocultos idênticos para sempre).
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
```

Nessa fase o trabalho principal é de UI/animação (D3 transitions, KaTeX, sincronia entre as duas colunas), não de algoritmo — a lógica de treino já vem pronta e validada da Fase 1. Servidor local: `python -m http.server 5500` dentro de `docs/` (Decisão 6 da demo; abrir o `index.html` direto bloqueia módulos ES).

### Narrativa: cada ato responde uma pergunta (decidido em 2026-10-11)

A demo organizava a história por **modelo** (Ato 1: Perceptron e Adaline; Ato 2: os dois falhando no XOR; Ato 3: rede multicamada). Para a apresentação, o site passa a ser organizado por **pergunta orientadora**, da mais elementar à mais complexa e em ordem histórica: **Q2 → Q5 → Q4**. A ordem Q2 → Q4 → Q5 chegou a ser considerada e foi descartada no mesmo dia, porque o argumento da Q4 (a ativação precisa de derivada) pressupõe a ideia de gradiente da Q5; qualquer mudança futura é decisão do grupo. O mesmo componente de laboratório é reaproveitado, só mudando a configuração. A demo é referência, não requisito: onde a pergunta pedir algo diferente dela, adaptamos.

| Ato | Pergunta | Modelo | Laboratório | Aproveita da demo |
|---|---|---|---|---|
| **1** | **Q2** — por que o Perceptron não resolve todo tipo de problema? | Perceptron | modo Perceptron, 7 portas: as 5 separáveis convergem; XOR e XNOR falham | Ato 1 (parte Perceptron), Ato 2 (parte Perceptron) e o card do NAND |
| **2** | **Q5** — como o gradiente descendente encontra uma solução? | Adaline | modos Adaline (padrão) e Perceptron, 7 portas | Ato 1 (parte Adaline) e o card do Adaline que "converge para a constante" no XOR |
| **3** | **Q4** — por que existem diferentes funções de ativação? | MLP 2-2-1 com backpropagation | modo MLP, **rede fixa 2-2-1**, seletor de ativação e de η | Ato 3 sem os botões +/−, com o card do mínimo local e do reinício |
| **Bônus obrigatório** | — | rede livre | modo MLP **editável**, 7 portas, ativação, η e demais parâmetros | Ato 3 completo da demo |

**Como cada ato responde** (resposta em uma frase, que vira o fecho do ato e o roteiro da fala):
- **Q2:** um neurônio só traça uma reta, e XOR/XNOR não têm reta que os separe; o Perceptron corrige um ponto e estraga outro, e nunca para.
- **Q5:** o gradiente aponta para onde o erro cai mais depressa; o Adaline mede o erro antes da decisão e dá um passo nessa direção a cada iteração, com o η controlando o tamanho do passo. Num neurônio a descida encontra o melhor ajuste possível, mesmo quando ele é inútil (no XOR, uma constante: 0 com os alvos −1/+1 do Marco 2, o ponto médio entre as classes). A mesma ideia atravessa camadas no Ato 3.
- **Q4:** para o gradiente atravessar camadas, a ativação precisa ser **não linear** (uma composição de funções lineares é linear: $W_2(W_1x+b_1)+b_2=(W_2W_1)x+(W_2b_1+b_2)$, uma reta só) e **diferenciável** (o degrau tem derivada zero, e a regra da cadeia anula o gradiente). Sigmoide, tanh e ReLU atendem, e diferem em faixa de saída, saturação e velocidade de convergência (números medidos no Marco 4).

**Elementos novos em relação à demo** (só HTML, texto e gráficos estáticos, a cargo do Heitor): mapa das três perguntas no topo da página, com cada uma apontando para o seu ato; selo "Respondendo à Q_" no início de cada ato; a resposta em uma frase no fim; um **resumo final** com as três respostas, antes de "Trabalhos relacionados"; e, no Ato 3, o card matemático e as gavetas das funções de ativação, descritos abaixo.

**Card matemático do Ato 3 (Q4).** Três passos curtos em KaTeX, nos dois temas, sem laboratório: (1) a composição de funções lineares é linear, com a conta acima; (2) a derivada do degrau é 0 onde existe e indefinida em 0, então a regra da cadeia zera o gradiente que chegaria às camadas anteriores; (3) as derivadas das ativações usadas: sigmoide $\sigma' = \sigma(1-\sigma)$, tanh $1-\tanh^2$ e ReLU 0 ou 1. Demonstrar por conta, e não por experimento no laboratório, foi decisão do grupo.

**Gavetas das funções de ativação (Ato 3, decidido em 2026-10-11).** Logo abaixo do card matemático, cinco `<details class="gaveta">` fechadas por padrão: degrau, linear (identidade, a saída do Adaline), sigmoide, tanh e ReLU. Cada gaveta traz o nome, a **fórmula e a derivada em KaTeX**, uma frase sobre o que a função faz e o seu limite (degrau: decide, mas o gradiente é zero; linear: permite corrigir sempre, mas só gera retas; sigmoide: saída em $(0,1)$ e saturação nas pontas; tanh: saída em $(-1,1)$, centrada em zero; ReLU: sem saturação para $z>0$, com o risco do "neurônio morto" que a demo já documenta) e, **embaixo, o gráfico** de $f(z)$ e de $f'(z)$. É viável e barato, porque a demo já tem os ingredientes: gavetas `<details>` (Decisão 12 da demo), KaTeX, D3 e o objeto `ATIVACOES` em `treino_mlp.js`, com `f` e `derivadaDaSaida` de tanh, sigmoide e ReLU. O gráfico deve usar **as mesmas funções do treino** (fonte única: o que se vê é o que treina), calculando $f'(z)$ como `derivadaDaSaida(f(z))`; degrau e linear não são usadas pela MLP e ficam definidos no módulo das gavetas (o `degrau` já existe em `dados.js`). Cuidados: o degrau tem salto em $z=0$ e derivada indefinida, então o gráfico mostra o ponto como aberto e a derivada como zero fora da origem; as cores vêm das variáveis `--grafico-*`; sem rolagem horizontal a 320 px; os gráficos são estáticos, sem animação nem `<canvas>`. Opcional, sem exigência: destacar a gaveta da ativação escolhida no seletor do laboratório.

**Dependências entre as respostas (a ter em mente ao escrever o texto)**: o Ato 2 já introduz o gradiente com o Adaline; o Ato 3 mostra que, para ele atravessar camadas, a ativação importa. O texto do Ato 2 deve terminar apontando para essa pergunta ("como o erro volta por uma camada?"), e o card do mínimo local no fim do Ato 3 deve dizer que ele também fecha a Q5 (o gradiente é um método local).

**Ponto fraco conhecido (Q5)**: no Ato 2, a descida do gradiente é mostrada pela curva de erro e pela reta que desliza, e a "ladeira" (o erro como superfície) é apenas sugerida. É mitigado pela **ilustração da superfície de erro**, descrita a seguir.

**Ilustração da superfície de erro (Ato 2, decidido em 2026-10-11).** Desenho de fundo no estilo de uma função de perda em 3D: malha em perspectiva só com **linhas** (sem mapa de calor), na paleta e no traço da página, com uma trilha que desce até o fundo e, projetadas no piso, as curvas de nível. Serve a dois objetivos: dar à página uma parte estética e mostrar visualmente a ideia de função de perda e de descida, sem criar um componente novo de interface. Ressalvas que valem registrar:
- **É uma ilustração, não o gráfico real do laboratório.** A legenda deve dizer isso ("ilustração: o erro de um neurônio em função dos pesos"). Mostrar a perda de verdade exigiria calcular o SSE do laboratório sobre uma grade de pesos e marcar nela os pesos atuais; isso é uma versão com dados, descrita em "Ideias fora do escopo".
- **A forma importa para a Q5.** O SSE de um neurônio linear é quadrático nos pesos: uma **única bacia, sem mínimos locais**. Por isso a superfície do Ato 2 é um **vale suave**, e não a superfície irregular com várias bacias da figura de referência. Essa, sim, representa a rede multicamada, e o seu lugar natural é o card do mínimo local do Ato 3 (uso **opcional**: a mesma superfície com duas trilhas, uma que trava numa bacia rasa e outra que, após o reinício, chega ao fundo). Em ambos os casos é uma metáfora de poucas dimensões, e a legenda deve avisar.
- **Desenho próprio.** A figura de referência é só inspiração de forma e de composição; o desenho é gerado por nós, na estética da página.
- **Como fazer (viável com o que já está no projeto).** Uma função `z(x, y)` avaliada numa grade pequena, projetada em perspectiva e desenhada em SVG com D3 (as curvas de nível do piso saem de `d3.contours`, que faz parte do D3 em `vendor/`). Para as linhas de trás ficarem escondidas, desenhar as células de trás para a frente, preenchidas com a cor do papel e com traço de linha. Gerar **uma vez** (na carga, no redimensionamento e na troca de tema), nunca a cada quadro. Se a função for um parâmetro, a mesma peça serve para o vale do Ato 2, para a superfície irregular do Ato 3 e, se algum dia valer a pena, para o SSE real.
- **A visualização vence a estética** (regra herdada da demo): a ilustração fica atrás do texto, fora do laboratório, com baixo contraste, e o texto sobre ela mantém contraste mínimo de 4,5:1 (medido). Em telas estreitas, entra no fluxo ou some, como as demais ilustrações de margem da demo.

**Laboratório livre (bônus obrigatório)**: seção no fim da mesma página, depois do Ato 3, com a rede editável (1 a 4 camadas ocultas e 1 a 6 neurônios por camada, limites da demo, mantidos por legibilidade) e controle sobre porta (qualquer das 7), ativação, taxa de aprendizado e velocidade — que a demo já tem — mais **semente, reinício automático ligado/desligado e máximo de épocas**, que o `TreinoMLP` já aceita mas a demo não expõe na interface. É um bônus no sentido de não bloquear a narrativa, mas **obrigatório** no sentido de que entra no escopo e deve estar pronto antes do congelamento.

**Tudo o que a demo tem entra no escopo** (decisão de 2026-10-09): rede editável com mini-gráfico por neurônio, tela de abertura, menu móvel, indicador de seção e acabamento. O que muda é a posição de cada coisa; a rede editável saiu do Ato 3 e foi para o laboratório livre.

**Ideias fora do escopo** (não existem na demo; ficam registradas e só voltam ao plano se sobrar tempo no ponto de controle de 06/11): a **ladeira do erro com dados reais** — o SSE da porta escolhida calculado numa grade de pesos (com o viés fixo) e um marcador, com trilha, nos pesos atuais do laboratório. Reaproveita a mesma função de desenho da ilustração, trocando a superfície inventada pela real; o custo extra é o cálculo da grade e a ligação com o treino (viés e projeção a decidir).

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
| `fase2-logica` | `dados.js`, `treino_*.js` + script de conferência em `testes/` | Herik | Marcos 1 a 4 |
| `fase2-laboratorio` | `laboratorio.js`, `grafico.js`, `algoritmo.js`, `principal.js` e os textos dos Atos 1 e 2 (neurônio único, Q2 e Q5), com mapa das perguntas, selos, resposta em uma frase e a regra de um laboratório rodando por vez | Heitor; Herik integra | `fase2-base`, `fase2-logica` |
| `fase2-rede-mlp` | `rede_visual.js` e o Ato 3 (Q4) com **rede fixa 2-2-1** (mini-gráficos, conexões com brilho, seletor de ativação e de η), o card matemático, as gavetas das funções de ativação e o resumo final | Heitor; Herik integra | `fase2-laboratorio` |
| `fase2-laboratorio-livre` | laboratório livre (bônus obrigatório): botões +/−, controles extras (semente, reinício, máximo de épocas) | Heitor (interface); Herik (controles e integração) | `fase2-rede-mlp` |
| `fase2-estetica` | abertura, decoração, logotipo, `DESIGN.md` e a ilustração da superfície de erro (Ato 2; opcionalmente também no card do mínimo local do Ato 3) | Heitor | `fase2-base` |
| `fase2-acabamento` | menu móvel, indicador de seção, atalhos, termos com (?), dica de primeira visita | Heitor | `fase2-laboratorio` |

**`fase2-base`**
- Pronto quando: `python -m http.server 5500` dentro de `docs/` abre a página sem erros de console e funciona sem internet; primeiro deploy no Vercel só depois de resolvidas as pendências da seção "Vercel".

**`fase2-logica`**
- Pontos a entender: `TOLERANCIA_ZERO = 1e-9` no `degrau` (Aprendizado 4); gerador `mulberry32`, porque `Math.random()` não aceita semente e a reprodutibilidade importa para repetir experimentos ao vivo; MLP generalizada para várias camadas, porque a arquitetura será editável no laboratório livre; reinício por janela (Aprendizado 9 da demo).
- Pronto quando um script em Node (`testes/`, mantido pelo Herik) roda as 7 portas e mostra: Perceptron e Adaline com o mesmo desfecho do Python para a mesma porta e os mesmos pesos iniciais (a época pode diferir em casos de fronteira, Aprendizado 4); o `treino_adaline.js` **segue as convenções do Marco 2** (alvos −1/+1, `degrau` em $z \ge 0$ com tolerância, custo $\tfrac12\sum$ no fim da época e parada em $10^{-4}$), e a versão da demo, que usava alvos 0/1 e limiar 0,5, deve ser adaptada, não copiada; MLP convergindo nas arquiteturas que a demo testou (`[2]`, `[4]`, `[4,2]`, `[4,2,2]`); reinício disparando no XOR quando a rede empaca. Até lá nenhum módulo de interface é mesclado sobre ele.
- Risco: **os números de referência do site (épocas 7, 40 e 1357) vêm do gerador `mulberry32` com semente 42, que não sorteia os mesmos pesos iniciais que o `numpy` com semente 42** (no Python, o Perceptron do AND converge em 3 épocas, não em 7). Por isso a conferência Python × JS usa **pesos iniciais manuais** idênticos nos dois lados, e os números do site valem só para o JS; se o gerador mudar, os gabaritos de época mudam.

**`fase2-laboratorio`**
- Pronto quando, com semente 42 (determinístico): **Ato 1** (Perceptron, AND, η = 0,1) converge na **época 7**, 4/4, e (Perceptron, XOR) para na **época 40** sem resolver; **Ato 2** reproduz os números do Python dos Marcos 2 e 3 (Adaline nas 5 portas com 0 mal classificados, por exemplo AND em 43 épocas com custo 0,5061 e η = 0,1, e no XOR o custo estaciona com $z \approx 0$ nos quatro pontos, número medido no Marco 3), e o contraste Perceptron × Adaline (erro em escada × curva contínua) é visível trocando o modo no mesmo laboratório; sem rolagem horizontal a 320, 390, 820 e 1440 px.
- Pronto quando o **mapa das perguntas**, os **selos** e a **resposta em uma frase** de cada ato existem e as âncoras do mapa levam ao ato certo.
- Pronto quando **iniciar um laboratório pausa os outros**, cada um preservando o seu estado e retomando de onde parou (regra do componente `Laboratorio`, que vale também para o Ato 3 e para o laboratório livre; os labs da demo já começam pausados).

**`fase2-rede-mlp`**
- Pronto quando: **Ato 3** (XOR, rede `[2]`, tanh, η = 2) converge na **época 1357**, 4/4, com o reinício automático visível na curva de erro; a rede **não tem botões +/−** (arquitetura fixa); folga de **0 px** entre a ponta de cada conexão e o neurônio a 390 px; nenhuma barra de rolagem na rede; ampliar um neurônio por toque e desfazer com outro toque (ou toque fora); os botões (?) da rede e do laboratório que a demo tinha existem e abrem dentro da tela (na demo, dois deles sumiram na reescrita para SVG único sem que nenhum teste percebesse — o teste deve listar o que **deve existir**, não só o que não deve quebrar); o seletor de ativação troca entre sigmoide, tanh e ReLU, e a convergência de cada uma bate com a tabela medida no Marco 4; o **card matemático** e as **cinco gavetas** (degrau, linear, sigmoide, tanh, ReLU) existem, cada uma com fórmula e derivada em KaTeX nos dois temas e o gráfico de $f(z)$ e $f'(z)$ embaixo; o gráfico das três ativações da MLP usa o mesmo `ATIVACOES` do treino, e valores de conferência batem ($\sigma(0)=0{,}5$, $\tanh(0)=0$, $\mathrm{ReLU}(-1)=0$); sem rolagem horizontal a 320 px; o **resumo final** com as três respostas está antes de "Trabalhos relacionados".
- Risco: reconstruir a rede como HTML com SVG por cima traz de volta os três defeitos da Decisão 10.

**`fase2-laboratorio-livre`**
- Pronto quando: é possível adicionar e remover camadas (1 a 4) e neurônios (1 a 6) e escolher porta (as 7), ativação, η, velocidade, semente, reinício automático ligado ou desligado e máximo de épocas; com a configuração do Ato 3 (rede `[2]`, tanh, η = 2, semente 42, XOR), o resultado é o mesmo do Ato 3 (**época 1357**); com 3 camadas a 390 px, folga de **0 px** entre conexões e neurônios e nenhuma barra de rolagem.
- Risco: a demo só rodou 3 laboratórios na mesma página e este seria o quarto. A regra de **um laboratório rodando por vez** (ver `fase2-laboratorio`) elimina o custo de animações simultâneas; sobra o custo de manter 4 laboratórios montados, que é pequeno com todos pausados. Mesmo assim, medir rapidamente no celular antes de mesclar. Se ainda pesar, o laboratório livre vira uma página própria (linkada do fim do Ato 3).

**`fase2-estetica` e `fase2-acabamento`**
- Pronto quando os números dos três atos e do laboratório livre continuam exatamente iguais aos das branches anteriores: a estética nunca muda o que o gráfico desenha.
- Pronto quando a **ilustração da superfície de erro** do Ato 2 existe só com linhas (sem mapa de calor), na paleta da página nos dois temas, com legenda que a declara ilustração; o vale tem uma só bacia; é gerada uma vez (não a cada quadro); não cria rolagem horizontal de 320 a 1440 px; e o texto do Ato 2 sobre ela mantém contraste de pelo menos 4,5:1.

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

Pontos de controle: **30/10** (Fase 1 validada) e **06/11** (três atos funcionando). Como o escopo é "tudo o que a demo tem", é nesses pontos que o grupo decide, com o código na mão, o que fazer se algum item estiver atrasado. O laboratório livre é obrigatório mas vem por último na fila de desenvolvimento, porque não bloqueia a narrativa: se faltar tempo, os três atos já estão completos. É também em 06/11 que se decide se alguma das "ideias fora do escopo" cabe.

## Ordem de execução, dependências e riscos (2026-10-09)

```
docs-plano-importacao
   ├─ marco2 [concluído] ─ marco3-xor-falha ┐
   ├─ marco4-mlp ───────────────────────────┴─ fase2-logica ─┐
   └─ fase2-base ─┬──────────────────────────────────────────┴─ fase2-laboratorio ─ fase2-rede-mlp ─ fase2-laboratorio-livre
                  ├─ fase2-estetica                              └─ fase2-acabamento
```

- `marco3-xor-falha` depende do Marco 2 (já na `main`); `fase2-logica` depende dos três marcos; `fase2-base` e `fase2-estetica` não dependem dos marcos e andam em paralelo; o **deploy** depende de resolver o Vercel.
- **Se uma branch descobrir algo que contradiz a demo** (um número que não bate, um comportamento diferente): (1) não ajustar o código até "bater com a demo" — primeiro descobrir **qual dos dois está certo**, como foi feito no Aprendizado 4 com a conta à mão; (2) registrar a divergência no `05_aprendizados_obtidos.md`, dizendo o que a demo tinha e o que foi medido aqui; (3) se afetar um gabarito usado por branches seguintes (por exemplo as épocas 7, 40 e 1357), atualizar este documento no mesmo PR.
- **Riscos gerais**: virar cópia (o PR traz arquivos inteiros da demo sem que o autor saiba explicar cada parte — quem revisa, ou o próprio autor ao se autorrevisar, pergunta o porquê de trechos não óbvios); estourar o prazo (a demo levou três dias de uma pessoa, mas boa parte foi estética e acabamento; os pontos de controle servem para isso); números de referência que dependem de semente, gerador aleatório, ordem das operações e velocidade da animação (se qualquer um mudar, os gabaritos de época mudam — não é defeito, mas tem que ser explicado).

## Sequência de marcos (visão geral)

1. Marco 1 — Perceptron clássico (5 portas) — *concluído*
2. Marco 2 — Adaline (5 portas, comparação) — *concluído*
3. Marco 3 — Falha do XOR/XNOR com 1 neurônio
4. Marco 4 — MLP + backprop resolvendo XOR/XNOR
5. Fase 2 — Website (D3 + KaTeX + layout final), em 7 branches: três atos (Q2, Q4, Q5) e laboratório livre
6. Documento de texto + roteiro da apresentação (em paralelo, desde o Marco 1)

Ver também `01_brainstorming.md` (decisões de escopo e stack), `02_diario.md` (log cronológico) e `03_referencias.md` (diferenciais frente a ferramentas semelhantes já existentes).
