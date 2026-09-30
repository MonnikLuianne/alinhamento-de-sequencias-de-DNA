# A4
from backend.matrix import initialize_local_matrix, create_traceback_matrix

def score_pair(base1, base2, match, mismatch):
    if base1 == base2:
        return match
    else:
        return mismatch
def run_local(seq1, seq2, match, mismatch, gap):

    seq1 = seq1.strip().upper()
    seq2 = seq2.strip().upper()

    rows = len(seq1) + 1
    col = len(seq2) + 1

    # Inicializa a matriz usando a função do matrix.py
    matrix = initialize_local_matrix(seq1, seq2)

    # Cria a matriz de traceback usando a função do matrix.py
    traceback_matrix = create_traceback_matrix(rows, col)

    max_score = 0
    max_i = 0
    max_j = 0

    # Preenchimento da matriz
    for i in range(1, rows):
        for j in range(1, col):
            pair_score = score_pair(
                seq1[i - 1],
                seq2[j - 1],
                match,
                mismatch
            )
            # Diagonal
            diagonal = matrix[i - 1][j - 1] + pair_score
            # Vertical
            vertical = matrix[i - 1][j] + gap
            # Horizontal
            horizontal = matrix[i][j - 1] + gap
            # Smith-Waterman
            best_score = max(
                diagonal,
                vertical,
                horizontal,
                0
            )
            matrix[i][j] = best_score

            # Prioridade: diagonal > vertical > horizontal
            if best_score == 0:
                traceback_matrix[i][j] = None

            elif best_score == diagonal:
                traceback_matrix[i][j] = "DIAGONAL"

            elif best_score == vertical:
                traceback_matrix[i][j] = "VERTICAL"

            elif best_score == horizontal:
                traceback_matrix[i][j] = "HORIZONTAL"

            # Guarda a maior pontuação encontrada
            if best_score > max_score:

                max_score = best_score
                max_i = i
                max_j = j

  #traceback
    i = max_i
    j = max_j
    aligned_seq1 = []
    aligned_seq2 = []

    # Traceback até encontrar uma célula com valor 0
    while i > 0 and j > 0:

        if matrix[i][j] == 0:
            break

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

    # O traceback foi feito de trás para frente, então precisamos inverter as sequências.
    aligned_seq1.reverse()
    aligned_seq2.reverse()

    seq1_aln = "".join(aligned_seq1)
    seq2_aln = "".join(aligned_seq2)

    # Resultado
    return {
        "seq1_aln": seq1_aln,
        "seq2_aln": seq2_aln,
        "score": max_score,
        "matrix": matrix,
        "traceback_matrix": traceback_matrix
    }