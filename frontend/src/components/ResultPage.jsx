import { useCallback, useMemo, useState } from "react";
import ScoreMatrix from "./ScoreMatrix";
import TracebackMatrix from "./TracebackMatrix";
import AlignmentView from "./AlignmentView";
import AlignmentSelector from "./AlignmentSelector";
import StepByStep from "./StepByStep";

function getTracebackPath(matrix, traceback, method) {
  if (!matrix?.length || !traceback?.length) return [];

  let i;
  let j;

  if (method === "local") {
    let maxScore = 0;
    i = 0;
    j = 0;

    matrix.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value > maxScore) {
          maxScore = value;
          i = rowIndex;
          j = colIndex;
        }
      });
    });

    if (maxScore === 0) return [];
  } else {
    i = matrix.length - 1;
    j = matrix[0].length - 1;
  }

  const path = [];
  let guard = 0;

  while (i >= 0 && j >= 0 && guard < matrix.length * matrix[0].length + 1) {
    guard++;

    if (method === "local" && matrix[i][j] === 0) break;

    path.push([i, j]);

    if (i === 0 && j === 0) break;

    const direction = String(traceback[i]?.[j] ?? "").toUpperCase();

    if (direction.includes("DIAGONAL") || direction === "↖") {
      i--;
      j--;
    } else if (direction.includes("VERTICAL") || direction === "↑") {
      i--;
    } else if (direction.includes("HORIZONTAL") || direction === "←") {
      j--;
    } else {
      break;
    }
  }

  return path;
}

function downloadFile(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob(["\uFEFF", content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function matrixToCSV(matrix) {
  return matrix.map((row) => row.join(",")).join("\n");
}

function alignmentToCSV(seq1, seq2) {
  const indicator = Array.from(seq1, (base, index) => {
    if (base === "-" || seq2[index] === "-") return "-";
    return base === seq2[index] ? "|" : ".";
  }).join("");

  return [
    "Sequencia1,Indicador,Sequencia2",
    `${seq1},${indicator},${seq2}`,
  ].join("\n");
}

export default function ResultPage({ config, result, onBack, onHome }) {
  const alignments = result.alignments?.length
    ? result.alignments
    : [result];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visibleCells, setVisibleCells] = useState(0);

  const selected = alignments[selectedIndex] ?? result;

  const seq1 = selected.seq1_aln ?? "";
  const seq2 = selected.seq2_aln ?? "";
  const score = selected.score ?? result.score ?? 0;
  const matrix = result.matrix ?? selected.matrix ?? [];
  const traceback = result.traceback_matrix ?? selected.traceback_matrix ?? [];

  const path = useMemo(
    () => getTracebackPath(matrix, traceback, config.method),
    [matrix, traceback, config.method]
  );

  const handleStepChange = useCallback((step) => {
    setVisibleCells(step);
  }, []);

  const totalCells = matrix.reduce((total, row) => total + row.length, 0);

  const report = [
    "RELATÓRIO DE ALINHAMENTO DE DNA",
    `Método: ${config.method === "global" ? "Needleman-Wunsch (global)" : "Smith-Waterman (local)"}`,
    `Sequência 1: ${config.sequence1}`,
    `Sequência 2: ${config.sequence2}`,
    `Match: ${config.match}`,
    `Mismatch: ${config.mismatch}`,
    `Gap: ${config.gap}`,
    `Score final: ${score}`,
    "",
    "ALINHAMENTO",
    seq1,
    Array.from(seq1, (base, index) => {
      if (base === "-" || seq2[index] === "-") return "-";
      return base === seq2[index] ? "|" : ".";
    }).join(""),
    seq2,
    "",
    "MATRIZ DE PONTUAÇÃO",
    matrixToCSV(matrix),
    "",
    "MATRIZ DE TRACEBACK",
    matrixToCSV(traceback),
  ].join("\n");

  return (
    <main className="result-page">
      <header className="topbar">
        <button className="text-button" onClick={onBack}>
          ← Configuração
        </button>

        <div className="brand">
          <span className="brand-icon">⌁</span>
          DNA ALIGN
        </div>

        <button className="text-button" onClick={onHome}>
          Tela inicial
        </button>
      </header>

      <section className="results-container">
        <div className="section-heading">
          <span className="eyebrow">RESULTADO DO PROCESSAMENTO</span>
          <h1>Relatório de alinhamento</h1>
          <p>
            {config.method === "global"
              ? "Needleman-Wunsch · Alinhamento global"
              : "Smith-Waterman · Alinhamento local"}
          </p>
        </div>

        <div className="summary-grid">
          <article className="summary-card score-card">
            <span>Score final</span>
            <strong>{score}</strong>
          </article>

          <article className="summary-card">
            <span>Comprimento do alinhamento</span>
            <strong>{Math.max(seq1.length, seq2.length)}</strong>
          </article>

          <article className="summary-card">
            <span>Sequência 1 original</span>
            <strong>{config.sequence1.length} bases</strong>
          </article>

          <article className="summary-card">
            <span>Sequência 2 original</span>
            <strong>{config.sequence2.length} bases</strong>
          </article>
        </div>

        <section className="panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow">01</span>
              <h2>Alinhamento</h2>
            </div>
            <span className="status-badge">Concluído</span>
          </div>

          <AlignmentSelector
            alignments={alignments}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />

          <AlignmentView seq1={seq1} seq2={seq2} />
        </section>

        <section className="panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow">02</span>
              <h2>Matriz de pontuação</h2>
            </div>
          </div>

          <p className="panel-description">
            Os valores representam os melhores scores calculados para cada
            posição das sequências.
          </p>

          <StepByStep
            totalCells={totalCells}
            onStepChange={handleStepChange}
          />

          <ScoreMatrix
            matrix={matrix}
            seq1={config.sequence1}
            seq2={config.sequence2}
            path={path}
            visibleCells={visibleCells}
          />
        </section>

        <section className="panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow">03</span>
              <h2>Matriz de traceback</h2>
            </div>
          </div>

          <p className="panel-description">
            As setas indicam a origem da pontuação de cada célula.
          </p>

          <TracebackMatrix
            matrix={traceback}
            seq1={config.sequence1}
            seq2={config.sequence2}
            path={path}
          />
        </section>

        <section className="panel">
          <span className="eyebrow">04</span>
          <h2>Parâmetros utilizados</h2>

          <div className="parameters-summary">
            <div><span>Match</span><strong>{config.match}</strong></div>
            <div><span>Mismatch</span><strong>{config.mismatch}</strong></div>
            <div><span>Gap</span><strong>{config.gap}</strong></div>
          </div>
        </section>

        <section className="panel">
          <span className="eyebrow">05</span>
          <h2>Exportar resultados</h2>
          <p className="panel-description">
            Salve o relatório completo ou exporte as matrizes separadamente.
          </p>

          <div className="export-buttons">
            <button
              className="secondary-button"
              onClick={() => downloadFile("relatorio.txt", report)}
            >
              ↓ Relatório TXT
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                downloadFile(
                  "matriz_pontuacao.csv",
                  matrixToCSV(matrix),
                  "text/csv;charset=utf-8"
                )
              }
            >
              ↓ Matriz de pontuação CSV
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                downloadFile(
                  "matriz_traceback.csv",
                  matrixToCSV(traceback),
                  "text/csv;charset=utf-8"
                )
              }
            >
              ↓ Matriz traceback CSV
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                downloadFile(
                  "alinhamento.csv",
                  alignmentToCSV(seq1, seq2),
                  "text/csv;charset=utf-8"
                )
              }
            >
              ↓ Alinhamento CSV
            </button>
          </div>
        </section>

        <button className="primary-button submit-button" onClick={onBack}>
          REALIZAR NOVO ALINHAMENTO
        </button>
      </section>
    </main>
  );
}