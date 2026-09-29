#criação/inicialização das matrizes (A2)
def create_matrix(rows, cols, value=0):
    return [
        [value for _ in range(cols)]
        for _ in range(rows)
    ]


def initialize_global_matrix(seq1, seq2, gap):
    m = len(seq1)
    n = len(seq2)

    matrix = create_matrix(m + 1, n + 1)

    for j in range(1, n + 1):
        matrix[0][j] = j * gap

    for i in range(1, m + 1):
        matrix[i][0] = i * gap

    return matrix


def initialize_local_matrix(seq1, seq2):
    m = len(seq1)
    n = len(seq2)

    matrix = create_matrix(m + 1, n + 1, 0)

    return matrix


def create_traceback_matrix(rows, cols):
  
    return create_matrix(rows, cols, None)