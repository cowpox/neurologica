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

## Decisão 7 — Ordem das perguntas orientadoras no site (Q2 → Q5 → Q4) e seletor "1 neurônio × rede" no Ato 3

**Demanda**: o site passa a ter um ato por pergunta orientadora (Q2, Q4, Q5), da mais elementar à mais complexa e em ordem histórica. Era preciso fixar a ordem dos atos e onde mostrar "uma reta contra duas retas" (um neurônio contra uma camada extra).

**Opções consideradas**:

- **A. Q2 → Q5 → Q4.** O argumento da Q4 (a ativação precisa de derivada) pressupõe a ideia de gradiente, que a Q5 introduz com o Adaline; segue também a ordem histórica (Perceptron, Adaline, backpropagation). Problema apontado pelo grupo: o Adaline já usa, no Ato 2, uma função diferente da do Perceptron (saída linear no lugar do degrau), e essa troca ficaria sem explicação até o Ato 3.
- **B. Q2 → Q4 → Q5.** A pergunta sobre as ativações vem junto com a primeira troca de função (degrau × linear); o gradiente atravessando camadas e o mínimo local ficam para o fim. Chegou a ser adotada por engano em 2026-10-12 (uma resposta foi lida assim) e revertida no mesmo dia.
- **Seletor "1 neurônio × rede 2-2-1": no Ato 2 ou no Ato 3.** No Ato 2, a rede e o backpropagation entrariam antes de a ativação ser explicada e o XOR resolvido perderia o lugar de clímax. No Ato 3, o mesmo laboratório alterna "1 neurônio" (que falha no XOR) e "rede 2-2-1" (que resolve).

**Escolha**: A (Q2 → Q5 → Q4), com o seletor no Ato 3 e uma **ressalva**: o texto do Ato 2 nomeia a saída linear do Adaline, explica que ela é o que diz ao neurônio o quanto errou e anuncia que o porquê da escolha (e por que a linear sozinha não basta) é a pergunta do Ato 3, sem usar derivadas nem a regra da cadeia. Modos configurados no componente `Laboratorio`, como o Ato 1 da demo já fazia com Perceptron e Adaline.

**Motivo**: a dependência lógica (gradiente antes de derivada da ativação) e a ordem histórica; o aluno chega ao Ato 3 já sabendo o que é o gradiente, e a pergunta das ativações surge ao tentar ensinar uma rede de duas camadas. O Ato 3 junta a Q4 à rede e ao XOR resolvido, que é o clímax, e termina no laboratório livre. **Riscos aceitos:** a Q5 só se completa no Ato 3 (o texto dele deve retomá-la), e a troca de função no Ato 2 fica sem explicação completa até lá, o que a ressalva trata. A ordem de apresentação (Q2, Q5, Q4) difere da numeração do curso, e o mapa das perguntas deve avisar. Mudar a ordem de novo é decisão do grupo. Plano e roteiro oral em `04_planejamento.md`, seção "Narrativa: cada ato responde uma pergunta".

---

## Decisão 8 — Como o Marco 3 reaproveita os treinos e o que o seu relatório afirma

**Demanda**: o Marco 3 deve mostrar o Perceptron e o Adaline falhando no XOR/XNOR sem mudar a arquitetura nem a regra de treino. Era preciso decidir como reaproveitar o código dos Marcos 1 e 2, o que o relatório do console afirma e como medir o "melhor possível" do Adaline sem depender do próprio treino.

**Opções consideradas**:

- **Reaproveitamento**: (A) copiar os treinos para o `03`; (B) alterar o `02` para aceitar XOR/XNOR e reaproveitar o `--comparar`; (C) chamar `treinar_perceptron` e `treinar_adaline` por `importlib`, sem tocar nos Marcos 1 e 2.
- **Relatório**: (A) reaproveitar o `resumo_adaline` do Marco 2; (B) um relatório próprio.
- **Régua do ótimo**: (A) usar o custo final do próprio Adaline; (B) calcular o mínimo teórico por mínimos quadrados (`lstsq`), independente do treino.

**Escolha**: C, B e B. O `03` importa os dois treinos (como o `02` já importa o `01`), com a mesma semente, taxa e pesos iniciais. O relatório é próprio e só afirma "convergiu" quando houve convergência de fato. Conta os erros com os pesos finais (`perceptron.contar_erros`, a mesma medida dos dois treinos, Decisão 5), detecta o ciclo dos pesos de fim de época do Perceptron e compara o custo do Adaline com o mínimo teórico. Defaults: `--epocas 50` (o Perceptron mostra a falha em ~10 épocas; mais só alonga a animação) e sem `--quiet` (os dois logs vão para os painéis da animação, como no `--comparar` do Marco 2).

**Motivo**: não duplica nem altera código já validado. O `resumo_adaline` termina com "η grande demais" quando o Adaline para com pontos errados, mensagem verdadeira para o Aprendizado 8, mas falsa no XOR, onde a causa é a arquitetura. E usar o próprio custo do Adaline como "o melhor" não provaria nada; o mínimo por `lstsq` mostra que o custo estaciona no ótimo (E = 2), e que o ótimo é a constante 0. Verificado: a conta à mão em aritmética exata (XOR, pesos 0 0, η = 0,1) bate com os dois treinos. **Revisão manual (2026-10-12):** o relatório passou a (1) decidir "estabilizou", "limite de épocas" ou "divergiu" pelo mesmo critério do gerador (`estado_adaline`), e não por "parou antes de `--epocas`", que errava quando o custo estabiliza exatamente na última época permitida; (2) mostrar também o **ponto de chegada** do Adaline online (`ponto_fixo_online`), porque o veredito na época de parada é um estado transitório; e (3) usar textos e títulos da animação conforme o estado (antes o quadro final dizia "ESTABILIZOU" mesmo quando o Adaline divergia ou atingia o limite de épocas).

---

## Decisão 9 — Conquistas locais e pistas progressivas, em vez de um mural compartilhado (site em sala)

**Demanda**: o site será apresentado em sala, com o link divulgado por QR code para a turma e para o professor. A ideia inicial era pedir o nome do aluno na entrada e mostrar "João resolveu o XOR!" na tela dos demais. Queríamos também aumentar a interatividade de cada ato: mostrar o problema (uma configuração que não resolve) e só depois dar pistas, para a turma mexer nos parâmetros (ativação, η, camadas, neurônios) até resolver.

**Opções consideradas**:

- **A. Mural compartilhado com banco em tempo real** (Firebase ou Supabase, direto do navegador). É o mais simples dos que compartilham estado, mas depende de um serviço externo, de regras de segurança bem escritas e de moderação de nomes.
- **B. Mural com funções da Vercel e Redis.** A Vercel não mantém conexão aberta (sem WebSocket), então seria consulta periódica. Permitiria verificar a conquista no servidor, reexecutando o treino determinístico, ao custo de uma pasta `api/` e de mexer no `vercel.json`.
- **C. Tudo local**: uma notificação parabenizando o aluno pela conquista, guardada no `localStorage`, mais uma gaveta de pistas que libera por tentativas. Sem nome, sem conta e sem rede.

**Escolha**: C. A conquista só dispara quando o treino **resolve de verdade**: `convergiu`, `errosAtuais() === 0` (recontagem independente), configuração do desafio do ato, uma vez por navegador. As pistas liberam depois de tentativas sem resolver (`TENTATIVAS_POR_PISTA = 2`, valor inicial). Detalhes em `04_planejamento.md`, seções "Roteiro de texto dos atos" e "Pistas progressivas e conquistas".

**Motivo**: o site é estático, sem build, e precisa funcionar mesmo com a conexão ruim da sala; um mural online o tornaria dependente de um serviço externo justamente no dia da apresentação, e traria dados de alunos para um site público. A interatividade que importa (mexer nos parâmetros até resolver) não precisa de rede. O texto da conquista mostra os valores reais que funcionaram (ativação, η, épocas), o que reforça o aprendizado. Um achado de projeto: **"convergiu" não basta como critério**. O Adaline "converge" com 1 ponto errado quando o η é grande (Aprendizado 8, η = 0,7 no AND), e isso não é resolver; por isso a regra exige a recontagem dos erros, e a configuração inicial do Ato 2 usa exatamente esse η para que o problema seja real. A regra fica numa função pura (`desafios.js`) com testes em Node (camada 6 da conferência), para a conquista não disparar por engano na apresentação. Fica fora do escopo o mural online (registrado em "Ideias fora do escopo").

---

## Decisão 10 — Conferir a MLP sem deixar o arredondamento se acumular (Fase 2)

**Demanda**: o JS da MLP precisa reproduzir o Python, mas o numpy usa FMA nas multiplicações de matriz e uma tanh própria (Aprendizado 11), e num treino de milhares de épocas uma diferença de 1 ulp pode crescer. O plano previa comparar só as primeiras 300 épocas e depois os marcos discretos, o que deixaria a maior parte do treino sem conferência fina e não diria, se um marco divergisse, se a causa era arredondamento ou defeito.

**Opções consideradas**:

- **A. A do plano**: trajetória completa só nas 300 primeiras épocas (≤ 10⁻⁹) e marcos depois.
- **B. Reproduzir o numpy bit a bit no JS**: emular FMA em software e reimplementar a tanh do numpy. Frágil: o uso de FMA depende do BLAS e do processador da máquina que gerou as referências.
- **C. Conferência sincronizada**: em cada época gravada (todas as primeiras 300 e depois uma a cada 25), o JS parte do estado **exato** do Python e dá um passo; as decisões de parada e de reinício do JS são reexecutadas sobre o SSE de **todas** as épocas do Python; e o treino livre do JS precisa bater nos marcos discretos.

**Escolha**: C. Para isso, o `treino_mlp.js` separa a parte numérica (funções puras `propagar`, `gradientes`, `aplicarGradiente`, `epocaDeGradiente`) da lógica de parada (`JanelaDeReinicio`), e o `TreinoMLP` só as compõe. A mesma ordem de operações do Python foi mantida onde o JS consegue (produto escalar antes do bias, somas sequenciais, `(saída − alvo) · (a · (1 − a))`, gradiente dividido por n antes de multiplicar por η).

**Motivo**: como cada passo começa do estado do Python, o erro não tem como se acumular, e a tolerância pode ser apertada (10⁻¹³ relativo; medido 2,2·10⁻¹⁶). As decisões reexecutadas sobre o SSE do Python testam a lógica de parada sem nenhum arredondamento envolvido. O treino livre continua conferido, e se um dia um marco divergir, as outras duas partes dizem se é arredondamento ou defeito. Verificado que a conferência não é de enfeite: reintroduzidos numa cópia os dois defeitos da demo (alvos 0/1 no Adaline; gradiente aplicado depois do reinício), ela reprova os dois. Não foi preciso mudar o Python para injetar pesos: o gerador grava os pesos de cada tentativa chamando a mesma `inicializar_pesos` com a mesma semente.

---

## Decisão 11 — O que muda na interface dos treinos em relação à demo (contrato para o front-end)

**Demanda**: o front-end (`laboratorio.js`, `grafico.js`, `algoritmo.js`, `rede_visual.js`) será adaptado da demo, e os treinos agora seguem as convenções dos Marcos 1 a 4, não as da demo. Quem integra precisa saber exatamente o que mudou de nome ou de significado.

**Escolha**: manter tudo o que a interface da demo lê (`passo()`, `terminou`, `convergiu`, `esgotou`, `historicoErro` com `{ epoca, valor }`, `tipoErro`, `pesos`, `bias`, `limiar`, `prever`, `valorContinuo`, `errosAtuais`, `pseudocodigo`, `formato`, `camadas`, `ativacao`, `reinicios`, `tentativa`, `mapaDeAtivacoes`, `retaDoNeuronio`, `ATIVACOES`) e mudar só o que carrega um significado novo:

- **Perceptron**: `errosNaEpoca` passa a ser o veredito com os pesos **finais** da época, e só existe no último exemplo (nos outros vem `null`); as correções feitas durante a época vão para o novo `correcoesNaEpoca`. O gráfico mostra `errosNaEpoca`. Padrão `maxEpocas = 20` (o laboratório da demo passava 40).
- **Adaline**: alvos −1/+1 (o registro traz `alvo`), fronteira em z = 0 (`limiar = 0`; `LIMIAR_ADALINE` não existe mais), e `sse` (½ Σ, com os pesos finais) e `errosNaEpoca` só no fim da época, no lugar de `sseNaEpoca` e `errosClassificacaoNaEpoca` (acumulados). Estado novo `divergiu` (incluído em `terminou`), parada em 1e-3 · η e `custoAtual()`. "Convergiu" quer dizer que o custo estabilizou, **não** que acertou tudo (com η = 0,7 no AND ele estabiliza com 1 erro): a mensagem de desfecho e a conquista precisam olhar `errosAtuais()`.
- **MLP**: `mse` virou `sse` (½ Σ), `erros` virou `errosNaEpoca` (classe por `degrau(z_saída)`), e o registro traz `zSaida` e `yPrevisto`; `estado` diz como terminou (`convergiu`, `limite` ou `esgotou`, os dois últimos com `esgotou = true`); `reinicios` é `[{ epoca, sse }]`; `fontePesos` opcional; `MAX_TENTATIVAS = 10`. Padrões do Python (`ativacao = 'sigmoide'`, `taxa = 2`); o Ato 3 passa tanh. Depois de um reinício não há passo de gradiente (Aprendizado 12).

**Motivo**: preservar o contrato reduz o trabalho de adaptar o front-end da demo, e mudar os nomes que mudaram de significado evita que um campo antigo seja lido com o sentido errado sem ninguém perceber (por exemplo, `errosNaEpoca` acumulado do Perceptron, ou um Adaline "convergido" com pontos errados).

---

## Decisão 12 — Como as conquistas e as pistas aparecem na página

**Demanda**: implementar a notificação de conquista e a gaveta de pistas da Decisão 9 sem atrapalhar o laboratório: o plano pedia uma faixa que não cobrisse o plano de decisão nem a rede, que funcionasse no telefone e que só disparasse quando o aluno resolvesse de verdade.

**Opções consideradas**:

- **A. Aviso flutuante (toast) preso à tela**, como sugeria o plano. Chama atenção, mas, fixo na tela, fatalmente cobre alguma coisa (no telefone, a parte de baixo do laboratório, onde ficam a curva de erro e a barra de estado), e some sozinho sem o aluno ler.
- **B. Aviso no fluxo, logo abaixo do laboratório**, com um selo desenhado à mão e um botão de fechar. Não cobre nada, aparece exatamente onde o aluno está olhando (a barra de estado com "resolveu" fica na base do laboratório) e fica até ele fechar.

**Escolha**: B. As pistas também ficam no fluxo, numa gaveta logo abaixo do aviso.

**Detalhes**:
- A regra fica em `desafios.js` (funções puras, conferidas na camada 6 de `testes/conferir_js.mjs`): conta só `convergiu` + 0 erros na recontagem + configuração do desafio; o Ato 1 acumula as 5 portas separáveis; uma tentativa é um treino do problema do ato que terminou sem resolver ou foi abandonado depois de 3 épocas (300 na rede).
- O laboratório avisa por eventos (`laboratorio:terminou`, `laboratorio:abandonou`) com a configuração DO TREINO (e não a dos controles, que pode já ter mudado); `progresso.js` liga os eventos à regra e guarda o estado no `localStorage` (com `try/catch`).
- "Estou travado" libera a próxima pista depois de 20 s, e o texto da espera convida a tentar mais uma vez enquanto isso.
- Quando uma pista libera, só o contador reage (e o `aria-live` anuncia): a gaveta não abre sozinha.
- O aviso de conquista mostra os valores reais que funcionaram (η, ativação, épocas).

**Motivo**: a visualização vence a estética (regra herdada da demo): um aviso que cobre o plano de decisão no momento em que a rede acaba de resolver esconde justamente o que se quer mostrar. No fluxo, o aviso continua comemorando, sem competir com o gráfico.

---

## Decisão 13 — Modo "Classificação" no laboratório livre e matemática determinística

**Demanda**: implementar os conjuntos de classificação do laboratório livre (ideia registrada no `04`): círculo, XOR em quadrantes, duas gaussianas e espiral, no estilo do TensorFlow Playground, sem atrasar o resto.

**Escolhas**:

- **Dados gerados por nós** (`docs/js/datasets.js`), com o gerador com semente do site, 200 pontos por conjunto, 100 de cada classe, em [−6, 6]² na tela e divididos por 6 na entrada da rede (para Xavier e η continuarem fazendo sentido). Gerados **sem sobreposição** entre as classes, para que "acertar todos os pontos" seja possível.
- **Critério de parada próprio**: o `TreinoMLP` ganhou a opção `pararQuando: 'acertos'` (todos os pontos certos). O padrão continua `'erro'` (SSE abaixo do limiar, o do Python), então a conferência e os gabaritos não mudam. Com 200 pontos, o SSE pode levar muito mais tempo para cair abaixo do limiar do que a rede leva para acertar tudo.
- **Reinício automático desligado** ao entrar na classificação: ali o erro cai devagar por muito tempo, e a janela de 300 épocas confundiria isso com estar preso. O aluno pode ligá-lo.
- **Interface**: seletor "Problema" (portas lógicas × classificação) e "Conjunto de dados"; o plano de decisão recebe a faixa e a escala do conjunto (eixos de −4 a 4, pontos pequenos sem rótulo, contorno escuro em quem está errado); nos modos de neurônio único a velocidade cresce com o número de pontos e o log mostra só o resumo de cada época.
- **Desafios com solução medida**, em gavetas abaixo do laboratório: gaussianas (o Perceptron resolve na época 3), círculo (2 ocultos não bastam, 177/200; com 3, tanh, η = 2: época 1418), XOR em quadrantes (2 não bastam, 177/200, embora bastem na porta de 4 pontos; com 3: época 662) e espiral (três camadas de 6, tanh, η = 3: época 4113). Os números estão na camada 7 da conferência.
- **Matemática determinística** (Aprendizado 15): exponencial e tanh próprias em `dados.js`, e coordenadas dos conjuntos arredondadas para milésimos, para que todo navegador produza os mesmos números.

**Motivo**: a classificação mostra a mesma ideia do Ato 3 em escala maior — cada neurônio oculto é uma reta, e formas mais complicadas pedem mais retas e mais camadas —, com resultados que a turma pode comparar entre si. A matemática determinística é o que permite citar épocas exatas no texto (1358, 4113…) sabendo que o celular de cada aluno vai mostrar o mesmo número.
