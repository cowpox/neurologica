# Apresentação final: estudo e roteiro (25/11, noite)

**Ciência de Dados e Inteligência Artificial · Redes Neurais I · Prof. Davi**
**Tempo:** 15 minutos · **2 apresentadores** (Apresentador 1 e Apresentador 2, a definir quem é quem) · **1 troca de fala**, no meio
**Site:** <https://neurologica.vercel.app> (projetar o **QR Code + link** desde o primeiro minuto)

> Este roteiro segue a ordem do site: abertura → Ato 1 (Q2) → Ato 2 (Q5) → Ato 3 (Q4) → laboratório livre → resumo.
> Todos os números de treino citados aqui foram **medidos rodando o código do site** (`docs/js`, semente 42, a mesma da página). Se alguém na turma tiver resultado diferente, foi porque mudou η, porta ou velocidade, não porque o site está errado.

---

## 0. Plano de tempo

| Relógio | Bloco | Quem | Duração |
|---|---|---|---|
| 0:00 | Abertura: o que é o NeuroLógica, justificativa, objetivos, QR Code | **Apresentador 1** | 1:30 |
| 1:30 | **Ato 1 · Q2**: pergunta → desafio → resposta | **Apresentador 1** | 3:00 |
| 4:30 | **Ato 2 · Q5**: pergunta → desafio → resposta | **Apresentador 1** | 3:00 |
| 7:30 | **↔ troca de fala** (na ponte do Ato 2 para o Ato 3) | 1 → 2 | — |
| 7:30 | **Ato 3 · Q4**: pergunta → ativações (rápido) → desafio → resposta | **Apresentador 2** | 4:00 |
| 11:30 | **Laboratório livre**: liberdade de parâmetros, MLP, espiral e xadrez | **Apresentador 2** | 2:30 |
| 14:00 | Fechamento: as três respostas numa frase + agradecimento | **Apresentador 2** | 1:00 |

O **Apresentador 1** fala 7:30 e o **Apresentador 2** fala 7:30. A troca acontece num ponto que o próprio site já marca como passagem: a frase "Duas retas resolveriam o XOR. Mas como o erro chega a um neurônio escondido?".

**Se o tempo apertar:** corte primeiro o cartão "E no XOR?" do Ato 2 (vira uma frase), depois o xadrez do laboratório (fica só a espiral). **Não corte** a resposta de cada pergunta, porque é o que o professor avalia.

---

## 1. Antes de começar (checklist da máquina)

- [ ] Abrir <https://neurologica.vercel.app> e esperar a tela de carregamento ("Afinando o lápis...").
- [ ] **Zerar o progresso:** no rodapé, botão **"Zerar conquistas e pistas"**. Sem isso, as pistas dos ensaios aparecem já abertas.
- [ ] **Tema:** no projetor, o **tema claro** (botão sol/lua no cabeçalho) costuma ler melhor. Testem os dois na sala.
- [ ] **Zoom do navegador** em 110 a 125%, para a turma enxergar a equação da reta e os números.
- [ ] Slide ou imagem com o **QR Code + link** pronta para a abertura (e para deixar no canto, se der).
- [ ] **Atalhos:** `Espaço` = ▶/pausa e `→` = avançar um passo (com o foco no laboratório). O ↺ recomeça o treino.
- [ ] **Plano B:** prints/GIF dos três laboratórios, caso a internet da sala falhe (o site carrega tudo localmente depois de aberto, então abram antes).
- [ ] Declarar o uso de ferramentas de IA generativa, se o professor exigir (como na atividade intermediária).

---

## 2. Abertura (Apresentador 1 · 1:30)

**O que é o trabalho.** O NeuroLógica é um **site interativo** que treina neurônios **ao vivo no navegador**, nas **sete portas lógicas** (AND, OR, NOT, NAND, NOR, XOR, XNOR). Enquanto treina, ele mostra a **fronteira de decisão** (a reta), a **equação** com os pesos atuais, o **algoritmo** linha a linha e a **curva de erro**. É organizado em **três atos**, cada um respondendo a uma das nossas perguntas orientadoras, na ordem em que as ideias surgiram na história: Perceptron (1958) → Adaline (1960) → rede multicamada com backpropagation (1986).

**Justificativa (curta).** Os conceitos de redes neurais costumam aparecer como fórmula. Mas a pergunta "por que um neurônio não resolve o XOR?" fica óbvia quando você **vê** a reta tentar e falhar. Um site deixa cada colega testar sozinho, no próprio celular.

**Objetivos da apresentação.**
1. Responder às nossas três perguntas: **Q2 → Q5 → Q4**.
2. Fazer a turma **resolver um desafio** em cada ato, com a gente guiando.
3. Mostrar o **laboratório livre**, onde dá para montar a própria rede.

**Por que Q2 → Q5 → Q4 (e não em ordem numérica):** a Q4 (a ativação precisa ter derivada) depende da ideia de gradiente, que só aparece na Q5. Também é a ordem histórica.

> **Fala sugerida (≈ 1:15, adaptem ao jeito de vocês):**
> *"Boa noite. A gente vai começar com uma frase que está no topo do nosso site: um neurônio aprende traçando uma reta. O problema é quando uma reta não basta. [pausa] Antes de explicar, apontem a câmera do celular para esse QR Code: tudo o que vamos mostrar hoje roda aí na mão de vocês, e vocês vão resolver desafios junto com a gente.*
> *O NeuroLógica é um site que treina neurônios ao vivo, nas sete portas lógicas que vimos na disciplina. Enquanto o neurônio aprende, vocês veem a reta se mexendo, a equação com os pesos atualizados e a curva de erro caindo, ou não caindo.*
> *Por que um site? Porque redes neurais normalmente chegam para a gente como fórmula, e muita coisa que parece abstrata fica óbvia quando você vê a reta tentar e falhar.*
> *O nosso objetivo hoje é responder três perguntas, cada uma num ato do site. E a ordem não é numérica, é Q2, Q5, Q4, porque a Q4 depende de uma ideia que só aparece na Q5. É também a ordem em que isso aconteceu na história: 1958, 1960 e 1986."*
>
> **Na tela:** no topo do site (o título grande), depois role até **"Três perguntas, três atos"** e passe o mouse pelos três cartões enquanto diz a ordem. O selo de cada cartão (Q2 · 1958, Q5 · 1960, Q4 · 1986) já resume a linha do tempo, então aponte para ele.
>
> **Como falar a abertura (nota geral).** Abra com a frase do topo do site, olhando para a turma: *"Um neurônio aprende traçando uma reta. O problema é quando uma reta não basta."* Diga que tudo o que vão ver roda no celular deles e projete o QR Code **antes** de explicar justificativa e objetivos, para que o site já esteja carregando enquanto você fala. Mostre o **mapa "Três perguntas, três atos"** (role até ele) e aponte os três cartões: *"cada cartão é uma pergunta, e cada pergunta vira um desafio para vocês"*. Não leia os objetivos: diga em uma frase cada. Termine clicando em "Ato 1".

---

## 3. Ato 1 · Q2 (Apresentador 1 · 3:00)

### 3.1 A pergunta (≈ 30 s)
**"Por que o Perceptron não resolve todo tipo de problema preditivo?"**

Contexto que o site dá: em **1958**, Rosenblatt apresenta o **Perceptron**. Ao contrário do neurônio de McCulloch e Pitts (1943), ele **aprende os próprios pesos** a partir de exemplos. O neurônio faz `z = w₁x₁ + w₂x₂ + b` e decide: liga (1) se `z ≥ 0`, senão 0 (o **degrau**). Geometricamente, isso é **traçar uma reta** e ver de que lado cada ponto caiu. A regra do Perceptron **só mexe nos pesos quando erra**, por isso a reta anda aos saltos.

> **Como falar.** Leia a pergunta devagar, apontando o subtítulo em itálico do Ato 1. Depois, a ideia central em três frases curtas:
> *"Em 1958, o Rosenblatt fez uma coisa que o neurônio de McCulloch e Pitts não fazia: aprender os pesos sozinho, a partir de exemplos. O neurônio multiplica cada entrada por um peso, soma com um viés e decide: liga ou não liga. Desenhado no plano, isso é uma reta: de um lado ele diz 1, do outro diz 0."*
> Aponte a **ilustração da margem** (o quadrado com a reta batendo num muro e o "e agora?"): *"Guardem essa imagem, ela é o spoiler do ato."*
> Uma frase sobre a regra, porque ela explica o que vão ver: *"O Perceptron só corrige quando erra. Então a reta fica parada enquanto tudo vai bem e dá um pulo a cada erro."*
> **Não explique** o teorema de convergência aqui: guarde para a resposta.

### 3.2 O que cada coisa na tela mostra (diga apontando)

O laboratório tem duas colunas, e é **igual em todos os atos**. Explicar uma vez aqui economiza tempo depois.

| Elemento | O que é |
|---|---|
| **Porta lógica / Taxa (η) / Velocidade** | Os seletores. A porta é o conjunto de dados (4 pontos da tabela-verdade). |
| **Fronteira de decisão** | A equação da reta **com os pesos atuais** (`w1 x₁ + w2 x₂ + b = 0`) e as fichas `w1`, `w2`, `b`. Muda a cada correção. |
| **Algoritmo / Log de treino** | O pseudocódigo com a **linha que está executando acesa**; a outra aba mostra cada passo em texto. |
| **▶ · ⏭ · ↺** | Tocar/pausar, avançar **um exemplo**, recomeçar. |
| **Época · Acertos · estado** | Quantas passadas pelos 4 pontos, quantos estão certos (ex.: 4/4) e a pílula de estado (treinando, resolveu, parou sem resolver...). |
| **O plano** | Os 4 pontos (o número em cima é a classe esperada), a **reta branca** e o **fundo colorido**, que é a região que o neurônio classifica como 1 (**rosa**) ou 0 (**ciano**). O ponto que está sendo avaliado ganha um **anel amarelo** durante o treino, e o anel some quando o treino termina. |
| **Erro por época** | No Perceptron é uma **escada**: conta pontos errados (número inteiro). |
| **Selos AND · OR · NOT · NAND · NOR** | Acima do laboratório: acendem conforme o Perceptron resolve cada porta linear. |
| **Pistas** | Gaveta abaixo do laboratório. Abre **1 pista a cada 2 tentativas** sem resolver, ou com **"Estou travado"** (espera de 20 s). |

> **Como falar (tour da tela, ≈ 40 s).** Não leia a tabela: faça um **tour com o mouse**, da esquerda para a direita, uma frase por elemento.
> *"Aqui em cima vocês escolhem a porta lógica, que é o conjunto de dados: os quatro pontos da tabela-verdade. Aqui está a equação da reta com os pesos de agora: cada vez que o neurônio corrige, esses números mudam. Embaixo, o algoritmo: a linha acesa é a que está rodando. Do lado direito, o play, o botão de avançar um passo e o de recomeçar. O plano mostra os quatro pontos, o número em cima é a resposta certa, a reta branca é a fronteira e a cor do fundo é o que o neurônio responde em cada região: rosa é 1, ciano é 0. E aqui embaixo, quantos pontos ele erra em cada época."*
> Feche com: *"Essa tela é a mesma nos três atos, então vale a pena entender agora."* Aperte **⏭ (um passo)** duas ou três vezes no AND antes de dar play: a turma vê o anel amarelo passar de ponto em ponto e a reta pular **só** quando há erro. É a forma mais rápida de mostrar a regra do Perceptron funcionando.
> Aponte os **selos AND · OR · NOT · NAND · NOR** acima do laboratório e a gaveta **Pistas** abaixo: *"isso aqui é o placar de vocês, e aqui embaixo ficam as dicas, que vão abrindo conforme vocês tentam."*

### 3.3 O desafio (≈ 1:30 com a turma)
**Texto do site:** "Treine o Perceptron em cada uma das **sete portas** e descubra quais ele consegue resolver. Comece pelo AND e termine no **XOR**: o que muda?"

**Roteiro ao vivo:**
1. **AND** em velocidade normal, ▶. Converge na **época 7** (≈ 5 s). Mostre a reta parando e o selo **AND** acendendo.
2. Peça à turma: *"cada um testa OR, NOT, NAND e NOR no celular"*. Resultado esperado: **todas convergem** (OR, NOT e NOR na época 4, NAND na 7). Quem fizer as cinco ganha a conquista "O Perceptron aprendeu as 5 portas lineares".
3. **Dica primeiro** (pista 1 do site): *"Executem o XOR novamente e acompanhem a reta. A cada correção ela classifica corretamente um ponto e passa a errar outro. Quantos pontos erram no fim de cada época?"*
4. **Resolvendo juntos:** no projetor, **XOR** em velocidade **rápida/turbo** (em normal, 40 épocas levam ≈ 27 s). A reta gira sem parar e o treino termina em **"parou sem resolver"** na época **40**, com **3 pontos errados** (no XNOR, 2).
5. **Pista 2, a do lápis:** *"Tentem passar uma reta que deixe os dois pontos rosa de um lado e os dois ciano do outro."* Aponte que os pontos da mesma cor estão em **cantos opostos** do quadrado.

> **Como falar o desafio.**
> - **Antes do AND:** peça uma previsão. *"Quem acha que ele aprende o AND? Levanta a mão."* Quase todos levantam: ótimo, a próxima previsão vai pegar a turma.
> - **Durante o AND**, narre a reta: *"errou esse ponto, a reta pulou... errou de novo, pulou... e agora parou. Época 7, quatro de quatro."* Mostre o selo AND acendendo: *"o placar contou."*
> - **Ao liberar a turma:** *"Agora é com vocês: testem OR, NOT, NAND e NOR. Quem conseguir as cinco ganha uma conquista."* Dê 30 s. Enquanto isso, pergunte em voz alta: *"Alguém achou uma que ele não resolve?"*
> - **Antes do XOR**, a previsão de novo: *"E o XOR? Ele sai 1 quando as entradas são diferentes. Quem acha que o Perceptron aprende?"* Deixe a dúvida no ar.
> - **Durante o XOR** (turbo), fale enquanto a reta gira: *"olhem: ele acerta esse ponto e passa a errar aquele. Acerta aquele e erra outro. Não é falta de tempo: são 40 épocas e ele nunca passa de três de quatro."*
> - **A dica do lápis** é o momento-chave: pegue a caneta ou desenhe no ar. *"Tentem passar uma reta que deixe os dois rosa de um lado e os dois ciano do outro."* Espere 3 segundos de silêncio. *"Não dá, né? Os rosa estão em cantos opostos."*
> - Se alguém disser *"e se fosse uma curva?"* ou *"e se fossem duas retas?"*: **elogie e guarde** (*"segura essa ideia, ela é o Ato 3"*).

### 3.4 A resposta à Q2 (≈ 30 s)
> Um neurônio só traça **uma reta**, e o XOR e o XNOR **não têm reta que os separe**. O Perceptron corrige um ponto, passa a errar outro, e nunca para. **Não falta treino: falta reta.**

Das 16 funções booleanas de 2 entradas, um neurônio realiza **14**: todas menos XOR e XNOR (contamos por programação linear). Essas 14 são as **linearmente separáveis**, e para elas o Perceptron sempre converge (teorema de convergência).

**Ponte para o Ato 2** (frase do site): *"Ele só sabe se errou ou acertou, e só muda quando erra. E se soubesse **o quanto** errou?"*

> **Como falar a resposta.** Role até a caixa **"Resposta à Q2"** e leia **olhando a turma**, não a tela. Enfatize **"uma reta"** e faça uma pausa antes de *"e nunca para"*. Depois, a frase de efeito: *"Não falta treino: falta reta."*
> O dado das 16 funções é opcional, mas dá peso: *"Com duas entradas existem 16 funções lógicas possíveis. O Perceptron aprende 14. As duas que sobram são justamente essas."*
> Diga a ponte como uma **pergunta de verdade**, com tom de curiosidade, e clique em "Ato 2 →" logo depois. A transição tem de parecer continuação, não troca de assunto.

---

## 4. Ato 2 · Q5 (Apresentador 1 · 3:00)

### 4.1 A pergunta (≈ 40 s)
**"Como o gradiente descendente encontra uma solução?"**

Em **1960**, Widrow e Hoff propõem o **Adaline**: **o mesmo neurônio**, com os mesmos pesos e a mesma reta. Muda **só onde o erro é medido**:

| | Perceptron | Adaline |
|---|---|---|
| Erro medido | depois do degrau: `y − ŷ` (−1, 0 ou +1) | **antes** do degrau: `alvo − z` (qualquer número) |
| O que ele sabe | "acertei ou errei" | **o quanto** errou e para que lado |
| Quando corrige | só quando erra | sempre |

Com o "quanto errou", dá para pensar no erro como um **terreno**: cada combinação de pesos é um lugar, e a altura é o erro. O **gradiente** aponta a subida mais íngreme, e andar no sentido contrário é descer. A cada exemplo o Adaline dá **um passo no sentido de descida do erro**, e o **η é o tamanho do passo**. Aponte a **ilustração animada do terreno** (curvas de nível, bolinha descendo).

> **Como falar.** O ponto central do ato cabe numa frase, então diga-a devagar: *"O Adaline é o mesmo neurônio, com a mesma reta. A única diferença é onde ele mede o erro."*
> Explique com um exemplo, não com a tabela: *"O Perceptron olha a saída depois do degrau, que só diz certo ou errado. É como uma prova que só diz 'reprovado'. O Adaline olha antes do degrau, no número z. É como ver a nota: tirou 4,9 ou tirou 1? Agora dá para saber o quanto falta e para que lado."*
> Na **ilustração do terreno**, conte a metáfora apontando a bolinha: *"Imaginem que cada combinação de pesos é um lugar nesse mapa, e a altura é o tamanho do erro. O gradiente aponta para onde o terreno sobe mais rápido, então o Adaline anda para o lado contrário: desce o terreno. E o η é o tamanho do passo que ele dá."*
> Termine com o gancho do desafio: *"E o tamanho do passo importa muito. Vamos ver."*

### 4.2 O que muda na tela
- **Regra de treino:** agora dá para escolher Adaline ou Perceptron no mesmo laboratório (e comparar a reta "aos saltos" com a reta que **desliza**).
- **Gráfico de baixo:** vira **"Custo E = ½ Σ (alvo − z)²"**, uma **curva lisa** em vez da escada.
- **Algoritmo:** a linha `erro ← alvo − z (antes do degrau)` e as três paradas: "E divergiu", "E quase não mudou (estabilizou)", "máximo de épocas".

> **Como falar (≈ 15 s, só as diferenças).** *"A tela é a mesma de antes, com duas mudanças. O gráfico de baixo agora é uma curva lisa, não uma escada, porque o erro é um número contínuo e pode melhorar um pouquinho de cada vez. E no algoritmo, olhem essa linha: o erro é calculado antes do degrau."*
> Aponte as três linhas de parada e antecipe o desafio: *"Reparem que ele para quando o erro quase não muda, e não quando acerta tudo. Isso vai fazer diferença agora."*

### 4.3 O desafio (≈ 1:30 com a turma)
**Texto do site:** "O laboratório abre no AND com **η = 0,7**. Execute: o custo para de cair, mas um ponto continua do lado errado da reta. Mude o η até os quatro pontos ficarem certos."

**Roteiro ao vivo:**
1. ▶ com η = 0,7: o custo **estabiliza na época 12**, mas com **3/4 acertos** (pílula "estabilizou com erros", custo ≈ 4,58). *"O gradiente parou. Por que ele parou no lugar errado?"*
2. **Dica primeiro** (pista 2 do site): *"Imaginem descer um vale sem enxergar o fundo. Com passos longos demais, vocês vão de um lado ao outro do vale e nunca param no fundo."* Aponte de novo a ilustração do terreno.
3. Turma testa outros η. **Valores medidos para o AND:**

| η | Resultado |
|---|---|
| 1,2 | **diverge** na época 13 (o custo diverge) |
| 1,0 | oscila, não estabiliza, 2 erros |
| 0,7 | estabiliza na época 12, **1 erro** (o ponto de partida) |
| 0,5 | estabiliza na época 14, **1 erro** |
| **0,3** | **resolve: época 13, 4/4** ← o maior η que funciona |
| 0,1 | resolve: época 43, 4/4 (custo 0,506, quase o mínimo 0,5) |
| 0,05 | resolve: época 99 |

4. **Resolvendo juntos:** coloque **η = 0,3** (resolve rápido) e depois **η = 0,1** (mais devagar, mas centraliza melhor a reta). Ganha a conquista "Você achou um η que funciona". Se der tempo, mostre o **1,2 divergindo**: é o "passo grande demais" ao vivo.
5. **(Opcional, 20 s) O cartão "E no XOR?":** troque a porta para XOR. O custo **diminui e se estabiliza**, sem divergir, em ≈ 2,0. A saída fica `z ≈ [0,10 0,00 −0,11 −0,22]`, tudo perto de 0, que é o meio entre −1 e +1. A melhor reta para o XOR é **uma constante**: o neurônio responde "não sei". **As regras de treino funcionaram; o que falta é arquitetura.**

> **Como falar o desafio.**
> - **Rodando o η = 0,7**, crie o mistério: *"Olhem a curva: caiu e parou. O Adaline diz que convergiu. Mas olhem o plano: tem um ponto do lado errado. Três de quatro. Por que ele parou no lugar errado?"* Ouça um ou dois palpites antes de dar a dica.
> - **A dica do vale:** use as mãos. Mostre um "V" com uma mão e faça a outra pular de uma borda à outra: *"passo grande demais, vocês pulam o fundo do vale de um lado para o outro e nunca chegam lá embaixo."*
> - **Ao liberar a turma:** *"Mudem o η, que é a taxa aqui em cima, e procurem o maior valor que acerta os quatro pontos."* A palavra "maior" deixa o desafio mais interessante do que "um valor qualquer".
> - **Resolvendo:** coloque 0,3 e narre: *"Época 13, quatro de quatro."* Depois 0,1: *"Mais devagar, mas olhem como a reta fica mais no meio, longe dos pontos."*
> - **O 1,2 divergindo** é o momento visual mais forte do ato: *"E se o passo for enorme?"* Rode e deixe a curva disparar: *"Divergiu: cada passo joga ele mais longe do vale."*
> - **No XOR (se houver tempo)**, faça a virada: *"E se a gente der ao Adaline o XOR? Ele tem o gradiente, tem o 'quanto errou'..."* Rode. *"O custo cai e para em 2. E a saída é quase zero para tudo: ele aprendeu a dizer 'não sei'. O gradiente fez o trabalho dele direitinho. O problema não é o método, é que uma reta não basta."*

> Evitem η = 0,01 na demo: com o limite de 300 épocas o custo ainda está caindo quando o treino termina, e a versão publicada mostra "parou sem resolver" mesmo com 4/4.

### 4.4 A resposta à Q5 (≈ 30 s)
> O gradiente aponta para onde o erro **cai mais depressa**. O Adaline mede o erro **antes** da decisão e dá, a cada exemplo, **um passo nessa direção**, com o **η** controlando o tamanho do passo. Ele encontra o **melhor ajuste possível**, mesmo quando o melhor possível não resolve (o XOR).

**Ponte e troca de fala (Apresentador 1 diz):** *"Duas retas resolveriam o XOR. Mas como o erro chega a um neurônio escondido? Isso quem conta é o [nome do Apresentador 2]."*

> **Como falar a resposta e a troca.** Leia a resposta destacando três palavras: **"cai mais depressa"**, **"um passo"**, **"η"**. A última frase (*"mesmo quando o melhor possível não resolve"*) é a que liga ao Ato 3, então diga-a mais devagar.
> Na troca, o **Apresentador 1** já deixa o mouse com o **Apresentador 2** enquanto diz a pergunta-ponte. O **Apresentador 2** começa repetindo a pergunta, sem pausa morta: *"Isso mesmo: duas retas resolveriam. Mas tem um problema..."*

---

## 5. Ato 3 · Q4 (Apresentador 2 · 4:00)

### 5.1 A pergunta (≈ 40 s)
**"Por que existem diferentes funções de ativação?"**

Contexto (**1969 → 1986**): Minsky e Papert mostram que um neurônio não resolve o XOR, e o entusiasmo esfria. Empilhar neurônios já era uma hipótese; faltava **treinar a camada escondida**. Isso se populariza em 1986 com o **backpropagation** (Rumelhart, Hinton e Williams): o erro da saída **volta camada por camada** pela regra da cadeia. **Ele só volta se a ativação tiver uma derivada útil.**

**O cartão de três passos do site (mostrar, sem fazer conta):**
1. **Linear em cima de linear continua linear:** `W₂(W₁x + b₁) + b₂ = (W₂W₁)x + (W₂b₁ + b₂)`. Sem algo **não linear** no meio, duas camadas viram uma reta só.
2. **O degrau corta o caminho do erro:** a derivada do degrau é **0** (e não existe no salto). Pela regra da cadeia, esse zero multiplica tudo, e o neurônio escondido não recebe nada.
3. **Por isso, funções suaves:** `σ' = σ(1−σ)`, `tanh' = 1 − tanh²`, `ReLU' = 1 (z>0) ou 0 (z<0)`.

> **Como falar.** Comece pela história, em tom de "drama": *"Em 1969, Minsky e Papert provam o que a gente acabou de ver: um neurônio não faz o XOR. E a área praticamente para. A solução parecia óbvia: coloca mais neurônios. Mas aí vem o problema: se um neurônio está escondido no meio da rede, como ele sabe que errou? Ninguém diz a resposta certa para ele."*
> Aponte a **faixa com as duas retas** no topo do ato ("duas retas!"): *"Isso aqui é o que a gente quer: duas retas recortando uma faixa."*
> **No cartão de três passos**, uma frase por passo, apontando cada coluna (não leia as fórmulas em voz alta):
> 1. *"Primeiro: se não tiver nada não linear no meio, duas camadas viram uma camada só. Matemática de matriz: continua uma reta."*
> 2. *"Segundo: o degrau, que o Perceptron usa, tem inclinação zero. E o backpropagation funciona multiplicando inclinações pela regra da cadeia. Zero vezes qualquer coisa é zero: o erro não chega."*
> 3. *"Terceiro: então a gente precisa de funções suaves, que dobram e têm inclinação. É por isso que existem várias."*
> Conclusão de uma linha: *"A troca da função de ativação não é estética: é o que torna o treino possível."*

### 5.2 Funções de ativação, rápido (≈ 50 s)
O site tem **nove gavetas** (fórmula, derivada e gráfico de cada uma). Mostrem **só as que vimos em aula**: abram 2 ou 3 gavetas, e digam as outras em uma frase.

| Função | Faixa | Em uma frase | Limite |
|---|---|---|---|
| **Degrau** | {0, 1} | A do Perceptron: decide seco | Derivada zero: não treina rede |
| **Linear** | ℝ | A do Adaline: devolve a soma | Empilhar linear dá linear |
| **Sigmoide** | (0, 1) | Achata para algo que parece probabilidade; a **saída da nossa rede** é sempre sigmoide | **Satura** nas pontas; derivada máxima 0,25 |
| **tanh** | (−1, 1) | Como a sigmoide, mas **centrada em zero**; derivada chega a 1 → costuma treinar mais rápido | Também satura |
| **ReLU** | [0, ∞) | Passa o positivo, zera o resto; barata e não satura para z > 0 | **"Neurônio morto"**: preso no negativo, nunca mais recebe gradiente |
| **Leaky ReLU** | ℝ | ReLU com uma inclinação pequena (0,01) no lado negativo | Resolve o neurônio morto; a inclinação é escolhida à mão |

(ELU, Swish e GELU também estão no site: *"variações mais recentes, a GELU é a dos modelos de linguagem atuais; fica para quem quiser explorar"*.)

> **Como falar (≈ 50 s, ritmo rápido de propósito).** Avise antes: *"O site tem nove funções. Vamos passar rápido pelas que vimos em aula."* Abra **no máximo três gavetas** (sugestão: **Degrau**, **Sigmoide** e **ReLU**) e diga as outras sem abrir.
> - Em cada gaveta aberta, aponte os **dois gráficos**: *"em cima, a função; embaixo, a derivada, que é a inclinação. É a derivada que importa para o treino."*
> - **Degrau:** *"derivada zero em todo lugar: linha reta no chão. Por isso não treina rede."*
> - **Linear:** *"é a do Adaline. Derivada 1, mas empilhar linear dá linear."*
> - **Sigmoide:** aponte as pontas achatadas: *"aqui nas pontas ela fica plana, e a derivada cai quase a zero. É a saturação, e ela vai aparecer no desafio."*
> - **tanh:** *"a prima da sigmoide, mas centrada no zero e com derivada até 1. Costuma treinar mais rápido."*
> - **ReLU / Leaky ReLU:** *"a ReLU deixa passar o positivo e zera o negativo. Simples e rápida, mas um neurônio que cai no lado negativo pode morrer: nunca mais recebe gradiente. A Leaky mantém uma inclinação pequena para evitar isso."*
> Não tente explicar fórmulas. A turma precisa sair com uma ideia: **todas dobram e todas têm inclinação, e diferem em como saturam e em quão rápido treinam**.

### 5.3 O que é novo na tela
| Elemento | O que é |
|---|---|
| **Modelo: 1 neurônio / rede 2-2-1** | Duas entradas, **dois neurônios ocultos**, uma saída. A arquitetura é fixa neste ato. |
| **Ativação** | O seletor da função dos neurônios ocultos. |
| **"A rede" (diagrama)** | **Linhas:** espessura = tamanho do peso; **rosa = positivo, ciano = negativo**; brilho = quanto o neurônio de origem está ativo. **Mini-gráfico em cada neurônio:** a região que aquele neurônio sozinho aprendeu (toque para ampliar). O da saída é a resposta final. |
| **Curva de erro** | Custo SSE. Quando a rede **estagna**, ela sorteia pesos novos (**reinício**), e isso aparece na curva e no log. |
| **Algoritmo da rede (δ)** | No pseudocódigo da rede, **δ** é o termo de erro de cada camada: o "gradiente" que **volta** da saída para as camadas ocultas. Basta dizer isso em uma frase: *"esse δ é o erro andando para trás."* |

> **Como falar (≈ 25 s).** O elemento novo é **"A rede"**, que fica em cima à direita. Aponte da esquerda para a direita: *"Duas entradas, dois neurônios escondidos, uma saída. Cada linha é um peso: quanto mais grossa, maior; rosa é positivo, ciano é negativo. E dentro de cada neurônio tem um mini-gráfico: o que aquele neurônio sozinho está enxergando no plano."*
> Avise o que observar: *"Durante o treino, fiquem de olho nos dois quadradinhos do meio. Cada um vai virar uma reta."* Mencione os botões **(?)** ao lado de "A rede" e da legenda: quem estiver no celular pode tocar para ler a explicação.

### 5.4 O desafio (≈ 1:30 com a turma)
**Texto do site:** "O laboratório abre no XOR com **1 neurônio**: ele falha de novo. Troque para a **rede 2-2-1**. Ela começa com a sigmoide e **η = 0,1**, e também não resolve. Mude a ativação e o η até as duas retas recortarem o XOR."

**Roteiro ao vivo:**
1. ▶ com **1 neurônio**: falha (é o Adaline do Ato 2, 3 erros). *"Já sabíamos."*
2. Troque para **rede 2-2-1** (sigmoide, η = 0,1), velocidade **turbo**. O erro estagna, a rede reinicia, estagna de novo e **é interrompida na época 6599, depois de 10 tentativas** (o log mostra "interrompido"). Em velocidade normal isso leva ≈ 25 s, então use turbo.
3. **Dica primeiro** (pista 3 do site): *"Para o erro voltar até os neurônios ocultos, a ativação precisa ter inclinação. A sigmoide achata nas pontas e, com η pequeno, o passo quase some. Aumentem o η ou troquem a ativação."*
4. Turma testa. **Medido no XOR com a rede 2-2-1:**

| Ativação | η = 0,1 | η = 0,5 | η = 2 | η = 5 |
|---|---|---|---|---|
| sigmoide | **interrompida** (6599) | resolve, ép. 5767 | resolve, ép. 2347 | resolve, **ép. 577**, sem reinício |
| tanh | resolve, ép. 10 390 | resolve, ép. 3337 | resolve, **ép. 1294** (1 reinício) | resolve, ép. 757 |
| ReLU | resolve, ép. 3938 | resolve, ép. 1326 | resolve, ép. 706 | resolve, ép. 644 |

5. **Resolvendo juntos:** **tanh com η = 2** (a solução de referência do site: resolve na época 1294, com um reinício na época 899 que dá para apontar na curva). Alternativa que impressiona: **sigmoide com η = 5** resolve em 577 épocas. **A mesma ativação que foi interrompida passa a resolver só mudando o passo.**
6. Ao terminar, **amplie os mini-gráficos dos dois neurônios ocultos**: cada um traçou **uma reta**, e a saída combina as duas numa **faixa** que recorta o XOR. É a ilustração "duas retas!" do topo do ato.

> **Como falar o desafio.**
> - **1 neurônio:** rode sem cerimônia: *"um neurônio só, já sabemos o final."* Não gaste mais de 10 s aqui.
> - **Rede 2-2-1 com sigmoide e η = 0,1:** crie expectativa (*"agora temos duas retas, deve funcionar, certo?"*) e rode em turbo. Narre os reinícios: *"Olhem a curva: caiu um pouco e estagnou. A rede percebeu e sorteou pesos novos, aqui ó, a curva deu um salto. Estagnou de novo... e foi interrompida. Dez tentativas."*
> - **A dica:** ligue ao que a turma acabou de ver nas gavetas. *"Lembram da sigmoide achatada nas pontas? Com derivada pequena e passo pequeno, o passo efetivo quase some. O que vocês mudariam?"* Deixe a turma responder: geralmente alguém diz "aumentar o η".
> - **Ao liberar:** *"Testem: mudem a ativação, mudem o η. Quem resolver primeiro, fala aí qual combinação usou."*
> - **Resolvendo juntos:** primeiro **sigmoide com η = 5**, porque o contraste é o argumento: *"mesma função que foi interrompida. Só aumentei o passo... resolveu em 577 épocas."* Depois **tanh com η = 2**: *"agora com a tanh: olhem que aqui ela também reinicia uma vez, na época 899, e depois desce direto."*
> - **Os mini-gráficos** são o fechamento visual do ato. Clique para ampliar cada neurônio oculto: *"Esse neurônio aprendeu essa reta. Esse aprendeu essa outra. E a saída combinou as duas numa faixa. Duas retas fazendo o que uma não conseguia."* Volte à ilustração do topo do ato se der tempo.

**Cartão "Quando o treino trava" (10 s):** com só 2 ocultos, ≈ 1 em cada 5 inicializações com sigmoide cai num **mínimo local**. O gradiente desce a encosta que está sob os pés, e nada garante que ela leva ao fundo. Por isso o reinício. Isso **também responde à Q5**: o gradiente acha *uma* solução, não necessariamente a melhor.

> **Como falar o cartão.** Volte à metáfora do Ato 2, que a turma já conhece: *"Lembram do vale? Às vezes a bolinha cai num buraco que não é o fundo. O gradiente só olha o chão embaixo dele, então não sabe que existe um vale mais fundo do lado. Por isso a rede reinicia: sorteia outro ponto de partida."*

### 5.5 A resposta à Q4 (≈ 30 s)
> Para o erro atravessar camadas, a ativação precisa ser **não linear** (senão as camadas colapsam numa reta) e **diferenciável** (senão a regra da cadeia zera o gradiente). Sigmoide, tanh e ReLU atendem às duas exigências e **diferem em faixa de saída, saturação e velocidade**, como acabamos de ver na tabela.

> **Como falar a resposta.** Leia a caixa **"Resposta à Q4"** em duas partes, cada uma com o seu "porquê": *"não linear, senão vira uma reta; diferenciável, senão o erro não volta."* Depois, ligue ao que a turma viu: *"E por que existem várias? Porque elas diferem: a sigmoide satura e precisou de passo maior; a tanh e a ReLU treinaram mais rápido. Não existe uma melhor para tudo."*
> Use a ponte do site para entrar no laboratório: *"Agora é com vocês: monte a sua própria rede."*

---

## 6. Laboratório livre (Apresentador 2 · 2:30)

### 6.1 A liberdade de parâmetros (≈ 40 s, só apontar)
"Monte a sua rede": todas as peças da página num lugar só.

- **Problema:** *Portas lógicas* (as 7 tabelas-verdade) ou **Classificação** (7 conjuntos de **200 pontos**: duas gaussianas, círculo, XOR em quadrantes, duas meias-luas, **xadrez 4×4**, yin-yang, **espiral dupla**).
- **Modelo:** Perceptron, Adaline ou **Rede multicamada**.
- **Arquitetura editável:** de **1 a 4 camadas ocultas**, com **até 6 neurônios** cada.
- **Ativação**, **η digitável**, **semente** (o sorteio dos pesos iniciais: mesma semente, mesmo treino), **reinício automático** (liga/desliga), **máximo de épocas** e velocidade.
- Na classificação, o treino **para quando acerta os 200 pontos**.
- Embaixo, a lista **"Desafios de classificação"**: cada gaveta tem uma solução medida e um botão **"Aplicar parâmetros"** que configura o laboratório (o treino só começa no ▶).

> **Como falar (tour rápido).** O objetivo aqui é mostrar **liberdade**, não ensinar cada controle. Passe o mouse pelos seletores contando: *"Aqui vocês escolhem o problema: as portas ou conjuntos de classificação com 200 pontos. O modelo: Perceptron, Adaline ou rede. Quantas camadas e quantos neurônios, até quatro camadas de seis. A ativação, o η, a semente, que é o sorteio dos pesos iniciais, e se a rede pode reiniciar quando estagna."*
> Faça o convite como o site: *"A ideia é experimentar configurações que levem a rede a falhar e depois corrigi-las."*
> Aponte a lista **"Desafios de classificação"**: *"Cada um desses tem uma solução que a gente mediu. Tentem antes de abrir a gaveta."*

### 6.2 Demonstração 1: espiral dupla (≈ 50 s)
- Abra a gaveta **Espiral dupla** → **Aplicar parâmetros**: **3 camadas de 6, tanh, η = 3, turbo**.
- Antes do ▶: *"redes de uma camada param entre 115 e 140 acertos de 200."*
- ▶: resolve **os 200 pontos na época 4113**. Enquanto treina, mostre o **diagrama da rede** (as linhas mudando de espessura e cor) e os **mini-gráficos**: a primeira camada traça retas, as seguintes combinam essas retas em curvas cada vez mais enroladas, até formar a espiral.

> **Como falar.** Antes do ▶, pergunte: *"Quantas retas vocês acham que precisa para separar uma espiral?"* Depois do ▶, deixe a imagem falar por alguns segundos, sem narrar. É a parte mais bonita da apresentação, então não a cubra com texto.
> Quando a fronteira começar a enrolar, aponte a rede: *"Isso tudo é feito de retas. A primeira camada só sabe traçar retas; a segunda combina retas; a terceira combina combinações. É o mesmo truque do XOR, repetido três vezes."*
> Ao terminar: *"Duzentos de duzentos."*

### 6.3 Demonstração 2: xadrez 4×4 (≈ 40 s)
- Gaveta **Xadrez 4×4** → **Aplicar parâmetros**: **3 camadas de 6, GELU, η = 3** → resolve na **época 1223**.
- A progressão que vale contar: **uma reta acerta 100 de 200** (o chute); **1 camada de 6, 154**; **2 camadas de 4, 191**; **3 camadas de 6, todos os 200**. *"Profundidade compõe: cada camada constrói sobre a anterior."*
- Se perguntarem pela GELU: é parente suave da ReLU. Com ReLU (η = 2) também resolve, na época 4556, só que mais devagar.

> **Como falar.** Use os números como uma **escada de acertos**, contando nos dedos: *"Uma reta: cem de duzentos, metade, o mesmo que chutar. Uma camada de seis: 154. Duas camadas de quatro: 191. Três camadas de seis..."* Aperte ▶ e termine a frase quando a rede chegar: *"...duzentos."*
> A mensagem a deixar: *"Não foi só colocar mais neurônios: foi colocar mais camadas. Profundidade é o que deixa a rede compor formas complicadas."*

> **Cronometrem as duas demos no ensaio**: na classificação cada época processa 200 pontos, e o tempo real depende da máquina.

---

## 7. Fechamento (Apresentador 2 · 1:00)
Role até **"As três respostas, numa frase cada"** e leia olhando para a turma:

- **Q2:** um neurônio só traça uma reta, e há problemas, como o XOR, que nenhuma reta separa.
- **Q5:** medindo o quanto errou e dando passos na direção em que o erro cai mais depressa, com o η controlando o tamanho do passo.
- **Q4:** para o erro atravessar camadas, a ativação precisa ser não linear e diferenciável; cada escolha muda a faixa de saída, a saturação e a velocidade.

Feche com: *"O site continua no ar: o laboratório livre é de vocês. Obrigado."* Deixe o QR Code na tela durante as perguntas.

> **Como falar o fechamento.** Recapitule a história com as três palavras-chave antes de ler as respostas: *"Começamos com uma **reta** que não bastava. Vimos que o **passo** do gradiente leva ao melhor ajuste possível. E que a **derivada** da ativação é o que deixa o erro chegar nos neurônios escondidos."*
> Leia as três respostas em ritmo calmo, uma por respiração, apontando cada item na tela.
> Termine olhando para a turma e para o professor, e não para a tela. Agradeça e convide para perguntas: *"Obrigado. Ficamos à disposição para perguntas, e o QR Code continua aí para quem quiser testar."*

---

## 8. Como explicar oralmente (nota geral para os dois)

> **A sequência de cada ato é sempre a mesma, e a turma aprende o ritmo:** (1) leiam a **pergunta** em voz alta; (2) deem o **contexto histórico em uma frase** (o ano está no site); (3) digam **qual é o desafio** e **onde olhar na tela**; (4) deixem a turma tentar **30 a 45 s**, andando pela sala ou olhando a reação; (5) deem **uma dica** (as pistas do site já são as dicas, leiam do jeito delas); (6) **resolvam juntos no projetor**, narrando o que a reta e a curva estão fazendo; (7) fechem lendo a **resposta** do site.
>
> **Falem como professor, não como apresentador de slides.** Façam perguntas e esperem um segundo: *"O que vocês acham que vai acontecer com o XOR?"*, *"Por que ele parou com um ponto errado?"*. **Prever antes de rodar** é o que prende a turma. Quando alguém resolver antes, aproveitem: *"Que η você usou?"*.
>
> **Narrem a tela, não o código.** Diga "a reta deu um salto porque errou esse ponto" em vez de ler o pseudocódigo. A linha acesa do algoritmo serve de apoio visual, não de roteiro. Usem sempre as mesmas três palavras-chave: **reta** (Ato 1), **passo** (Ato 2), **derivada** (Ato 3). Elas são o fio da história.
>
> **Controlem o tempo pela velocidade do laboratório:** normal para mostrar o mecanismo (AND do Ato 1, η = 0,7 do Ato 2); rápida/turbo para chegar ao resultado (XOR, rede 2-2-1, classificação). Se a turma demorar, o botão **"Estou travado"** libera a próxima pista em 20 s, mas vocês podem simplesmente dizer a dica em voz alta.
>
> **Na troca de fala**, o Apresentador 1 termina com a pergunta-ponte e passa explicitamente ("isso quem conta é o [nome]"); o Apresentador 2 começa repetindo a pergunta, para quem se distraiu. Combinem quem segura o mouse: quem fala, controla.

---

## 9. Perguntas que podem fazer (respostas curtas)

- **"Por que 2 neurônios ocultos?"** É o mínimo para o XOR (duas retas). Com 3, quase toda inicialização converge; mantivemos 2 porque é a menor rede que conta a história.
- **"O Perceptron sempre converge?"** Se os dados forem linearmente separáveis, sim (teorema de convergência). Se não, nunca para: é a Q2.
- **"Por que o Adaline continua mexendo na reta depois de acertar tudo?"** Porque ele minimiza o **erro contínuo**, não o número de erros: ele **centraliza** a reta entre as classes (no AND, acerta na época 3 e só para na 43 com η = 0,1).
- **"Por que estabilizar não é o mesmo que resolver?"** O Adaline para quando o custo quase não muda, não quando acerta tudo. Com η grande, ele estabiliza com ponto errado: é o desafio do Ato 2.
- **"A rede sempre aprende?"** Não há garantia: há mínimos locais (o cartão do Ato 3). O teorema da aproximação universal diz que a solução **existe**, não que o gradiente **a encontra**.
- **"Por que tudo em 2D?"** É a única dimensão em que dá para **ver** a fronteira. A ideia vale em mais dimensões; a imagem não.
- **"Os números são de verdade?"** Sim: os treinos do site foram conferidos contra os protótipos em Python (`testes/conferir_js.mjs`, 331 verificações).
