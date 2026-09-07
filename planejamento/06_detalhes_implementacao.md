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

**Motivo**: é o padrão mais usado em projetos colaborativos reais por um bom motivo — isola cada mudança (facilita revisar e reverter se algo quebrar), força uma revisão antes de qualquer coisa entrar na `main` (mesmo sendo só dois, ajuda a pegar erros como os de ponto flutuante que já encontramos), e documenta naturalmente o histórico de decisões pelos próprios PRs — reforçando a mesma prática de transparência de processo que já adotamos nos documentos de `planejamento/`. Registrado também em `README.md`, seção "Fluxo de trabalho em equipe".
