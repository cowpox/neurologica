# Aprendizados obtidos — Marco 1 (Perceptron clássico)

Registro dos aprendizados obtidos ao testar e depurar o Marco 1 (`prototipos/01_perceptron_gates.py`), incluindo os parâmetros e o algoritmo exatos usados nos experimentos que geraram essas observações. Este arquivo alimenta diretamente a seção "Aprendizados obtidos e sugestões para o futuro" exigida no documento de texto final.

## Parâmetros utilizados no experimento

- **Algoritmo**: Perceptron clássico (Tópico 14 do curso) — regra de correção de erro discreta, aplicada apenas quando há classificação errada.
- **Função de ativação**: degrau (step) — $\hat{y} = 1$ se $z \geq 0$, senão $0$.
- **Taxa de aprendizado (η)**: 0.1 (padrão do script).
- **Pesos iniciais**: escolhidos manualmente como $[0, 0]$ (`--pesos-iniciais 0 0`), em vez da inicialização aleatória padrão — escolha deliberada para eliminar a aleatoriedade da inicialização e isolar o efeito da tabela-verdade de cada porta sobre a trajetória de treino.
- **Bias inicial**: 0.0 (`--bias-inicial 0`) — que, pela equivalência do Tópico 14 (seção 2.3, ver Aprendizado 3 abaixo), é também o "peso inicial do bias" ($w_0$ inicial): os dois nomeiam o mesmo número.
- **Máximo de épocas**: 20 (padrão) — não foi o fator limitante, as portas convergiram bem antes disso.
- **Portas testadas nestas observações**: AND e OR (das 5 portas linearmente separáveis que o Marco 1 cobre: AND, OR, NOT, NOR, NAND).
- **Comando exato usado**:
  ```
  python 01_perceptron_gates.py --porta AND --pesos-iniciais 0 0 --bias-inicial 0
  python 01_perceptron_gates.py --porta OR  --pesos-iniciais 0 0 --bias-inicial 0
  ```

## Algoritmo utilizado

Regra de correção do perceptron, aplicada a cada exemplo (uma iteração = um exemplo processado; uma época = uma passada completa pelos 4 exemplos da porta):

$$z = \vec{w}\cdot\vec{x} + b \qquad \hat{y} = \text{degrau}(z) \qquad \text{erro} = y_{real} - \hat{y}$$

Se `erro != 0` (classificação errada), atualiza:

$$w_{novo} = w_{antigo} + \eta \cdot \text{erro} \cdot x \qquad b_{novo} = b_{antigo} + \eta \cdot \text{erro}$$

Critério de convergência/parada: uma época inteira em que nenhum dos 4 exemplos gera erro.

## Aprendizado 1 — por que a reta "cerca" pontos diferentes em cada porta

Observação: rodando AND e OR com os mesmos pesos/bias iniciais, a reta final de cada uma isola um canto diferente do quadrado de entradas — no AND, isola só o ponto $(1,1)$; no OR, isola só o ponto $(0,0)$.

**Explicação**: isso é consequência direta da tabela-verdade de cada porta, não da inicialização, da ordem de treino ou de qualquer aleatoriedade:

- **AND** só vale 1 quando as duas entradas são 1 → o único ponto da classe "1" é o canto $(1,1)$ (entradas máximas). A reta é obrigada a isolar exatamente esse canto dos outros três.
- **OR** só vale 0 quando as duas entradas são 0 → o único ponto da classe "0" é o canto $(0,0)$ (entradas mínimas). A reta é obrigada a isolar exatamente esse canto dos outros três.

AND e OR são portas **duais** (uma é a outra invertida via De Morgan), e essa dualidade lógica é o que aparece geometricamente como a reta indo para cantos opostos do quadrado.

**Gancho para o Marco 3 (XOR)**: no XOR, cada classe tem 2 pontos, situados nas diagonais opostas do quadrado — não existe um "canto único" a isolar, e é por isso que nenhuma reta consegue separar as duas classes (não separabilidade linear, Tópico 10). Vale reaproveitar essa mesma observação guiada ("por que a reta pega esse ponto e não aquele?") na apresentação final, como forma de a turma "descobrir" visualmente, antes da revelação, por que o XOR será diferente.

## Aprendizado 2 — limite de precisão de ponto flutuante na fronteira de decisão

Observação: numa das execuções (AND, época 4, iteração 3, ponto $x=(1,0)$), o console mostrava `z = -0.000` e $\hat{y}=0$; numa execução equivalente do OR, o mesmo tipo de linha mostrava `z = 0.000` e $\hat{y}=1$. A função degrau é idêntica nos dois casos — o que gerou a dúvida foi por que o mesmo "z aparentemente zero" deu resultados diferentes.

**Investigação numérica** (valores exatos, sem o arredondamento de exibição `:.3f`):

```
OR  (época 4, iteração 3, x=[1,0]):  pesos=[0.1, 0.1]  bias=-0.1
                                      z = 0.0                      -> z>=0 = True  -> ŷ=1
AND (época 4, iteração 3, x=[1,0]):  pesos=[0.2, 0.1]  bias=-0.20000000000000004
                                      z = -2.7755575615628914e-17  -> z>=0 = False -> ŷ=0
```

**Explicação**: `0.1` não tem representação binária exata em `float64` (fato conhecido de qualquer linguagem que usa esse padrão — Python, JavaScript, C etc.). Os pesos e o bias chegam aos seus valores finais somando/subtraindo múltiplos de `0.1` ao longo de várias épocas, e o **caminho exato de contas** percorrido é diferente entre AND e OR (histórico de atualizações diferente). No OR, os erros de arredondamento se cancelaram perfeitamente e sobrou `0.0` exato; no AND, sobrou um resíduo de $-2.78\times10^{-17}$ — usado pela comparação `z >= 0` como um valor genuinamente negativo, mesmo sendo, na prática, ruído numérico.

**O que isso significa conceitualmente**: o ponto $(1,0)$, matematicamente, caiu **exatamente em cima da reta de decisão** nos dois casos (com os pesos "redondos" pretendidos, $z$ seria zero nos dois). Isso é uma característica real do algoritmo do perceptron: diferente de uma SVM (que maximiza a margem, afastando a reta o máximo possível de todos os pontos), o perceptron **para na primeira reta que zera o erro de treino** — e não se importa se essa reta passa rente a um ponto ou até exatamente sobre ele. Quando isso acontece, a classificação daquele ponto fica numericamente "no fio da navalha": um resíduo de arredondamento de $10^{-17}$ (menor que a própria precisão útil do `float64`, que é da ordem de $10^{-16}$ perto de 1.0) decide de qual lado ele cai. Calculando a distância real entre o ponto e a reta (usando os floats exatos): $\approx 1,24\times10^{-16}$ — ou seja, a "diferença" não é uma verdade geométrica contínua esperando um zoom suficiente para ser vista; é o próprio limite de representação do número de ponto flutuante se manifestando.

**Por que não quebrou o treino**: por coincidência, o resultado da comparação bateu com o rótulo verdadeiro nos dois casos (AND: $y_{real}=0$, $\hat{y}=0$; OR: $y_{real}=1$, $\hat{y}=1$), então o treino convergiu normalmente nos dois. Mas o episódio deixa claro que "convergiu com erro zero" garante *que aquela reta separa corretamente os dados*, não que exista uma margem confortável entre as classes.

## Aprendizado 3 — o "bias inicial" e o "peso inicial do bias" são o mesmo número

Dúvida: no experimento, qual é o bias inicial e qual é o peso inicial associado ao bias — são valores diferentes?

**Resposta: não, são exatamente o mesmo número.** O Tópico 14 (seção 2.3) mostra que o bias pode ser tratado como só mais um peso, $w_0$, associado a uma entrada fictícia constante $x_0=1$:

$$z = w_0x_0 + w_1x_1 + \dots + w_nx_n, \quad \text{com } x_0=1,\ w_0=b$$

Como $x_0$ é sempre $1$, multiplicar por ele não muda nada: $w_0\cdot x_0 = w_0\cdot 1 = w_0 = b$. Ou seja, "o peso associado ao bias" **é** o próprio valor do bias — não é um segundo número independente, é só outro nome para a mesma quantidade.

No código do Marco 1, isso aparece de forma direta: `bias` é implementado como uma variável separada (não concatenamos um $x_0=1$ ao vetor de entradas), mas a regra de atualização é matematicamente idêntica à do $w_0$:

$$b_{novo} = b_{antigo} + \eta \cdot \text{erro} \cdot \underbrace{1}_{x_0} = b_{antigo} + \eta \cdot \text{erro}$$

— exatamente a linha que aparece no console (`-> ATUALIZA b : ... + η*(erro) = ...`).

**Nos experimentos registrados neste documento** (`--bias-inicial 0`): bias inicial = **0.0**, e portanto o peso inicial do bias ($w_0$ inicial) também é **0.0** — pela razão acima, não porque seja uma coincidência dos parâmetros escolhidos.

## Aprendizado 4 — o mesmo limite de ponto flutuante muda até o NÚMERO DE ÉPOCAS até convergir

Ao refazer as contas do AND inteiramente à mão (aritmética exata, sem arredondamento), o usuário obteve convergência na **época 6**, não na época 4 como o script reporta. Isso foi verificado e confirmado — não é erro de conta.

**Verificação 1 — treino com aritmética exata** (mesmos hiperparâmetros: pesos iniciais $[0,0]$, bias $0$, $\eta=0.1$), usando frações em vez de `float64`:

```
época 1: erros=2   época 2: erros=3   época 3: erros=3
época 4: erros=2   época 5: erros=1   época 6: erros=0  -> CONVERGE
```

**Verificação 2 — valor exato de $z$ no ponto $(1,0)$ (iteração 3) em cada época, na versão `float64` real do script**:

```
época 1: z = -0.1                -> sem erro
época 2: z = -0.1                -> sem erro
época 3: z =  0.0    (exato)     -> degrau(0)=1, mas y_real=0  -> ERRO, corrige
época 4: z = -2.78e-17           -> degrau(z)=0, bate com y_real=0 -> sem erro -> CONVERGE (no float64)
```

**Explicação**: na época 3, o ponto $(1,0)$ cai exatamente sobre a fronteira ($z=0$ redondo, sem nenhuma imprecisão envolvida ainda). Pela convenção `degrau(z) = 1 se z\geq 0`, isso conta como classe 1 — mas $AND(1,0)=0$, então é tratado como erro e os pesos são corrigidos de novo. **Com aritmética exata, essa mesma situação se repete** nas épocas seguintes (o ponto continua caindo exatamente em $z=0$ após cada correção, sendo reclassificado errado toda vez pela convenção `\geq 0`), e só depois de mais duas rodadas de correção o ponto sai de fato para o lado negativo — daí a convergência real ser na época 6.

No `float64`, porém, o arredondamento acumulado ao longo da época 3 faz esse mesmo cálculo, na época 4, resultar num resíduo *ligeiramente negativo* ($-2,78\times10^{-17}$) em vez de exatamente zero. Isso já basta para a convenção `\geq 0` classificar como `0` — que por coincidência é o rótulo certo — parando o treino 2 épocas mais cedo do que a matemática exata prevê.

**Conclusão**: a convergência "na época 4" reportada pelo script é, tecnicamente, **um acidente de arredondamento**, não uma propriedade robusta do algoritmo para esses hiperparâmetros. As duas contas — a manual (exata) e a do script (`float64`) — implementam a mesma regra corretamente; a diferença de 2 épocas vem inteiramente de como cada uma resolve um caso em que um ponto de treino fica repetidamente exatamente em cima da fronteira de decisão. Isso só acontece por causa da combinação "redonda" de hiperparâmetros escolhida (pesos iniciais zero, $\eta=0,1$, entradas booleanas $\{0,1\}$) — com pesos iniciais aleatórios (não redondos), é bem mais raro um `z` cair exatamente em zero, e esse efeito tende a não aparecer.

**Implicação para a Fase 2 (site em JS)**: como JavaScript também usa `float64`, reimplementar esse mesmo treino em JS pode reproduzir o comportamento do Python (convergência "cedo", por acidente) ou não, dependendo da ordem exata das operações de ponto flutuante no código — o número de épocas até convergir não é necessariamente portável 1:1 entre implementações, mesmo implementando "o mesmo algoritmo". Vale testar isso explicitamente durante a Fase 2.

### Como deixamos o algoritmo mais robusto a esse problema

Duas mudanças, uma no código e uma de boa prática:

1. **Tolerância numérica na função degrau** (implementada em `01_perceptron_gates.py`): em vez de comparar `z >= 0` cru, qualquer `|z|` menor que `TOLERANCIA_ZERO = 1e-9` é tratado como exatamente zero antes de comparar.

   ```python
   def degrau(z, tolerancia=1e-9):
       if abs(z) < tolerancia:
           z = 0.0
       return 1 if z >= 0 else 0
   ```

   O ruído de ponto flutuante observado aqui é da ordem de $10^{-16}$ a $10^{-17}$ — muitas ordens de grandeza menor que a tolerância — enquanto diferenças "de verdade" entre classes, com esses hiperparâmetros, nunca chegam nem perto de $10^{-9}$ por acaso. Resultado: o comportamento passa a ser **determinístico** e a bater sempre com a matemática exata. Verificado: com essa mudança, `AND` com `--pesos-iniciais 0 0 --bias-inicial 0` agora converge de forma estável na **época 6** (igual à aritmética exata), em vez de depender de qual resíduo de arredondamento sobrava. As demais portas com inicialização aleatória (padrão do script) não mudaram de comportamento, como esperado.

2. **Preferir inicialização aleatória (padrão do script) em vez de pesos "redondos"** para demonstrações — a causa raiz do caso degenerado é a combinação de números redondos (pesos zero, entradas booleanas, $\eta=0,1$); com pesos iniciais aleatórios, é estatisticamente muito raro um `z` cair exatamente em zero durante o treino, então esse efeito praticamente não aparece. `--pesos-iniciais 0 0` continua disponível (é didaticamente útil, como este próprio episódio mostra), mas vale ter em mente esse efeito colateral ao escolhê-lo.

## Aprendizado 5 — só pontos de classe 1 podem estar exatamente sobre a reta convergida

Depois da correção do Aprendizado 4, rodando novamente AND e OR, o usuário notou um padrão: a reta de decisão final **só passa exatamente em cima de pontos de classe 1** — nunca de classe 0. No AND (pesos finais $[0.2,0.1]$, bias $-0.3$), a reta passa exatamente por $(1,1)$. No OR (pesos finais $[0.1,0.1]$, bias $-0.1$), a reta passa exatamente por $(0,1)$ e $(1,0)$.

**Isso não é coincidência — é uma garantia matemática da combinação "convenção do degrau + convergência".** Prova curta:

1. Pela convenção do degrau, se um ponto $p$ está exatamente sobre a reta ($z(p)=0$), então $\hat{y}(p) = \text{degrau}(0) = 1$ — sempre, por definição da função (não depende dos dados).
2. Se o treino **convergiu** (erro zero em todos os pontos), então, em particular, não há erro em $p$: $\hat{y}(p) = y_{real}(p)$.
3. Combinando 1 e 2: $y_{real}(p) = 1$.

**Conclusão**: com a convenção `degrau(z)=1` para `z\geq 0`, é matematicamente **impossível** um ponto de classe 0 ficar exatamente sobre a reta de decisão de um perceptron já convergido — só pontos de classe 1 podem tocá-la (pontos de classe 0 ficam sempre **estritamente** do lado negativo). A recíproca não vale: um ponto de classe 1 pode estar exatamente sobre a reta ou estritamente do lado positivo — as duas opções são permitidas para essa classe, só a de classe 0 é que fica restrita.

Essa observação também reencaixa perfeitamente com o Aprendizado 4: antes da correção da tolerância, o ponto $(1,0)$ do AND (classe 0) estava "quase" caindo exatamente sobre a reta — e, por essa mesma prova, isso *teria* que dar erro caso ficasse exatamente em cima (já que é classe 0). O ruído de ponto flutuante, ao empurrá-lo para o lado estritamente negativo, foi o que permitiu ele ser classificado corretamente sem mais correções — mascarando, por acidente, o fato de que a reta "deveria" continuar se ajustando.

## Sugestões para o futuro

- Ao portar a lógica para o site (JS, Fase 2), ter em mente que JavaScript também usa `float64` (IEEE 754) — o mesmo tipo de resíduo de arredondamento pode aparecer lá, especialmente em qualquer ponto que fique exatamente sobre a fronteira aprendida. Não é um bug a corrigir, é um comportamento esperado a explicar se aparecer durante uma demonstração ao vivo.
- Ao comparar com o Adaline (Marco 2), verificar se o fato de ele otimizar erro quadrático contínuo (em vez de só contar acertos/erros) tende a deixar os pontos mais "afastados" da fronteira aprendida, evitando esse tipo de caso de fronteira exata — bom contraste pedagógico para a Q5 (gradiente descendente) na apresentação.
- Vale considerar, na fundamentação teórica do documento final, citar esse episódio como exemplo concreto de que o perceptron não maximiza margem — abre espaço para mencionar, ainda que brevemente, o conceito de margem (relevante para quem for além do escopo da disciplina, ex. SVM) como contraste.

---

# Aprendizados obtidos — Marco 2 (Adaline)

Parâmetros padrão: alvos bipolares (−1/+1), η = 0,1, pesos iniciais aleatórios (semente 42, mesmos do Marco 1), bias inicial 0, versão online, parada quando `|ΔSSE| < 1e-3·η` (`1e-4` com η = 0,1; revisto em 2026-10-12, ver o fim do Aprendizado 8).

## Aprendizado 6 — com alvos 0/1, "minimizar o erro" e "classificar certo" não são a mesma coisa

O Adaline não procura uma reta que separe as classes: ele procura a reta que deixa `z` o mais perto possível do alvo, em média quadrática. Com alvos 0/1 e o degrau em `z ≥ 0`, esse ótimo do AND é `w=(0,5; 0,5)`, `b=−0,25`, que classifica errado os pontos (0,1) e (1,0) (dão `z=+0,25`). Com alvos bipolares, o ótimo passa a ser `w=(1,1)`, `b=−1,5` e as 4 classificações ficam certas. Na prática, isso mostra que o custo que o algoritmo minimiza é uma escolha de projeto, e que ela precisa estar alinhada com a regra de decisão (ver Decisão 3 em `06_detalhes_implementacao.md`).

## Aprendizado 7 — o Adaline continua ajustando depois de acertar tudo

No AND, o Adaline já classifica os 4 pontos certo no fim da época 3, mas continua treinando até a época 43, porque o erro `alvo − z` ainda não é zero. A reta vai saindo de perto do ponto (1,1) e indo para o meio entre as classes, chegando a `w≈(1,06; 1,00)`, `b≈−1,48`. No mesmo cenário, o Perceptron para na época 3 com a reta quase encostada no (1,1), porque com erro `y − ŷ = 0` ele não tem mais motivo nenhum para se mover (ver Aprendizado 5). O modo `--comparar` mostra isso lado a lado. Os valores finais ficam perto do mínimo exato (`w=(1,1)`, `b=−1,5`), mas não exatamente nele: na versão online, cada exemplo puxa os pesos para um lado e eles ficam rondando o mínimo, como descrito no Tópico 15, seção 5. O SSE final é ~0,506, contra 0,5 do mínimo exato.

## Aprendizado 8 — o Adaline online, com a ordem fixa, não converge ao mínimo: converge a um ponto que se afasta dele quando η cresce

*Texto revisto em 2026-10-12 (Herik). A primeira versão atribuía o "ciclo" a ultrapassar o limite $2/\lVert\tilde{x}\rVert^2 = 2/3$ do Tópico 15 (seção 6); a conferência abaixo mostrou que não é isso que governa.*

**O que foi observado** (Marco 2, AND, η = 0,7): o treino não diverge; cada um dos 4 exemplos passa a errar por exatamente ±1,667, os pesos voltam ao mesmo valor no fim de cada época, o SSE "estabiliza" em 4,58 (o mínimo é 0,5) e 1 ponto fica mal classificado. Isso se confirma.

**A causa.** A versão online (um ajuste por exemplo), com os exemplos sempre na mesma ordem, é um mapa afim por época. Os pesos de fim de época convergem a um **ponto fixo que depende de η** e que só coincide com o mínimo (w = (1; 1; −1,5), E = 0,5) quando η → 0. Cálculo exato do ponto fixo no AND:

| η | pesos do ponto fixo (w₁; w₂; b) | E | mal classificados |
|---|---|---|---|
| 0,1 | (1,111; 1,056; −1,556) | 0,509 | 0 |
| 0,3 | (1,429; 1,214; −1,714) | 0,638 | 0 |
| 0,4 | (1,667; 1,333; −1,833) | 0,833 | 0 |
| 0,5 | (2,0; 1,5; −2,0) | 1,250 | 1 |
| 0,7 | (3,333; 2,167; −2,667) | 4,583 | 1 |

- **Estabilidade.** A época converge a esse ponto fixo (raio espectral < 1) até η ≈ 1,0 (0,98 em η = 0,99 e 1,03 em η = 1,01) e **diverge acima de 1,0** (em η = 1, o SSE chega a 2,7·10⁵ em 300 épocas). O valor $2/\lVert\tilde{x}\rVert^2 = 2/3$ é o limite de um passo isolado, não o da época; o limite da versão em lote é $2/\lambda_{max} \approx 0{,}31$.
- **Classificação.** O ponto fixo passa a classificar errado a partir de η = 0,5, abaixo de 2/3. Não há transição em 2/3: o custo sobe suavemente com η.
- É o mesmo efeito do "resíduo sobe com η" que a demo registrou no seu Aprendizado 6.

**Consequências.**
- **O SSE não é monótono.** No AND com η = 0,1 ele passa por 0,5061 (época 43, quando a parada, de $10^{-4}$ com η = 0,1, dispara) e depois sobe devagar até 0,5093 (o ponto fixo, w = (1,111; 1,056; −1,556)). Os "pesos finais ≈ (1,06; 1,00; −1,48)" ficam perto do mínimo do Tópico 15 porque a parada pega o trecho em que o caminho passa perto dele, não porque o limite seja o mínimo.
- O script avisa quando para com pontos ainda mal classificados (η grande demais).
- **Parada proporcional ao η (2026-10-12).** Com uma tolerância fixa de $10^{-4}$, η pequeno parava antes da hora, porque a queda do custo por época é proporcional ao η: no AND, η = 0,0005 parava no SSE 0,658 e η = 0,00001, na época 2 com 1 ponto errado, sendo o mínimo 0,5. A tolerância passou a ser $10^{-3}\,\eta$ (igual a $10^{-4}$ com η = 0,1, então os resultados com o η padrão não mudam: AND 43, OR 61, NAND 44, NOR 64 e NOT 85 épocas). Com η = 0,0005 o treino agora para no SSE 0,5008, na época 11600.
- **Mitigações possíveis (não implementadas):** η menor; a versão em lote (converge ao mínimo se η < $2/\lambda_{max}$); embaralhar a ordem dos exemplos a cada época.

## Aprendizado 9 — como interpretar o Adaline: uma regressão linear usada como classificador

O Adaline tem a mesma estrutura do Perceptron: calcula `z = w₁x₁ + w₂x₂ + b` e classifica pelo degrau (`ŷ = 1` se `z ≥ 0`). A reta de decisão também é a mesma, os pontos onde `z = 0`. O que muda é o que ele tenta aprender:

| | Perceptron | Adaline |
|---|---|---|
| Erro usado na correção | `y − ŷ` (depois do degrau) | `y − z` (antes do degrau) |
| Valores possíveis do erro | −1, 0 ou +1 | qualquer número real |
| Quando corrige | só quando erra a classe | sempre, inclusive quando acerta a classe |
| Pergunta que responde | "acertei?" | "quão longe fiquei do alvo?" |

**Leitura geométrica.** O Adaline ajusta um plano `z(x₁, x₂)` que tenta passar pelas alturas −1/+1 dos pontos, o que é uma regressão linear por mínimos quadrados. A reta de decisão é onde esse plano corta a altura zero. A regra delta, `Δw = η · (y − z) · x`, é um passo de gradiente descendente sobre o custo `SSE = ½ · Σ (y − z)²` (calculado assim no script). A curva de SSE no gráfico mostra essa descida.

**Exemplo do AND.** O melhor plano possível é `z = x₁ + x₂ − 1,5`:

| Entrada | Alvo | z | Resíduo `y − z` |
|---|---|---|---|
| (0,0) | −1 | −1,5 | +0,5 |
| (0,1) | −1 | −0,5 | −0,5 |
| (1,0) | −1 | −0,5 | −0,5 |
| (1,1) | +1 | +0,5 | +0,5 |

Daí saem duas consequências observadas na animação:

- **O SSE não chega a zero.** Um plano não passa exatamente pelas 4 alturas, e cada ponto fica a 0,5 do alvo. Isso dá `SSE = ½ · 4 · 0,25 = 0,5`, o piso que o gráfico mostra. Por isso o critério de parada é o SSE parar de cair, e não zerar os erros de classificação (Decisão 4).
- **A reta termina centrada entre as classes.** O mínimo leva todos os pontos em conta ao mesmo tempo, então a reta não fica encostada num ponto como no Perceptron convergido (Aprendizado 5). É por isso que ela continua andando depois de 100% de acerto (Aprendizado 7).

**O limite do modelo (gancho para o Marco 3).** No XOR, com alvos bipolares, o mesmo cálculo de mínimos quadrados dá `w = (0, 0)` e `b = 0`: um plano plano em `z = 0` para todas as entradas. Pela convenção do degrau, os 4 pontos viram classe 1 e só 2 de 4 ficam certos. O gradiente descendente funciona e converge, mas para um modelo que não decide nada. A limitação não está no algoritmo de otimização: está em o modelo ser linear. É isso que motiva a camada escondida do Marco 4. (Previsão teórica, a ser conferida quando o Marco 3 rodar o XOR com o Adaline.)

