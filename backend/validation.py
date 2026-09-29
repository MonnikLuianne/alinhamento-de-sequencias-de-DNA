#validar as entradas (A1)
#Streamlit
from pathlib import Path
BASES_VALIDAS = {"A", "C", "G", "T"}
def normalize_sequence(sequence):
    return sequence.strip().upper()

def validate_sequence(sequence, nome="sequência"):


    if not isinstance(sequence, str):
        return False, f"ERRO: {nome} deve ser um texto."

    if not sequence:
        return False, f"ERRO: {nome} está vazia."

    for base in sequence:
        if base not in BASES_VALIDAS:
            return False, f"ERRO: base inválida na {nome}: {base}"

    return True, ""


def validate_input(seq1, seq2, match, mismatch, gap):

    if seq1 is None or seq2 is None:
        return False, "ERRO: exatamente duas sequências devem ser fornecidas."

    seq1 = normalize_sequence(seq1)
    seq2 = normalize_sequence(seq2)

    valid, message = validate_sequence(seq1, "Seq1")
    if not valid:
        return False, message

    valid, message = validate_sequence(seq2, "Seq2")
    if not valid:
        return False, message

    if not isinstance(match, int) or isinstance(match, bool):
        return False, "ERRO: Match deve ser um número inteiro."

    if not isinstance(mismatch, int) or isinstance(mismatch, bool):
        return False, "ERRO: Mismatch deve ser um número inteiro."

    if not isinstance(gap, int) or isinstance(gap, bool):
        return False, "ERRO: Gap deve ser um número inteiro."

    if match == 0:
        return False, "ERRO: Match não pode ser zero."

    if mismatch == 0:
        return False, "ERRO: Mismatch não pode ser zero."

    if gap == 0:
        return False, "ERRO: Gap não pode ser zero."

    return True, ""
def load_sequences_from_file(file_path):

    path = Path(file_path)

    if not path.exists():
        return False, "Arquivo não encontrado."

    if not path.is_file():
        return False, "O caminho informado não corresponde a um arquivo."

    if path.suffix.lower() not in {".txt", ".fasta"}:
        return False, "Formato de arquivo incompatível. Use .txt ou .fasta."

    try:
        with open(path, "r", encoding="utf-8") as file:
            lines = [line.strip() for line in file if line.strip()]
    except (OSError, UnicodeDecodeError):
        return False, "Não foi possível ler o arquivo."

    if not lines:
        return False, "O arquivo está vazio."

    sequences = []

    if path.suffix.lower() == ".fasta":
        current_sequence = ""

        for line in lines:
            if line.startswith(">"):
                if current_sequence:
                    sequences.append(current_sequence)
                    current_sequence = ""
            else:
                current_sequence += line

        if current_sequence:
            sequences.append(current_sequence)

    else:
        sequences = lines
    if len(sequences) != 2:
        return False, "O arquivo deve conter exatamente duas sequências."

    for i, sequence in enumerate(sequences, start=1):
        valid, message = validate_sequence(
            sequence,
            f"Sequência {i}"
        )

        if not valid:
            return False, message

    sequences = [
        normalize_sequence(sequence)
        for sequence in sequences
    ]

    return True, sequences