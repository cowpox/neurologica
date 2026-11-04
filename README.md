# NeuroLógica

Trabalho final de Redes Neurais I (UEL) — animação interativa mostrando um neurônio/rede ajustando hiperplanos para resolver as 7 portas lógicas (AND, OR, NOT, NAND, NOR, XOR, XNOR), na progressão **Perceptron → Adaline → MLP com backpropagation**.

Questões orientadoras respondidas: por que o Perceptron não resolve todo tipo de problema preditivo, por que existem diferentes funções de ativação, e como o Gradiente Descendente encontra uma solução.

**Site (GitHub Pages)**: _link a ser adicionado após o primeiro deploy da Fase 2_.

## Autores

- Adriano Lúcio Uchôa Brandão
- Herik Daurizio Ricardo
- Heitor Oliveira Nunes

## Estrutura do repositório

- `prototipos/` — Fase 1: scripts Python (`numpy` + `matplotlib`) validando cada regra de aprendizagem isoladamente antes de ir para o site.
- `docs/` — Fase 2: o site em si (HTML/CSS/JS puro, D3.js + KaTeX via CDN), publicado via GitHub Pages diretamente desta pasta.
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
```

Cada script aceita `--help`. Parâmetros úteis: `--taxa` (η), `--epocas`, `--pesos-iniciais`, `--bias-inicial` e `--semente`.

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
