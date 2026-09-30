# A3
from backend.matrix import initialize_global_matrix, create_traceback_matrix


def score_pair(base1, base2, match, mismatch):
    """
    Calcula a pontuação entre duas bases.
    """
    if base1 == base2:
        return match

    return mismatch


def run_global(seq1, seq2, match, mismatch, gap):
    """
    Executa o algoritmo Needleman-Wunsch para alinhamento global.

    Retorna um dicionário com:
        seq1_aln: primeira sequência alinhada
        seq2_aln: segunda sequência alinhada
        score: score final
        matrix: matriz de pontuação
        traceback_matrix: matriz de direções
    """

    seq1 = seq1.strip().upper()
    seq2 = seq2.strip().upper()

    rows = len(seq1) + 1
    columns = len(seq2) + 1

    # A primeira linha e a primeira coluna recebem
    # penalidades acumuladas de gap.
    matrix = initialize_global_matrix(seq1, seq2, gap)

    traceback_matrix = create_traceback_matrix(rows, columns)

    # Inicialização das direções das bordas.
    for i in range(1, rows):
        traceback_matrix[i][0] = "VERTICAL"

    for j in range(1, columns):
        traceback_matrix[0][j] = "HORIZONTAL"

    # Preenchimento da matriz.
    for i in range(1, rows):
        for j in range(1, columns):
            pair_score = score_pair(
                seq1[i - 1],
                seq2[j - 1],
                match,
                mismatch
            )

            diagonal = matrix[i - 1][j - 1] + pair_score
            vertical = matrix[i - 1][j] + gap
            horizontal = matrix[i][j - 1] + gap

            # Prioridade em caso de empate:
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

    # No alinhamento global, o traceback começa
    # na célula inferior direita e vai até a origem.
    i = len(seq1)
    j = len(seq2)

    aligned_seq1 = []
    aligned_seq2 = []

    while i > 0 or j > 0:
        direction = traceback_matrix[i][j]

        if direction == "DIAGONAL":
            aligned_seq1.append(seq1[i - 1])
            aligned_seq2.append(seq2[j - 1])
            i -= 1
            j -= 1

        elif direction == "VERTICAL":
            aligned_seq1.append(seq1[i - 1])
            aligned_seq2.append("-")
            i -= 1

        elif direction == "HORIZONTAL":
            aligned_seq1.append("-")
            aligned_seq2.append(seq2[j - 1])
            j -= 1

        else:
            break

    # O traceback é construído de trás para frente.
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