"""Marco 3 do projeto NeuroLógica: por que 1 neurônio só NÃO resolve XOR/XNOR (Transição).

Este marco não traz algoritmo novo. Ele roda exatamente o mesmo código dos Marcos 1 e
2 — sem nenhuma mudança de arquitetura — nas duas portas que não são linearmente
separáveis, lado a lado, para deixar visualmente claro que o problema não está na
regra de aprendizagem. É o ponto de virada da narrativa (Q2 do trabalho):

  * PERCEPTRON (esquerda): nunca converge. Corrige um ponto, estraga outro, e os pesos
    de fim de época acabam se repetindo (um ciclo). O número de pontos mal
    classificados nunca chega a zero e o treino só para porque o limite de épocas acaba.

  * ADALINE (direita): converge, no sentido do gradiente descendente — o custo cai e
    estaciona perto do mínimo teórico. Só que ele estaciona num lugar inútil: o melhor
    ajuste linear (mínimos quadrados) do XOR/XNOR com alvos -1/+1 é a função CONSTANTE
    z = 0, que não separa nada. Como a versão online (ordem fixa dos exemplos) chega a
    um ponto fixo um pouco inclinado em volta dessa constante (Aprendizado 8), o lado em
    que cada ponto cai é decidido por um resíduo pequeno de z, não por uma separação de
    verdade.

A conclusão que se quer tirar sozinho: as duas regras de treino fizeram o que
prometem, e mesmo assim falham. O limite é da ARQUITETURA (um neurônio traça uma única
reta, e o problema precisa de duas), não da regra de treino. É por isso que o Marco 4
muda de arquitetura, e não de taxa de aprendizado.

Reaproveita os treinos dos Marcos 1 e 2 sem alterá-los (`treinar_perceptron` e
`treinar_adaline`, com a mesma semente, taxa e pesos iniciais). Como a comparação é o
objetivo, os dois logs detalhados vão para os painéis da animação (não há `--quiet`) e o
console mostra um relatório com o veredito de cada treino.

Uso:
    python 03_perceptron_xor_falha.py --porta XOR
    python 03_perceptron_xor_falha.py --porta XNOR --epocas 80
    python 03_perceptron_xor_falha.py --porta XOR --pesos-iniciais 0 0 --bias-inicial 0
"""

import argparse
import importlib
import sys

import matplotlib.animation as animation
import matplotlib.pyplot as plt
import numpy as np

from utils_plot import (
    decision_line_points,
    draw_points_2d,
    formatar_linhas_log,
    get_gate,
    setup_log_panel,
    vetor_normal_ancorado,
)

# O nome dos arquivos dos Marcos 1 e 2 começa com dígito, então não dá para usar `import`
# direto. Reaproveita os treinos, o `degrau` (com a mesma tolerância numérica), a contagem
# de erros e a formatação do gráfico de custo do Adaline.
perceptron = importlib.import_module("01_perceptron_gates")
adaline = importlib.import_module("02_adaline_gates")
degrau = perceptron.degrau

PORTAS_VALIDAS = ["XOR", "XNOR"]

# Arredondamento (casas decimais) usado para decidir se dois estados de pesos são "o mesmo"
# ao procurar o ciclo do Perceptron. Os pesos do Perceptron são somas de múltiplos da taxa,
# então repetições exatas aparecem com sobra de precisão; o arredondamento só absorve o
# ruído de ponto flutuante.
CASAS_CICLO = 9


def solucao_minimos_quadrados(X, y):
    """Melhor ajuste linear (w, b) para os alvos bipolares, por mínimos quadrados, e o custo
    mínimo E = 1/2 * soma (alvo - z)^2 que ele alcança.

    É o limite do gradiente descendente em lote (ou do Adaline online com η → 0) e serve de
    régua independente do treino: o custo do Adaline só pode se aproximar desse valor, e
    não superá-lo. Para o XOR/XNOR ele é w = (0, 0) e b = 0 (a constante 0), com E = 2. O
    Adaline online com η finito e ordem fixa dos exemplos para um pouco ao lado dele
    (`ponto_fixo_online`).
    """
    alvos = 2 * y - 1  # classe 0 -> -1, classe 1 -> +1 (convenção do Marco 2)
    X_aumentado = np.column_stack([X, np.ones(len(X))])
    solucao = np.linalg.lstsq(X_aumentado, alvos, rcond=None)[0]
    pesos, bias = solucao[:-1], solucao[-1]
    z_otimo = X @ pesos + bias
    custo_minimo = 0.5 * np.sum((alvos - z_otimo) ** 2)
    return pesos, bias, z_otimo, custo_minimo


def ponto_fixo_online(X, y, taxa):
    """Ponto de chegada REAL do Adaline online com η finito e os exemplos sempre na mesma ordem.

    Uma época do Adaline online é uma função afim dos pesos, v -> M v + c (v = (w, b)), porque
    cada passo (v += η (alvo - x~.v) x~, com x~ = (x, 1)) é afim. Se o raio espectral de M é
    menor que 1, os pesos de fim de época convergem ao ponto fixo (I - M) v = c, que depende de
    η e da ORDEM dos exemplos, mas não da inicialização. Ele só coincide com o mínimo de
    mínimos quadrados quando η -> 0 (Aprendizado 8). Devolve (pesos, bias, z, custo) ou None
    se a época não converge (η grande demais).
    """
    alvos = 2 * y - 1
    X_aumentado = np.column_stack([X, np.ones(len(X))])
    n = X_aumentado.shape[1]
    M, c = np.eye(n), np.zeros(n)
    for x_aumentado, alvo in zip(X_aumentado, alvos):
        A = np.eye(n) - taxa * np.outer(x_aumentado, x_aumentado)
        M = A @ M
        c = A @ c + taxa * alvo * x_aumentado
    if np.max(np.abs(np.linalg.eigvals(M))) >= 1:
        return None
    v = np.linalg.solve(np.eye(n) - M, c)
    z = X_aumentado @ v
    return v[:-1], v[-1], z, 0.5 * np.sum((alvos - z) ** 2)


def estado_adaline(fins_a, taxa):
    """Como o treino do Adaline terminou: "diverge", "estabilizou" ou "limite" (parou por limite
    de épocas com o custo ainda caindo).

    Aplica o MESMO critério do gerador (`treinar_adaline`): |ΔSSE| < TOLERANCIA_SSE_POR_TAXA * η
    entre as duas últimas épocas. Não dá para inferir isso por "parou antes de max_epocas":
    se o custo estabiliza exatamente na última época permitida, a época é igual ao limite.
    """
    sse = fins_a[-1]["sse"]
    if not np.isfinite(sse) or sse > 1e6:
        return "diverge"
    if len(fins_a) >= 2 and abs(fins_a[-2]["sse"] - sse) < adaline.TOLERANCIA_SSE_POR_TAXA * taxa:
        return "estabilizou"
    return "limite"


def sem_zero_negativo(valor, casas=4):
    """Arredonda e troca -0.0 por 0.0, para o relatório não mostrar "-0.0000"."""
    return float(np.round(valor, casas)) + 0.0


def fins_de_epoca(passos, n_exemplos):
    """Só os passos que fecham uma época (último exemplo), que é onde `erros_na_epoca`
    existe e onde os pesos de fim de época podem ser comparados."""
    return [p for p in passos if p["indice"] == n_exemplos - 1]


def detectar_ciclo(fins):
    """Procura a primeira época cujos pesos de fim de época já tinham ocorrido antes.

    Devolve (época_em_que_o_estado_aparece_pela_1ª_vez, período) ou None se nunca se
    repetem. Período 1 significa que a época termina exatamente onde terminou a anterior.
    """
    vistos = {}
    for p in fins:
        estado = (tuple(np.round(p["pesos"], CASAS_CICLO)), round(float(p["bias"]), CASAS_CICLO))
        if estado in vistos:
            primeira = vistos[estado]
            return primeira, p["epoca"] - primeira
        vistos[estado] = p["epoca"]
    return None


def resumo_falha(nome_porta, X, y, passos_p, passos_a, max_epocas, args):
    """Relatório do console com o veredito de cada treino.

    Só diz "convergiu" quando houve convergência de verdade (nunca porque o limite de
    épocas acabou) e conta os erros COM OS PESOS FINAIS (`contar_erros`), a mesma medida
    nos dois treinos. Não reaproveita o `resumo_adaline` do Marco 2, cuja mensagem para
    quando o Adaline para com pontos errados ("η grande demais") seria falsa aqui: no
    XOR/XNOR o limite é a arquitetura.
    """
    n = len(X)
    fins_p = fins_de_epoca(passos_p, n)
    fins_a = fins_de_epoca(passos_a, n)
    ultimo_p, ultimo_a = fins_p[-1], fins_a[-1]
    pesos_otimos, bias_otimo, z_otimo, custo_minimo = solucao_minimos_quadrados(X, y)

    print("=" * 72)
    print(f"MARCO 3 — PORTA {nome_porta} COM UM ÚNICO NEURÔNIO")
    print("=" * 72)
    origem = "escolhidos manualmente" if args.pesos_iniciais is not None else f"aleatórios (semente={args.semente})"
    print(
        f"Parâmetros (iguais para os dois): η = {args.taxa} | máx. {max_epocas} épocas | "
        f"pesos iniciais {origem}, bias inicial {args.bias_inicial}"
    )

    # ------------------------------------------------------------ Perceptron
    print("\n--- PERCEPTRON ---")
    erros = [p["erros_na_epoca"] for p in fins_p]
    if ultimo_p["correcoes_na_epoca"] == 0:
        print(f"  Convergiu na época {ultimo_p['epoca']} (época sem nenhuma correção).")
    else:
        print(
            f"  NÃO convergiu em {ultimo_p['epoca']} época(s): ainda fez "
            f"{ultimo_p['correcoes_na_epoca']} correção(ões) na última."
        )
    print(
        f"  Mal classificados com os pesos finais de cada época: mínimo {min(erros)}, "
        f"máximo {max(erros)} (de {n} pontos)."
    )
    ciclo = detectar_ciclo(fins_p)
    if ciclo is not None and ultimo_p["correcoes_na_epoca"] > 0:
        inicio, periodo = ciclo
        print(
            f"  Ciclo: os pesos de fim de época voltam a um estado já visto (da época {inicio} em diante, "
            f"período de {periodo} época(s)). A reta continua se mexendo dentro de cada época, "
            f"mas o treino não sai do lugar."
        )

    # --------------------------------------------------------------- Adaline
    print("\n--- ADALINE ---")
    estado_a = estado_adaline(fins_a, args.taxa)
    diverge = estado_a == "diverge"
    if diverge:
        print(f"  DIVERGIU na época {ultimo_a['epoca']} (SSE explodiu); diminua --taxa.")
    elif estado_a == "estabilizou":
        print(
            f"  Estabilizou na época {ultimo_a['epoca']}: o custo parou de cair (variação abaixo da tolerância; "
            f"os pesos ainda podem estar se acomodando um pouco)."
        )
    else:
        print(f"  O custo ainda não estabilizou em {max_epocas} época(s); aumente --epocas.")
    pesos_a, bias_a = ultimo_a["pesos"], ultimo_a["bias"]
    z_finais = X @ pesos_a + bias_a
    classes = [degrau(z) for z in z_finais]
    mal = perceptron.contar_erros(X, y, pesos_a, bias_a)
    print(
        f"  Custo final E = {ultimo_a['sse']:.4f}  |  mínimo teórico (mínimos quadrados) E = {custo_minimo:.4f}"
    )
    if np.allclose(pesos_otimos, 0, atol=1e-9):
        print(
            f"  Melhor ajuste linear possível: w = (0, 0), b = {sem_zero_negativo(bias_otimo):+.4f}, ou seja, "
            f"z = {sem_zero_negativo(z_otimo[0]):+.4f} em TODOS os pontos (uma constante: o ponto médio dos alvos -1 e +1)."
        )
    else:
        print(f"  Melhor ajuste linear possível: w = {np.round(pesos_otimos, 4)}, b = {sem_zero_negativo(bias_otimo):+.4f}.")
    print(
        f"  Pesos finais: w = {np.round(pesos_a, 4)}, b = {bias_a:+.4f}  |  z nos {n} pontos = {np.round(z_finais, 4)}"
    )
    print(f"  Classes decididas pelo degrau: {classes}  (esperado: {[int(v) for v in y]})")
    print(f"  Mal classificados com os pesos finais: {mal} de {n}.")
    if mal > 0 and not diverge and np.max(np.abs(z_finais)) < 0.5:
        print(
            f"  Como |z| é no máximo {np.max(np.abs(z_finais)):.3f}, o lado de cada ponto é decidido por um "
            f"resíduo pequeno em volta de zero, e não por uma separação de verdade."
        )
    if not diverge:
        fixo = ponto_fixo_online(X, y, args.taxa)
        if fixo is not None:
            _, _, z_fixo, custo_fixo = fixo
            classes_fixo = [degrau(z) for z in z_fixo]
            mal_fixo = sum(c != int(yy) for c, yy in zip(classes_fixo, y))
            print(
                f"  Ponto de chegada do Adaline online (ordem fixa dos exemplos; não depende da inicialização): "
                f"z = {np.round(z_fixo, 4)}, E = {custo_fixo:.4f}, classes {classes_fixo}, {mal_fixo} de {n} "
                f"mal classificados."
            )
            print(
                "  (O veredito acima vale para a época de parada; o treino continuaria se acomodando até esse ponto, "
                "que é só uma pequena inclinação em volta da constante z = 0.)"
            )

    # ------------------------------------------------------------- conclusão
    print("\n--- CONCLUSÃO ---")
    print(
        "  Nenhuma das duas regras resolve a porta, por motivos diferentes: o Perceptron nunca para de errar;\n"
        "  o Adaline encontra o melhor ajuste linear, que é inútil. O limite é a ARQUITETURA (uma reta só),\n"
        "  não a regra de treino — por isso o Marco 4 muda a arquitetura."
    )
    print("=" * 72)


def animar_falha(nome_porta, X, y, passos_p, passos_a, custo_minimo, estado_a, intervalo):
    """Perceptron (esquerda) x Adaline (direita) na mesma porta não separável.

    Os dois treinos avançam um exemplo por frame, juntos. O Adaline estabiliza cedo e
    fica congelado no estado final (com a mensagem de que parou num lugar inútil)
    enquanto o Perceptron segue corrigindo até o limite de épocas.
    """
    n = len(X)
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
        "Perceptron — não converge (os pesos entram em ciclo)",
        {
            "estabilizou": "Adaline — o custo estaciona, num ajuste inútil",
            "limite": "Adaline — ainda descendo no limite de épocas",
            "diverge": "Adaline — divergiu (η grande demais)",
        }[estado_a],
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

    # erro do Perceptron: pontos mal classificados (pesos finais da época), em degraus
    ax_erro_p.set_xlabel("Época")
    ax_erro_p.set_ylabel("Mal classificados\n(pesos finais da época)")
    ax_erro_p.set_title("Perceptron: erro em degraus, que nunca zera", fontsize=10)
    ax_erro_p.set_xlim(0, max(passos_p[-1]["epoca"], passos_a[-1]["epoca"]) + 1)
    ax_erro_p.set_ylim(-0.2, n + 0.5)
    linha_erro_p, = ax_erro_p.step([], [], where="post", color="tab:orange")

    # erro do Adaline: SSE (curva contínua) e, à direita, mal classificados; a linha
    # tracejada é o mínimo teórico, que o custo nunca consegue ultrapassar
    sse_ylim = max(p["sse"] for p in passos_a if "sse" in p)
    # a escala vai de um pouco abaixo do mínimo teórico até um pouco acima do custo inicial, para
    # a descida até o mínimo (que é pequena nesta porta) ser visível
    ax_erro_a.set_ylim(custo_minimo * 0.9, max(sse_ylim, custo_minimo) * 1.1)
    linha_sse, linha_class = adaline.preparar_eixo_erro(
        ax_erro_a, max(passos_p[-1]["epoca"], passos_a[-1]["epoca"]), n
    )
    ax_erro_a.axhline(custo_minimo, color="gray", linestyle="--", linewidth=1)
    ax_erro_a.text(0.98, custo_minimo, f" mínimo teórico = {custo_minimo:.1f}", transform=ax_erro_a.get_yaxis_transform(),
                   ha="right", va="bottom", fontsize=8, color="gray")
    ax_erro_a.set_title(
        "Adaline: o custo estaciona perto do mínimo (que é inútil)" if estado_a == "estabilizou"
        else "Adaline: custo por época",
        fontsize=10,
    )

    hist_p, hist_a = [], []
    fig.suptitle(f"Porta {nome_porta} — um neurônio só (Perceptron x Adaline, mesmos pesos iniciais e η)", fontsize=12)

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
            if passo["indice"] == n - 1:
                hist_p.append((passo["epoca"], passo["erros_na_epoca"]))
                linha_erro_p.set_data(*zip(*hist_p))
            buffer_log_p.extend(formatar_linhas_log(passo, n))
            texto_log_p.set_text("\n".join(buffer_log_p))
        elif frame == len(passos_p):
            textos[0].set_text(
                textos[0].get_text().replace("  ATUALIZOU", "") + "\nNÃO CONVERGIU — segue errando e corrigindo"
            )

        if frame < len(passos_a):
            passo = passos_a[frame]
            desenhar_reta(1, passo)
            z_todos = X @ passo["pesos"] + passo["bias"]
            textos[1].set_text(
                f"época {passo['epoca']:>2} | w={np.round(passo['pesos'], 2)} b={passo['bias']:.2f}\n"
                f"z nos {n} pontos={np.round(z_todos, 2)}"
            )
            if "sse" in passo:
                hist_a.append((passo["epoca"], passo["sse"], passo["erros_na_epoca"]))
                ep, sse, cls = zip(*hist_a)
                linha_sse.set_data(ep, sse)
                linha_class.set_data(ep, cls)
            buffer_log_a.extend(adaline.formatar_linhas_log_adaline(passo, n))
            texto_log_a.set_text("\n".join(buffer_log_a))
        elif frame == len(passos_a):
            fecho = {
                "estabilizou": "ESTABILIZOU — o melhor ajuste linear é z ≈ 0 em todo lugar",
                "limite": "LIMITE DE ÉPOCAS — o custo ainda estava caindo",
                "diverge": "DIVERGIU — η grande demais",
            }[estado_a]
            textos[1].set_text(textos[1].get_text() + "\n" + fecho)

        return (*linhas, *vetores, *textos, linha_erro_p, linha_sse, linha_class, texto_log_p, texto_log_a)

    anim = animation.FuncAnimation(
        fig, atualizar, frames=max(len(passos_p), len(passos_a)) + 1,
        interval=intervalo, blit=False, repeat=False,
    )
    plt.tight_layout()
    plt.show()
    return anim


def main():
    parser = argparse.ArgumentParser(
        description="Marco 3 — por que um único neurônio não resolve XOR/XNOR (Perceptron x Adaline)"
    )
    parser.add_argument("--porta", choices=PORTAS_VALIDAS, default="XOR", help="porta não linearmente separável")
    parser.add_argument("--taxa", type=float, default=0.1, help="taxa de aprendizado (eta), usada nos dois")
    parser.add_argument("--epocas", type=int, default=50, help="número máximo de épocas, usado nos dois")
    parser.add_argument("--intervalo", type=int, default=150, help="milissegundos entre frames")
    parser.add_argument(
        "--semente", type=int, default=42,
        help="semente da inicialização aleatória dos pesos (ignorada se --pesos-iniciais for usado)",
    )
    parser.add_argument(
        "--pesos-iniciais", type=float, nargs="+", default=None, metavar="W",
        help="pesos iniciais escolhidos manualmente, um valor por entrada (ex.: --pesos-iniciais 0.1 -0.2). "
             "Se omitido, os pesos começam aleatórios (--semente).",
    )
    parser.add_argument("--bias-inicial", type=float, default=0.0, help="bias inicial (padrão: 0.0)")
    args = parser.parse_args()

    if args.epocas < 1:
        parser.error("--epocas precisa ser pelo menos 1")

    X, y = get_gate(args.porta)

    try:
        passos_p = list(perceptron.treinar_perceptron(
            X, y, args.taxa, args.epocas, args.semente, verbose=False,
            pesos_iniciais=args.pesos_iniciais, bias_inicial=args.bias_inicial,
        ))
        passos_a = list(adaline.treinar_adaline(
            X, y, args.taxa, args.epocas, args.semente, verbose=False,
            pesos_iniciais=args.pesos_iniciais, bias_inicial=args.bias_inicial,
        ))
    except ValueError as erro:
        print(f"Erro: {erro}")
        sys.exit(1)

    _, _, _, custo_minimo = solucao_minimos_quadrados(X, y)
    resumo_falha(args.porta, X, y, passos_p, passos_a, args.epocas, args)
    estado_a = estado_adaline(fins_de_epoca(passos_a, len(X)), args.taxa)
    animar_falha(args.porta, X, y, passos_p, passos_a, custo_minimo, estado_a, args.intervalo)


if __name__ == "__main__":
    main()
