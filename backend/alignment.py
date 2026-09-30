from backend.validation import validate_input, normalize_sequence
from backend.smith_waterman import run_local
from backend.needleman_wunsch import run_global


def run_alignment(seq1, seq2, method, match, mismatch, gap):
    """
    Executa o alinhamento LOCAL ou GLOBAL após validar as entradas.
    """

    valid, message = validate_input(
        seq1,
        seq2,
        match,
        mismatch,
        gap
    )

    if not valid:
        raise ValueError(message)

    seq1 = normalize_sequence(seq1)
    seq2 = normalize_sequence(seq2)

    method = method.strip().upper()

    if method == "LOCAL":
        result = run_local(
            seq1,
            seq2,
            match,
            mismatch,
            gap
        )

    elif method == "GLOBAL":
        result = run_global(
            seq1,
            seq2,
            match,
            mismatch,
            gap
        )

    else:
        raise ValueError(
            "ERRO: método inválido. Use LOCAL ou GLOBAL."
        )

    result["method"] = method
    result["seq1_original"] = seq1
    result["seq2_original"] = seq2
    result["match"] = match
    result["mismatch"] = mismatch
    result["gap"] = gap

    return result