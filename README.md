# NeuroLógica

Trabalho final de Redes Neurais I (UEL) — animação interativa mostrando um neurônio/rede ajustando hiperplanos para resolver as 7 portas lógicas (AND, OR, NOT, NAND, NOR, XOR, XNOR), na progressão **Perceptron → Adaline → MLP com backpropagation**.

Questões orientadoras respondidas: por que o Perceptron não resolve todo tipo de problema preditivo, por que existem diferentes funções de ativação, e como o Gradiente Descendente encontra uma solução.

**Site (Vercel)**: https://neurologica.vercel.app/. Para rodar localmente, ver "Rodando o site".

## Autores

- Adriano Lúcio Uchôa Brandão
- Herik Daurizio Ricardo
- Heitor Oliveira Nunes

## Estrutura do repositório

- `prototipos/` — Fase 1: scripts Python (`numpy` + `matplotlib`) validando cada regra de aprendizagem isoladamente antes de ir para o site.
- `docs/` — Fase 2: o site em si (HTML/CSS/JavaScript puro, sem build), publicado no Vercel diretamente desta pasta. D3.js, KaTeX, GSAP e as fontes ficam copiados em `docs/vendor/` (licenças em `docs/vendor/licencas/`), então o site funciona sem internet.
- `testes/` — conferência da lógica do site (JavaScript) contra os protótipos (Python).
- `DESIGN.md` — o sistema visual do site (cores, tipografia, espaçamento, regras de uso).
- `planejamento/` — notas de processo: instruções do trabalho, brainstorming, diário de bordo, referências/trabalhos relacionados e este planejamento.
- `entrega/` — documento de texto final enviado ao Google Classroom.

## Rodando os protótipos (Fase 1)

Python 3.11 é o alvo do projeto. Crie e ative um ambiente virtual (as pastas `.venv/` e `venv/` não vão para o git):

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1      # Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
```

```bash
python prototipos/01_perceptron_gates.py --porta AND
python prototipos/02_adaline_gates.py --porta AND
python prototipos/02_adaline_gates.py --porta AND --comparar   # Perceptron x Adaline lado a lado
python prototipos/03_perceptron_xor_falha.py --porta XOR        # Marco 3 — a falha do neurônio único
python prototipos/04_mlp_backprop_xor.py --porta XOR            # Marco 4 — MLP com backpropagation
python prototipos/04_mlp_backprop_xor.py --porta XOR --testar-sementes 40   # taxa de convergência, sem animação
```

Cada script aceita `--help`. Parâmetros úteis: `--taxa` (η), `--epocas`, `--pesos-iniciais`, `--bias-inicial` e `--semente`; no Marco 4, `--ocultos`, `--ativacao`, `--sem-reinicio`, `--testar-sementes N` e `--quiet`.

## Rodando o site (Fase 2)

O site é estático e não precisa de backend. Como usa módulos ES, **não funciona abrindo o `index.html` com duplo clique**: é preciso servi-lo por HTTP.

```bash
cd docs
python -m http.server 5500
# abrir http://localhost:5500
```

Organização de `docs/js/`:

| Módulo | O que faz |
|---|---|
| `dados.js`, `treino_perceptron.js`, `treino_adaline.js`, `treino_mlp.js` | lógica de treino, traduzida dos protótipos e conferida em `testes/` |
| `desafios.js` | regra pura de conquista e de liberação de pistas (conferida em `testes/`) |
| `datasets.js` | os conjuntos de classificação do laboratório livre: círculo, XOR em quadrantes, duas gaussianas, espiral, duas meias-luas, xadrez 4×4 e yin-yang (conferidos em `testes/`) |
| `laboratorio.js`, `grafico.js`, `algoritmo.js`, `rede_visual.js` | o laboratório: controles, plano de decisão, curva de erro, equação, log e a rede |
| `ativacoes_visual.js`, `superficie_erro.js` | gavetas das funções de ativação (Ato 3) e ilustração da superfície de erro (Ato 2) |
| `pistas.js`, `notificacao.js`, `progresso.js` | pistas progressivas, aviso de conquista e progresso guardado no navegador |
| `principal.js`, `carregamento.js`, `decoracao.js`, `navegacao.js`, `acabamento.js` | início, tela de abertura, desenhos de margem, menu e detalhes de acabamento |

As conquistas e as pistas ficam só no navegador de quem usa (nada é enviado para servidor nenhum). O botão "Zerar conquistas e pistas", no rodapé, apaga esse progresso — útil para ensaiar a apresentação.

## Lógica do site e conferência Python → JavaScript (Fase 2)

A lógica de treino do site fica em `docs/js/` (`dados.js`, `treino_perceptron.js`, `treino_adaline.js` e `treino_mlp.js`), traduzida dos protótipos. O Python é a referência, e a pasta `testes/` confere se o JavaScript reproduz os mesmos números:

```bash
python testes/gerar_referencias.py   # só quando um protótipo mudar: grava testes/referencias/*.json
node testes/conferir_js.mjs          # reexecuta o JS e compara; sai com código 1 se algo falhar
```

Precisa do Node 18 ou mais novo, sem dependências. No Windows, se o Python reclamar de `UnicodeEncodeError` ao imprimir η, rode com `PYTHONUTF8=1`. Toda mudança que altere números num dos lados regenera as referências e roda a conferência no mesmo PR.

## Fluxo de trabalho em equipe

**Nunca commitar direto na `main`** — ela deve sempre refletir a versão estável do projeto. Para qualquer mudança (novo marco, correção, documentação), criar uma branch nova:

```bash
git checkout main
git pull
git checkout -b nome-da-branch   # ex.: marco2-adaline, fix-tolerancia-degrau, docs-referencias
```

Depois de terminar, subir a branch e abrir um **Pull Request** no GitHub (de preferência para alguém revisar antes de mesclar na `main`):

```bash
git push -u origin nome-da-branch
```

Revisar o PR antes de mesclar ajuda a pegar erros e manter um histórico organizado, mas **é uma recomendação, não uma obrigação**: se ninguém puder revisar a tempo, quem fez a mudança pode mesclar o próprio PR, desde que confira antes o que mudou e avise o grupo. O mesmo vale para criar branches e dividir tarefas — são boas práticas, não regras. Apagar a branch depois de mesclada (o próprio GitHub oferece isso na tela do PR).

## Trabalhos relacionados

Ver `planejamento/03_referencias.md` para a comparação com ferramentas semelhantes (TensorFlow Playground, Perceptron Educational Lab) e os diferenciais deste projeto.
