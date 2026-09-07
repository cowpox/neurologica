"""Marco 1 do projeto NeuroLógica: Perceptron clássico (Modo 1a).

Regra de aprendizagem: correção de erro discreta pós-ativação (Tópico 14) —
w += taxa * (y_real - y_previsto) * x, ajustando os pesos só quando o
neurônio classifica errado.

Roda nas 5 portas lógicas linearmente separáveis: AND, OR, NOT, NOR, NAND.

Uso:
    python 01_perceptron_gates.py --porta AND
    python 01_perceptron_gates.py --porta NOT --taxa 0.2 --epocas 10
    python 01_perceptron_gates.py --porta AND --pesos-iniciais 0.1 -0.2 --bias-inicial 0.5
"""

import argparse
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

PORTAS_VALIDAS = ["AND", "OR", "NOT", "NOR", "NAND"]


TOLERANCIA_ZERO = 1e-9


def degrau(z, tolerancia=TOLERANCIA_ZERO):
    """Função de ativação degrau: 1 se z >= 0, senão 0.

    Usa uma tolerância para tratar qualquer |z| menor que ela como exatamente
    zero antes de comparar. Isso existe por causa de um caso real encontrado
    ao validar o Marco 1 (ver planejamento/05_aprendizados_obtidos.md,
    Aprendizado 4): com hiperparâmetros "redondos" (pesos iniciais zero,
    entradas booleanas, η=0.1), um ponto de treino pode cair matematicamente
    EXATO em cima da fronteira (z=0) — e nesse caso o resíduo de arredondamento
    de ponto flutuante (~1e-16, muito menor que a tolerância aqui) decide
    "por acidente" de qual lado ele cai, tornando o número de épocas até
    convergir dependente da ordem das operações de ponto flutuante em vez do
    algoritmo em si. A tolerância remove essa dependência: o resultado passa a
    bater sempre com a matemática exata, e fica portável entre implementações
    (Python, JS etc.).
    """
    if abs(z) < tolerancia:
        z = 0.0
    return 1 if z >= 0 else 0


def treinar_perceptron(
    X, y, taxa_aprendizado=0.1, max_epocas=20, semente=42, verbose=True,
    pesos_iniciais=None, bias_inicial=0.0,
):
    """Gera o estado do treino a cada exemplo processado (regra clássica do perceptron).

    Cada item gerado é um dicionário com: epoca, indice, x, y_real, y_previsto,
    pesos (cópia), bias, houve_atualizacao e erros_na_epoca (acumulado até aqui).
    Para de gerar assim que uma época inteira passar sem nenhum erro (convergência).

    Se `pesos_iniciais` for None (padrão), os pesos começam aleatórios (controlados
    por `semente`); se for uma lista/array com um valor por entrada, os pesos
    começam exatamente nesses valores (nesse caso `semente` é ignorada). `bias_inicial`
    controla o bias de partida (padrão 0.0), nos dois casos.

    Se verbose=True, imprime no console, a cada iteração: a fórmula da soma
    ponderada com os números substituídos, o erro, e — quando houver — a fórmula
    de correção de cada peso/bias, além do cabeçalho com os hiperparâmetros e da
    mensagem de convergência.
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

    if verbose:
        print("=" * 72)
        print("MARCO 1 — PERCEPTRON CLÁSSICO")
        print("=" * 72)
        print(f"Hiperparâmetro escolhido: taxa de aprendizado (η) = {taxa_aprendizado}")
        print(f"Máximo de épocas: {max_epocas}")
        print(f"Pesos iniciais {origem_pesos}: {np.round(pesos, 4)}  |  bias inicial: {bias:.4f}")
        print("Regra de correção (só aplicada quando y_real != y_previsto):")
        print("  w_novo = w_antigo + η * (y_real - y_previsto) * x")
        print("  b_novo = b_antigo + η * (y_real - y_previsto)")
        print("=" * 72)

    for epoca in range(1, max_epocas + 1):
        erros_na_epoca = 0
        if verbose:
            print(f"\n--- Época {epoca} ---")
        for i in range(len(X)):
            x = X[i]
            y_real = y[i]
            z = np.dot(pesos, x) + bias
            y_previsto = degrau(z)
            erro = y_real - y_previsto
            houve_atualizacao = erro != 0

            if verbose:
                termos = " + ".join(f"({w:.3f})*{xi:.0f}" for w, xi in zip(pesos, x))
                print(
                    f"  [iteração {i + 1}] x={x} y_real={y_real}  |  "
                    f"z = {termos} + ({bias:.3f}) = {z:.3f}  |  "
                    f"ŷ = degrau(z) = {y_previsto}  |  erro = ({y_real} - {y_previsto}) = {erro}"
                )

            if houve_atualizacao:
                pesos_antigos = pesos.copy()
                bias_antigo = bias
                pesos = pesos + taxa_aprendizado * erro * x
                bias = bias + taxa_aprendizado * erro
                erros_na_epoca += 1
                if verbose:
                    for j, (w_antigo, w_novo, xj) in enumerate(zip(pesos_antigos, pesos, x), start=1):
                        print(
                            f"      -> ATUALIZA w{j}: {w_antigo:.3f} + {taxa_aprendizado} * ({erro}) * {xj:.0f} = {w_novo:.3f}"
                        )
                    print(
                        f"      -> ATUALIZA b : {bias_antigo:.3f} + {taxa_aprendizado} * ({erro}) = {bias:.3f}"
                    )
            elif verbose:
                print("      -> classificação correta, sem atualização")

            yield {
                "epoca": epoca,
                "indice": i,
                "x": x,
                "y_real": y_real,
                "y_previsto": y_previsto,
                "z": z,
                "pesos": pesos.copy(),
                "bias": bias,
                "houve_atualizacao": houve_atualizacao,
                "erros_na_epoca": erros_na_epoca,
            }

        if verbose:
            print(f"  >> Fim da época {epoca}: {erros_na_epoca} ponto(s) mal classificado(s).")

        if erros_na_epoca == 0:
            if verbose:
                print(f"\n*** CONVERGIU na época {epoca}: nenhum ponto mal classificado. ***")
                print(f"Pesos finais: {np.round(pesos, 4)}  |  bias final: {bias:.4f}")
            return  # convergiu: todos os pontos classificados corretamente nesta época

    if verbose:
        print(f"\n*** NÃO convergiu em {max_epocas} época(s) — ajuste --taxa ou --epocas. ***")


def animar_2d(nome_porta, X, y, passos, intervalo):
    fig = plt.figure(figsize=(14, 7.5))
    gs = fig.add_gridspec(2, 3, height_ratios=[3, 1.3])
    ax_diagrama = fig.add_subplot(gs[0, 0])
    ax_plano = fig.add_subplot(gs[0, 1])
    ax_erro = fig.add_subplot(gs[0, 2])
    ax_log = fig.add_subplot(gs[1, :])
    texto_log, buffer_log = setup_log_panel(ax_log)

    diagrama = draw_neuron_diagram(ax_diagrama, n_entradas=2, rotulo_ativacao="degrau")

    ax_plano.set_xlim(-0.5, 1.5)
    ax_plano.set_ylim(-0.5, 1.5)
    ax_plano.set_xlabel("x1")
    ax_plano.set_ylabel("x2")
    ax_plano.set_title(f"Porta {nome_porta}")
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

    ax_erro.set_xlabel("Época")
    ax_erro.set_ylabel("Pontos mal classificados")
    ax_erro.set_title("Erro por época")
    max_epocas_estimado = passos[-1]["epoca"] + 1
    ax_erro.set_xlim(0, max_epocas_estimado)
    ax_erro.set_ylim(0, len(X) + 1)
    erros_por_epoca = []
    linha_erro, = ax_erro.plot([], [], "o-", color="tab:orange")

    def atualizar(frame):
        passo = passos[frame]
        xs, ys = decision_line_points(passo["pesos"], passo["bias"])
        linha.set_data(xs, ys)
        ancora, ponta = vetor_normal_ancorado(passo["pesos"], passo["bias"])
        vetor_w.xy = ponta
        vetor_w.set_position(ancora)
        texto.set_text(
            f"época {passo['epoca']:>2} | amostra x={passo['x']} y={passo['y_real']}\n"
            f"pesos={np.round(passo['pesos'], 2)} bias={passo['bias']:.2f} | "
            f"previsto={passo['y_previsto']}"
            f"{'  <- ATUALIZOU' if passo['houve_atualizacao'] else ''}"
        )

        for peso_txt, w in zip(diagrama["pesos"], passo["pesos"]):
            peso_txt.set_text(f"w={w:.2f}")
        diagrama["bias"].set_text(f"b={passo['bias']:.2f}")
        diagrama["soma"].set_text(f"z={passo['z']:.2f}")
        diagrama["saida"].set_text(str(passo["y_previsto"]))

        if passo["indice"] == len(X) - 1:
            erros_por_epoca.append((passo["epoca"], passo["erros_na_epoca"]))
            xs_e, ys_e = zip(*erros_por_epoca)
            linha_erro.set_data(xs_e, ys_e)

        buffer_log.extend(formatar_linhas_log(passo, len(X)))
        texto_log.set_text("\n".join(buffer_log))

        return (linha, vetor_w, texto, linha_erro, texto_log,
                *diagrama["pesos"], diagrama["bias"], diagrama["soma"], diagrama["saida"])

    anim = animation.FuncAnimation(
        fig, atualizar, frames=len(passos), interval=intervalo, blit=False, repeat=False
    )
    plt.tight_layout()
    plt.show()
    return anim


def animar_1d(nome_porta, X, y, passos, intervalo):
    fig = plt.figure(figsize=(11, 6))
    gs = fig.add_gridspec(2, 2, height_ratios=[3, 1.3])
    ax_diagrama = fig.add_subplot(gs[0, 0])
    ax = fig.add_subplot(gs[0, 1])
    ax_log = fig.add_subplot(gs[1, :])
    texto_log, buffer_log = setup_log_panel(ax_log)

    diagrama = draw_neuron_diagram(ax_diagrama, n_entradas=1, rotulo_ativacao="degrau")

    ax.set_xlim(-1, 2)
    ax.set_ylim(-0.5, 1.5)
    ax.set_yticks([])
    ax.set_xlabel("x")
    ax.set_title(f"Porta {nome_porta} — Perceptron (1 entrada)")

    cores = ["tab:blue" if rotulo == 0 else "tab:red" for rotulo in y]
    ax.scatter(X[:, 0], [0] * len(X), c=cores, s=250, zorder=3, edgecolors="black")
    for (x1,), rotulo in zip(X, y):
        ax.annotate(str(rotulo), (x1, 0), textcoords="offset points", xytext=(0, 16), ha="center")

    linha_limiar = ax.axvline(0, color="green", linewidth=2)
    texto = ax.text(0.02, 1.15, "", transform=ax.transAxes, va="top", fontsize=9, family="monospace")

    def atualizar(frame):
        passo = passos[frame]
        w = passo["pesos"][0]
        b = passo["bias"]
        limiar = -b / w if abs(w) > 1e-9 else 0.0
        linha_limiar.set_xdata([limiar, limiar])
        texto.set_text(
            f"época {passo['epoca']:>2} | x={passo['x']} y={passo['y_real']} | "
            f"w={w:.2f} b={b:.2f} | previsto={passo['y_previsto']}"
            f"{'  <- ATUALIZOU' if passo['houve_atualizacao'] else ''}"
        )

        diagrama["pesos"][0].set_text(f"w={w:.2f}")
        diagrama["bias"].set_text(f"b={b:.2f}")
        diagrama["soma"].set_text(f"z={passo['z']:.2f}")
        diagrama["saida"].set_text(str(passo["y_previsto"]))

        buffer_log.extend(formatar_linhas_log(passo, len(X)))
        texto_log.set_text("\n".join(buffer_log))

        return (linha_limiar, texto, texto_log,
                diagrama["pesos"][0], diagrama["bias"], diagrama["soma"], diagrama["saida"])

    anim = animation.FuncAnimation(
        fig, atualizar, frames=len(passos), interval=intervalo, blit=False, repeat=False
    )
    plt.tight_layout()
    plt.show()
    return anim


def main():
    parser = argparse.ArgumentParser(description="Marco 1 — Perceptron clássico em portas lógicas")
    parser.add_argument("--porta", choices=PORTAS_VALIDAS, default="AND", help="porta lógica a treinar")
    parser.add_argument("--taxa", type=float, default=0.1, help="taxa de aprendizado (eta)")
    parser.add_argument("--epocas", type=int, default=20, help="número máximo de épocas")
    parser.add_argument("--intervalo", type=int, default=400, help="milissegundos entre frames")
    parser.add_argument("--semente", type=int, default=42, help="semente da inicialização aleatória dos pesos (ignorada se --pesos-iniciais for usado)")
    parser.add_argument(
        "--pesos-iniciais", type=float, nargs="+", default=None, metavar="W",
        help="pesos iniciais escolhidos manualmente, um valor por entrada (ex.: --pesos-iniciais 0.1 -0.2). "
             "Se omitido, os pesos começam aleatórios (--semente).",
    )
    parser.add_argument("--bias-inicial", type=float, default=0.0, help="bias inicial (padrão: 0.0)")
    parser.add_argument(
        "--quiet", action="store_true",
        help="desliga o log detalhado no console (só mostra o resumo final)",
    )
    args = parser.parse_args()

    X, y = get_gate(args.porta)
    eh_1d = args.porta in GATES_1D

    try:
        passos = list(treinar_perceptron(
            X, y, args.taxa, args.epocas, args.semente, verbose=not args.quiet,
            pesos_iniciais=args.pesos_iniciais, bias_inicial=args.bias_inicial,
        ))
    except ValueError as erro:
        print(f"Erro: {erro}")
        sys.exit(1)

    if args.quiet:
        print(f"Porta {args.porta}: {len(passos)} passos gerados ao longo de {passos[-1]['epoca']} época(s).")
        if passos[-1]["erros_na_epoca"] == 0 and passos[-1]["indice"] == len(X) - 1:
            print("Convergiu (última época sem nenhum erro).")
        else:
            print(f"Não convergiu em {args.epocas} épocas — aumente --epocas ou ajuste --taxa.")

    if eh_1d:
        animar_1d(args.porta, X, y, passos, args.intervalo)
    else:
        animar_2d(args.porta, X, y, passos, args.intervalo)


if __name__ == "__main__":
    main()
