from backend.needleman_wunsch import run_global


def test_global_sequencias_iguais():
    resultado = run_global(
        "ACGT",
        "ACGT",
        match=2,
        mismatch=-1,
        gap=-2
    )

    assert resultado["score"] == 8
    assert resultado["seq1_aln"] == "ACGT"
    assert resultado["seq2_aln"] == "ACGT"

def test_global_exemplo_especificacao():
    resultado = run_global(
        "ACGTAC",
        "ACGTTC",
        match=2,
        mismatch=-1,
        gap=-2
    )

    assert resultado["score"] == 9
    assert resultado["seq1_aln"] == "ACGTAC"
    assert resultado["seq2_aln"] == "ACGTTC"


def test_global_com_gap():
    resultado = run_global(
        "ACGT",
        "AGT",
        match=2,
        mismatch=-1,
        gap=-2
    )

    assert resultado["score"] == 4
    assert len(resultado["seq1_aln"]) == len(resultado["seq2_aln"])
    assert "-" in resultado["seq1_aln"] or "-" in resultado["seq2_aln"]


def test_global_matriz_dimensoes():
    resultado = run_global(
        "ACG",
        "AC",
        match=2,
        mismatch=-1,
        gap=-2
    )

    matriz = resultado["matrix"]

    assert len(matriz) == 4
    assert len(matriz[0]) == 3


def test_global_inicializacao_gap():
    resultado = run_global(
        "ACG",
        "AC",
        match=2,
        mismatch=-1,
        gap=-2
    )

    matriz = resultado["matrix"]

    assert matriz[0] == [0, -2, -4]
    assert [linha[0] for linha in matriz] == [0, -2, -4, -6]