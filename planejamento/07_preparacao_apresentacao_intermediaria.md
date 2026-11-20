# Atividade intermediária — roteiro para a apresentação oral (2026-11-04)

Material de preparo do grupo NeuroLógica (Adriano, Herik, Heitor) para a atividade intermediária pedida pelo professor, antes da apresentação final (25/11).

**A atividade tem duas partes:**

1. Pesquisar e apresentar as questões **01, 03, 08 e 09** (todos os grupos).
2. Apresentar **como pretendemos responder as nossas questões** (Q2, Q5 e Q4) e **ranquear, por prioridade, as questões dos outros grupos**. O ranking vai como anexo na tarefa do Classroom.

> Todos os números citados abaixo foram **rodados ou conferidos por código** nesta preparação, ou vêm dos registros do projeto (`05_aprendizados_obtidos.md`). Os itens de teoria com autor e ano são resultados clássicos da literatura; vale conferir a referência antes de citar o ano em voz alta se alguém duvidar.

---

## 0. Plano de fala (sugestão, ~13 min)

| Bloco | Tempo | Quem (sugestão) | Conteúdo |
|---|---|---|---|
| Abertura | 0:30 | Herik | O fio condutor: *um neurônio traça uma reta → uma rede dobra o espaço → os dados reais são difíceis, mas têm estrutura*. |
| Q1 — neurônio aprende | 2:00 | Herik | Regra do Perceptron e do Adaline, com a conta do AND na lousa. |
| Q3 — rede aprende funções difíceis | 2:30 | Adriano | XOR = AND(OR, NAND), backprop e o que dá errado (mínimos locais). |
| Q8 — alta dimensionalidade | 2:00 | Heitor | Mini-demo numérica (apêndice A). |
| Q9 — variedades | 2:00 | Heitor ou Adriano | A hipótese da variedade e a ligação com a camada oculta. |
| Nosso trabalho (Q2, Q5, Q4) | 3:00 | Adriano e Herik | Seção 2. |
| Ranking | 1:00 | quem sobrar | Seção 3: top 5 em voz alta, o resto no anexo. |

- A divisão de quem fala é **sugestão**: o professor avalia "participação equilibrada", então ajustem para que os três falem.
- **Se o tempo for menor**, use só a "Resposta em 20 segundos" de cada questão e vá direto à seção 2.
- Não leiam o texto: cada seção traz a ideia em frases curtas, para falar olhando a turma.

---

## 1. As quatro questões da atividade

A ordem que melhor conta uma história é **1 → 3 → 8 → 9**: o neurônio (reta) → a rede (várias retas compostas) → por que dados reais são difíceis → por que, apesar disso, aprender é possível.

### Q1 — Como um neurônio artificial aprende?

**Resposta em 20 segundos.** Um neurônio calcula uma soma ponderada das entradas e decide. Aprender é **ajustar os pesos para reduzir o erro**: compara-se a saída com a resposta certa e empurra-se cada peso um pouco na direção que diminuiria o erro, em proporção à entrada que participou. Geometricamente, os pesos definem uma reta (um hiperplano) e aprender é **mover essa reta** até ela separar as classes.

**Explicação.**

O neurônio faz $z = w_1x_1 + w_2x_2 + b$ e depois decide por uma função de ativação (o degrau: $\hat y = 1$ se $z \ge 0$). A fronteira de decisão é o conjunto $z = 0$: uma reta no plano. O vetor $(w_1, w_2)$ é perpendicular a ela e aponta para o lado da classe 1. O $b$ desloca a reta sem girá-la.

Duas regras de ajuste, as duas "$w \leftarrow w + \eta \cdot (\text{erro}) \cdot x$":

| | Perceptron (Rosenblatt, 1958) | Adaline (Widrow e Hoff, 1960) |
|---|---|---|
| Erro | $y - \hat y$ (depois do degrau) | $y - z$ (antes do degrau) |
| Valores do erro | $-1$, $0$ ou $+1$ | qualquer número real |
| Quando corrige | só quando erra a classe | sempre, mesmo acertando |
| Pergunta que responde | "acertei?" | "quão longe fiquei?" |

O $\eta$ (taxa de aprendizado) é o tamanho do passo.

**A conta do AND para fazer na lousa** (pesos iniciais $0, 0$, $b=0$, $\eta = 0{,}1$; conferida por código):

| Exemplo | $z$ | $\hat y$ | $y$ | O que acontece |
|---|---|---|---|---|
| $(0,0)$ | $0$ | $1$ | $0$ | erro $-1$ → $b = -0{,}1$ (os $w$ não mudam, porque $x=0$) |
| $(0,1)$ | $-0{,}1$ | $0$ | $0$ | certo, nada muda |
| $(1,0)$ | $-0{,}1$ | $0$ | $0$ | certo, nada muda |
| $(1,1)$ | $-0{,}1$ | $0$ | $1$ | erro $+1$ → $w = (0{,}1;\ 0{,}1)$, $b = 0$ |

Dá para ver a reta se mexer só quando erra. Esse AND, com pesos iniciais zero, converge na época 6 (conferido contra aritmética exata; com pesos aleatórios, semente 42, converge na época 3).

**Ligação com o NeuroLógica.** É exatamente o Marco 1 (Perceptron) e o Marco 2 (Adaline) e o conteúdo dos Atos 1 e 2 do site. Dois achados nossos que rendem boa conversa:

- O Perceptron **para na primeira reta que acerta tudo**, mesmo encostada num ponto (a reta convergida só pode tocar pontos de classe 1: Aprendizado 5). O Adaline continua ajustando e **centraliza** a reta entre as classes (AND: acerta tudo na época 3, mas só para na 43; Aprendizado 7).
- O Adaline é uma **regressão linear** usada como classificador: o melhor plano pelos alvos $-1/+1$ no AND dá custo mínimo $0{,}5$, e é isso que o gráfico mostra (Aprendizado 9).

**Pergunta para a turma.** "Se o neurônio já acerta os 4 pontos, por que o Adaline continua mexendo na reta?"

**Perguntas que podem fazer.**
- *Por que o bias?* Sem ele a reta é obrigada a passar pela origem. É só um peso com entrada fixa $1$ (Aprendizado 3).
- *Sempre converge?* O Perceptron converge **se** os dados são linearmente separáveis (teorema de convergência do Perceptron). Se não são, não converge: é o tema da Q2.

---

### Q3 — Como uma rede aprende funções difíceis?

**Resposta em 20 segundos.** "Difícil" aqui quer dizer que **uma reta não basta**. A rede aprende empilhando neurônios: a camada oculta **cria novas características** (cada neurônio oculto traça a sua reta) e a camada seguinte combina essas características numa decisão simples. Para ajustar tudo junto, o erro da saída é **propagado de volta** pelas camadas com a regra da cadeia (backpropagation), e cada peso recebe a sua parcela de culpa.

**Explicação.**

*O que muda do neurônio para a rede.* Um neurônio só separa o que uma reta separa. O XOR não é assim: os pontos de classe 1 estão em diagonais opostas, não há reta que isole uma classe. A saída é **mudar a representação** antes de decidir.

*A construção exata do XOR* (Tópico 18 do curso): $\text{XOR} = \text{AND}(\text{OR},\ \text{NAND})$. Cada neurônio oculto aprende uma porta linear e o de saída as combina:

| $(x_1, x_2)$ | $h_1$ = OR | $h_2$ = NAND | saída = AND($h_1,h_2$) |
|---|---|---|---|
| $(0,0)$ | 0 | 1 | **0** |
| $(0,1)$ | 1 | 1 | **1** |
| $(1,0)$ | 1 | 1 | **1** |
| $(1,1)$ | 1 | 0 | **0** |

No espaço $(h_1,h_2)$, os pontos de classe 1 ficam ambos em $(1,1)$, e os de classe 0 em $(0,1)$ e $(1,0)$: **agora uma reta separa** (por exemplo $h_1 + h_2 = 1{,}5$). A rede não resolveu um problema difícil: ela **transformou o problema difícil num problema fácil**.

*Como ela encontra isso sozinha — backpropagation, em três passos:*
1. **Para frente:** calcula as saídas camada por camada e o erro final.
2. **Para trás:** o erro da saída é distribuído às camadas anteriores pela regra da cadeia, $\delta_{\text{oculta}} = (W^\top \delta_{\text{saída}}) \odot f'(z_{\text{oculta}})$.
3. **Ajusta** cada peso com o gradiente descendente, o mesmo princípio do Adaline, só que atravessando camadas.

*Duas condições na ativação* (resposta curta à Q4): ela precisa ser **não linear** (senão as camadas colapsam numa só: $W_2(W_1x+b_1)+b_2 = (W_2W_1)x + (W_2b_1+b_2)$, uma reta) e **diferenciável** (o degrau tem derivada 0, e a regra da cadeia zeraria o gradiente).

*O que é "garantido" e o que não é.* O teorema da aproximação universal (Cybenko, 1989; Hornik, 1991) diz que **uma camada oculta suficientemente larga** pode aproximar qualquer função contínua. Isso diz que a solução **existe**, não que o gradiente descendente a **encontra**, nem quantos neurônios são necessários. É um ponto crítico bom para a discussão.

**Ligação com o NeuroLógica e números medidos.** É o Marco 4 e o Ato 3. Nossos testes com a MLP 2-2-1 (XOR, $\eta = 2$, 20 sementes; **preliminares**: o script `04_mlp_backprop_xor.py` ainda está em andamento na branch `marco4-mlp`, não commitado):

| Ativação oculta | Sementes que convergiram | Mediana de épocas |
|---|---|---|
| sigmoide | 20/20 | 1802 |
| tanh | 20/20 | 333 |
| ReLU | 16/20 | 804 |

Com sigmoide, $\eta = 0{,}5$ e **sem** reinício automático, só **15/20** sementes convergem (a demo anterior media 14/20). O motivo: a rede 2-2-1 tem **mínimos locais** reais, e o gradiente descendente é um método **local**: vai para a bacia onde começou. Nossa solução é detectar a estagnação e **reiniciar** de outro sorteio (mantendo os 2 neurônios ocultos da narrativa), o que dá 100% nas ativações suaves. Isso responde honestamente "a rede sempre aprende?": **não, não há garantia**.

**Pergunta para a turma.** "Se os dois neurônios ocultos começassem com pesos exatamente iguais, o que aconteceria?" (Resposta: ficariam idênticos para sempre, porque recebem o mesmo gradiente; a inicialização aleatória quebra a simetria.)

**Perguntas que podem fazer.**
- *Por que 2 neurônios ocultos?* É o mínimo para o XOR (duas retas). Com mais, converge mais fácil, mas decidimos não adicionar neurônios só para forçar convergência.
- *E para funções realmente difíceis (imagem, voz)?* Mais camadas: cada uma compõe sobre a anterior (bordas → partes → objetos). Há resultados teóricos de que certas funções exigem muito menos neurônios com profundidade do que com uma só camada larga.

---

### Q8 — Por que dados de alta dimensionalidade são difíceis?

**Resposta em 20 segundos.** Porque o espaço **cresce exponencialmente** com o número de dimensões e os dados não acompanham: com a mesma quantidade de exemplos, tudo fica **esparso e a distância deixa de discriminar**. Isso é a "maldição da dimensionalidade" (Bellman, 1961). Também há mais parâmetros do que exemplos, o que favorece o sobreajuste.

**Explicação, em quatro fenômenos.**

1. **Os dados ficam esparsos.** Para cobrir cada eixo com 10 intervalos é preciso $10^d$ células: 100 em $d=2$, $10^{10}$ em $d=10$. Nunca há exemplos para encher esse espaço.
2. **O volume migra para as bordas.** A bola inscrita no cubo unitário ocupa $78{,}5\%$ do cubo em $d=2$, $52{,}4\%$ em $d=3$, $0{,}25\%$ em $d=10$ e $2{,}5\times10^{-8}$ em $d=20$. Quase todo o volume fica nos "cantos", longe do centro.
3. **As distâncias se concentram.** Em pontos aleatórios, o mais distante é muito mais longe que o mais próximo em 2D e quase igual em 1000D. Medimos com 500 pontos: $(\text{máx}-\text{mín})/\text{mín}$ vale $40{,}7$ em $d=2$, $4{,}7$ em $d=10$, $0{,}36$ em $d=100$ e $0{,}11$ em $d=1000$. Quando "vizinho mais próximo" e "mais distante" quase não diferem, métodos baseados em distância (k-NN, clusterização) perdem sentido (Beyer et al., 1999).
4. **Mais parâmetros que exemplos.** Com $p \gg n$, um modelo flexível decora os dados (Q6).

*Mas há um lado favorável, que é a pegadinha boa:* em dimensão alta, os dados tendem a ficar **mais fáceis de separar linearmente** (teorema de Cover, 1965). Foi o que o XOR fez: ao acrescentar a característica $x_1x_2$, o problema de 2D vira linearmente separável em 3D. A camada oculta é uma forma de **aprender** esse espaço maior ou melhor.

**Ligação com o NeuroLógica.** Dois pontos concretos e já verificados:

- **A capacidade de um neurônio colapsa com o número de entradas.** Das $2^{2^n}$ funções booleanas de $n$ entradas, um único neurônio realiza só as linearmente separáveis. Contamos por programação linear: $n=1$: 4 de 4; $n=2$: **14 de 16** (todas menos XOR e XNOR); $n=3$: **104 de 256** ($41\%$). Para $n=4$ a literatura dá 1882 de 65536 ($3\%$, OEIS A000609; este não rodamos). Com 2 entradas, só 2 funções falham; com 4, quase todas.
- **Por isso nosso projeto vive em 2D de propósito:** é a única dimensão em que dá para **ver** a fronteira. Vale dizer isso com honestidade: o que mostramos não escala visualmente.

**Pergunta para a turma.** "Em 100 dimensões, vocês confiam em 'o vizinho mais próximo' para classificar? Por quê?"

**Perguntas que podem fazer.**
- *Qual a solução?* Reduzir a dimensão (Q15: PCA, autoencoders), regularizar, ter mais dados, escolher bons atributos e **explorar o fato de que dados reais não preenchem o espaço** (Q9).
- *Mais dimensões é sempre ruim?* Não: pode facilitar a separação (Cover, SVM com kernel), desde que haja dados e controle de complexidade.

---

### Q9 — O que são variedades (*manifolds*) e por que elas importam?

**Resposta em 20 segundos.** Uma variedade é uma superfície que, vista de perto, parece um espaço plano de poucas dimensões, mesmo estando dobrada num espaço maior. Uma folha de papel enrolada é 2D, embora esteja em 3D. Importam porque **os dados reais não preenchem o espaço de alta dimensão: concentram-se perto de variedades de dimensão baixa** (a "hipótese da variedade"). É isso que torna aprender possível apesar da Q8.

**Explicação.**

- **Exemplos clássicos:** um círculo no plano (curva 1D vivendo em 2D); a superfície de uma esfera (2D em 3D); o "rolo suíço" (folha 2D enrolada em 3D). Em todos, poucos números locais bastam para localizar um ponto (um ângulo no círculo, duas coordenadas na folha).
- **Exemplo de dado real:** uma imagem de $28\times28$ tem 784 números. Mas fotografar o mesmo dígito em vários ângulos varia **um** parâmetro (o ângulo); as imagens formam uma curva em 784 dimensões. A maioria dos 784 pixels aleatórios nem parece um dígito: o espaço é imenso, mas os dados ocupam uma fatia minúscula e organizada.
- **Por que importa para aprender:** (1) explica por que modelos funcionam em dimensão alta (o problema "efetivo" tem poucos graus de liberdade); (2) dá o objetivo de várias técnicas: **Isomap** e **LLE** (Tenenbaum e Roweis, 2000), **t-SNE/UMAP** (visualização), **autoencoders** (aprendem as coordenadas da variedade), **mapas auto-organizáveis** (Q13); (3) dá uma leitura geométrica do que a rede faz: **cada camada deforma o espaço para desembaraçar as classes**, até uma reta final bastar.
- **Onde a hipótese falha:** nem todo dado é bem descrito por uma só variedade lisa (dados discretos, ruído alto, vários componentes desconexos). É uma hipótese útil, não uma lei.

**Ligação com o NeuroLógica.** É a melhor leitura do nosso Ato 3: a camada oculta do XOR é uma **transformação do espaço**, $(x_1,x_2) \to (h_1,h_2)$, que dobra o quadrado até os dois pontos de classe 1 coincidirem e a reta final separar (tabela da Q3). No site, o mini-gráfico de cada neurônio oculto mostra a fronteira que ele aprendeu.

*Cuidado de honestidade:* o nosso XOR tem só **4 pontos**; não há uma variedade contínua ali. A analogia vale para a ideia ("a rede muda de representação até ficar fácil"), e o caso contínuo é o padrão em xadrez do TensorFlow Playground. Digam isso se perguntarem.

**Pergunta para a turma.** "Uma foto de rosto tem milhões de pixels. Quantos números vocês acham que bastam para descrever *todas* as variações de expressão e ângulo de um mesmo rosto?" (Dezenas, não milhões.)

**Perguntas que podem fazer.**
- *Como se sabe a dimensão da variedade?* Não se sabe com certeza; há estimadores de "dimensão intrínseca", e na prática se escolhe por validação.
- *Qual a relação com a Q8?* A Q8 é o problema (espaço enorme e vazio); a Q9 é a saída (os dados ocupam pouco dele).

**Leitura recomendada.** Christopher Olah, *Neural Networks, Manifolds, and Topology* (2014), que mostra visualmente a rede desembaraçando duas curvas (conferir o link antes de citar). Bengio, Courville e Vincent (2013), *Representation Learning*, para a hipótese da variedade.

---

## 2. Como pretendemos responder as nossas questões (Q2, Q5, Q4)

**Formato.** Um **site interativo** (NeuroLógica) com duas colunas lado a lado: à esquerda o **algoritmo** (pesos, equação da reta com os valores atuais, passo do treino) e à direita o **gráfico** (os 4 pontos da porta lógica e a reta se movendo). A progressão é **Perceptron → Adaline → MLP** nas **7 portas** (AND, OR, NOT, NAND, NOR, XOR, XNOR). A turma interage: **prevê** se o neurônio vai convergir antes de rodarmos, escolhe porta e pesos iniciais, e no fim tem um laboratório livre.

**Ordem: Q2 → Q5 → Q4** (difere da numeração do curso, e o site avisa). A razão é a dependência lógica: a Q4 (a ativação precisa de derivada) pressupõe a ideia de gradiente, que a Q5 introduz. Também segue a ordem histórica: Perceptron, Adaline, backpropagation.

| Ato | Pergunta | Nossa resposta em uma frase | Como mostramos | Evidência já medida |
|---|---|---|---|---|
| 1 | **Q2** — por que o Perceptron não resolve todo problema? | Um neurônio só traça uma reta, e XOR/XNOR não têm reta que os separe: o Perceptron corrige um ponto e estraga outro, e nunca para. | As 7 portas no Perceptron: 5 convergem, XOR e XNOR "giram sem parar". | Marco 3: em 120 execuções o Perceptron não convergiu nenhuma vez; na melhor época acerta 3 dos 4 pontos, nunca os 4. |
| 2 | **Q5** — como o gradiente descendente encontra uma solução? | O gradiente aponta para onde o erro cai mais depressa; o Adaline dá um passo nessa direção a cada exemplo, e o $\eta$ é o tamanho do passo. Encontra o *melhor ajuste possível*, mesmo quando ele é inútil. | Perceptron × Adaline lado a lado (reta "aos saltos" × reta suave), curva de custo caindo e a ilustração do "vale" do erro. | AND: o Adaline acerta tudo na época 3 e para na 43 com custo $0{,}506$ (mínimo $0{,}5$). No XOR o ótimo é a constante $z=0$ (custo $2{,}0$): não faltou treino, o limite é da arquitetura. |
| 3 | **Q4** — por que existem diferentes funções de ativação? | Para o gradiente atravessar camadas, a ativação precisa ser não linear e diferenciável; sigmoide, tanh e ReLU atendem e diferem em faixa, saturação e velocidade. | Card matemático em 3 passos, gavetas com fórmula, derivada e gráfico de cada ativação, e o laboratório com seletor "1 neurônio × rede 2-2-1": o XOR falha no primeiro e é resolvido na segunda. | Tabela da Q3 (sigmoide 1802, tanh 333, ReLU 804 épocas; ReLU falha em 4 de 20 sementes). |

**Como a Q1 e a Q3 aparecem sem serem "oficiais":** a Q1 é o Ato 1; a Q3 é o clímax do Ato 3. As Q8 e Q9 entram como contexto (por que só 2D? por que a camada oculta funciona?).

**Trabalhos relacionados que vamos citar de cara** (em vez de deixar a turma notar sozinha):
- **Perceptron Educational Lab** (Virtual Labs), o mais parecido: cobre só AND/OR/XOR, não tem Adaline, e a ativação é só um alternador degrau/sigmoide sem explicar o porquê.
- **TensorFlow Playground**, um sandbox genérico, sem portas booleanas, sem equação da reta, sem narrativa.
- *Nosso diferencial:* as 7 portas do curso, a ponte Perceptron → Adaline → MLP pelo gradiente, a explicação da troca de ativação e a ligação com o neurônio de McCulloch-Pitts. Descoberta que vale contar: **o NAND cabe em 1 neurônio com pesos aprendidos, mas precisa de 2 neurônios com os pesos fixos do MCP**.

### Onde o projeto está hoje (confira antes de falar; é o que o repositório mostra)

- **Marcos 1 e 2** (Perceptron e Adaline): prontos e na `main`.
- **Marco 3** (falha do XOR com neurônio único): implementado e enviado na branch `marco3-xor-falha`, ainda não mesclada na `main`.
- **Marco 4** (MLP com backprop): em andamento na branch `marco4-mlp` (o script existe, mas ainda não foi commitado). Os números da tabela acima são dele.
- **Site (`docs/`)**: ainda vazio neste repositório. Existe uma **demo completa** (`HerikDR/Neurologica-2`, publicada em `neurologica.vercel.app`) que serve de referência e de **plano B** para mostrar o resultado final. Conferir se está no ar antes de depender dela.
- **Prazos:** código congela em 14/11; apresentação final em 25/11.
- **Para demonstrar hoje à noite**, sem site: `python prototipos/01_perceptron_gates.py --porta AND` e `python prototipos/02_adaline_gates.py --porta AND --comparar` rodam na `main`; o Marco 3 (`03_perceptron_xor_falha.py --porta XOR`) exige estar na branch dele. Tenham **prints ou GIFs** como plano B caso a janela do matplotlib falhe.
- Se alguém perguntar "o que está atrasado?": o ponto de controle de 30/10 (Fase 1 validada) ainda tem o Marco 4 aberto, e o site precisa começar. É melhor dizer isso do que ser pego.

---

## 3. Ranking das questões dos outros grupos

**Critério:** (a) quão bem a resposta **complementa o que nós *não* cobrimos** e dialoga com o NeuroLógica, (b) valor para a turma. A lista do enunciado inclui 02, 04 e 05, que são as **nossas**; foram excluídas do ranking (se o professor quiser que entrem, ficam em 1.º). Restam 21 questões.

| # | Questão | Por que interessa / ligação com o NeuroLógica |
|---|---|---|
| 1 | **06** — rede que aprende além do ideal | A continuação natural do Ato 3: treinamos a rede até o erro zero em 4 pontos, e a pergunta é o que acontece com dados reais e ruidosos. Fecha a Q8 (mais parâmetros que exemplos). |
| 2 | **07** — como avaliar se realmente aprendeu | O nosso "convergiu" é medido no próprio conjunto de treino (4 pontos): não dizemos nada sobre generalização. Esta questão é exatamente a crítica ao nosso projeto. |
| 3 | **24** — escolher a arquitetura | Por que 2 neurônios ocultos, e não 3 ou 4? Medimos que mais neurônios convergem mais fácil. Questão-irmã da nossa Q3. |
| 4 | **21** — interpretar decisões | O NeuroLógica é, em essência, um projeto de interpretabilidade: equação da reta ao vivo, mini-gráfico por neurônio. Quero ver o que existe para redes grandes. |
| 5 | **25** — limites das redes | Complementa a nossa Q2 (o limite do Perceptron) numa escala geral: o que nenhuma rede resolve? |
| 6 | **27** — inspiração no cérebro | Nosso nome e o Tópico 2: o neurônio de McCulloch-Pitts é um modelo do neurônio biológico. Comparar com o que o modelo deixa de fora. |
| 7 | **11** — regra de Hebb | A outra regra de aprendizado "clássica", sem erro e sem professor; contraste direto com a regra do Perceptron e a do Adaline. |
| 8 | **26** — quando *não* usar uma rede | Contraponto honesto: para 4 pontos booleanos uma tabela-verdade basta. Fecha bem a discussão da Q25. |
| 9 | **23** — erros nos dados | O Perceptron nem converge se um rótulo está errado (deixa de ser separável). Dialoga com a Q2. |
| 10 | **22** — robustez | Continuação da 23 e da 7. |
| 11 | **15** — reduzir dimensionalidade | A solução prática para a Q8 e a ferramenta ligada à Q9. |
| 12 | **10** — padrões sem rótulos | Tudo o que fazemos é supervisionado; mostra o outro lado. |
| 13 | **13** — mapa auto-organizável | Exemplo de aprendizado de variedade (Q9) e de aprendizado competitivo. |
| 14 | **12** — rede de Hopfield | Memória associativa: ligada à regra de Hebb (11) e ao cérebro (27). |
| 15 | **28** — desafios éticos | Importante, mas pouco ligada ao nosso conteúdo técnico. Sobe se a turma valorizar o debate. |
| 16 | **19** — diagnóstico médico | Aplicação de alto impacto (e ponte com 21 e 28). |
| 17 | **17** — classificação de imagens | O caso típico de alta dimensionalidade (Q8) e variedades (Q9), via redes convolucionais. |
| 18 | **18** — padrões em sinais | Aplicação; menos ligação com o que fizemos. |
| 19 | **16** — detecção de anomalias | Aplicação; usa autoencoders (Q9). |
| 20 | **14** — gerar novas instâncias | Aplicação mais distante do nosso escopo. |
| 21 | **20** — agricultura de precisão | Aplicação; menos ligação com o nosso conteúdo. |

**Como se organiza o ranking:** as posições 1 a 5 formam o **eixo "o que o nosso trabalho deixa em aberto"** (generalização, arquitetura, interpretação, limites); 6 a 10 são o **eixo "regras de aprendizado e dados imperfeitos"**; 11 a 14 são **não supervisionado e variedades**; 15 a 21 são **aplicações e ética**. É uma proposta: o interesse é do grupo, então os três devem ajustar a ordem antes de enviar. Para o anexo basta a tabela com número e título (os motivos são para a fala).

---

## 4. Checklist para hoje à noite

- [ ] Combinar quem fala em cada bloco (os três falam).
- [ ] Decidir o ranking final (seção 3) e **anexar ao Classroom**.
- [ ] Testar na máquina da apresentação: `python prototipos/02_adaline_gates.py --porta AND --comparar` (e ter prints/GIFs de reserva).
- [ ] Conferir se `neurologica.vercel.app` (demo) está no ar.
- [ ] Preparar a lousa/slide da conta do AND (Q1) e dos números da Q8 (apêndice A).
- [ ] Combinar a resposta honesta para "o que falta?" (seção 2, "Onde o projeto está hoje").
- [ ] **Declarar o uso de ferramenta gerativa** (exigência do professor): este roteiro foi redigido com apoio do Claude Code (Anthropic); os números foram conferidos rodando os scripts do projeto e cálculos próprios.

---

## Apêndice A — mini-demo da maldição da dimensionalidade (Q8)

Roda em segundos; os números da seção Q8 saem daqui (a semente muda os valores da concentração das distâncias, mas não a tendência).

```python
import math, numpy as np

# 1) Fração do cubo unitário ocupada pela bola inscrita
for d in (2, 3, 10, 20):
    r = 0.5
    v = math.pi ** (d / 2) / math.gamma(d / 2 + 1) * r ** d
    print(f"d={d:>2}: bola/cubo = {v:.3e}")

# 2) Concentração das distâncias: 500 pontos aleatórios e um ponto de consulta
rng = np.random.default_rng(0)
for d in (2, 10, 100, 1000):
    P, q = rng.random((500, d)), rng.random(d)
    dist = np.linalg.norm(P - q, axis=1)
    print(f"d={d:>4}: (max-min)/min = {(dist.max() - dist.min()) / dist.min():.2f}")
```

## Apêndice B — referências para citar

- McCulloch e Pitts (1943), o neurônio lógico; Rosenblatt (1958), o Perceptron; Widrow e Hoff (1960), o Adaline; Minsky e Papert (1969), *Perceptrons*, a prova da limitação do XOR; Rumelhart, Hinton e Williams (1986), o backpropagation.
- Cybenko (1989) e Hornik (1991): aproximação universal.
- Bellman (1961): "maldição da dimensionalidade"; Cover (1965): separabilidade em dimensão alta; Beyer et al. (1999), *When is "nearest neighbor" meaningful?*: concentração de distâncias.
- Tenenbaum et al. (2000), Isomap, e Roweis e Saul (2000), LLE, ambos na *Science*; Bengio, Courville e Vincent (2013), *Representation Learning*; Olah (2014), *Neural Networks, Manifolds, and Topology*.
- Do projeto: `05_aprendizados_obtidos.md` (Aprendizados 5, 7, 9 e 10), `03_referencias.md` e `04_planejamento.md`.
