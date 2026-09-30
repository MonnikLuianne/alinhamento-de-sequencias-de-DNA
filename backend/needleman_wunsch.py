#A3
from backend.matrix import create_matrix, create_traceback_matrix


def score_pair(base1, base2, match, mismatch):
    """
    Calcula a pontuação entre duas bases.

    Parâmetros:
        base1: base da sequência 1.
        base2: base da sequência 2.
        match: pontuação para bases iguais.
        mismatch: pontuação para bases diferentes.

    Retorno:
        Pontuação correspondente ao par de bases.
    """
    if base1 == base2:
        return match

    return mismatch


def initialize_global_matrix(seq1, seq2, gap):
    """
    Cria e inicializa a matriz do algoritmo Needleman-Wunsch.

    A primeira linha e a primeira coluna recebem penalidades
    acumuladas de gap.

    Retorno:
        Matriz inicializada.
    """
    rows = len(seq1) + 1
    columns = len(seq2) + 1

    matrix = create_matrix(rows, columns, 0)

    # Primeira coluna
    for i in range(1, rows):
        matrix[i][0] = matrix[i - 1][0] + gap

    # Primeira linha
    for j in range(1, columns):
        matrix[0][j] = matrix[0][j - 1] + gap

    return matrix


def run_global(seq1, seq2, match, mismatch, gap):
    """
    Executa o algoritmo Needleman-Wunsch para alinhamento global.

    Parâmetros:
        seq1: primeira sequência de DNA.
        seq2: segunda sequência de DNA.
        match: pontuação para bases iguais.
        mismatch: pontuação para bases diferentes.
        gap: penalidade de gap.

    Retorno:
        Dicionário contendo:
            seq1_aln: primeira sequência alinhada.
            seq2_aln: segunda sequência alinhada.
            score: score final do alinhamento.
            matrix: matriz de pontuação.
            traceback_matrix: matriz de direções.
    """

    seq1 = seq1.strip().upper()
    seq2 = seq2.strip().upper()

    rows = len(seq1) + 1
    columns = len(seq2) + 1

    # Matriz de pontuação
    matrix = initialize_global_matrix(
        seq1,
        seq2,
        gap
    )

    # Matriz de traceback
    traceback_matrix = create_traceback_matrix(
        rows,
        columns
    )

    # Inicialização do traceback
    for i in range(1, rows):
        traceback_matrix[i][0] = "VERTICAL"

    for j in range(1, columns):
        traceback_matrix[0][j] = "HORIZONTAL"

    # Preenchimento da matriz
    for i in range(1, rows):
        for j in range(1, columns):

            pair_score = score_pair(
                seq1[i - 1],
                seq2[j - 1],
                match,
                mismatch
            )

            diagonal = (
                matrix[i - 1][j - 1]
                + pair_score
            )

            vertical = (
                matrix[i - 1][j]
                + gap
            )

            horizontal = (
                matrix[i][j - 1]
                + gap
            )

            # Prioridade de empate:
            # diagonal > vertical > horizontal
            if diagonal >= vertical and diagonal >= horizontal:
                best_score = diagonal
                direction = "DIAGONAL"

            elif vertical >= horizontal:
                best_score = vertical
                direction = "VERTICAL"

            else:
                best_score = horizontal
                direction = "HORIZONTAL"

            matrix[i][j] = best_score
            traceback_matrix[i][j] = direction

    # Traceback
    i = len(seq1)
    j = len(seq2)

    aligned_seq1 = []
    aligned_seq2 = []

    while i > 0 or j > 0:

        direction = traceback_matrix[i][j]

        if direction == "DIAGONAL":

            aligned_seq1.append(
                seq1[i - 1]
            )

            aligned_seq2.append(
                seq2[j - 1]
            )

            i -= 1
            j -= 1

        elif direction == "VERTICAL":

            aligned_seq1.append(
                seq1[i - 1]
            )

            aligned_seq2.append("-")

            i -= 1

        elif direction == "HORIZONTAL":

            aligned_seq1.append("-")

            aligned_seq2.append(
                seq2[j - 1]
            )

            j -= 1

        else:
            break

    # O traceback foi construído de trás para frente.
    aligned_seq1.reverse()
    aligned_seq2.reverse()

    seq1_aln = "".join(aligned_seq1)
    seq2_aln = "".join(aligned_seq2)

    return {
        "seq1_aln": seq1_aln,
        "seq2_aln": seq2_aln,
        "score": matrix[len(seq1)][len(seq2)],
        "matrix": matrix,
        "traceback_matrix": traceback_matrix
    }