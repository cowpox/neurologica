# NeuroLógica

Trabalho final de Redes Neurais I (UEL) — animação interativa mostrando um neurônio/rede ajustando hiperplanos para resolver as 7 portas lógicas (AND, OR, NOT, NAND, NOR, XOR, XNOR), na progressão **Perceptron → Adaline → MLP com backpropagation**.

Questões orientadoras respondidas: por que o Perceptron não resolve todo tipo de problema preditivo, por que existem diferentes funções de ativação, e como o Gradiente Descendente encontra uma solução.

**Site (GitHub Pages)**: _link a ser adicionado após o primeiro deploy da Fase 2_.

## Autores

- Adriano
- Herik Daurízio Ricardo

## Estrutura do repositório

- `prototipos/` — Fase 1: scripts Python (`numpy` + `matplotlib`) validando cada regra de aprendizagem isoladamente antes de ir para o site.
- `docs/` — Fase 2: o site em si (HTML/CSS/JS puro, D3.js + KaTeX via CDN), publicado via GitHub Pages diretamente desta pasta.
- `planejamento/` — notas de processo: instruções do trabalho, brainstorming, diário de bordo, referências/trabalhos relacionados e este planejamento.
- `entrega/` — documento de texto final enviado ao Google Classroom.

## Rodando os protótipos (Fase 1)

```bash
pip install -r requirements.txt
python prototipos/01_perceptron_gates.py --porta AND
```

## Trabalhos relacionados

Ver `planejamento/03_referencias.md` para a comparação com ferramentas semelhantes (TensorFlow Playground, Perceptron Educational Lab) e os diferenciais deste projeto.
