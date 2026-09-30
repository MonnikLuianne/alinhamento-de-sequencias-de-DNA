import pytest

from backend.alignment import run_alignment


def test_run_alignment_global():
    resultado = run_alignment(
        "ACGT",
        "ACGT",
        "GLOBAL",
        2,
        -1,
        -2
    )

    assert resultado["method"] == "GLOBAL"
    assert resultado["score"] == 8
    assert resultado["seq1_aln"] == "ACGT"
    assert resultado["seq2_aln"] == "ACGT"


def test_run_alignment_local():
    resultado = run_alignment(
        "ACGT",
        "ACGT",
        "LOCAL",
        2,
        -1,
        -2
    )

    assert resultado["method"] == "LOCAL"
    assert resultado["score"] == 8


def test_run_alignment_normaliza_sequencias():
    resultado = run_alignment(
        "acgt",
        "acgt",
        "GLOBAL",
        2,
        -1,
        -2
    )

    assert resultado["seq1_original"] == "ACGT"
    assert resultado["seq2_original"] == "ACGT"


def test_run_alignment_metodo_invalido():
    with pytest.raises(ValueError):
        run_alignment(
            "ACGT",
            "ACGT",
            "OUTRO",
            2,
            -1,
            -2
        )


def test_run_alignment_sequencia_invalida():
    with pytest.raises(ValueError):
        run_alignment(
            "ACGX",
            "ACGT",
            "GLOBAL",
            2,
            -1,
            -2
        )