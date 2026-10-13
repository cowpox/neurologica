# Detalhes de implementação — decisões técnicas

Registro das decisões técnicas tomadas ao longo do desenvolvimento do projeto NeuroLógica, no formato **demanda → opções consideradas → escolha → motivo**. Serve de memória para o grupo (por que fizemos assim e não de outro jeito) e de material de apoio para as seções "estratégias criadas" e "histórico" do documento de texto final. Vamos adicionar uma entrada nova cada vez que surgir uma decisão técnica não trivial.

---

## Decisão 1 — Log de treino sincronizado com a animação (Marco 1)

**Demanda**: o log detalhado de cada iteração/época (época, iteração, fórmula de `z`, erro, correção) hoje aparece todo de uma vez no terminal, **antes** da janela de animação abrir — porque o gerador de treino roda até o fim (`list(treinar_perceptron(...))`) e só depois a animação é montada a partir da lista de passos já calculada. O usuário quer ver esse mesmo tipo de informação aparecendo **ao lado dos gráficos**, sincronizada com a animação, à medida que ela acontece (não tudo de uma vez, antes).

**Opções consideradas**:

- **A. Painel de texto rolante dentro da própria figura do matplotlib.** Um espaço extra na figura, sem eixos, mostrando as últimas N linhas do log, atualizado pelo mesmo callback `atualizar(frame)` que já desenha o gráfico e o diagrama do neurônio — a sincronia vem de graça, porque é o mesmo laço de animação. Limitação: sem histórico rolável de verdade (tipo scroll), só uma janela deslizante das últimas linhas visíveis.
- **B. Janela separada com widget de texto nativo (Tkinter).** Log completo, com scroll de verdade, historiável e copiável — mas exige misturar matplotlib com Tkinter e gerenciar duas janelas na tela.
- **C. Sincronizar só o timing do log que já existe no terminal**, trocando o pré-cálculo de todos os passos por um laço manual com `time.sleep()` no mesmo intervalo da animação. Resolve a sincronia no tempo, mas não coloca o log "ao lado" dos gráficos fisicamente — continua no terminal, só que pausado a cada linha.
- **D. Adiar para a Fase 2 (site em HTML/D3/KaTeX)**, onde layout de painéis lado a lado com scroll é trivial via CSS — é literalmente o design já previsto para a "coluna do algoritmo" no `01_brainstorming.md`.

**Escolha**: Opção A agora, ainda na Fase 1 (protótipo Python). As opções B e D ficam como possibilidades futuras, não descartadas — B se algum dia precisarmos de um log Python "de produção" com histórico completo, D naturalmente quando a Fase 2 começar.

**Motivo**: A é a que dá mais retorno pelo esforço, nesta fase do projeto. Reaproveita o mesmo callback de animação (sincronia sem esforço extra de coordenar duas bibliotecas de UI diferentes), não adiciona nenhuma dependência nova, e é suficiente para o objetivo da Fase 1: validar a lógica e reforçar o entendimento didático, não polir a interface — isso é papel explícito da Fase 2, que é onde esse tipo de painel vai ganhar a versão definitiva, bonita e realmente rolável.

---

## Decisão 2 — Fluxo de trabalho em equipe no git (branches + Pull Request)

**Demanda**: com o Herik agora aceitando o convite de colaborador no repositório, dois desenvolvedores vão trabalhar no mesmo código. É preciso um fluxo que evite um `push` de um sobrescrever/quebrar o trabalho do outro sem revisão.

**Opções consideradas**:

- **A. Sem regra nenhuma — os dois commitam direto na `main`.** Mais simples de começar, mas arriscado: qualquer `push` pode sobrescrever trabalho não commitado do outro, sem chance de revisão antes de ir para a branch estável, e o histórico fica mais difícil de acompanhar.
- **B. Uma branch por marco/feature + Pull Request no GitHub antes de mesclar na `main`.** Cada mudança (novo marco, correção, documentação) nasce numa branch própria (`marco2-adaline`, `fix-tolerancia-degrau` etc.); ao terminar, sobe a branch e abre um PR para o outro revisar antes do merge.
- **C. Branch por pessoa** (ex.: `adriano`, `herik`), mesclando periodicamente. Mais simples que B, mas mistura trabalhos não relacionados na mesma branch e dificulta revisar mudanças pontuais isoladamente.

**Escolha**: Opção B.

**Motivo**: é o padrão mais usado em projetos colaborativos reais por um bom motivo — isola cada mudança (facilita revisar e reverter se algo quebrar), incentiva uma revisão antes de qualquer coisa entrar na `main` (recomendada, não obrigatória: se ninguém puder revisar a tempo, o autor pode mesclar o próprio PR depois de conferir o que mudou e avisar o grupo) (mesmo sendo só dois, ajuda a pegar erros como os de ponto flutuante que já encontramos), e documenta naturalmente o histórico de decisões pelos próprios PRs — reforçando a mesma prática de transparência de processo que já adotamos nos documentos de `planejamento/`. Registrado também em `README.md`, seção "Fluxo de trabalho em equipe".

---

## Decisão 3 — Alvos bipolares (−1/+1) no treino do Adaline (Marco 2)

**Demanda**: o Marco 1 treina com as classes da porta em 0/1 e classifica com `degrau(z) = 1 se z ≥ 0`. Ao portar para o Adaline, que treina com o erro **contínuo** `alvo − z`, era preciso decidir com que valores de alvo treinar.

**Opções consideradas**:

- **A. Alvos 0/1 e degrau em z ≥ 0 (igual ao Marco 1).** Não funciona: o Adaline converge para o mínimo do erro quadrático, e com alvos 0/1 esse mínimo fica com a fronteira no lugar errado. Conferido por mínimos quadrados: AND fica com só 2 de 4 acertos (`w=(0,5; 0,5)`, `b=−0,25`, os pontos (0,1) e (1,0) dão `z=+0,25`), NOR também com 2, OR e NAND com 3.
- **B. Alvos 0/1 e degrau em z ≥ 0,5.** Funciona, mas cria um limiar diferente do Marco 1 e do Tópico 14, o que complica comparar os dois lado a lado.
- **C. Alvos bipolares (classe 0 → −1, classe 1 → +1) e o mesmo degrau em z ≥ 0.** É a convenção do Tópico 15 (o exemplo do AND usa alvo bipolar, mínimo em `w=(1,1)`, `b=−1,5`). As 5 portas ficam 100% corretas no mínimo.

**Escolha**: Opção C. Os gráficos continuam mostrando as classes como 0/1 (a tabela-verdade da porta não muda), só o alvo usado no cálculo do erro é bipolar.

**Motivo**: mantém o mesmo degrau e a mesma fronteira `z = 0` do Marco 1 (comparação justa), segue a notação do material do curso e é a única das três em que "minimizar o erro quadrático" e "classificar certo" apontam para o mesmo lugar nas 5 portas sem ajuste extra. Fica registrado como um ponto a mencionar na Fase 2: no site, mostrar o alvo bipolar explicitamente na coluna do algoritmo.

---

## Decisão 4 — Versão online e critério de parada do Adaline (Marco 2)

**Demanda**: o Tópico 15 apresenta duas versões da regra delta (online, um ajuste por exemplo; em lote, um ajuste por época) e o Adaline nunca chega a "zero erro", então o critério de parada do Marco 1 (época sem nenhum erro) não serve.

**Opções consideradas**:

- **Versão**: (A) online, (B) em lote, (C) as duas com uma flag.
- **Parada**: (1) número fixo de épocas; (2) parar quando todos os pontos forem classificados certo; (3) parar quando o SSE parar de mudar (`|ΔSSE| < tolerância` entre épocas seguidas).

**Escolha**: online (A) + parada por estabilização do SSE (3), com tolerância `1e-4` e máximo padrão de 100 épocas (**revisto em 2026-10-12:** a tolerância passou a ser proporcional ao η, `1e-3 * η`, que vale `1e-4` com η = 0,1. A queda do custo por época é proporcional ao η, e um valor fixo confundia "descendo devagar" com "convergiu" e parava antes da hora com η pequeno. Com η = 0,1 nada mudou). O SSE é recalculado no fim de cada época sobre os 4 pontos com os pesos atuais (é o `E(w,b)` do Tópico 15, seção 3), e o gráfico mostra também, num eixo à direita, quantos pontos estão mal classificados com esses pesos.

**Motivo**: a versão online é o pseudocódigo principal do Tópico 15 e tem a mesma granularidade do Marco 1 (um frame por exemplo), o que permite rodar os dois sincronizados no modo `--comparar`. Parar ao classificar tudo certo (2) esconderia justamente o que diferencia o Adaline: ele continua ajustando depois de acertar, levando a reta para o meio entre as classes. O lote fica como extensão possível (é o que converge para o mínimo exato em vez de rondá-lo).

---

## Decisão 5 — Contagem de erros por época homogênea entre os treinos de neurônio único (Marcos 1 a 3)

**Demanda**: o Perceptron (Marco 1) acumulava `erros_na_epoca` **durante** a época (decisões tomadas com os pesos ainda mudando), enquanto o Adaline (Marco 2) calcula no **fim** da época, com os pesos finais. Ao pôr os dois lado a lado (`--comparar` e o Marco 3), os dois gráficos de "pontos mal classificados" mediam coisas diferentes.

**Opções consideradas**:

- **A. Manter como está e só rotular os gráficos.** Não corrige a comparação, só a explica.
- **B. Passar o Adaline a acumular durante a época**, como o Perceptron. Faria o Adaline perder o veredito da reta como ela ficou, que é o que importa.
- **C. Passar o Perceptron a entregar o veredito com os pesos finais**, com uma função única `contar_erros(X, y, pesos, bias)` usada pelos dois treinos, e guardar as correções feitas durante a época à parte (`correcoes_na_epoca`).

**Escolha**: C. `contar_erros` fica em `01_perceptron_gates.py` (o `02` a reaproveita por `importlib`, como já faz com o `degrau`); `erros_na_epoca` só existe no último exemplo de cada época; o critério de parada do Perceptron continua sendo "época sem nenhuma correção", agora lido de `correcoes_na_epoca`.

**Motivo**: dá uma medida justa e idêntica nos dois, com uma única implementação, e não muda o Perceptron (conferido: pesos, bias e épocas iguais aos de antes em 5 portas × 3 taxas × 2 inicializações). Efeito visível, e honesto: em 5 de 28 fins de época medidos (η = 0,1, semente 42) o Perceptron já acertava tudo antes da época sem correções que confirma a convergência; agora o gráfico mostra isso, em vez de esconder. Os Marcos 3 e 4 entregam `erros_na_epoca` com o mesmo significado.

---

## Decisão 6 — Alvo e limiar da MLP (Marco 4): sigmoide, alvos 0/1 e classe por `degrau(z_saída)`

**Demanda**: o Adaline (Marco 2) treina com alvos bipolares −1/+1 (Decisão 3). A MLP do plano tem saída sigmoide, que vive em $(0, 1)$. Era preciso decidir a representação do alvo e do limiar no Marco 4 sem quebrar a padronização com os Marcos 1 e 2.

**Opções consideradas**:

- **A. Alvos −1/+1 com saída tanh**, classe por `degrau`. Coerente com o Adaline, mas muda a saída do plano e descarta o que a demo validou (sigmoide, 40/40 sementes).
- **B. Alvos 0/1 com saída sigmoide e limiar 0,5** aplicado à saída $a$.
- **C. Alvos 0/1 com saída sigmoide e classe por `degrau(z_saída)`**, com `z_saída` a soma ponderada antes da sigmoide.

**Escolha**: C. B e C dão a mesma classe ($\sigma(z) \ge 0{,}5 \iff z \ge 0$); C reaproveita o `degrau` e a `TOLERANCIA_ZERO` dos Marcos 1 e 2 em vez de criar um limiar novo.

**Motivo**: a padronização se mantém (a classe é decidida pela mesma função e pela mesma tolerância, `y` continua 0/1 em tudo e os alvos 0/1 só entram no erro e no gradiente). O −1/+1 fica restrito aos alvos do Adaline. Uma diferença consciente: o erro da MLP é medido **depois** da ativação da saída (como no Perceptron), porque o backpropagation precisa da derivada da sigmoide; o do Adaline é medido antes (saída linear). Seguem abertas e serão registradas quando o Marco 4 for implementado: a definição do custo (`sse` com $\tfrac12$ ou `mse`, e a conversão dos limiares da demo) e a amplitude da inicialização.

---

## Decisão 7 — Ordem das perguntas orientadoras no site (Q2 → Q4 → Q5) e seletor "1 neurônio × rede" no Ato 3

**Demanda**: o site passa a ter um ato por pergunta orientadora (Q2, Q4, Q5), da mais elementar à mais complexa e em ordem histórica. Era preciso fixar a ordem dos atos e onde mostrar "uma reta contra duas retas" (um neurônio contra uma camada extra).

**Opções consideradas**:

- **A. Q2 → Q5 → Q4.** O argumento: a derivada da ativação (Q4) pressupõe o gradiente (Q5), que o Adaline introduz. Foi a escolha de 2026-10-11. Problema apontado pelo grupo: o Adaline já usa uma função diferente da do Perceptron (saída linear no lugar do degrau) no Ato 2, e esse salto ficaria sem explicação, porque a pergunta sobre as ativações só viria depois.
- **B. Q2 → Q4 → Q5.** A pergunta sobre as funções de ativação vem junto com a primeira troca de função (degrau × linear); o gradiente atravessando camadas (backpropagation) e o mínimo local ficam para o fim.
- **Seletor "1 neurônio × rede 2-2-1": no Ato 2 ou no Ato 3.** No Ato 2, a rede e o backpropagation entrariam antes de a ativação ser explicada e o XOR resolvido perderia o lugar de clímax. No Ato 3, o mesmo laboratório alterna "1 neurônio" (que falha no XOR) e "rede 2-2-1" (que resolve).

**Escolha**: B, com o seletor no Ato 3. Modos configurados no componente `Laboratorio`, como o Ato 1 da demo já fazia com Perceptron e Adaline.

**Motivo**: a pergunta sobre as ativações precisa aparecer no ato em que o aluno acaba de ver duas delas. O Ato 3 fecha a história com o caso mais complexo (a regra da cadeia atravessando camadas e o mínimo local), que é também a última peça na ordem histórica, e termina no XOR resolvido e no laboratório livre. **Risco aceito:** o argumento da derivada na Q4 antecede a ideia completa de gradiente. A mitigação é o Adaline do próprio Ato 2, que já dá a ideia informal (a inclinação diz para que lado ajustar) e que o Ato 3 formaliza; o texto do Ato 2 deve falar em "inclinação" e não depender da regra da cadeia. Mudar a ordem de novo é decisão do grupo. Plano e roteiro oral em `04_planejamento.md`, seção "Narrativa: cada ato responde uma pergunta".
