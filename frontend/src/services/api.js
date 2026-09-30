function normalizeSequence(sequence) {
  return String(sequence ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s/g, "");
}

function validateInput(seq1, seq2, match, mismatch, gap) {
  const a = normalizeSequence(seq1);
  const b = normalizeSequence(seq2);

  if (!a) {
    throw new Error("A sequência 1 está vazia.");
  }

  if (!b) {
    throw new Error("A sequência 2 está vazia.");
  }

  if (!/^[ACGT]+$/.test(a)) {
    throw new Error(
      "A sequência 1 contém bases inválidas. Use apenas A, C, G e T."
    );
  }

  if (!/^[ACGT]+$/.test(b)) {
    throw new Error(
      "A sequência 2 contém bases inválidas. Use apenas A, C, G e T."
    );
  }

  if (!Number.isInteger(Number(match)) || Number(match) === 0) {
    throw new Error("Match deve ser um número inteiro diferente de zero.");
  }

  if (!Number.isInteger(Number(mismatch)) || Number(mismatch) === 0) {
    throw new Error("Mismatch deve ser um número inteiro diferente de zero.");
  }

  if (!Number.isInteger(Number(gap)) || Number(gap) === 0) {
    throw new Error("Gap deve ser um número inteiro diferente de zero.");
  }

  return {
    seq1: a,
    seq2: b,
    match: Number(match),
    mismatch: Number(mismatch),
    gap: Number(gap),
  };
}

function pairScore(a, b, match, mismatch) {
  return a === b ? match : mismatch;
}


/* ============================================================
   NEEDLEMAN-WUNSCH — ALINHAMENTO GLOBAL
   ============================================================ */

function runGlobal(seq1, seq2, match, mismatch, gap) {
  const rows = seq1.length + 1;
  const columns = seq2.length + 1;

  const matrix = Array.from(
    { length: rows },
    () => Array(columns).fill(0)
  );

  const tracebackMatrix = Array.from(
    { length: rows },
    () => Array(columns).fill(null)
  );

  // Primeira coluna
  for (let i = 1; i < rows; i++) {
    matrix[i][0] = matrix[i - 1][0] + gap;
    tracebackMatrix[i][0] = "VERTICAL";
  }

  // Primeira linha
  for (let j = 1; j < columns; j++) {
    matrix[0][j] = matrix[0][j - 1] + gap;
    tracebackMatrix[0][j] = "HORIZONTAL";
  }

  const steps = [];

  // Preenchimento da matriz
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < columns; j++) {
      const diagonal =
        matrix[i - 1][j - 1] +
        pairScore(seq1[i - 1], seq2[j - 1], match, mismatch);

      const vertical =
        matrix[i - 1][j] + gap;

      const horizontal =
        matrix[i][j - 1] + gap;

      let bestScore;
      let direction;

      // Prioridade:
      // diagonal > vertical > horizontal
      if (
        diagonal >= vertical &&
        diagonal >= horizontal
      ) {
        bestScore = diagonal;
        direction = "DIAGONAL";
      } else if (vertical >= horizontal) {
        bestScore = vertical;
        direction = "VERTICAL";
      } else {
        bestScore = horizontal;
        direction = "HORIZONTAL";
      }

      matrix[i][j] = bestScore;
      tracebackMatrix[i][j] = direction;

      steps.push({
        i,
        j,
        diagonal,
        vertical,
        horizontal,
        best_score: bestScore,
        direction,
      });
    }
  }

  // Traceback
  let i = seq1.length;
  let j = seq2.length;

  const aligned1 = [];
  const aligned2 = [];

  while (i > 0 || j > 0) {
    const direction = tracebackMatrix[i][j];

    if (direction === "DIAGONAL") {
      aligned1.push(seq1[i - 1]);
      aligned2.push(seq2[j - 1]);

      i--;
      j--;
    } else if (direction === "VERTICAL") {
      aligned1.push(seq1[i - 1]);
      aligned2.push("-");

      i--;
    } else if (direction === "HORIZONTAL") {
      aligned1.push("-");
      aligned2.push(seq2[j - 1]);

      j--;
    } else {
      break;
    }
  }

  aligned1.reverse();
  aligned2.reverse();

  return {
    seq1_aln: aligned1.join(""),
    seq2_aln: aligned2.join(""),
    score: matrix[seq1.length][seq2.length],
    matrix,
    traceback_matrix: tracebackMatrix,
    steps,
  };
}


/* ============================================================
   SMITH-WATERMAN — ALINHAMENTO LOCAL
   ============================================================ */

function runLocal(seq1, seq2, match, mismatch, gap) {
  const rows = seq1.length + 1;
  const columns = seq2.length + 1;

  const matrix = Array.from(
    { length: rows },
    () => Array(columns).fill(0)
  );

  const tracebackMatrix = Array.from(
    { length: rows },
    () => Array(columns).fill(null)
  );

  const steps = [];

  let maxScore = 0;

  // Todas as posições que possuem o maior score
  const maxPositions = [];

  // Preenchimento da matriz
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < columns; j++) {
      const diagonal =
        matrix[i - 1][j - 1] +
        pairScore(seq1[i - 1], seq2[j - 1], match, mismatch);

      const vertical =
        matrix[i - 1][j] + gap;

      const horizontal =
        matrix[i][j - 1] + gap;

      const bestScore = Math.max(
        0,
        diagonal,
        vertical,
        horizontal
      );

      matrix[i][j] = bestScore;

      let direction = null;

      // Prioridade:
      // diagonal > vertical > horizontal
      if (bestScore === 0) {
        direction = null;
      } else if (bestScore === diagonal) {
        direction = "DIAGONAL";
      } else if (bestScore === vertical) {
        direction = "VERTICAL";
      } else if (bestScore === horizontal) {
        direction = "HORIZONTAL";
      }

      tracebackMatrix[i][j] = direction;

      steps.push({
        i,
        j,
        diagonal,
        vertical,
        horizontal,
        best_score: bestScore,
        direction,
      });

      if (bestScore > maxScore) {
        maxScore = bestScore;
      }
    }
  }

  // Encontrar todas as células com o score máximo
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < columns; j++) {
      if (matrix[i][j] === maxScore && maxScore > 0) {
        maxPositions.push([i, j]);
      }
    }
  }

  /*
   * Traceback recursivo.
   *
   * No traceback local, existem potencialmente vários caminhos
   * quando há empate. Aqui exploramos todos os caminhos de
   * maior score para retornar os alinhamentos possíveis.
   */
  const alignments = [];

  function tracebackAll(
    i,
    j,
    current1,
    current2,
    score
  ) {
    // Parou em zero
    if (i === 0 || j === 0 || matrix[i][j] === 0) {
      const seq1Aln = current1.reverse().join("");
      const seq2Aln = current2.reverse().join("");

      alignments.push({
        seq1_aln: seq1Aln,
        seq2_aln: seq2Aln,
        score,
        matrix,
        traceback_matrix: tracebackMatrix,
        steps,
      });

      current1.reverse();
      current2.reverse();

      return;
    }

    const cellScore = matrix[i][j];

    const diagonal =
      matrix[i - 1][j - 1] +
      pairScore(
        seq1[i - 1],
        seq2[j - 1],
        match,
        mismatch
      );

    const vertical =
      matrix[i - 1][j] + gap;

    const horizontal =
      matrix[i][j - 1] + gap;

    /*
     * DIAGONAL
     */
    if (cellScore === diagonal) {
      current1.push(seq1[i - 1]);
      current2.push(seq2[j - 1]);

      tracebackAll(
        i - 1,
        j - 1,
        current1,
        current2,
        score
      );

      current1.pop();
      current2.pop();
    }

    /*
     * VERTICAL
     */
    if (cellScore === vertical) {
      current1.push(seq1[i - 1]);
      current2.push("-");

      tracebackAll(
        i - 1,
        j,
        current1,
        current2,
        score
      );

      current1.pop();
      current2.pop();
    }

    /*
     * HORIZONTAL
     */
    if (cellScore === horizontal) {
      current1.push("-");
      current2.push(seq2[j - 1]);

      tracebackAll(
        i,
        j - 1,
        current1,
        current2,
        score
      );

      current1.pop();
      current2.pop();
    }
  }

  /*
   * Faz traceback a partir de todas as células de maior score.
   */
  for (const [i, j] of maxPositions) {
    tracebackAll(
      i,
      j,
      [],
      [],
      maxScore
    );
  }

  /*
   * Remove alinhamentos duplicados.
   */
  const unique = [];
  const seen = new Set();

  for (const alignment of alignments) {
    const key =
      alignment.seq1_aln +
      "|" +
      alignment.seq2_aln;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(alignment);
    }
  }

  /*
   * Caso extremamente simples em que não houve nenhum score positivo.
   */
  if (unique.length === 0) {
    unique.push({
      seq1_aln: "",
      seq2_aln: "",
      score: 0,
      matrix,
      traceback_matrix: tracebackMatrix,
      steps,
    });
  }

  return {
    ...unique[0],
    alignments: unique,
    score: maxScore,
    matrix,
    traceback_matrix: tracebackMatrix,
    steps,
  };
}


/* ============================================================
   FUNÇÃO PRINCIPAL
   ============================================================ */

export async function runAlignment(payload) {
  const {
    method,
    seq1,
    seq2,
    match,
    mismatch,
    gap,
  } = payload;

  const validated = validateInput(
    seq1,
    seq2,
    match,
    mismatch,
    gap
  );

  if (method === "global") {
    return runGlobal(
      validated.seq1,
      validated.seq2,
      validated.match,
      validated.mismatch,
      validated.gap
    );
  }

  if (method === "local") {
    return runLocal(
      validated.seq1,
      validated.seq2,
      validated.match,
      validated.mismatch,
      validated.gap
    );
  }

  throw new Error("Método de alinhamento inválido.");
}