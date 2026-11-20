---
version: 4
name: NeuroLógica
description: >
  Sistema visual do NeuroLógica. Uma paleta verde inspirada na UEL (#00864a, tinta quase
  preta, papel esverdeado) aplicada à interface do site existente, mais uma camada
  decorativa de estética Scribble / Hand-Drawn Minimalist — futurista, mas feita à mão —
  restrita a elementos avulsos: tela de carregamento, arte do topo, ilustrações de margem,
  divisores e o tratamento do logotipo. O layout, as fontes, os componentes funcionais e
  todos os gráficos permanecem exatamente como estão — inclusive as cores dos gráficos,
  que mantêm a paleta antiga (laranja-terracota e azul). A visualização vem antes da estética.
colors:
  primary: "#00864a"
  primary-strong: "#006b3b"
  primary-deep: "#004d2a"
  primary-soft: "#7ccb9f"
  primary-mist: "#bfe3cd"
  on-primary: "#ffffff"
  ink: "#0d1411"
  body: "#3d4b43"
  muted: "#5a6a61"
  muted-faint: "#7c8c83"
  muted-light: "#a9bcb0"
  surface: "#f6faf7"
  surface-tint: "#ebf3ee"
  surface-wash: "#dceae1"
  border: "#c8dccf"
  border-strong: "#a6c2b1"
  success: "{colors.primary-strong}"
  error: "#b3323f"
chart-colors:
  # Paleta ANTIGA, preservada de propósito: os gráficos não mudam de cor.
  data-positive: "#d97757"
  data-negative: "#6a9bcc"
  highlight: "#d97757"
  ink: "#141413"
  muted: "#73726c"
  surface: "#faf9f5"
  border: "#d1cfc5"
  border-strong: "#bdbab0"
  line-1: "#141413"
  line-2: "#788c5d"
  line-3: "#c25f3f"
  line-4: "#73726c"
chart-colors-dark:
  data-positive: "#e08a68"
  data-negative: "#7fb0dd"
  highlight: "#e08a68"
  ink: "#f5f3ee"
  muted: "#a09d93"
  surface: "#16161a"
  border: "#33333a"
  border-strong: "#45454e"
  line-1: "#f5f3ee"
  line-2: "#9ab17a"
  line-3: "#ec9b7a"
  line-4: "#a09d93"
colors-dark:
  primary: "#2ec27e"
  primary-strong: "#63d99f"
  primary-deep: "#1a8f5a"
  primary-soft: "#2f7a55"
  primary-mist: "#1f3d2f"
  on-primary: "#0e1512"
  ink: "#eef5f0"
  body: "#bccac1"
  muted: "#93a59a"
  muted-faint: "#6f8177"
  muted-light: "#6f8177"
  surface: "#0e1512"
  surface-tint: "#141d19"
  surface-wash: "#1c2823"
  border: "#2a3a33"
  border-strong: "#3a4f45"
  success: "#63d99f"
  error: "#e8737d"
typography:
  display-xl:
    fontFamily: Inter
    fontSize: clamp(31px, 5.4vw, 54px)
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: -0.018em
  display-lg:
    fontFamily: Inter
    fontSize: clamp(25px, 3.6vw, 36px)
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: -0.018em
  title-md:
    fontFamily: Inter
    fontSize: 19px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  body-serif:
    fontFamily: Source Serif 4
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.55
  body-sans:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.25
  caption:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.3
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0.06em
  note-serif:
    fontFamily: Source Serif 4
    fontSize: 15px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.4
  mono-code:
    fontFamily: JetBrains Mono
    fontSize: 12.5px
    fontWeight: 400
    lineHeight: 1.75
rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  2xl: 24px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 20px
  xl: 24px
  2xl: 32px
  3xl: 48px
  4xl: 64px
  gutter: 40px
shadow:
  card: "rgba(0, 0, 0, 0.05) 0 4px 24px 0"
  elevated: "rgba(0, 0, 0, 0.04) 0 1px 1px 0, rgba(0, 0, 0, 0.06) 0 4px 4px 0, rgba(0, 0, 0, 0.08) 0 16px 24px 0"
stroke:
  hair: 1px
  line: 1.5px
  marker: 2.5px
motion:
  draw-on: 620ms cubic-bezier(0.22, 1, 0.36, 1)
  quick: 140ms cubic-bezier(0.2, 0, 0.2, 1)
  line-boil: 8fps
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px 24px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border}"
    borderWidth: 1px
    rounded: "{rounded.md}"
    padding: 12px 24px
  card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    borderWidth: 1px
    rounded: "{rounded.xl}"
    padding: 24px
  badge:
    backgroundColor: "{colors.surface-wash}"
    textColor: "{colors.ink}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.sm}"
    padding: 4px 8px
  link:
    textColor: "{colors.primary-strong}"
---

# NeuroLógica — Sistema de Design

## Visão geral

O NeuroLógica ensina redes neurais mostrando um neurônio *aprendendo a traçar uma reta*. O
site já existe, funciona e tem um layout, fontes e gráficos que estão **aprovados**. Este
documento descreve uma mudança de **pele**, e não de estrutura: trocar a paleta laranja e
bege **da interface** por um verde de identidade UEL e acrescentar uma camada decorativa de
rabisco à mão, com cara de caderno de laboratório futurista.

**Os gráficos não mudam de cor.** O plano de decisão, a curva de erro, a rede (conexões,
miniaturas dos neurônios, molduras), as retas de decisão e as legendas que codificam as
classes (tabela-verdade, amostras "peso positivo / peso negativo") continuam com a paleta
antiga: laranja-terracota para a classe 1 e o peso positivo, azul para a classe 0 e o peso
negativo, e os mesmos cinzas de rótulos, eixos e contornos. A interface ao redor fica verde;
o dado continua laranja e azul.

A identidade de cor vem da **paleta institucional da UEL**: o verde `#00864a` (o círculo do
emblema), a tinta quase preta (as barras) e o papel claro. Só as **cores** são inspiração.
O emblema da universidade **não deve ser redesenhado nem imitado**; se um dia o logotipo
oficial for exibido, deve ser o arquivo oficial da instituição, sem alterações.

O logotipo do projeto (o neurônio de dendritos, soma e axônio) **permanece o mesmo**. Muda a
cor da soma, que passa a ser o verde da marca, e ele ganha o tremido de traço à mão *apenas*
na tela de carregamento.

> **Regra de precedência.** Se qualquer decisão estética entrar em conflito com a
> legibilidade, a posição de um dado ou o layout, **a visualização vence**, sempre.

## Contrato de escopo: o que muda e o que não muda

| | Muda | Não muda |
|---|---|---|
| **Cor** | Os *valores* das variáveis de cor da **interface** (laranja → verde, bege → verdes claros) | Os *nomes* das variáveis; as **cores dos gráficos** (paleta antiga preservada) |
| **Tela de carregamento** | Todo o visual e a linha do tempo da animação | Duração mínima e máxima, espera das fontes, caminho de movimento reduzido |
| **Arte do topo** | A ilustração de fundo do hero | O texto, os botões, a altura e o espaçamento do hero |
| **Decoração** | Ilustrações de margem, divisores de seção, marca-texto em títulos, textura | — (é tudo *acréscimo* atrás do conteúdo) |
| **Logotipo** | Cor da soma; tremido à mão na abertura | A geometria (3 dendritos, soma, axônio ramificado) |
| **Layout** | — | Grades, larguras, alturas, espaçamentos, ordem, pontos de quebra, o que aparece no telefone |
| **Fontes** | — | Inter, Source Serif 4 e JetBrains Mono, com os mesmos tamanhos e pesos. **Nenhuma fonte nova.** |
| **Componentes funcionais** | Só as cores (ver tabela adiante) | Forma, tamanho, raio, espaçamento, sombra, ícones |
| **Gráficos** | — (nem a cor) | Cores, geometria, traços, marcadores, tracejados, brilho, tamanhos, código |
| **Lógica** | — | Todo o treino, os dados e o estado |

**Como os gráficos ficam com as cores antigas sem mudar o código deles.** O código dos
gráficos lê as cores das variáveis CSS no contêiner onde cada gráfico é desenhado
(`getComputedStyle(contêiner)`). Variáveis CSS são herdadas, então basta **redeclarar**,
só dentro desses contêineres, as variáveis que o código lê, apontando para a paleta antiga
(tokens `chart-colors`). Resultado: `grafico.js` e `rede_visual.js` ficam intactos.

| Contêiner | Quem desenha | Variáveis redeclaradas |
|---|---|---|
| `.lab-plano` | plano de decisão (`grafico.js`) | `--cor-primaria`, `--cor-tinta`, `--cor-suave`, `--cor-superficie`, `--cor-borda` |
| `.lab-erro` | curva de erro (`grafico.js`) | as mesmas |
| `.rede-visual` | rede (`rede_visual.js`) | `--cor-tinta`, `--cor-suave`, `--cor-superficie`, `--cor-borda-forte` |
| `:root` | todos | `--cor-classe-1` e `--cor-classe-0` simplesmente **não mudam de valor** |

Dois cuidados que esse mecanismo exige:

- **Não vazar para a interface.** `.rede-visual` também contém controles (botões +/−, (?)).
  Por isso ali **não** se redeclara `--cor-primaria` (o código da rede não a lê; o hover dos
  botões continua verde), e as barras de controle voltam aos neutros do tema lendo aliases
  `--tema-*`, declarados no `:root` antes de qualquer redeclaração. A borda e o fundo do
  próprio painel `.rede-visual` também seguem o tema.
- **Fundos acompanham o tema.** O que o código *desenha* mantém a cor antiga; o que fica
  *atrás* do desenho (papel da página, fundo do painel da rede, fundo do laboratório) é da
  interface e fica verde-claro. Na região semitransparente do plano de decisão o papel novo
  aparece por baixo; no tema claro a diferença é imperceptível, no escuro o quadro esverdeado
  tinge levemente as áreas de baixa confiança.

**Duas exceções em código, ambas pequenas e justificadas:**

1. **Cores das retas.** A função `retasAtuais()` (`laboratorio.js`) lê as cores das retas no
   contêiner do *laboratório inteiro*, que é interface e fica verde; ali `--cor-acerto` e
   `--cor-primaria-forte` viram o **mesmo verde**. Para manter as quatro cores antigas, a
   função passa a ler variáveis próprias (`--grafico-reta-1` a `--grafico-reta-4`, tokens
   `chart-colors.line-*`, com os valores antigos). É a **única** edição em código de
   gráfico, e é só de onde a cor é lida.
2. **Botões (?) da rede.** Os dois que explicam o mini-gráfico e as linhas entre neurônios
   foram perdidos numa reescrita anterior e são restaurados (item pedido desde o início). Os
   textos descrevem as cores dos gráficos, que continuam **laranja e azul**. Na tela larga
   ficam na linha do título "A rede"; até 720 px essa linha não tem folga, então eles saem do
   fluxo e ficam nos cantos de cima do painel da rede, dos dois lados do controle de camadas.

## Direção de arte da camada decorativa

Cinco princípios, aplicados **somente** aos elementos avulsos do escopo acima.

1. **Toda linha tem um autor.** Nenhum traço decorativo é perfeitamente reto ou uniforme. A
   irregularidade é pequena (frações de pixel a 2 px) e coerente: o mesmo filtro de tremido
   em todo o site, para parecer uma só mão.
2. **Menos traços, mais intenção.** Cada ilustração usa poucos gestos: um círculo, uma reta,
   três pontos. Se dá para tirar um traço sem perder o sentido, tire.
3. **Contorno duplo.** Formas de destaque são traçadas duas vezes, com deslocamento de 1 a
   2 px e opacidade diferente, como quem passa a caneta duas vezes.
4. **Marca-texto, não fundo.** Ênfase é uma faixa irregular de `primary-mist` sob palavras
   de **títulos**, como canetinha passada por cima. Nunca dentro do laboratório.
5. **O futuro aparece como instrumento.** Retículas, órbitas tracejadas, colchetes de mira,
   marcas de régua e cotas em fonte mono; em verde ou tinta, finos (`stroke.hair`), com
   opacidade baixa e sempre *atrás* do conteúdo.

**O que este estilo não é:** não é infantil (nada de rostos ou cores berrantes), não é
ruidoso (o tremido jamais compromete a leitura) e **não toca a área de dados**.

## Cores

### Papel (tema claro)

| Papel | Token | Valor | Uso |
|---|---|---|---|
| Acento | `primary` | `#00864a` | Fundo de botão primário, traços de marca, soma do logotipo, texto **grande** |
| Verde de texto | `primary-strong` | `#006b3b` | **Todo texto verde pequeno**: links, rótulos, hover de botão |
| Verde profundo | `primary-deep` | `#004d2a` | Traço de ênfase nas ilustrações, hachura densa |
| Verde suave | `primary-soft` | `#7ccb9f` | Órbitas, hachura leve, "Lógica" no rodapé |
| Marca-texto | `primary-mist` | `#bfe3cd` | Faixa de canetinha sob títulos |
| Sobre o acento | `on-primary` | `#ffffff` | **Único** uso de branco puro: rótulo do botão primário (4,66:1) |
| Tinta | `ink` | `#0d1411` | Texto principal |
| Corpo | `body` | `#3d4b43` | Texto corrido secundário |
| Suave | `muted` | `#5a6a61` | Texto de apoio (5,43:1) |
| Tênue | `muted-faint` | `#7c8c83` | Só decorativo ou texto ≥ 18 px (3,36:1) |
| Papel | `surface` | `#f6faf7` | Fundo da página e dos cartões (nunca branco puro) |
| Papel-tom | `surface-tint` | `#ebf3ee` | Cabeçalho, seções alternadas, blocos de código |
| Papel-lavado | `surface-wash` | `#dceae1` | Selo "pronto", realces neutros |
| Contorno | `border` / `border-strong` | `#c8dccf` / `#a6c2b1` | Linhas finas estruturais |

### Quadro-negro (tema escuro)

A mesma lógica em outra atmosfera: papel vira quadro verde-escuro (`#0e1512`) e a tinta vira
giz (`#eef5f0`). O acento sobe de luminosidade (`#2ec27e`) para manter contraste, e o rótulo
do botão inverte para o tom do quadro. Os traços **decorativos** do modo escuro ficam um
pouco mais grossos e mais opacos, com jeito de giz. Valores em `colors-dark`.

### Cores dos gráficos (paleta antiga, preservada)

Valores em `chart-colors` e `chart-colors-dark`. **Idênticos aos do site antes da troca.**

| Significado | Claro | Escuro | Variável |
|---|---|---|---|
| Classe 1 / peso positivo / neurônio ativo | `#d97757` | `#e08a68` | `--cor-classe-1` (valor mantido) |
| Classe 0 / peso negativo / neurônio calado | `#6a9bcc` | `#7fb0dd` | `--cor-classe-0` (valor mantido) |
| Destaque (ponto em avaliação, curva de erro) | `#d97757` | `#e08a68` | `--grafico-destaque` |
| Rótulos e contornos | `#141413` / `#73726c` / `#d1cfc5` / `#bdbab0` | `#f5f3ee` / `#a09d93` / `#33333a` / `#45454e` | `--grafico-tinta`, `-suave`, `-borda`, `-borda-forte` |
| Contorno claro dos pontos | `#faf9f5` | `#16161a` | `--grafico-superficie` |
| Retas dos neurônios ocultos | `#141413`, `#788c5d`, `#c25f3f`, `#73726c` | `#f5f3ee`, `#9ab17a`, `#ec9b7a`, `#a09d93` | `--grafico-reta-1` a `-4` |

**Limitação antiga, não agravada.** No tema claro, laranja e azul ficam em ~2,8–3,0:1 contra
o papel (abaixo dos 3:1 recomendados para gráficos). Era assim antes e continua assim — o
papel novo tem a mesma luminância que o antigo (2,96 e 2,78:1 nos dois). Corrigir exigiria
mudar as cores dos gráficos, o que está fora do escopo.

### Cores de estado da interface

| Significado | Claro | Escuro |
|---|---|---|
| Sucesso ("convergiu") | `#006b3b` | `#63d99f` |
| Falha ("parou sem resolver") | `#b3323f` | `#e8737d` |

### Regras

- **O verde `#00864a` nunca é texto pequeno** (4,42:1, abaixo de 4,5). Todo texto pequeno que
  hoje usa a cor de marca passa a usar `primary-strong`. Isso inclui: links (`a`), o rótulo
  do topo (`.hero-etiqueta`, 12 px), a dica da gaveta (`.gaveta-pista`), a linha de reinício
  do log (`.log-linha--reinicio`) e o "Lógica" do cabeçalho. O verde puro fica para
  preenchimentos, traços e texto ≥ 24 px (o destaque em itálico do topo).
- **"Treinando" ≠ "convergiu".** Como ambos seriam verdes, o selo *treinando* deixa de usar o
  tom da marca: fica transparente, com um contorno de tinta de 1 px feito por
  `box-shadow: inset` (para não mudar o tamanho do selo). Só o *convergiu* é verde.
- **Sem cor de marca em bloco grande.** O verde ocupa menos de ~10% de qualquer tela.
- **Laranja só nos dados.** Laranja-terracota, bege, creme e areia **não aparecem na
  interface**. O laranja existe apenas como cor dos gráficos e das legendas que codificam as
  classes (tabela-verdade, amostras "peso positivo"), e os textos que *descrevem* os gráficos
  (botões (?)) podem e devem dizer "laranja".
- **Decoração não usa as cores dos dados.** Ilustrações decorativas nunca pintam pontos de
  laranja e azul, para não sugerir um código de cores diferente do dos gráficos: pontos
  decorativos são cheios ou vazados, em tinta ou verde.

### Contrastes verificados (WCAG 2.x, calculados)

| Par | Razão | Mínimo | |
|---|---|---|---|
| `ink` / `surface` | 17,72 | 4,5 | ok |
| `body` / `surface` | 8,72 | 4,5 | ok |
| `muted` / `surface` | 5,43 | 4,5 | ok |
| `primary-strong` / `surface` | 6,30 | 4,5 | ok |
| `primary-strong` / `surface-wash` | 5,34 | 4,5 | ok |
| `on-primary` / `primary` | 4,66 | 4,5 | ok |
| `primary` / `surface` como texto | 4,42 | 4,5 | **abaixo** — só traço e texto grande |
| `primary` / `surface` como elemento não-textual | 4,42 | 3,0 | ok |
| `error` / `surface` | 5,79 | 4,5 | ok |
| `ink` / `primary-mist` (marca-texto) | 13,41 | 4,5 | ok |
| rodapé: `primary-soft` / `ink` | 9,69 | 4,5 | ok |
| escuro: `ink` / `surface` | 16,70 | 4,5 | ok |
| escuro: `primary` / `surface` | 8,05 | 4,5 | ok |
| escuro: `on-primary` / `primary` | 8,05 | 4,5 | ok |
| gráfico, claro: classe 1 / papel | 2,96 | 3,0 | abaixo — **igual ao antes** |
| gráfico, claro: classe 0 / papel | 2,78 | 3,0 | abaixo — **igual ao antes** |
| gráfico, escuro: classe 1 / quadro | 7,05 | 3,0 | ok |
| gráfico, escuro: classe 0 / quadro | 8,07 | 3,0 | ok |

## Tipografia

**Não muda.** Inter (títulos, interface, botões), Source Serif 4 (texto corrido e navegação)
e JetBrains Mono (pesos, log, pseudocódigo), com os mesmos tamanhos, pesos e espaçamentos.
**Nenhuma fonte nova é adicionada**, e em particular nenhuma fonte manuscrita: o "à mão"
vem só dos traços desenhados. Os únicos pesos são 400, 600 e 700 (nunca 500).

Anotações curtas dentro das ilustrações, quando houver, usam `note-serif` (Source Serif 4
itálico, 15 px, cor `muted`), até uma por seção, com no máximo ~6 palavras: "uma reta só…".

**O nome.** "NeuroLógica" continua com duas vozes, já implementadas: *Neuro* em Inter 600 na
tinta; *Lógica* em Source Serif 4 itálico 600 no verde. `primary-strong` no cabeçalho
(19 px) e `primary` na abertura (grande); `primary-soft` sobre o fundo escuro do rodapé.
Na versão grande, o sublinhado ondulado passa a usar o verde novo. Sempre com o acento e o
"L" maiúsculo em textos visíveis.

## Layout e posicionamento das decorações

O layout **não muda**. Toda decoração obedece a estas regras, sem exceção:

- `position: absolute`, `pointer-events: none`, `aria-hidden="true"`, atrás do conteúdo.
  Para ficar atrás do texto sem sumir atrás do fundo da seção, a seção vira um contexto de
  empilhamento (`position: relative; z-index: 0`, que não muda a geometria) e a decoração usa
  `z-index: -1`. A decoração cabe inteira dentro da seção e da largura da página.
  Portanto **não entra no fluxo**, não altera a altura de nada e não cria rolagem.
- **Nunca** dentro de `.laboratorio`, de `.texto-coluna`, dos gráficos, da rede ou do painel do
  algoritmo, e nunca sobre o texto de leitura.
- **Tamanho medido, não suposto** (atualizado em 2026-09-29): em telas largas, o desenho vai
  para a lateral no maior tamanho que caiba sem encostar em nenhuma linha de texto (folga de
  28 px), medido por `js/decoracao.js`.
- **Celular primeiro:** onde a lateral não comporta o desenho (sempre no telefone), ele fica
  **no fluxo** — no alto de cada ato, e uma versão horizontal abaixo dos botões do topo. Essa
  é a única exceção autorizada à regra de não mexer no layout.
- **Divisores de seção:** o `border-block` de `.secao--tom` **permanece com a mesma
  espessura** (pode ficar transparente). A onda desenhada é um pseudo-elemento absoluto
  por cima dele. Remover a borda mudaria a altura da seção em 2 px.

## Elevação e profundidade

**Não muda.** Os cartões continuam com `--sombra-cartao` e o laboratório com
`--sombra-elevada` (as sombras suaves do site atual). Hachura só existe *dentro* das
ilustrações decorativas.

## Sistema de ilustração

### Traço

| Elemento | Espessura | Cor | Opacidade | Filtro |
|---|---|---|---|---|
| Ilustração principal | `stroke.marker` 2,5 px | `ink` | 0,85 | `#rascunho` |
| Segundo traço (duplo) | `stroke.line` 1,5 px | `primary` | 0,55 | `#rascunho`, deslocado 1–2 px |
| Cota, órbita, retícula | `stroke.hair` 1 px | `primary-soft` | 0,45 | `#rascunho-fino` |
| Marca-texto | preenchimento | `primary-mist` | 0,9 | bordas desiguais |

Terminações e junções sempre **round**. O tremido usa os filtros SVG que já existem no
`index.html` (`#rascunho`, `#rascunho-fino`); não criar filtros novos sem necessidade.

> **Restrição de desempenho.** Filtro de deslocamento nunca em algo que se redesenha a cada
> quadro: o `<canvas>` da região de decisão, o gráfico de erro, a rede. Como as decorações
> são estáticas e fora dessas áreas, isso já é garantido pelo posicionamento.

### Vocabulário fechado de motivos

Neurônio-rabisco (o logotipo simplificado), quadrado XOR (quatro pontos nos cantos, dois
**cheios** e dois **vazados** — nunca laranja e azul, que são as cores dos dados), reta que
tenta, muro de tijolos, duas retas cruzadas, órbita com mira, cota com número em mono, seta
manuscrita e rabisco de ênfase. Ilustrações novas combinam estes motivos; não inventam outros.

### Ilustrações por seção

| Seção | Composição |
|---|---|
| Abertura | Órbitas + neurônio grande + retículas |
| Topo (hero) | Quadrado XOR com uma reta falhando, órbita atrás, colchetes de mira |
| Ato 1 | Neurônio-rabisco traçando uma reta que separa dois pontos (margem) |
| Ato 2 | Muro de tijolos com uma reta batendo nele (margem) |
| Ato 3 | Duas retas cruzadas recortando uma faixa hachurada (margem) |
| Divisores | Ondas de traço fino no lugar das bordas retas das seções de fundo tonal |
| Rodapé | Borda superior ondulada, como linha de horizonte |

## Movimento (somente decorativo)

- **Desenhar-se:** traços aparecem sendo riscados (`stroke-dashoffset` até 0), na ordem em que
  alguém desenharia; ao entrar na tela, com stagger curto.
- **Tremido de lápis:** ilustrações decorativas alternam 2 ou 3 variações do filtro a ~8 quadros
  por segundo. Só decorativo, só quando visível.
- **`prefers-reduced-motion`:** todo desenhar-se vira um aparecer simples e todo tremido fica
  parado. O conteúdo nunca depende de animação.
- **Não muda:** transições dos controles, animação do treino, ampliação do neurônio.

## Tela de carregamento — "o caderno abre"

1. Fundo de papel com o grão do site e uma retícula pontilhada discreta.
2. Um **anel de órbita** riscado à mão em volta do centro (traço duplo), com um anel interno
   tracejado girando devagar. O logotipo **maior** que hoje.
3. O logotipo é desenhado traço a traço (dendritos, soma, axônio); a **soma é preenchida por
   hachura verde** que cresce até virar disco.
4. Colchetes de mira aparecem nos quatro cantos do logotipo e uma cota tracejada mede o anel.
5. O nome **NeuroLógica** é "escrito" da esquerda para a direita (máscara que revela) e um
   sublinhado ondulado é traçado sob "Lógica".
6. A legenda continua em Inter 14 px. Pode trocar no máximo duas vezes ("afiando o lápis…"
   → "traçando os eixos…"). Um **risco de progresso** se estende com o progresso *real* da
   linha do tempo, sem porcentagem inventada.
7. Sai com uma transição de opacidade, como hoje.

**Não muda:** duração mínima (~1 s), teto com saída forçada (~3,4 s), espera de
`document.fonts.ready`, caminho simplificado em `prefers-reduced-motion`, e o script bloqueante
do `<head>` que grava o tema antes da primeira pintura (a tela **não** pode voltar a mostrar
um flash do tema errado).

## Componentes funcionais: só a cor muda

Forma, tamanho, raio, espaçamento, sombra e ícones permanecem. Mudam apenas estes valores:

| Elemento | Antes | Passa a ser |
|---|---|---|
| Botão primário | fundo terracota | fundo `primary`, rótulo `on-primary`; hover `primary-strong` |
| Botão de tocar | círculo terracota | círculo `primary` |
| Links | terracota | `primary-strong` |
| Etiqueta de ato | fundo areia | fundo `surface-wash`; alerta em `error`; sucesso em `success` |
| Selo "pronto" | fundo areia | fundo `surface-wash`, texto `ink` |
| Selo "treinando" | tom da marca | transparente + contorno de tinta interno (ver Regras) |
| Selo "convergiu" | sálvia | tom de `success` |
| Selo "falha" | tom de erro | tom de `error` (carmesim) |
| Chip de peso alterado | tom da marca | tom de `primary` |
| Linha ativa do pseudocódigo | tom da marca | tom de `primary` + filete `primary` |
| Log: sucesso / reinício | sálvia / terracota | `success` / `primary-strong` |
| Contador +/− e (?) em hover | terracota | `primary`, texto `on-primary` |
| Anel de foco | terracota | `primary` |
| Rodapé | fundo tinta, "Lógica" terracota-fraco | fundo tinta, "Lógica" `primary-soft` |

## Visualização de dados

**Não muda nada**: nem código, nem geometria, nem traços, nem tracejados, nem brilho, nem
**cor**. O mecanismo está descrito no Contrato de escopo (variáveis redeclaradas nos
contêineres dos gráficos). As duas exceções em código (de onde as retas leem a cor e os
botões (?)) também estão lá.

- **Prova exigida.** Como o treino é determinístico (semente 42), o estado final de cada
  laboratório é sempre o mesmo. Portanto os **pixels do `<canvas>` do plano de decisão**, os
  traços da curva de erro e as cores das conexões e das retas no fim de cada ato devem ser
  **idênticos** aos de antes da troca de paleta. As miniaturas dos neurônios devem ter todos os
  pixels na rampa entre `#6a9bcc` e `#d97757` (claro).
- **As legendas acompanham os gráficos.** A tabela-verdade e as amostras "peso positivo / peso
  negativo" usam `--cor-classe-1/0`, que não mudam; ficam laranja e azul, coerentes com o dado.

## Do's e Don'ts

### Faça
- Trate a estética como camada *por cima* e *ao redor*, nunca *dentro* da visualização.
- Use `primary-strong` para qualquer texto verde pequeno.
- Aplique o mesmo filtro de tremido em todo o site, para parecer uma só mão.
- Respeite `prefers-reduced-motion` e `prefers-color-scheme`.
- Meça o layout antes e depois: nada pode andar mais de 1 px.

### Não faça
- Não mude layout, fontes, tamanhos, espaçamentos, raios ou sombras dos componentes.
- Não use fonte manuscrita nem qualquer fonte nova.
- Não aplique filtro, tremido ou hachura em gráficos, rede, painel, controles ou textos.
- Não deixe decoração entrar no fluxo, alterar alturas ou criar rolagem horizontal.
- Não use laranja, terracota, bege, creme ou areia na interface nem na decoração (só nos gráficos).
- Não mude nenhuma cor desenhada pelos gráficos.
- Não use o verde puro como texto pequeno.
- Não desenhe o emblema da UEL nem imite as barras e o círculo dele.
- Não use imagens raster, CDN nem o peso 500.
- Não corrija por conta própria nada que mexa em código de gráfico além das duas exceções.

## Responsivo, desempenho e acessibilidade

- Verificar em 320, 390, 820 e 1440 px. **Nunca** rolagem horizontal, na página ou na rede.
- Decorações somem abaixo de 900 px (salvo se couberem em vazio já existente).
- Peso adicional de CSS + JS + SVG inline: manter abaixo de ~60 KB. Nenhuma fonte nova.
- Animação a 60 fps durante o treino, sem regressão.
- Ilustrações com `aria-hidden="true"`; foco de teclado visível; todo elemento interativo com
  nome acessível.

## Correspondência com as variáveis CSS

Os **nomes ficam como estão**; mudam só os **valores**. Um nome que ficaria enganoso
(`areia`) permanece por compatibilidade, com comentário.

| Token deste documento | Variável CSS | Observação |
|---|---|---|
| `primary` | `--cor-primaria` | vira `#00864a` |
| `primary-strong` | `--cor-primaria-forte` | passa a ser o verde de **texto** |
| `primary-soft` | `--cor-primaria-fraca` | hoje só no rodapé |
| `primary-deep` | *(nova)* `--cor-primaria-profunda` | criar |
| `primary-mist` | *(nova)* `--cor-marca-texto` | criar |
| `on-primary` | `--cor-sobre-escuro` | `#ffffff` no claro, `#0e1512` no escuro |
| `ink` / `body` | `--cor-tinta` / `--cor-texto` | |
| `muted` / `muted-faint` / `muted-light` | `--cor-suave` / `--cor-suave-fraca` / `--cor-suave-clara` | |
| `surface` / `surface-tint` | `--cor-superficie` / `--cor-superficie-tom` | |
| `surface-wash` | `--cor-superficie-areia` | **nome legado**; valor verde-claro |
| `border` / `border-strong` | `--cor-borda` / `--cor-borda-forte` | |
| `success` / `error` | `--cor-acerto` / `--cor-erro` | acerto vira verde; erro vira carmesim |
| `chart-colors.data-positive/negative` | `--cor-classe-1` / `--cor-classe-0` | **valores mantidos** (antigos) |
| `chart-colors.highlight` | *(nova)* `--grafico-destaque` | redeclarada como `--cor-primaria` em `.lab-plano` e `.lab-erro` |
| `chart-colors.ink/muted/surface/border/border-strong` | *(novas)* `--grafico-tinta`, `-suave`, `-superficie`, `-borda`, `-borda-forte` | redeclaradas nos contêineres dos gráficos |
| `chart-colors.line-1` a `line-4` | *(novas)* `--grafico-reta-1` a `-4` | lidas por `retasAtuais` |
| — | *(novas)* `--tema-tinta`, `-suave`, `-superficie`, `-borda`, `-borda-forte` | aliases dos neutros do tema, para as barras de controle dentro de `.rede-visual` |

Há duas cores fixas fora dos tokens, a corrigir: o sublinhado ondulado do nome
(`%23d97757` num `data:` URI em `css/estilo.css`, regra `.marca-nome--grande .marca-logica`) e
o valor de reserva do logotipo (`var(--cor-primaria, #d97757)` em `assets/logo.svg`). Um
`data:` URI não enxerga variáveis CSS: reescreva o sublinhado com a cor nova (ou como `mask`
sobre `currentColor`).

## Lacunas conhecidas

- Os valores dos filtros de tremido foram herdados do site atual; podem precisar de ajuste
  fino depois de ver as ilustrações em conjunto.
- O tremido animado não foi medido em aparelhos de baixo desempenho.
- Fundos acompanham o tema: no escuro, a região semitransparente do plano mistura o laranja e o
  azul com um quadro esverdeado em vez do cinza neutro antigo (efeito leve, só nas áreas de
  baixa confiança).
- Laranja e azul continuam abaixo de 3:1 contra o papel no tema claro, como sempre estiveram.
- Sem alteração de código, não há segundo sinal além da cor para distinguir verde de azul em
  escala de cinza.
