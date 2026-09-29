#A5
from backend.matrix import (
    create_matrix,
    initialize_global_matrix,
    initialize_local_matrix,
    create_traceback_matrix
)


def test_create_matrix():
    matrix = create_matrix(3, 4)

    assert len(matrix) == 3
    assert len(matrix[0]) == 4

    for row in matrix:
        assert row == [0, 0, 0, 0]


def test_create_matrix_with_value():
    matrix = create_matrix(2, 3, -1)

    assert matrix == [
        [-1, -1, -1],
        [-1, -1, -1]
    ]


def test_global_matrix_initialization():
    matrix = initialize_global_matrix(
        "ACGT",
        "AGT",
        -2
    )

    assert len(matrix) == 5
    assert len(matrix[0]) == 4

    assert matrix[0] == [0, -2, -4, -6]

    assert matrix[0][0] == 0
    assert matrix[1][0] == -2
    assert matrix[2][0] == -4
    assert matrix[3][0] == -6
    assert matrix[4][0] == -8


def test_local_matrix_initialization():
    matrix = initialize_local_matrix(
        "ACGT",
        "AGT"
    )

    assert len(matrix) == 5
    assert len(matrix[0]) == 4

    # Primeira linha
    assert matrix[0] == [0, 0, 0, 0]

    # Primeira coluna
    for row in matrix:
        assert row[0] == 0


def test_traceback_matrix():
    matrix = create_traceback_matrix(3, 4)

    assert len(matrix) == 3
    assert len(matrix[0]) == 4

    for row in matrix:
        assert row == [None, None, None, None]