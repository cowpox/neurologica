"""Gera as referências do Python para a conferência do JavaScript (`testes/conferir_js.mjs`).

Roda os protótipos dos Marcos 1 a 4 (importando os geradores de treino, sem tocar neles) e
grava em `testes/referencias/*.json` o que o JS precisa reproduzir. Só precisa ser rodado de
novo quando algum protótipo mudar (regra de paridade do planejamento):

    python testes/gerar_referencias.py

Por que cada coisa é gravada assim:

  * Pesos iniciais: o `numpy` e o gerador do site (`mulberry32`) sorteiam números diferentes com
    a mesma semente. Por isso cada caso grava os pesos iniciais que o Python usou, e o JS parte
    deles (`pesosIniciais` no Perceptron e no Adaline, `fontePesos` na MLP). Na MLP, os pesos de
    cada tentativa saem de `inicializar_pesos` com a semente `semente + 1000 * tentativa`, a
    mesma regra que o protótipo usa, então nada no `04` precisa mudar.
  * Perceptron e Adaline: as contas são as mesmas nos dois lados e na mesma ordem (as somas do
    numpy nestes vetores pequenos são sequenciais, e com entradas 0/1 os produtos são exatos),
    então a comparação é de igualdade exata.
  * MLP: o numpy usa FMA nas multiplicações de matriz e uma tanh própria, que o JS não tem como
    reproduzir bit a bit; num treino de milhares de épocas a diferença de 1 ulp pode crescer.
    Para a conferência não depender disso, gravamos: (a) o SSE de TODAS as épocas, para
    reexecutar no JS as decisões de parada e de reinício sobre os números do Python; (b) o
    estado da rede em todas as primeiras 300 épocas e depois a cada 25, sempre com o estado
    seguinte, para o JS dar UM passo a partir do estado do Python e comparar (sem acumular
    erro), num vetor achatado por época; (c) os marcos discretos (reinícios, época final, estado final), para comparar com o
    treino livre do JS.
"""

import importlib
import json
import os
import sys
from pathlib import Path

os.environ.setdefault("MPLBACKEND", "Agg")  # os protótipos importam o pyplot; sem janela aqui

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "prototipos"))

import numpy as np  # noqa: E402

from utils_plot import GATES_1D, GATES_2D, get_gate  # noqa: E402

perceptron = importlib.import_module("01_perceptron_gates")
adaline = importlib.import_module("02_adaline_gates")
marco3 = importlib.import_module("03_perceptron_xor_falha")
mlp = importlib.import_module("04_mlp_backprop_xor")

PASTA = Path(__file__).resolve().parent / "referencias"

PORTAS = list(GATES_2D) + list(GATES_1D)
NAO_SEPARAVEIS = ["XOR", "XNOR"]
TAXAS = [0.05, 0.1, 0.2]

# Na MLP: estado em todas as primeiras épocas e depois a cada AMOSTRA_MLP épocas.
EPOCAS_COMPLETAS_MLP = 300
AMOSTRA_MLP = 25


def inicializacoes(n_entradas):
    """Três pontos de partida por porta: pesos zero (a conta à mão), um manual e o sorteio do
    numpy com a semente 42 (o mesmo que os protótipos usam por padrão)."""
    sorteio = np.random.default_rng(42).uniform(-0.5, 0.5, size=n_entradas)
    return [
        ("zeros", [0.0] * n_entradas, 0.0),
        ("manual", [0.3, -0.2][:n_entradas], 0.1),
        ("semente42", [float(v) for v in sorteio], 0.0),
    ]


def numero(valor):
    """float do numpy -> float do Python, recusando NaN/inf (o JSON do JS não os aceita)."""
    valor = float(valor)
    if not np.isfinite(valor):
        raise ValueError(f"valor não finito na referência: {valor}")
    return valor


def casos_perceptron():
    casos = []
    for porta in PORTAS:
        X, y = get_gate(porta)
        max_epocas = 50 if porta in NAO_SEPARAVEIS else 20
        for taxa in TAXAS:
            for nome_init, pesos0, bias0 in inicializacoes(X.shape[1]):
                passos = list(perceptron.treinar_perceptron(
                    X, y, taxa_aprendizado=taxa, max_epocas=max_epocas, verbose=False,
                    pesos_iniciais=pesos0, bias_inicial=bias0,
                ))
                ultimo = passos[-1]
                casos.append({
                    "porta": porta, "taxa": taxa, "inicio": nome_init, "maxEpocas": max_epocas,
                    "pesosIniciais": pesos0, "biasInicial": bias0,
                    # um passo por exemplo: [epoca, indice, z, yPrevisto, houveAtualizacao,
                    # correcoesNaEpoca, errosNaEpoca ou null, bias, ...pesos]
                    "passos": [
                        [p["epoca"], p["indice"], numero(p["z"]), int(p["y_previsto"]),
                         bool(p["houve_atualizacao"]), int(p["correcoes_na_epoca"]),
                         int(p["erros_na_epoca"]) if "erros_na_epoca" in p else None,
                         numero(p["bias"]), *[numero(w) for w in p["pesos"]]]
                        for p in passos
                    ],
                    "convergiu": ultimo["correcoes_na_epoca"] == 0 and ultimo["indice"] == len(X) - 1,
                })
    return casos


def casos_adaline():
    casos = []
    extras = [("AND", 0.7, "desafio do Ato 2: estabiliza com 1 ponto errado"),
              ("AND", 1.2, "acima de η ≈ 1,0: diverge")]
    combinacoes = [(porta, taxa, None) for porta in PORTAS for taxa in TAXAS] + extras
    for porta, taxa, nota in combinacoes:
        X, y = get_gate(porta)
        max_epocas = 50 if porta in NAO_SEPARAVEIS else 100
        inits = inicializacoes(X.shape[1]) if nota is None else inicializacoes(X.shape[1])[:1]
        for nome_init, pesos0, bias0 in inits:
            passos = list(adaline.treinar_adaline(
                X, y, taxa_aprendizado=taxa, max_epocas=max_epocas, verbose=False,
                pesos_iniciais=pesos0, bias_inicial=bias0,
            ))
            fins = [p for p in passos if "sse" in p]
            sse = fins[-1]["sse"]
            # mesma ordem de testes do gerador do Marco 2: divergiu, estabilizou, limite
            if not np.isfinite(sse) or sse > 1e6:
                estado = "divergiu"
            elif len(fins) >= 2 and abs(fins[-2]["sse"] - sse) < adaline.TOLERANCIA_SSE_POR_TAXA * taxa:
                estado = "convergiu"
            else:
                estado = "esgotou"
            casos.append({
                "porta": porta, "taxa": taxa, "inicio": nome_init, "maxEpocas": max_epocas,
                "pesosIniciais": pesos0, "biasInicial": bias0, "nota": nota,
                # as 2 primeiras épocas exemplo a exemplo: [epoca, indice, z, erro, yPrevisto, bias, ...pesos]
                "passosIniciais": [
                    [p["epoca"], p["indice"], numero(p["z"]), numero(p["erro"]), int(p["y_previsto"]),
                     numero(p["bias"]), *[numero(w) for w in p["pesos"]]]
                    for p in passos if p["epoca"] <= 2
                ],
                # o fim de cada época: [epoca, sse, errosNaEpoca, bias, ...pesos]
                "fins": [
                    [p["epoca"], numero(p["sse"]), int(p["erros_na_epoca"]), numero(p["bias"]),
                     *[numero(w) for w in p["pesos"]]]
                    for p in fins
                ],
                "estado": estado,
            })
    return casos


def referencias_marco3():
    """O que o Marco 3 mede e o JS tem que reproduzir: o ponto de chegada do Adaline online e a
    época em que os pesos do Perceptron entram em ciclo; mais o custo mínimo de cada porta
    (régua independente: o custo do Adaline nunca fica abaixo dele)."""
    pontos_fixos, ciclos, minimos = [], [], {}
    for porta in PORTAS:
        X, y = get_gate(porta)
        minimos[porta] = numero(marco3.solucao_minimos_quadrados(X, y)[3])
    for porta in NAO_SEPARAVEIS:
        X, y = get_gate(porta)
        for taxa in TAXAS:
            pesos, bias, z, custo = marco3.ponto_fixo_online(X, y, taxa)
            pontos_fixos.append({
                "porta": porta, "taxa": taxa, "pesos": [numero(w) for w in pesos],
                "bias": numero(bias), "z": [numero(v) for v in z], "custo": numero(custo),
            })
            for nome_init, pesos0, bias0 in inicializacoes(X.shape[1]):
                passos = list(perceptron.treinar_perceptron(
                    X, y, taxa_aprendizado=taxa, max_epocas=200, verbose=False,
                    pesos_iniciais=pesos0, bias_inicial=bias0,
                ))
                ciclo = marco3.detectar_ciclo(marco3.fins_de_epoca(passos, len(X)))
                ciclos.append({
                    "porta": porta, "taxa": taxa, "inicio": nome_init,
                    "pesosIniciais": pesos0, "biasInicial": bias0,
                    "inicioDoCiclo": ciclo[0] if ciclo else None,
                    "periodo": ciclo[1] if ciclo else None,
                })
    return {"pontosFixos": pontos_fixos, "ciclosPerceptron": ciclos, "custoMinimo": minimos}


def rede_para_js(pesos):
    """W1/b1/W2/b2 do Python -> { pesos: [W1, W2], bias: [b1, b2] }, o layout do JS."""
    return {
        "pesos": [[[numero(v) for v in linha] for linha in pesos["W1"]],
                  [[numero(v) for v in linha] for linha in pesos["W2"]]],
        "bias": [[numero(v) for v in pesos["b1"]], [numero(v) for v in pesos["b2"]]],
    }


def achatar(pesos):
    """W1, b1, W2, b2 num vetor só, na ordem do layout do JS (matrizes linha a linha)."""
    return [numero(v) for v in np.concatenate(
        [pesos["W1"].ravel(), pesos["b1"].ravel(), pesos["W2"].ravel(), pesos["b2"].ravel()])]


def caso_mlp(porta, ativacao, semente, taxa=2.0, max_epocas=20000, reinicio=True, n_ocultos=2):
    X, y = get_gate(porta)
    passos = list(mlp.treinar_mlp(
        X, y, n_ocultos=n_ocultos, taxa_aprendizado=taxa, max_epocas=max_epocas, semente=semente,
        ativacao=ativacao, verbose=False, reiniciar_ao_empacar=reinicio,
    ))
    assert all(p["epoca"] == i for i, p in enumerate(passos)), "época deveria ser o índice do passo"
    tentativas = [
        rede_para_js(mlp.inicializar_pesos(X.shape[1], n_ocultos, np.random.default_rng(semente + k * 1000)))
        for k in range(mlp.MAX_TENTATIVAS)
    ]
    assert rede_para_js(passos[0]["pesos"]) == tentativas[0], "a tentativa 0 deveria ser a semente pura"

    # Estados gravados: todas as primeiras épocas, depois uma a cada AMOSTRA_MLP, sempre com a
    # época seguinte junto (o par t -> t+1 é um passo de gradiente, salvo quando t reiniciou).
    epocas = set()
    for t in range(len(passos) - 1):
        if t < EPOCAS_COMPLETAS_MLP or t % AMOSTRA_MLP == 0:
            epocas.update((t, t + 1))
    estados = [[t, *achatar(passos[t]["pesos"])] for t in sorted(epocas)]

    ultimo = passos[-1]
    return {
        "porta": porta, "ativacao": ativacao, "semente": semente, "taxa": taxa,
        "maxEpocas": max_epocas, "reinicio": reinicio, "camadas": [n_ocultos],
        "tentativas": tentativas,
        "sse": [numero(p["sse"]) for p in passos],
        "errosFinal": int(ultimo["erros_na_epoca"]),
        "reinicios": [p["epoca"] for p in passos if p["reiniciou"]],
        "epocaFinal": ultimo["epoca"],
        "estado": ultimo["estado"],
        # [epoca, ...W1 linha a linha, ...b1, ...W2 linha a linha, ...b2]
        "estados": estados,
    }


def casos_mlp():
    casos = [caso_mlp(porta, ativacao, 42) for porta in NAO_SEPARAVEIS for ativacao in mlp.ATIVACOES]
    # Casos com reinício (a semente 42 não reinicia): as primeiras sementes que reiniciam.
    X, y = get_gate("XOR")
    achados = 0
    for semente in range(40):
        reiniciou = any(p["reiniciou"] for p in mlp.treinar_mlp(
            X, y, taxa_aprendizado=2.0, semente=semente, ativacao="sigmoide", verbose=False))
        if reiniciou:
            casos.append(caso_mlp("XOR", "sigmoide", semente))
            achados += 1
            if achados == 2:
                break
    # Sem reinício e com limite curto: termina por limite de épocas.
    casos.append(caso_mlp("XOR", "sigmoide", 42, taxa=0.5, max_epocas=1500, reinicio=False))
    return casos


def gravar(nome, conteudo):
    PASTA.mkdir(exist_ok=True)
    caminho = PASTA / nome
    with open(caminho, "w", encoding="utf-8") as arquivo:
        json.dump(conteudo, arquivo, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
        arquivo.write("\n")
    print(f"  {caminho.relative_to(RAIZ)}  ({caminho.stat().st_size / 1024:.0f} KB)")


def main():
    sys.stdout.reconfigure(encoding="utf-8")  # o console do Windows não imprime η sem isto
    print("Gerando referências do Python:")
    gravar("portas.json", {
        porta: {"X": get_gate(porta)[0].tolist(), "y": get_gate(porta)[1].tolist()} for porta in PORTAS
    })
    gravar("perceptron.json", casos_perceptron())
    gravar("adaline.json", casos_adaline())
    gravar("marco3.json", referencias_marco3())
    gravar("mlp.json", casos_mlp())


if __name__ == "__main__":
    main()
