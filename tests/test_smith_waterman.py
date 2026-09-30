#A5
from backend.smith_waterman import run_local


def test_smith_waterman_retorna_dicionario():

    resultado = run_local(
        "ACGT",
        "ACGT",
        2,
        -1,
        -2
    )

    assert isinstance(resultado, dict)

    assert "seq1_aln" in resultado
    assert "seq2_aln" in resultado
    assert "score" in resultado
    assert "matrix" in resultado
    assert "traceback_matrix" in resultado


def test_smith_waterman_sequencias_iguais():

    resultado = run_local(
        "ACGT",
        "ACGT",
        2,
        -1,
        -2
    )

    assert resultado["score"] == 8

    assert resultado["seq1_aln"] == "ACGT"
    assert resultado["seq2_aln"] == "ACGT"


def test_smith_waterman_melhor_subsequencia():

    resultado = run_local(
        "ACGTAC",
        "ACGTTC",
        2,
        -1,
        -2
    )

    assert resultado["score"] > 0


def test_smith_waterman_matriz_tem_tamanho_correto():

    seq1 = "ACGT"
    seq2 = "ACGT"

    resultado = run_local(
        seq1,
        seq2,
        2,
        -1,
        -2
    )

    matrix = resultado["matrix"]

    assert len(matrix) == len(seq1) + 1
    assert len(matrix[0]) == len(seq2) + 1


def test_smith_waterman_primeira_linha_e_coluna_zero():

    resultado = run_local(
        "ACGT",
        "ACGT",
        2,
        -1,
        -2
    )

    matrix = resultado["matrix"]

    # Primeira linha
    assert matrix[0] == [0, 0, 0, 0, 0]

    # Primeira coluna
    for i in range(len(matrix)):
        assert matrix[i][0] == 0


def test_smith_waterman_nao_possui_scores_negativos():

    resultado = run_local(
        "AAAA",
        "TTTT",
        2,
        -1,
        -2
    )

    matrix = resultado["matrix"]

    for row in matrix:
        for value in row:
            assert value >= 0

def test_smith_waterman_com_gap():

    resultado = run_local(
        "ACGT",
        "AGT",
        2,
        -1,
        -2
    )

    assert resultado["score"] > 0

    assert len(resultado["seq1_aln"]) == len(resultado["seq2_aln"])

def test_smith_waterman_com_mismatch():

    resultado = run_local(
        "ACGT",
        "ATGT",
        2,
        -1,
        -2
    )

    assert resultado["score"] > 0

    assert len(resultado["seq1_aln"]) == len(resultado["seq2_aln"])


def test_smith_waterman_traceback_tem_mesmo_tamanho_da_matriz():

    seq1 = "ACGT"
    seq2 = "AGT"

    resultado = run_local(
        seq1,
        seq2,
        2,
        -1,
        -2
    )

    matrix = resultado["matrix"]
    traceback = resultado["traceback_matrix"]

    assert len(traceback) == len(matrix)

    for i in range(len(matrix)):
        assert len(traceback[i]) == len(matrix[i])


def test_smith_waterman_sem_alinhamento_positivo():

    resultado = run_local(
        "AAAA",
        "TTTT",
        2,
        -1,
        -2
    )

    assert resultado["score"] == 0

    assert resultado["seq1_aln"] == ""
    assert resultado["seq2_aln"] == ""


def test_smith_waterman_alinhamento_local():

    resultado = run_local(
        "TTACGTAA",
        "GGACGTCC",
        2,
        -1,
        -2
    )

    assert resultado["score"] == 8

    assert resultado["seq1_aln"] == "ACGT"
    assert resultado["seq2_aln"] == "ACGT"


def test_smith_waterman_traceback_possui_direcoes():

    resultado = run_local(
        "ACGT",
        "ACGT",
        2,
        -1,
        -2
    )

    traceback = resultado["traceback_matrix"]

    encontrou_diagonal = False

    for row in traceback:
        for direction in row:

            if direction == "DIAGONAL":
                encontrou_diagonal = True

    assert encontrou_diagonal