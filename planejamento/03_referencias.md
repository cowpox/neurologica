# Referências e trabalhos relacionados

Lista de ferramentas/trabalhos relacionados encontrados durante a pesquisa de prior art, para citar na seção de referências do documento de texto final e/ou na abertura da apresentação.

## Ferramentas semelhantes encontradas

### TensorFlow Playground
- **Link**: https://playground.tensorflow.org/
- **Autoria**: Daniel Smilkov e Shan Carter (Google)
- **O que é**: sandbox genérico e livre para explorar treinamento de MLPs — datasets contínuos/ruidosos (círculo, gaussiana, espiral, um padrão em xadrez que lembra XOR mas não é booleano), features extras (x1², x2², x1x2, sin), ativação selecionável (ReLU/Tanh/Sigmoid/Linear), nº de camadas/neurônios e learning rate ajustáveis.
- **O que não cobre**: equação do hiperplano visível, pseudocódigo/estado do algoritmo, distinção Perceptron vs. Adaline, portas lógicas booleanas, neurônio MCP, narrativa guiada.
- **Encontrado por**: Herik Daurízio Ricardo, em 2026-09-06.

### Perceptron Educational Lab (Virtual Labs)
- **Link**: https://dp-dei.vlabs.ac.in/exp/perceptron/simulation/interactive/index.html
- **Autoria**: Virtual Labs (plataforma educacional, projeto indiano)
- **O que é**: simulador com 5 telas — "Inside a Perceptron" (soma ponderada + ativação Step/Sigmoid), "Decision Boundary" (reta com sliders de peso/bias sobre AND/OR/XOR), "Training Animation" (play/step/reset, taxa de aprendizado, log de treino), "Convergence vs Failure" (OR converge vs. XOR oscila para sempre, lado a lado), "Perceptron vs MLP" (comparação lado a lado, MLP resolvendo XOR com fronteira não linear).
- **Sobreposição com o nosso projeto**: as telas "Training Animation" e "Convergence vs Failure" se aproximam bastante do nosso Modo 1a e da nossa "Transição" (ver `01_brainstorming.md`).
- **O que não cobre** (diferenciais do nosso projeto):
  1. Só 3 portas lógicas (AND, OR, XOR) — nada de NOT, NAND, NOR, XNOR.
  2. Nenhuma ligação com o neurônio de McCulloch-Pitts nem com a nuance de que NAND cabe em 1 neurônio com pesos aprendidos mas precisa de 2 neurônios com pesos fixos (Tópico 2 do curso).
  3. Ativação é só um toggle Step/Sigmoid, sem explicar por que existem funções de ativação diferentes (não responde de fato à questão orientadora Q4).
  4. Não tem Adaline — pula direto do Perceptron (regra discreta) para MLP com backpropagation, sem a ponte pedagógica via gradiente descendente sobre erro contínuo (Tópico 15 do curso), que dá corpo à nossa resposta à Q5.
- **Encontrado por**: Adriano, em pesquisa adicional de prior art, 2026-09-06.

## Como usar isso no trabalho

- Citar as duas ferramentas na seção de referências do documento de texto (`instrucoes_para_trabalho_final.md` pede "ilustrações, links, referências").
- Mencionar o Perceptron Educational Lab explicitamente logo na abertura da apresentação, como trabalho relacionado direto — é importante nomear a semelhança em vez de deixar a turma/professor notar por conta própria.
- Usar a lista de "o que não cobre" acima como o argumento central de diferenciação do projeto: cobertura completa das 7 portas do curso + conexão com o neurônio MCP + ponte Perceptron→Adaline→MLP + explicação real da mudança de função de ativação.

Ver também `01_brainstorming.md` (seção "Trabalhos relacionados", com o raciocínio completo) e `02_diario.md` (registro cronológico das buscas).
