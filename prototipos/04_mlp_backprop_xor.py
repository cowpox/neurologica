"""Marco 4 do projeto NeuroLógica: MLP com backpropagation resolvendo XOR/XNOR (Modo 2).

Desfecho da narrativa. O Marco 3 mostrou que nenhuma regra de treino salva um único
neurônio no XOR, porque uma reta só não dá conta. Aqui muda a ARQUITETURA: uma camada
oculta com N neurônios (padrão 2) e um neurônio de saída. Três coisas mudam juntas, e
dependem uma da outra:

  1. ARQUITETURA: cada neurônio oculto traça a SUA reta. Com duas retas dá para recortar
     a faixa diagonal onde ficam os pontos de classe 1 do XOR, o que é impossível com
     uma reta só. O neurônio de saída aprende a combinar as duas regiões (Tópico 18:
     XOR = AND(OR, NAND)).

  2. ATIVAÇÃO: o degrau tem derivada zero em todo lugar (e indefinida no salto), então
     não há gradiente para propagar; e uma ativação linear faria as camadas colapsarem
     numa reta só. Por isso a camada oculta usa uma função NÃO LINEAR e DIFERENCIÁVEL —
     sigmoide (padrão), tanh ou ReLU. É a resposta à Q4 do trabalho.

  3. REGRA DE TREINO: backpropagation, a regra da cadeia aplicada camada a camada para
     descobrir quanto cada peso contribuiu para o erro. É o mesmo gradiente descendente do
     Adaline, só que agora atravessando uma camada intermediária (Q5).

Escolhas registradas no planejamento (Decisões 6 e 9 de planejamento/06_detalhes_implementacao.md):

  * Saída SIGMOIDE com alvos 0/1 (e não -1/+1 como no Adaline). A classe é decidida por
    `degrau(z_saida)`, o mesmo degrau dos Marcos 1 a 3, aplicado à soma do neurônio de
    saída ANTES da sigmoide — como sigmoide(z) >= 0.5 exatamente quando z >= 0, é o mesmo
    que "saída >= 0.5", sem criar um limiar novo.
  * Custo monitorado: sse = 1/2 * soma (alvo - saída)^2, a mesma definição do Adaline. A
    atualização usa a MÉDIA dos gradientes sobre os exemplos (como o site), isto é, desce
    o custo médio sse/n; com 4 pontos, η = 2 aqui equivale a η = 0.5 sobre a soma.
  * Os limiares vêm do site (erro quadrático médio 0.01 para convergir; melhora mínima de
    3e-3 numa janela de 300 épocas para não reiniciar) e são convertidos para a escala do
    sse: sse = (n / 2) * erro_quadrático_médio.
  * Pesos iniciais pela regra de Xavier (uniforme em ±sqrt(6 / (entradas + saídas)) por
    camada), a mesma do site, a partir de `np.random.default_rng(semente)`.
  * Reinício automático: se em 300 épocas o custo não caiu o suficiente, a rede está presa
    num mínimo local (o erro "rasteja") e recomeça de outro sorteio (Aprendizado 9 da demo).

Diferenças conscientes em relação às convenções dos Marcos 1 a 3 (planejamento, seção
"Convenções de código dos protótipos"): o treino é em LOTE (todas as amostras por época),
então o gerador entrega um passo por ÉPOCA, e não por exemplo; `epoca` conta as
atualizações já feitas (0 = pesos iniciais, como no site); não há --pesos-iniciais (são 9
pesos com 2 ocultos, sorteados pela semente).

Uso:
    python 04_mlp_backprop_xor.py --porta XOR
    python 04_mlp_backprop_xor.py --porta XNOR --ativacao tanh
    python 04_mlp_backprop_xor.py --porta XOR --testar-sementes 40          # sem animação
    python 04_mlp_backprop_xor.py --porta XOR --testar-sementes 20 --sem-reinicio --taxa 0.5
"""

import argparse
import importlib

import matplotlib.animation as animation
import matplotlib.pyplot as plt
import numpy as np

from utils_plot import (
    decision_line_points,
    draw_network_diagram,
    draw_points_2d,
    estilo_conexao,
    get_gate,
    setup_log_panel,
)

# O nome do arquivo do Marco 1 começa com dígito, então não dá para usar `import` direto.
# Reaproveita o degrau, com a mesma tolerância numérica, para decidir a classe.
perceptron = importlib.import_module("01_perceptron_gates")
degrau = perceptron.degrau

PORTAS_VALIDAS = ["XOR", "XNOR"]

# Convergência: o mesmo limiar do site, expresso no erro quadrático médio (EQM). Abaixo
# dele todas as saídas já estão do lado certo de 0.5 com folga. Convertido para a escala
# do sse dentro do treino (sse = n/2 * EQM; com 4 pontos, 0.02 vira 0.04).
LIMIAR_EQM = 0.02

# Detecção de mínimo local por JANELA (a regra do site, Aprendizado 9 da demo): se em
# JANELA épocas o EQM não caiu pelo menos MELHORA_NA_JANELA_EQM, o treino está rastejando
# num mínimo local e vale recomeçar de outro sorteio. Comparar com o "melhor erro já
# visto" não funciona: no mínimo local o erro continua melhorando ~2.5e-6 por época, e o
# contador zeraria para sempre.
JANELA = 300
MELHORA_NA_JANELA_EQM = 3e-3

# Quantas inicializações tentar antes de desistir.
MAX_TENTATIVAS = 10
# Era 6. Medido na conferência Python -> JS (2026-11-10): cada tentativa fica presa num mínimo
# local com probabilidade de ~35% (sigmoide) a ~47% (tanh), e com 6 tentativas 2 de 200
# sementes do XNOR com sigmoide esgotavam todas; com 10, as 200 convergem (Aprendizado 13).


def sigmoide(z):
    # o recorte só evita overflow do exp quando os pesos divergem; não muda nada na faixa útil
    return 1.0 / (1.0 + np.exp(-np.clip(z, -500, 500)))


def derivada_sigmoide_da_saida(a):
    """Derivada da sigmoide escrita em função da PRÓPRIA saída: σ'(z) = a (1 - a).

    Como `a` já foi calculado no passo para a frente, a derivada sai de graça — uma das
    razões históricas de a sigmoide ter sido tão usada.
    """
    return a * (1.0 - a)


def tanh(z):
    return np.tanh(z)


def derivada_tanh_da_saida(a):
    """tanh'(z) = 1 - tanh(z)^2 = 1 - a^2."""
    return 1.0 - a ** 2


def relu(z):
    return np.maximum(0.0, z)


def derivada_relu_da_saida(a):
    """1 onde a saída é positiva, 0 caso contrário.

    O "neurônio morto": se um neurônio ReLU fica na região negativa para todos os
    exemplos, a derivada é 0 em todos eles, nenhum gradiente passa e ele nunca mais se
    recupera. Com só 4 pontos isso acontece com frequência.
    """
    return (a > 0).astype(float)


ATIVACOES = {
    "sigmoide": (sigmoide, derivada_sigmoide_da_saida),
    "tanh": (tanh, derivada_tanh_da_saida),
    "relu": (relu, derivada_relu_da_saida),
}


def inicializar_pesos(n_entradas, n_ocultos, rng):
    """Sorteia os pesos iniciais pela regra de Xavier (a mesma do site).

    Cada camada sorteia uniforme em ±sqrt(6 / (entradas + saídas)). A simetria precisa
    ser quebrada: se todos os neurônios ocultos começassem iguais, receberiam gradientes
    iguais e continuariam iguais para sempre, e a rede se comportaria como se tivesse um
    neurônio oculto só. Daí a inicialização ser aleatória, e não zerada como no Marco 1.
    """
    amplitude_1 = np.sqrt(6.0 / (n_entradas + n_ocultos))
    amplitude_2 = np.sqrt(6.0 / (n_ocultos + 1))
    return {
        "W1": rng.uniform(-amplitude_1, amplitude_1, size=(n_entradas, n_ocultos)),
        "b1": rng.uniform(-amplitude_1, amplitude_1, size=n_ocultos),
        "W2": rng.uniform(-amplitude_2, amplitude_2, size=(n_ocultos, 1)),
        "b2": rng.uniform(-amplitude_2, amplitude_2, size=1),
    }


def propagar(pesos, X, ativacao):
    """Passo para a frente. Devolve as somas e as ativações de cada camada."""
    ativar, _ = ATIVACOES[ativacao]
    z1 = X @ pesos["W1"] + pesos["b1"]       # (n, h)
    a1 = ativar(z1)
    z2 = a1 @ pesos["W2"] + pesos["b2"]      # (n, 1)
    a2 = sigmoide(z2)                         # saída sempre sigmoide: algo em (0, 1)
    return z1, a1, z2, a2


def custo(y, a2):
    """sse = 1/2 * soma (alvo - saída)^2, a mesma definição do Adaline (alvos 0/1 aqui)."""
    return 0.5 * float(np.sum((y.reshape(-1, 1) - a2) ** 2))


def retropropagar(pesos, X, y, a1, a2, ativacao):
    """Backpropagation à mão: regra da cadeia, da saída para a entrada.

    Partindo do erro na saída, cada camada pergunta "quanto EU contribuí para isso?" e
    repassa a responsabilidade para a camada anterior. Os `delta` são essa
    responsabilidade local de cada neurônio. Devolve os gradientes MÉDIOS (divididos por
    n), isto é, o gradiente de sse / n.
    """
    _, derivada = ATIVACOES[ativacao]
    n = len(X)
    y_coluna = y.reshape(-1, 1)

    # Camada de saída: d(sse)/d(z2) = (saída - alvo) * σ'(z2)
    delta2 = (a2 - y_coluna) * derivada_sigmoide_da_saida(a2)   # (n, 1)
    grad_W2 = a1.T @ delta2 / n
    grad_b2 = delta2.sum(axis=0) / n

    # Camada oculta: a responsabilidade chega repartida pelos pesos W2 (é aqui que a regra
    # da cadeia "atravessa" a camada) e é filtrada pela derivada da ativação oculta.
    delta1 = (delta2 @ pesos["W2"].T) * derivada(a1)           # (n, h)
    grad_W1 = X.T @ delta1 / n
    grad_b1 = delta1.sum(axis=0) / n

    return {"W1": grad_W1, "b1": grad_b1, "W2": grad_W2, "b2": grad_b2}, delta1, delta2


def _imprimir_conta_da_epoca_0(X, y, pesos, z1, a1, z2, a2, delta1, delta2, grads, taxa):
    """Log detalhado da primeira época, com os números substituídos, para a conta à mão."""
    print("\nÉpoca 0 em detalhe (pesos iniciais; a conta à mão começa aqui):")
    print(f"  W1 = {np.round(pesos['W1'], 4).tolist()}  b1 = {np.round(pesos['b1'], 4).tolist()}")
    print(f"  W2 = {np.round(pesos['W2'].ravel(), 4).tolist()}  b2 = {np.round(pesos['b2'], 4).tolist()}")
    for k in range(len(X)):
        print(
            f"  x={X[k]} alvo={y[k]} | z1={np.round(z1[k], 4)} a1={np.round(a1[k], 4)} | "
            f"z2={z2[k, 0]:+.4f} saída={a2[k, 0]:.4f} | δ2={delta2[k, 0]:+.4f} δ1={np.round(delta1[k], 4)}"
        )
    print(f"  gradiente médio: dW1={np.round(grads['W1'], 4).tolist()} db1={np.round(grads['b1'], 4).tolist()} "
          f"dW2={np.round(grads['W2'].ravel(), 4).tolist()} db2={np.round(grads['b2'], 4).tolist()}")
    print(f"  atualização: peso_novo = peso_antigo - {taxa} * gradiente_médio")


def treinar_mlp(
    X, y, n_ocultos=2, taxa_aprendizado=2.0, max_epocas=20000, semente=42,
    ativacao="sigmoide", verbose=True, reiniciar_ao_empacar=True,
):
    """Gera o estado da rede a cada época (gradiente descendente em LOTE).

    Cada item gerado é um dicionário com: epoca (atualizações já feitas; 0 = pesos
    iniciais), tentativa (0 = primeira inicialização), pesos (cópias de W1, b1, W2, b2),
    sse, erros_na_epoca (pontos mal classificados com esses pesos, classe por
    `degrau(z_saida)`), y_previsto, saidas (sigmoide da saída), z_saida, ativacoes_ocultas
    e reiniciou (True no passo em que a rede detectou o mínimo local e vai recomeçar).
    O ÚLTIMO passo traz também `estado`: "convergiu", "limite" (acabaram as épocas) ou
    "esgotou" (acabaram as tentativas de reinício).

    Lote completo, e não amostra a amostra como nos Marcos 1 e 2: são só 4 pontos e o que
    interessa ver é a superfície de decisão evoluindo de forma suave.
    """
    n = len(X)
    limiar_sse = LIMIAR_EQM * n / 2
    melhora_minima_sse = MELHORA_NA_JANELA_EQM * n / 2

    if verbose:
        print("=" * 72)
        print("MARCO 4 — MLP COM BACKPROPAGATION")
        print("=" * 72)
        print(f"Arquitetura: {X.shape[1]} entradas -> {n_ocultos} ocultos ({ativacao}) -> 1 saída (sigmoide)")
        print(f"Hiperparâmetro escolhido: taxa de aprendizado (η) = {taxa_aprendizado}  |  máx. {max_epocas} épocas")
        print(f"Pesos iniciais: Xavier uniforme (semente={semente}; reinício k usa a semente {semente} + 1000·k)")
        print("Alvos 0/1; classe = degrau(z da saída), equivalente a saída >= 0.5")
        print("Custo: SSE = 1/2 * Σ (alvo - saída)²; atualização: peso -= η * (gradiente médio do SSE)")
        print(f"Converge quando SSE < {limiar_sse:g} (erro quadrático médio < {LIMIAR_EQM})")
        if reiniciar_ao_empacar:
            print(f"Reinício se em {JANELA} épocas o SSE não cair pelo menos {melhora_minima_sse:g} "
                  f"(máx. {MAX_TENTATIVAS} tentativas)")
        else:
            print("Reinício automático DESLIGADO (para observar o mínimo local)")
        print("=" * 72)

    tentativa = 0
    pesos = inicializar_pesos(X.shape[1], n_ocultos, np.random.default_rng(semente))
    sse_inicio_janela = None
    epocas_na_janela = 0
    intervalo_log = max(1, max_epocas // 20)
    epoca = 0

    while True:
        z1, a1, z2, a2 = propagar(pesos, X, ativacao)
        sse = custo(y, a2)
        z_saida = z2.ravel()
        y_previsto = [degrau(z) for z in z_saida]
        erros = int(sum(p != int(alvo) for p, alvo in zip(y_previsto, y)))

        passo = {
            "epoca": epoca,
            "tentativa": tentativa,
            "pesos": {chave: valor.copy() for chave, valor in pesos.items()},
            "sse": sse,
            "erros_na_epoca": erros,
            "y_previsto": y_previsto,
            "saidas": a2.ravel().copy(),
            "z_saida": z_saida.copy(),
            "ativacoes_ocultas": a1.copy(),
            "reiniciou": False,
        }

        if sse < limiar_sse:
            passo["estado"] = "convergiu"
            if verbose:
                print(f"\n*** CONVERGIU na época {epoca}: SSE = {sse:.6f}, {erros} erro(s). ***")
                print(f"Saídas da rede: {np.round(a2.ravel(), 3)}  (alvos: {list(map(int, y))})")
                if tentativa:
                    print(f"    (após {tentativa} reinício(s) por mínimo local)")
            yield passo
            return

        if epoca >= max_epocas:
            passo["estado"] = "limite"
            if verbose:
                print(f"\n*** NÃO convergiu em {max_epocas} épocas (SSE = {sse:.6f}, {erros} erro(s)). ***")
            yield passo
            return

        if reiniciar_ao_empacar:
            if sse_inicio_janela is None:
                sse_inicio_janela = sse
            epocas_na_janela += 1
            if epocas_na_janela >= JANELA:
                if sse_inicio_janela - sse < melhora_minima_sse:
                    if tentativa + 1 >= MAX_TENTATIVAS:
                        passo["estado"] = "esgotou"
                        if verbose:
                            print(f"\n*** NÃO convergiu: {MAX_TENTATIVAS} tentativas presas em mínimo local "
                                  f"(SSE = {sse:.6f}). ***")
                        yield passo
                        return
                    passo["reiniciou"] = True
                    yield passo
                    tentativa += 1
                    if verbose:
                        print(f"  >> época {epoca}: SSE estacionado em {sse:.4f} ({erros} erro(s)) — mínimo local; "
                              f"reinício {tentativa} com novos pesos")
                    pesos = inicializar_pesos(X.shape[1], n_ocultos, np.random.default_rng(semente + tentativa * 1000))
                    sse_inicio_janela = None
                    epocas_na_janela = 0
                    epoca += 1  # o reinício ocupa o lugar de uma atualização, como no site
                    continue
                sse_inicio_janela = sse
                epocas_na_janela = 0

        yield passo

        grads, delta1, delta2 = retropropagar(pesos, X, y, a1, a2, ativacao)
        if verbose and epoca == 0:
            _imprimir_conta_da_epoca_0(X, y, pesos, z1, a1, z2, a2, delta1, delta2, grads, taxa_aprendizado)
        elif verbose and epoca % intervalo_log == 0:
            print(f"  época {epoca:>5}: SSE = {sse:.6f} | erros = {erros} | saídas = {np.round(a2.ravel(), 3)}")
        for chave in pesos:
            pesos[chave] = pesos[chave] - taxa_aprendizado * grads[chave]
        epoca += 1


def grade_de_saida(pesos, ativacao, resolucao=60, faixa=(-0.5, 1.5)):
    """Saída da rede numa grade do plano, para pintar a região de decisão (o protótipo do
    mapa de cores que o site desenha em <canvas>)."""
    eixo = np.linspace(faixa[0], faixa[1], resolucao)
    xx, yy = np.meshgrid(eixo, eixo)
    pontos = np.column_stack([xx.ravel(), yy.ravel()])
    _, _, _, saida = propagar(pesos, pontos, ativacao)
    return saida.reshape(resolucao, resolucao)


def resumo_mlp(nome_porta, passos, n_ocultos, ativacao):
    ultimo = passos[-1]
    reinicios = sum(p["reiniciou"] for p in passos)
    descricao = {
        "convergiu": f"convergiu na época {ultimo['epoca']}",
        "limite": "NÃO convergiu (acabaram as épocas)",
        "esgotou": f"NÃO convergiu ({MAX_TENTATIVAS} tentativas presas em mínimo local)",
    }[ultimo["estado"]]
    print(
        f"Porta {nome_porta} (MLP 2-{n_ocultos}-1, ocultos {ativacao}): {descricao} após {reinicios} reinício(s) | "
        f"SSE final = {ultimo['sse']:.4f} | {ultimo['erros_na_epoca']} mal classificado(s) no fim."
    )


def animar(nome_porta, X, y, passos, n_ocultos, ativacao, epocas_por_quadro, intervalo):
    """Rede por dentro (conexões com espessura = |peso| e cor = sinal), região de decisão
    com as retas dos neurônios ocultos, e a curva do SSE com os reinícios marcados."""
    n = len(X)
    limiar_sse = LIMIAR_EQM * n / 2
    quadros = [i for i, p in enumerate(passos)
               if p["epoca"] % epocas_por_quadro == 0 or p["reiniciou"] or i == len(passos) - 1]
    epocas = np.array([p["epoca"] for p in passos])
    sses = np.array([p["sse"] for p in passos])
    epocas_reinicio = [p["epoca"] for p in passos if p["reiniciou"]]

    fig = plt.figure(figsize=(15, 8.5))
    gs = fig.add_gridspec(2, 3, height_ratios=[3, 1.4])
    ax_rede = fig.add_subplot(gs[0, 0])
    ax_plano = fig.add_subplot(gs[0, 1])
    ax_erro = fig.add_subplot(gs[0, 2])
    ax_log = fig.add_subplot(gs[1, :])
    texto_log, buffer_log = setup_log_panel(ax_log, max_linhas=10)

    diagrama = draw_network_diagram(ax_rede, X.shape[1], n_ocultos, rotulo_ativacao=ativacao)

    ax_plano.set_xlim(-0.5, 1.5)
    ax_plano.set_ylim(-0.5, 1.5)
    ax_plano.set_xlabel("x1")
    ax_plano.set_ylabel("x2")
    ax_plano.set_aspect("equal")
    # saída perto de 0 = azul (classe 0), perto de 1 = vermelho (classe 1), como os pontos
    imagem = ax_plano.imshow(
        grade_de_saida(passos[0]["pesos"], ativacao), origin="lower", extent=(-0.5, 1.5, -0.5, 1.5),
        cmap="coolwarm", vmin=0, vmax=1, alpha=0.55, zorder=0,
    )
    draw_points_2d(ax_plano, X, y)
    cores_ocultos = plt.cm.Dark2(np.linspace(0, 1, max(n_ocultos, 3)))
    retas = []
    for i in range(n_ocultos):
        linha, = ax_plano.plot([], [], "--", linewidth=1.8, color=cores_ocultos[i],
                               label=f"reta do oculto h{i + 1}")
        retas.append(linha)
    ax_plano.legend(loc="lower right", fontsize=7)
    # título e estado no mesmo bloco de texto, para não se sobreporem
    texto = ax_plano.text(0.0, 1.02, "", transform=ax_plano.transAxes, va="bottom", fontsize=8, family="monospace")

    ax_erro.set_xlabel("Época")
    ax_erro.set_ylabel("SSE = ½ Σ (alvo − saída)²")
    ax_erro.set_title("Custo por época (os pontilhados cinza são reinícios)", fontsize=10)
    ax_erro.set_xlim(0, max(epocas[-1], 1) * 1.02)
    ax_erro.set_ylim(0, max(sses.max(), limiar_sse) * 1.1)
    ax_erro.axhline(limiar_sse, color="tab:green", linestyle=":", linewidth=1.2)
    ax_erro.text(0.99, limiar_sse, f" convergência (SSE < {limiar_sse:g})", transform=ax_erro.get_yaxis_transform(),
                 ha="right", va="bottom", fontsize=7.5, color="tab:green")
    linha_erro, = ax_erro.plot([], [], "-", color="tab:orange", linewidth=1.5)
    marcas_reinicio = [ax_erro.axvline(e, color="gray", linestyle=":", linewidth=1, visible=False)
                       for e in epocas_reinicio]

    def atualizar(k):
        i = quadros[k]
        p = passos[i]
        imagem.set_data(grade_de_saida(p["pesos"], ativacao))
        for j, linha in enumerate(retas):
            xs, ys = decision_line_points(p["pesos"]["W1"][:, j], p["pesos"]["b1"][j])
            linha.set_data(xs, ys)

        for j, conexoes_do_oculto in enumerate(diagrama["conexoes_entrada"]):
            for e, conexao in enumerate(conexoes_do_oculto):
                cor, espessura = estilo_conexao(p["pesos"]["W1"][e, j])
                conexao.set_color(cor)
                conexao.set_linewidth(espessura)
        for j, conexao in enumerate(diagrama["conexoes_saida"]):
            cor, espessura = estilo_conexao(p["pesos"]["W2"][j, 0])
            conexao.set_color(cor)
            conexao.set_linewidth(espessura)
        for j, txt in enumerate(diagrama["textos_ocultos"]):
            txt.set_text(f"média {p['ativacoes_ocultas'][:, j].mean():.2f}")
        diagrama["texto_saida"].set_text(f"média {p['saidas'].mean():.2f}")

        fim = {"convergiu": "  CONVERGIU", "limite": "  LIMITE DE ÉPOCAS", "esgotou": "  ESGOTOU AS TENTATIVAS"}
        texto.set_text(
            f"Porta {nome_porta} — região de decisão da rede\n"
            f"época {p['epoca']:>5} (tentativa {p['tentativa'] + 1}) | SSE = {p['sse']:.4f} | "
            f"erros = {p['erros_na_epoca']}{fim.get(p.get('estado'), '')}\n"
            f"saídas = {np.round(p['saidas'], 3)}  (alvos: {list(map(int, y))})"
        )

        linha_erro.set_data(epocas[: i + 1], sses[: i + 1])
        for marca, e in zip(marcas_reinicio, epocas_reinicio):
            marca.set_visible(e <= p["epoca"])

        buffer_log.append(
            f"ép{p['epoca']:>6} | tentativa {p['tentativa'] + 1} | SSE={p['sse']:.5f} | erros={p['erros_na_epoca']} | "
            f"saídas={np.round(p['saidas'], 2)}"
        )
        if p["reiniciou"]:
            buffer_log.append(f">> mínimo local: o SSE parou de cair em {JANELA} épocas; recomeçando com novos pesos")
        if "estado" in p:
            buffer_log.append(f">> fim: {p['estado']}")
        texto_log.set_text("\n".join(buffer_log))

        return (imagem, *retas, texto, linha_erro, texto_log, *marcas_reinicio)

    anim = animation.FuncAnimation(
        fig, atualizar, frames=len(quadros), interval=intervalo, blit=False, repeat=False
    )
    plt.tight_layout()
    plt.show()
    return anim


def testar_sementes(X, y, args, quantidade):
    """Roda o mesmo treino com várias sementes e mede a confiabilidade da convergência.

    É o critério de pronto do Marco 4: a convergência precisa ser CONFIÁVEL (100% das
    sementes), não sorte de uma inicialização boa.
    """
    sucessos, epocas, total_reinicios = 0, [], 0
    for semente in range(quantidade):
        ultimo, reinicios = None, 0
        for passo in treinar_mlp(
            X, y, args.ocultos, args.taxa, args.epocas, semente, args.ativacao,
            verbose=False, reiniciar_ao_empacar=not args.sem_reinicio,
        ):
            reinicios += passo["reiniciou"]
            ultimo = passo
        total_reinicios += reinicios
        if ultimo["estado"] == "convergiu":
            sucessos += 1
            epocas.append(ultimo["epoca"])
        else:
            print(f"  semente {semente:>3}: NÃO convergiu ({ultimo['estado']}; SSE final {ultimo['sse']:.4f}, "
                  f"{ultimo['erros_na_epoca']} erro(s))")

    reinicio = "sem reinício" if args.sem_reinicio else "com reinício automático"
    print(f"\nPorta {args.porta}, 2-{args.ocultos}-1, ocultos {args.ativacao}, η = {args.taxa}, {reinicio}, "
          f"até {args.epocas} épocas:")
    print(f"Sucesso: {sucessos}/{quantidade} sementes ({100 * sucessos / quantidade:.0f}%) | "
          f"reinícios no total: {total_reinicios}")
    if epocas:
        print(f"Épocas até convergir — mediana: {int(np.median(epocas))}, mín: {min(epocas)}, máx: {max(epocas)}")


def main():
    parser = argparse.ArgumentParser(description="Marco 4 — MLP com backpropagation no XOR/XNOR")
    parser.add_argument("--porta", choices=PORTAS_VALIDAS, default="XOR", help="porta não linearmente separável")
    parser.add_argument("--taxa", type=float, default=2.0, help="taxa de aprendizado (eta), sobre o gradiente médio")
    parser.add_argument("--epocas", type=int, default=20000, help="número máximo de épocas (somando os reinícios)")
    parser.add_argument("--intervalo", type=int, default=50, help="milissegundos entre frames")
    parser.add_argument("--semente", type=int, default=42, help="semente da inicialização aleatória dos pesos")
    parser.add_argument("--ocultos", type=int, default=2, help="neurônios na camada oculta (padrão: 2)")
    parser.add_argument("--ativacao", choices=list(ATIVACOES), default="sigmoide", help="ativação da camada oculta")
    parser.add_argument("--epocas-por-quadro", type=int, default=25,
                        help="de quantas em quantas épocas a animação mostra um quadro")
    parser.add_argument("--sem-reinicio", action="store_true",
                        help="desliga o reinício automático (para observar o mínimo local)")
    parser.add_argument("--testar-sementes", type=int, default=0, metavar="N",
                        help="roda N sementes (0 a N-1) sem animação e mede a taxa de convergência")
    parser.add_argument("--quiet", action="store_true", help="desliga o log detalhado no console (só o resumo)")
    args = parser.parse_args()

    if args.epocas < 1:
        parser.error("--epocas precisa ser pelo menos 1")
    if args.ocultos < 1:
        parser.error("--ocultos precisa ser pelo menos 1")
    if args.epocas_por_quadro < 1:
        parser.error("--epocas-por-quadro precisa ser pelo menos 1")
    if args.testar_sementes < 0:
        parser.error("--testar-sementes precisa ser 0 ou mais")

    X, y = get_gate(args.porta)

    if args.testar_sementes:
        testar_sementes(X, y, args, args.testar_sementes)
        return

    passos = list(treinar_mlp(
        X, y, args.ocultos, args.taxa, args.epocas, args.semente, args.ativacao,
        verbose=not args.quiet, reiniciar_ao_empacar=not args.sem_reinicio,
    ))
    resumo_mlp(args.porta, passos, args.ocultos, args.ativacao)
    animar(args.porta, X, y, passos, args.ocultos, args.ativacao, args.epocas_por_quadro, args.intervalo)


if __name__ == "__main__":
    main()
