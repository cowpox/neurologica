"""Marco 2 do projeto NeuroLógica: Adaline (Modo 1b).

Regra de aprendizagem: Regra Delta / Widrow-Hoff (Tópico 15) — gradiente
descendente sobre o erro quadrático, com o erro calculado ANTES da ativação:
w += taxa * (alvo - z) * x, ajustando os pesos em TODA iteração (mesmo quando
o ponto já está classificado certo), proporcionalmente ao tamanho do erro.

Versão estocástica/online (pseudocódigo da seção 5 do Tópico 15): um ajuste por
exemplo, mesma granularidade da animação do Marco 1.

Alvos bipolares: a porta continua sendo 0/1 (é o que aparece nos gráficos), mas o
treino usa alvo = -1 para a classe 0 e +1 para a classe 1. Com alvos 0/1 e o
degrau em z >= 0, o mínimo do erro quadrático classifica errado (ex.: AND fica
com só 2 de 4 acertos) — ver Decisão 3 de planejamento/06_detalhes_implementacao.md.

Roda nas 5 portas lógicas linearmente separáveis: AND, OR, NOT, NOR, NAND.

Uso:
    python 02_adaline_gates.py --porta AND
    python 02_adaline_gates.py --porta NOT --taxa 0.05 --epocas 80
    python 02_adaline_gates.py --porta AND --pesos-iniciais 0 0 --bias-inicial 0
    python 02_adaline_gates.py --porta AND --comparar     # Perceptron x Adaline lado a lado
"""

import argparse
import importlib
import sys

import matplotlib.animation as animation
import matplotlib.pyplot as plt
import numpy as np

from utils_plot import (
    GATES_1D,
    decision_line_points,
    draw_neuron_diagram,
    draw_points_2d,
    formatar_linhas_log,
    get_gate,
    setup_log_panel,
    vetor_normal_ancorado,
)

# O nome do arquivo do Marco 1 começa com dígito, então não dá para usar `import` direto.
# Reaproveita o degrau (com a mesma tolerância numérica) e, no modo --comparar, o próprio treino.
perceptron = importlib.import_module("01_perceptron_gates")
degrau = perceptron.degrau

PORTAS_VALIDAS = ["AND", "OR", "NOT", "NOR", "NAND"]

TOLERANCIA_SSE = 1e-4


def treinar_adaline(
    X, y, taxa_aprendizado=0.1, max_epocas=100, semente=42, verbose=True,
    pesos_iniciais=None, bias_inicial=0.0, tolerancia_sse=TOLERANCIA_SSE,
):
    """Gera o estado do treino a cada exemplo processado (Regra Delta, versão online).

    Cada item gerado é um dicionário com: epoca, indice, x, y_real (classe 0/1),
    alvo (bipolar -1/+1), z (pré-ativação, ANTES do ajuste), erro (alvo - z),
    y_previsto (degrau(z), só para classificar), pesos (cópia, DEPOIS do ajuste),
    bias e houve_atualizacao. No último exemplo de cada época vêm também sse
    (E = 1/2 * soma (alvo - z)^2 sobre os 4 pontos, com os pesos do fim da época)
    e erros_na_epoca (pontos mal classificados com esses mesmos pesos).

    Critério de parada: o Adaline nunca chega a erro zero (z contínuo raramente é
    exatamente ±1), então para quando o SSE muda menos que `tolerancia_sse` entre
    duas épocas seguidas (estabilizou), ou quando atinge `max_epocas`, ou se
    divergir (taxa grande demais).

    `pesos_iniciais`/`bias_inicial`/`semente` funcionam igual ao Marco 1, então a
    mesma semente gera exatamente os mesmos pesos iniciais do Perceptron.
    """
    n_entradas = X.shape[1]

    if pesos_iniciais is not None:
        pesos = np.array(pesos_iniciais, dtype=float)
        if pesos.shape != (n_entradas,):
            raise ValueError(
                f"--pesos-iniciais precisa ter exatamente {n_entradas} valor(es) para esta "
                f"porta (recebido {len(pesos_iniciais)}: {pesos_iniciais})."
            )
        origem_pesos = "escolhidos manualmente"
    else:
        rng = np.random.default_rng(semente)
        pesos = rng.uniform(-0.5, 0.5, size=n_entradas)
        origem_pesos = f"aleatórios (semente={semente})"

    bias = bias_inicial
    alvos = 2 * y - 1  # classe 0 -> -1, classe 1 -> +1

    if verbose:
        print("=" * 72)
        print("MARCO 2 — ADALINE (REGRA DELTA, VERSÃO ONLINE)")
        print("=" * 72)
        print(f"Hiperparâmetro escolhido: taxa de aprendizado (η) = {taxa_aprendizado}")
        print(f"Máximo de épocas: {max_epocas}  |  para quando |ΔSSE| < {tolerancia_sse}")
        print(f"Pesos iniciais {origem_pesos}: {np.round(pesos, 4)}  |  bias inicial: {bias:.4f}")
        print(f"Alvos bipolares (classe 0 -> -1, classe 1 -> +1): {alvos}")
        print("Regra delta (aplicada em TODA iteração, com o erro ANTES da ativação):")
        print("  erro   = alvo - z")
        print("  w_novo = w_antigo + η * erro * x")
        print("  b_novo = b_antigo + η * erro")
        print("Custo monitorado por época: SSE = 1/2 * Σ (alvo - z)²")
        print("=" * 72)

    sse_anterior = None
    for epoca in range(1, max_epocas + 1):
        if verbose:
            print(f"\n--- Época {epoca} ---")
        for i in range(len(X)):
            x = X[i]
            alvo = alvos[i]
            z = np.dot(pesos, x) + bias
            y_previsto = degrau(z)
            erro = alvo - z

            pesos_antigos = pesos.copy()
            bias_antigo = bias
            pesos = pesos + taxa_aprendizado * erro * x
            bias = bias + taxa_aprendizado * erro

            if verbose:
                termos = " + ".join(f"({w:.3f})*{xi:.0f}" for w, xi in zip(pesos_antigos, x))
                print(
                    f"  [iteração {i + 1}] x={x} alvo={alvo:+d}  |  "
                    f"z = {termos} + ({bias_antigo:.3f}) = {z:.3f}  |  "
                    f"erro = ({alvo:+d}) - ({z:.3f}) = {erro:+.3f}  |  ŷ = degrau(z) = {y_previsto}"
                )
                for j, (w_antigo, w_novo, xj) in enumerate(zip(pesos_antigos, pesos, x), start=1):
                    print(
                        f"      -> w{j}: {w_antigo:.3f} + {taxa_aprendizado} * ({erro:+.3f}) * {xj:.0f} = {w_novo:.3f}"
                    )
                print(f"      -> b : {bias_antigo:.3f} + {taxa_aprendizado} * ({erro:+.3f}) = {bias:.3f}")

            passo = {
                "epoca": epoca,
                "indice": i,
                "x": x,
                "y_real": y[i],
                "alvo": alvo,
                "z": z,
                "erro": erro,
                "y_previsto": y_previsto,
                "pesos": pesos.copy(),
                "bias": bias,
                "houve_atualizacao": True,
            }

            if i == len(X) - 1:
                z_todos = X @ pesos + bias
                sse = 0.5 * np.sum((alvos - z_todos) ** 2)
                erros_na_epoca = perceptron.contar_erros(X, y, pesos, bias)  # mesma contagem do Perceptron
                passo["sse"] = sse
                passo["erros_na_epoca"] = erros_na_epoca

            yield passo

        if verbose:
            print(
                f"  >> Fim da época {epoca}: SSE = {sse:.4f}  |  "
                f"{erros_na_epoca} ponto(s) mal classificado(s) com os pesos atuais."
            )

        if not np.isfinite(sse) or sse > 1e6:
            if verbose:
                print(f"\n*** DIVERGIU na época {epoca}: SSE explodiu — diminua --taxa. ***")
            return

        if sse_anterior is not None and abs(sse_anterior - sse) < tolerancia_sse:
            if verbose:
                print(
                    f"\n*** ESTABILIZOU na época {epoca}: |ΔSSE| = {abs(sse_anterior - sse):.2e} "
                    f"< {tolerancia_sse}. ***"
                )
                print(f"Pesos finais: {np.round(pesos, 4)}  |  bias final: {bias:.4f}  |  SSE final: {sse:.4f}")
                if erros_na_epoca > 0:
                    print(
                        "ATENÇÃO: estabilizou num CICLO (os pesos voltam ao mesmo lugar a cada época), não no "
                        "mínimo do custo — sinal de η grande demais para a versão online (Tópico 15, seção 6: "
                        "o limite por exemplo é 2/||x̃||², que nas portas de 2 entradas dá 2/3)."
                    )
            return
        sse_anterior = sse

    if verbose:
        print(f"\n*** SSE ainda não estabilizou em {max_epocas} época(s) — ajuste --taxa ou --epocas. ***")


def formatar_linhas_log_adaline(passo, n_exemplos):
    """Versão Adaline de `formatar_linhas_log` (utils_plot): mostra alvo bipolar,
    z, o erro contínuo (alvo - z) e, no fim da época, o SSE."""
    linhas = []
    if passo["indice"] == 0:
        linhas.append(f"--- Época {passo['epoca']} ---")

    acertou = "ok" if passo["y_previsto"] == passo["y_real"] else "ERRADO"
    linhas.append(
        f"ép{passo['epoca']:>2} it{passo['indice'] + 1}: x={passo['x']} alvo={passo['alvo']:+d} "
        f"z={passo['z']:+.3f} erro=alvo-z={passo['erro']:+.3f}  ŷ={passo['y_previsto']} ({acertou})"
    )

    if passo["indice"] == n_exemplos - 1:
        linhas.append(
            f">> fim da época {passo['epoca']}: SSE={passo['sse']:.4f} | "
            f"{passo['erros_na_epoca']} mal classificado(s)"
        )

    return linhas


def preparar_eixo_erro(ax, max_epocas, n_pontos):
    """Eixo do custo: SSE (linha contínua) e, no eixo da direita, pontos mal
    classificados (degraus) — o contraste 'custo suave x contagem em patamares'."""
    ax.set_xlabel("Época")
    ax.set_ylabel("SSE = ½ Σ (alvo − z)²", color="tab:green")
    ax.set_title("Custo por época")
    ax.set_xlim(0, max_epocas + 1)
    linha_sse, = ax.plot([], [], "-", color="tab:green", linewidth=2)
    ax_class = ax.twinx()
    ax_class.set_ylabel("Pontos mal classificados", color="tab:orange")
    ax_class.set_ylim(-0.2, n_pontos + 0.5)
    linha_class, = ax_class.step([], [], where="post", color="tab:orange", alpha=0.8)
    return linha_sse, linha_class


def animar_2d(nome_porta, X, y, passos, intervalo):
    fig = plt.figure(figsize=(14, 7.5))
    gs = fig.add_gridspec(2, 3, height_ratios=[3, 1.3])
    ax_diagrama = fig.add_subplot(gs[0, 0])
    ax_plano = fig.add_subplot(gs[0, 1])
    ax_erro = fig.add_subplot(gs[0, 2])
    ax_log = fig.add_subplot(gs[1, :])
    texto_log, buffer_log = setup_log_panel(ax_log)

    diagrama = draw_neuron_diagram(ax_diagrama, n_entradas=2, rotulo_ativacao="degrau")
    ax_diagrama.set_title("Dentro do neurônio (Adaline)")

    ax_plano.set_xlim(-0.5, 1.5)
    ax_plano.set_ylim(-0.5, 1.5)
    ax_plano.set_xlabel("x1")
    ax_plano.set_ylabel("x2")
    ax_plano.set_title(f"Porta {nome_porta} — Adaline", pad=34)
    ax_plano.set_aspect("equal")
    draw_points_2d(ax_plano, X, y)
    linha, = ax_plano.plot([], [], "g-", linewidth=2)
    vetor_w = ax_plano.annotate(
        "", xy=(0.5, 0.5), xytext=(0.5, 0.5),
        arrowprops=dict(arrowstyle="-|>", color="purple", linewidth=2),
    )
    texto = ax_plano.text(
        0.02, 1.12, "", transform=ax_plano.transAxes, va="top", fontsize=9, family="monospace"
    )

    sse_ylim = max(p["sse"] for p in passos if "sse" in p)
    ax_erro.set_ylim(0, sse_ylim * 1.1)
    linha_sse, linha_class = preparar_eixo_erro(ax_erro, passos[-1]["epoca"], len(X))
    historico = []

    def atualizar(frame):
        passo = passos[frame]
        xs, ys = decision_line_points(passo["pesos"], passo["bias"])
        linha.set_data(xs, ys)
        ancora, ponta = vetor_normal_ancorado(passo["pesos"], passo["bias"])
        vetor_w.xy = ponta
        vetor_w.set_position(ancora)
        texto.set_text(
            f"época {passo['epoca']:>2} | amostra x={passo['x']} alvo={passo['alvo']:+d}\n"
            f"pesos={np.round(passo['pesos'], 2)} bias={passo['bias']:.2f} | "
            f"erro=alvo-z={passo['erro']:+.2f}"
        )

        for peso_txt, w in zip(diagrama["pesos"], passo["pesos"]):
            peso_txt.set_text(f"w={w:.2f}")
        diagrama["bias"].set_text(f"b={passo['bias']:.2f}")
        diagrama["soma"].set_text(f"z={passo['z']:.2f}\nerro=alvo−z={passo['erro']:+.2f}")
        diagrama["saida"].set_text(str(passo["y_previsto"]))

        if "sse" in passo:
            historico.append((passo["epoca"], passo["sse"], passo["erros_na_epoca"]))
            ep, sse, cls = zip(*historico)
            linha_sse.set_data(ep, sse)
            linha_class.set_data(ep, cls)

        buffer_log.extend(formatar_linhas_log_adaline(passo, len(X)))
        texto_log.set_text("\n".join(buffer_log))

        return (linha, vetor_w, texto, linha_sse, linha_class, texto_log,
                *diagrama["pesos"], diagrama["bias"], diagrama["soma"], diagrama["saida"])

    anim = animation.FuncAnimation(
        fig, atualizar, frames=len(passos), interval=intervalo, blit=False, repeat=False
    )
    plt.tight_layout()
    plt.show()
    return anim


def animar_1d(nome_porta, X, y, passos, intervalo):
    fig = plt.figure(figsize=(14, 6.5))
    gs = fig.add_gridspec(2, 3, height_ratios=[3, 1.3])
    ax_diagrama = fig.add_subplot(gs[0, 0])
    ax = fig.add_subplot(gs[0, 1])
    ax_erro = fig.add_subplot(gs[0, 2])
    ax_log = fig.add_subplot(gs[1, :])
    texto_log, buffer_log = setup_log_panel(ax_log)

    diagrama = draw_neuron_diagram(ax_diagrama, n_entradas=1, rotulo_ativacao="degrau")
    ax_diagrama.set_title("Dentro do neurônio (Adaline)")

    ax.set_xlim(-1, 2)
    ax.set_ylim(-0.5, 1.5)
    ax.set_yticks([])
    ax.set_xlabel("x")
    ax.set_title(f"Porta {nome_porta} — Adaline (1 entrada)")

    cores = ["tab:blue" if rotulo == 0 else "tab:red" for rotulo in y]
    ax.scatter(X[:, 0], [0] * len(X), c=cores, s=250, zorder=3, edgecolors="black")
    for (x1,), rotulo in zip(X, y):
        ax.annotate(str(rotulo), (x1, 0), textcoords="offset points", xytext=(0, 16), ha="center")

    linha_limiar = ax.axvline(0, color="green", linewidth=2)
    texto = ax.text(0.02, 1.15, "", transform=ax.transAxes, va="top", fontsize=9, family="monospace")

    sse_ylim = max(p["sse"] for p in passos if "sse" in p)
    ax_erro.set_ylim(0, sse_ylim * 1.1)
    linha_sse, linha_class = preparar_eixo_erro(ax_erro, passos[-1]["epoca"], len(X))
    historico = []

    def atualizar(frame):
        passo = passos[frame]
        w = passo["pesos"][0]
        b = passo["bias"]
        limiar = -b / w if abs(w) > 1e-9 else 0.0
        linha_limiar.set_xdata([limiar, limiar])
        texto.set_text(
            f"época {passo['epoca']:>2} | x={passo['x']} alvo={passo['alvo']:+d} | "
            f"w={w:.2f} b={b:.2f} | erro=alvo-z={passo['erro']:+.2f}"
        )

        diagrama["pesos"][0].set_text(f"w={w:.2f}")
        diagrama["bias"].set_text(f"b={b:.2f}")
        diagrama["soma"].set_text(f"z={passo['z']:.2f}\nerro=alvo−z={passo['erro']:+.2f}")
        diagrama["saida"].set_text(str(passo["y_previsto"]))

        if "sse" in passo:
            historico.append((passo["epoca"], passo["sse"], passo["erros_na_epoca"]))
            ep, sse, cls = zip(*historico)
            linha_sse.set_data(ep, sse)
            linha_class.set_data(ep, cls)

        buffer_log.extend(formatar_linhas_log_adaline(passo, len(X)))
        texto_log.set_text("\n".join(buffer_log))

        return (linha_limiar, texto, linha_sse, linha_class, texto_log,
                diagrama["pesos"][0], diagrama["bias"], diagrama["soma"], diagrama["saida"])

    anim = animation.FuncAnimation(
        fig, atualizar, frames=len(passos), interval=intervalo, blit=False, repeat=False
    )
    plt.tight_layout()
    plt.show()
    return anim


def animar_comparacao(nome_porta, X, y, passos_p, passos_a, intervalo):
    """Perceptron (esquerda) x Adaline (direita): mesma porta, mesmos pesos iniciais,
    mesma taxa — critério de pronto do Marco 2 (planejamento/04_planejamento.md).

    Os dois treinos avançam um exemplo por frame, juntos. Quando o Perceptron
    converge (para de gerar passos), ele fica congelado no estado final enquanto o
    Adaline continua refinando a reta — mesmo já classificando tudo certo.
    """
    fig = plt.figure(figsize=(13, 9))
    gs = fig.add_gridspec(3, 2, height_ratios=[3, 1.6, 1.3])
    ax_planos = [fig.add_subplot(gs[0, 0]), fig.add_subplot(gs[0, 1])]
    ax_erro_p = fig.add_subplot(gs[1, 0])
    ax_erro_a = fig.add_subplot(gs[1, 1])
    ax_log_p = fig.add_subplot(gs[2, 0])
    ax_log_a = fig.add_subplot(gs[2, 1])
    texto_log_p, buffer_log_p = setup_log_panel(ax_log_p, max_linhas=6)
    texto_log_a, buffer_log_a = setup_log_panel(ax_log_a, max_linhas=6)
    ax_log_p.set_title("Log — Perceptron", loc="left", fontsize=10)
    ax_log_a.set_title("Log — Adaline", loc="left", fontsize=10)

    titulos = [
        f"Perceptron — erro = y − ŷ (só ajusta quando erra)",
        f"Adaline — erro = alvo − z (ajusta sempre)",
    ]
    linhas, vetores, textos = [], [], []
    for ax, titulo in zip(ax_planos, titulos):
        ax.set_xlim(-0.5, 1.5)
        ax.set_ylim(-0.5, 1.5)
        ax.set_xlabel("x1")
        ax.set_ylabel("x2")
        ax.set_title(titulo, fontsize=10)
        ax.set_aspect("equal")
        draw_points_2d(ax, X, y)
        linhas.append(ax.plot([], [], "g-", linewidth=2)[0])
        vetores.append(ax.annotate(
            "", xy=(0.5, 0.5), xytext=(0.5, 0.5),
            arrowprops=dict(arrowstyle="-|>", color="purple", linewidth=2),
        ))
        textos.append(ax.text(0.02, 0.98, "", transform=ax.transAxes, va="top",
                              fontsize=8, family="monospace",
                              bbox=dict(facecolor="white", alpha=0.8, edgecolor="none")))

    max_epocas = max(passos_p[-1]["epoca"], passos_a[-1]["epoca"])
    ax_erro_p.set_xlabel("Época")
    ax_erro_p.set_ylabel("Mal classificados\n(pesos finais da época)")
    ax_erro_p.set_title("Perceptron: erro em degraus", fontsize=10)
    ax_erro_p.set_xlim(0, max_epocas + 1)
    ax_erro_p.set_ylim(-0.2, len(X) + 0.5)
    linha_erro_p, = ax_erro_p.step([], [], where="post", color="tab:orange")

    sse_ylim = max(p["sse"] for p in passos_a if "sse" in p)
    ax_erro_a.set_ylim(0, sse_ylim * 1.1)
    linha_sse, linha_class = preparar_eixo_erro(ax_erro_a, max_epocas, len(X))
    ax_erro_a.set_title("Adaline: SSE descendo suave", fontsize=10)

    hist_p, hist_a = [], []
    fig.suptitle(f"Porta {nome_porta} — Perceptron x Adaline (mesmos pesos iniciais e η)", fontsize=12)

    def desenhar_reta(k, passo):
        xs, ys = decision_line_points(passo["pesos"], passo["bias"])
        linhas[k].set_data(xs, ys)
        ancora, ponta = vetor_normal_ancorado(passo["pesos"], passo["bias"])
        vetores[k].xy = ponta
        vetores[k].set_position(ancora)

    def atualizar(frame):
        if frame < len(passos_p):
            passo = passos_p[frame]
            desenhar_reta(0, passo)
            textos[0].set_text(
                f"época {passo['epoca']:>2} | w={np.round(passo['pesos'], 2)} b={passo['bias']:.2f}"
                f"{'  ATUALIZOU' if passo['houve_atualizacao'] else ''}"
            )
            if passo["indice"] == len(X) - 1:
                hist_p.append((passo["epoca"], passo["erros_na_epoca"]))
                linha_erro_p.set_data(*zip(*hist_p))
            buffer_log_p.extend(formatar_linhas_log(passo, len(X)))
            texto_log_p.set_text("\n".join(buffer_log_p))
        elif frame == len(passos_p):
            textos[0].set_text(textos[0].get_text().replace("  ATUALIZOU", "") + "\nCONVERGIU — parou de ajustar")

        if frame < len(passos_a):
            passo = passos_a[frame]
            desenhar_reta(1, passo)
            textos[1].set_text(
                f"época {passo['epoca']:>2} | w={np.round(passo['pesos'], 2)} b={passo['bias']:.2f}\n"
                f"erro=alvo-z={passo['erro']:+.2f}"
            )
            if "sse" in passo:
                hist_a.append((passo["epoca"], passo["sse"], passo["erros_na_epoca"]))
                ep, sse, cls = zip(*hist_a)
                linha_sse.set_data(ep, sse)
                linha_class.set_data(ep, cls)
            buffer_log_a.extend(formatar_linhas_log_adaline(passo, len(X)))
            texto_log_a.set_text("\n".join(buffer_log_a))

        return (*linhas, *vetores, *textos, linha_erro_p, linha_sse, linha_class, texto_log_p, texto_log_a)

    anim = animation.FuncAnimation(
        fig, atualizar, frames=max(len(passos_p), len(passos_a)) + 1,
        interval=intervalo, blit=False, repeat=False,
    )
    plt.tight_layout()
    plt.show()
    return anim


def resumo_adaline(nome_porta, passos, n_exemplos, max_epocas):
    fins = [p for p in passos if "sse" in p]
    ultimo = fins[-1]
    print(
        f"Porta {nome_porta} (Adaline): {len(passos)} passos ao longo de {ultimo['epoca']} época(s) | "
        f"SSE final = {ultimo['sse']:.4f} | {ultimo['erros_na_epoca']} mal classificado(s) no fim."
    )
    primeira_certa = next((p["epoca"] for p in fins if p["erros_na_epoca"] == 0), None)
    if primeira_certa is not None:
        print(f"  Classificou os {n_exemplos} pontos certo pela 1ª vez no fim da época {primeira_certa}.")
    if not np.isfinite(ultimo["sse"]) or ultimo["sse"] > 1e6:
        print("  Divergiu — diminua --taxa.")
    elif ultimo["epoca"] == max_epocas:
        print(f"  SSE ainda não estabilizou em {max_epocas} épocas — aumente --epocas ou ajuste --taxa.")
    elif ultimo["erros_na_epoca"] > 0:
        print("  SSE estabilizou num CICLO, não no mínimo — η grande demais para a versão online; diminua --taxa.")
    else:
        print("  SSE estabilizou (|ΔSSE| abaixo da tolerância).")


def main():
    parser = argparse.ArgumentParser(description="Marco 2 — Adaline (regra delta) em portas lógicas")
    parser.add_argument("--porta", choices=PORTAS_VALIDAS, default="AND", help="porta lógica a treinar")
    parser.add_argument("--taxa", type=float, default=0.1, help="taxa de aprendizado (eta)")
    parser.add_argument("--epocas", type=int, default=100, help="número máximo de épocas")
    parser.add_argument("--intervalo", type=int, default=120, help="milissegundos entre frames")
    parser.add_argument("--semente", type=int, default=42, help="semente da inicialização aleatória dos pesos (ignorada se --pesos-iniciais for usado)")
    parser.add_argument(
        "--pesos-iniciais", type=float, nargs="+", default=None, metavar="W",
        help="pesos iniciais escolhidos manualmente, um valor por entrada (ex.: --pesos-iniciais 0.1 -0.2). "
             "Se omitido, os pesos começam aleatórios (--semente).",
    )
    parser.add_argument("--bias-inicial", type=float, default=0.0, help="bias inicial (padrão: 0.0)")
    parser.add_argument(
        "--comparar", action="store_true",
        help="roda Perceptron e Adaline lado a lado (mesma porta, pesos iniciais e taxa); só portas de 2 entradas",
    )
    parser.add_argument(
        "--quiet", action="store_true",
        help="desliga o log detalhado no console (só mostra o resumo final)",
    )
    args = parser.parse_args()

    X, y = get_gate(args.porta)
    eh_1d = args.porta in GATES_1D

    if args.comparar and eh_1d:
        print("Erro: --comparar só está disponível para portas de 2 entradas (AND, OR, NOR, NAND).")
        sys.exit(1)

    # no modo comparar, os dois logs detalhados intercalados ficariam ilegíveis no console
    verbose = not (args.quiet or args.comparar)

    try:
        passos = list(treinar_adaline(
            X, y, args.taxa, args.epocas, args.semente, verbose=verbose,
            pesos_iniciais=args.pesos_iniciais, bias_inicial=args.bias_inicial,
        ))
        if args.comparar:
            passos_p = list(perceptron.treinar_perceptron(
                X, y, args.taxa, args.epocas, args.semente, verbose=False,
                pesos_iniciais=args.pesos_iniciais, bias_inicial=args.bias_inicial,
            ))
    except ValueError as erro:
        print(f"Erro: {erro}")
        sys.exit(1)

    if not verbose:
        resumo_adaline(args.porta, passos, len(X), args.epocas)

    if args.comparar:
        ultimo_p = passos_p[-1]
        convergiu = ultimo_p["correcoes_na_epoca"] == 0 and ultimo_p["indice"] == len(X) - 1
        print(
            f"Porta {args.porta} (Perceptron): {len(passos_p)} passos ao longo de {ultimo_p['epoca']} época(s) — "
            f"{'convergiu (zero erros)' if convergiu else 'não convergiu'}."
        )
        animar_comparacao(args.porta, X, y, passos_p, passos, args.intervalo)
    elif eh_1d:
        animar_1d(args.porta, X, y, passos, args.intervalo)
    else:
        animar_2d(args.porta, X, y, passos, args.intervalo)


if __name__ == "__main__":
    main()
