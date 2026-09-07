"""Funções e dados compartilhados entre os protótipos do projeto NeuroLógica.

Define as 7 portas lógicas do Tópico 2 do curso (AND, OR, NOT, NAND, NOR, XOR, XNOR)
e as funções de desenho reaproveitadas pelos scripts de cada marco (01 a 04).
"""

from collections import deque

import numpy as np

# Portas de 2 entradas (x1, x2 in {0,1})
GATES_2D = {
    "AND":  (np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float), np.array([0, 0, 0, 1])),
    "OR":   (np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float), np.array([0, 1, 1, 1])),
    "NAND": (np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float), np.array([1, 1, 1, 0])),
    "NOR":  (np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float), np.array([1, 0, 0, 0])),
    "XOR":  (np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float), np.array([0, 1, 1, 0])),
    "XNOR": (np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float), np.array([1, 0, 0, 1])),
}

# Porta de 1 entrada (unária)
GATES_1D = {
    "NOT": (np.array([[0], [1]], dtype=float), np.array([1, 0])),
}

TODAS_AS_PORTAS = list(GATES_2D) + list(GATES_1D)


def get_gate(nome):
    """Retorna (X, y) da porta lógica pelo nome (case-insensitive)."""
    nome = nome.upper()
    if nome in GATES_2D:
        return GATES_2D[nome]
    if nome in GATES_1D:
        return GATES_1D[nome]
    raise ValueError(f"Porta lógica desconhecida: '{nome}'. Opções: {TODAS_AS_PORTAS}")


def setup_figure_2d(titulo):
    """Cria a figura com 2 subplots: plano de decisão (esquerda) e erro por época (direita)."""
    import matplotlib.pyplot as plt

    fig, (ax_plano, ax_erro) = plt.subplots(1, 2, figsize=(10, 5))
    ax_plano.set_xlim(-0.5, 1.5)
    ax_plano.set_ylim(-0.5, 1.5)
    ax_plano.set_xlabel("x1")
    ax_plano.set_ylabel("x2")
    ax_plano.set_title(titulo)
    ax_plano.set_aspect("equal")

    ax_erro.set_xlabel("Época")
    ax_erro.set_ylabel("Pontos mal classificados")
    ax_erro.set_title("Erro por época")

    return fig, ax_plano, ax_erro


def draw_points_2d(ax, X, y):
    """Desenha os pontos da porta lógica coloridos por classe (0=azul, 1=vermelho)."""
    cores = ["tab:blue" if rotulo == 0 else "tab:red" for rotulo in y]
    ax.scatter(X[:, 0], X[:, 1], c=cores, s=250, zorder=3, edgecolors="black")
    for (x1, x2), rotulo in zip(X, y):
        ax.annotate(str(rotulo), (x1, x2), textcoords="offset points", xytext=(0, 14), ha="center")


def draw_neuron_diagram(ax, n_entradas, rotulo_ativacao="degrau"):
    """Desenha 'por dentro do neurônio': entradas -> soma ponderada -> ativação -> saída
    (mesmo estilo da tela "Inside a Perceptron" do Perceptron Educational Lab, ver
    planejamento/03_referencias.md).

    Retorna um dicionário de Text artists a atualizar a cada frame da animação:
    {"pesos": [Text, ...], "bias": Text, "soma": Text, "saida": Text}.
    """
    import matplotlib.patches as mpatches

    ax.set_xlim(0, 4.3)
    ax.set_ylim(-1.3, 2.2)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_title("Dentro do neurônio")
    for lado in ax.spines.values():
        lado.set_visible(False)

    y_entradas = [1.5, 0.5] if n_entradas == 2 else [0.5]
    x_no = 0.4
    x_soma = 2.1
    y_soma = 0.5 if n_entradas == 1 else 1.0
    x_ativ = 3.1
    x_saida = 3.9
    y_bias = -0.9

    def seta(p1, p2, cor="#888888"):
        ax.add_patch(mpatches.FancyArrowPatch(p1, p2, arrowstyle="-|>", mutation_scale=14, color=cor, zorder=2))

    pesos_textos = []
    for i, y_i in enumerate(y_entradas):
        ax.add_patch(mpatches.Circle((x_no, y_i), 0.18, facecolor="#a8c6e8", edgecolor="black", zorder=3))
        ax.text(x_no, y_i, f"x{i + 1}", ha="center", va="center", zorder=4, fontsize=9)
        seta((x_no + 0.18, y_i), (x_soma - 0.24, y_soma))
        txt = ax.text((x_no + x_soma) / 2, (y_i + y_soma) / 2 + 0.13, "", ha="center", fontsize=8, color="#a33333")
        pesos_textos.append(txt)

    ax.add_patch(mpatches.Circle((x_no, y_bias), 0.18, facecolor="#f2d675", edgecolor="black", zorder=3))
    ax.text(x_no, y_bias, "b", ha="center", va="center", zorder=4, fontsize=9)
    seta((x_no + 0.18, y_bias), (x_soma - 0.24, y_soma))
    bias_texto = ax.text((x_no + x_soma) / 2, (y_bias + y_soma) / 2 - 0.16, "", ha="center", fontsize=8, color="#b7791f")

    ax.add_patch(mpatches.Circle((x_soma, y_soma), 0.24, facecolor="#f7d9d9", edgecolor="black", zorder=3))
    ax.text(x_soma, y_soma, "Σ", ha="center", va="center", zorder=4, fontsize=13)
    soma_texto = ax.text(x_soma, y_soma - 0.45, "", ha="center", fontsize=8)

    seta((x_soma + 0.24, y_soma), (x_ativ - 0.18, y_soma))
    ax.add_patch(mpatches.Circle((x_ativ, y_soma), 0.18, facecolor="#d9d9f7", edgecolor="black", zorder=3))
    ax.text(x_ativ, y_soma, rotulo_ativacao, ha="center", va="center", zorder=4, fontsize=6.5)

    seta((x_ativ + 0.18, y_soma), (x_saida - 0.2, y_soma), cor="black")
    ax.add_patch(mpatches.Circle((x_saida, y_soma), 0.2, facecolor="#f7d9d9", edgecolor="black", zorder=3))
    ax.text(x_saida, y_soma + 0.42, "ŷ", ha="center", fontsize=10)
    saida_texto = ax.text(x_saida, y_soma - 0.02, "", ha="center", va="center", zorder=4, fontsize=9)

    return {"pesos": pesos_textos, "bias": bias_texto, "soma": soma_texto, "saida": saida_texto}


def vetor_normal_ancorado(pesos, bias, centro=(0.5, 0.5), comprimento=0.4):
    """Calcula (âncora, ponta) do vetor de pesos (w1, w2), que é o vetor NORMAL ao
    hiperplano de decisão w1*x1 + w2*x2 + b = 0 (Tópico 9 do curso) e aponta sempre
    para o lado da classe 1 (onde w.x + b > 0).

    A âncora é o ponto da própria reta mais próximo de `centro` (projeção ortogonal),
    para o vetor nascer "de dentro" da reta desenhada. O comprimento é fixo (não a
    magnitude real de w) só para ficar sempre visível, independente de quão
    grandes/pequenos os pesos estejam durante o treino — só a DIREÇÃO importa aqui.
    """
    w1, w2 = pesos
    norma = np.hypot(w1, w2)
    if norma < 1e-9:
        return centro, centro

    cx, cy = centro
    # distância (com sinal) de `centro` até a reta, ao longo da direção normalizada de (w1, w2)
    distancia = (w1 * cx + w2 * cy + bias) / norma
    ancora = (cx - distancia * w1 / norma, cy - distancia * w2 / norma)
    direcao = (w1 / norma, w2 / norma)
    ponta = (ancora[0] + direcao[0] * comprimento, ancora[1] + direcao[1] * comprimento)
    return ancora, ponta


def setup_log_panel(ax, max_linhas=13):
    """Prepara um painel de texto sem eixos para funcionar como 'console ao vivo',
    sincronizado com a animação (Decisão 1 de planejamento/06_detalhes_implementacao.md).

    Retorna (texto, buffer): `texto` é o Text artist a atualizar a cada frame;
    `buffer` é um deque(maxlen=max_linhas) — quem chama só precisa dar `.append()`
    nas linhas novas e chamar `texto.set_text('\\n'.join(buffer))`.
    """
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_title("Log de treino (ao vivo)", loc="left", fontsize=10)
    for lado in ax.spines.values():
        lado.set_visible(False)
    texto = ax.text(
        0.01, 0.95, "", transform=ax.transAxes, va="top", ha="left",
        family="monospace", fontsize=8,
    )
    buffer = deque(maxlen=max_linhas)
    return texto, buffer


def formatar_linhas_log(passo, n_exemplos):
    """Formata a(s) linha(s) de log referentes a um passo do treino (um exemplo
    processado), reaproveitando os campos já produzidos pelo gerador de treino.
    Inclui separador de época no primeiro exemplo e resumo no último.
    """
    linhas = []
    if passo["indice"] == 0:
        linhas.append(f"--- Época {passo['epoca']} ---")

    erro = passo["y_real"] - passo["y_previsto"]
    linhas.append(
        f"ép{passo['epoca']:>2} it{passo['indice'] + 1}: x={passo['x']} y={passo['y_real']} "
        f"z={passo['z']:+.3f} ŷ={passo['y_previsto']} erro={erro:+d}"
        f"{'  <- atualizou' if passo['houve_atualizacao'] else ''}"
    )

    if passo["indice"] == n_exemplos - 1:
        linhas.append(f">> fim da época {passo['epoca']}: {passo['erros_na_epoca']} erro(s)")

    return linhas


def decision_line_points(pesos, bias, faixa_x=(-0.5, 1.5)):
    """Calcula os pontos da reta w1*x1 + w2*x2 + b = 0, prontos para ax.plot()."""
    w1, w2 = pesos
    if abs(w2) < 1e-9:
        # reta vertical: w1*x1 + b = 0  =>  x1 = -b/w1
        x1 = -bias / w1 if abs(w1) > 1e-9 else 0.0
        return [x1, x1], list(faixa_x)
    x1_vals = np.array(faixa_x)
    x2_vals = -(w1 * x1_vals + bias) / w2
    return x1_vals, x2_vals
