#A5
from backend.validation import load_sequences_from_file
from backend.validation import (
    normalize_sequence,
    validate_sequence,
    validate_input
)


def test_normalize_sequence():
    assert normalize_sequence("acgtac") == "ACGTAC"


def test_valid_sequence():
    valid, message = validate_sequence("ACGT")
    
    assert valid is True
    assert message == ""


def test_empty_sequence():
    valid, message = validate_sequence("")
    
    assert valid is False
    assert "vazia" in message


def test_invalid_base():
    valid, message = validate_sequence("ACGX")
    
    assert valid is False
    assert "base inválida" in message


def test_valid_input():
    valid, message = validate_input(
        "ACGTAC",
        "ACGTTC",
        2,
        -1,
        -2
    )

    assert valid is True
    assert message == ""


def test_none_sequence():
    valid, message = validate_input(
        None,
        "ACGT",
        2,
        -1,
        -2
    )

    assert valid is False


def test_match_zero():
    valid, message = validate_input(
        "ACGT",
        "ACGT",
        0,
        -1,
        -2
    )

    assert valid is False
    assert "Match" in message


def test_mismatch_zero():
    valid, message = validate_input(
        "ACGT",
        "ACGT",
        2,
        0,
        -2
    )

    assert valid is False
    assert "Mismatch" in message


def test_gap_zero():
    valid, message = validate_input(
        "ACGT",
        "ACGT",
        2,
        -1,
        0
    )

    assert valid is False
    assert "Gap" in message

def test_load_txt_file(tmp_path):
    file = tmp_path / "sequencias.txt"

    file.write_text(
        "ACGTAC\nACGTTC\n",
        encoding="utf-8"
    )

    valid, sequences = load_sequences_from_file(file)

    assert valid is True
    assert sequences == ["ACGTAC", "ACGTTC"]


def test_load_fasta_file(tmp_path):
    file = tmp_path / "sequencias.fasta"

    file.write_text(
        ">Seq1\n"
        "ACGTAC\n"
        ">Seq2\n"
        "ACGTTC\n",
        encoding="utf-8"
    )

    valid, sequences = load_sequences_from_file(file)

    assert valid is True
    assert sequences == ["ACGTAC", "ACGTTC"]


def test_file_not_found():
    valid, message = load_sequences_from_file(
        "arquivo_que_nao_existe.txt"
    )

    assert valid is False
    assert "não encontrado" in message


def test_invalid_file_extension(tmp_path):
    file = tmp_path / "sequencias.csv"

    file.write_text(
        "ACGTAC\nACGTTC\n",
        encoding="utf-8"
    )

    valid, message = load_sequences_from_file(file)

    assert valid is False
    assert "incompatível" in message


def test_invalid_sequence_in_file(tmp_path):
    file = tmp_path / "sequencias.txt"

    file.write_text(
        "ACGTAC\nACGTX\n",
        encoding="utf-8"
    )

    valid, message = load_sequences_from_file(file)

    assert valid is False
    assert "base inválida" in message


def test_wrong_number_of_sequences(tmp_path):
    file = tmp_path / "sequencias.txt"

    file.write_text(
        "ACGTAC\n",
        encoding="utf-8"
    )

    valid, message = load_sequences_from_file(file)

    assert valid is False
    assert "exatamente duas" in message