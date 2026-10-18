import { useCallback, useMemo, useState } from "react";
import ScoreMatrix from "./ScoreMatrix";
import TracebackMatrix from "./TracebackMatrix";
import AlignmentView from "./AlignmentView";
import AlignmentSelector from "./AlignmentSelector";
import StepByStep from "./StepByStep";
import { runAlignment } from "../services/api.js";

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

function scoreMatrixToCSV(matrix, seq1, seq2) {
  const colHeaders = [" ", "-", ...seq2.split("")];
  const rowHeaders = ["-", ...seq1.split("")];
  const header = colHeaders.join(",");
  const rows = matrix.map((row, i) => [rowHeaders[i], ...row].join(","));
  return [header, ...rows].join("\n");
}

function tracebackMatrixToCSV(matrix, seq1, seq2) {
  const arrowMap = { DIAGONAL: "↖", VERTICAL: "↑", HORIZONTAL: "←" };
  const colHeaders = [" ", "-", ...seq2.split("")];
  const rowHeaders = ["-", ...seq1.split("")];
  const header = colHeaders.join(",");
  const rows = matrix.map((row, i) => {
    const cells = row.map((cell) => {
      const key = String(cell).toUpperCase();
      return arrowMap[key] ?? cell ?? " ";
    });
    return [rowHeaders[i], ...cells].join(",");
  });
  return [header, ...rows].join("\n");
}

function alignmentToCSV(seq1, seq2) {
  const header = "Posição,Seq1,Indicador,Seq2";
  const rows = Array.from(seq1, (base, index) => {
    let indicator;
    if (base === "-" || seq2[index] === "-") indicator = "-";
    else indicator = base === seq2[index] ? "|" : ".";
    return `${index + 1},${base},${indicator},${seq2[index]}`;
  });
  return [header, ...rows].join("\n");
}

/* ─── painel de comparação ──────────────────────────────────────────── */
function ComparisonPanel({ method, seq1, seq2, match, mismatch, gap }) {
  const other = method === "global" ? "local" : "global";
  const otherLabel = other === "global" ? "Global (Needleman-Wunsch)" : "Local (Smith-Waterman)";

  const [state, setState] = useState("idle");
  const [otherResult, setOtherResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleCompare() {
    setState("loading");
    setErrorMsg("");
    try {
      const result = await runAlignment({ method: other, seq1, seq2, match, mismatch, gap });
      setOtherResult(result);
      setState("done");
    } catch (err) {
      setErrorMsg(err?.message || "Erro ao executar o alinhamento.");
      setState("error");
    }
  }

  if (state === "idle") {
    return (
      <div style={{ marginTop: 12 }}>
        <button
          onClick={handleCompare}
          style={{
            background: "none", border: "1px solid #4caf50", color: "#4caf50",
            borderRadius: 8, padding: "10px 20px", fontSize: 14,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          ⟳ Comparar com alinhamento {otherLabel}
        </button>
        <p style={{ fontSize: 12, color: "#7aab8a", marginTop: 6 }}>
          Usa os mesmos parâmetros (match/mismatch/gap) e as mesmas sequências.
        </p>
      </div>
    );
  }

  if (state === "loading") return <p style={{ color: "#7aab8a", fontSize: 14 }}>Calculando {otherLabel}…</p>;
  if (state === "error") return <p style={{ color: "#f28b82", fontSize: 14 }}>⚠ {errorMsg}</p>;

  const s1 = otherResult.seq1_aln ?? "";
  const s2 = otherResult.seq2_aln ?? "";
  const indicator = Array.from(s1, (base, idx) => {
    if (base === "-" || s2[idx] === "-") return " ";
    return base === s2[idx] ? "|" : ".";
  }).join("");

  return (
    <div style={{ marginTop: 16, background: "#0a1a12", border: "1px solid #1e3a27", borderRadius: 10, padding: "20px 24px" }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#4caf50", margin: "0 0 12px" }}>
        {otherLabel} — Score: {otherResult.score}
      </p>
      <pre style={{ fontFamily: "'Courier New', monospace", fontSize: 14, color: "#e8f5e9", margin: 0, lineHeight: 1.8, overflowX: "auto" }}>
        {`Seq1: ${s1}\n      ${indicator}\nSeq2: ${s2}`}
      </pre>
    </div>
  );
}

/* ─── componente principal ──────────────────────────────────────────── */
export default function ResultPage({ config, result, onBack, onHome }) {
  const alignments = result.alignments?.length ? result.alignments : [result];

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

  const handleStepChange = useCallback((step) => { setVisibleCells(step); }, []);

  const totalCells = matrix.reduce((total, row) => total + row.length, 0);

  const indicator = Array.from(seq1, (base, index) => {
    if (base === "-" || seq2[index] === "-") return "-";
    return base === seq2[index] ? "|" : ".";
  }).join("");

  const reportCSV =
    "MATRIZ DE PONTUAÇÃO\n" +
    scoreMatrixToCSV(matrix, config.sequence1, config.sequence2) +
    "\n\nMATRIZ DE TRACEBACK\n" +
    tracebackMatrixToCSV(traceback, config.sequence1, config.sequence2);

  const report = [
    "RELATÓRIO DE ALINHAMENTO DE DNA",
    `Método: ${config.method === "global" ? "Needleman-Wunsch (global)" : "Smith-Waterman (local)"}`,
    `Sequência 1: ${config.sequence1}`,
    `Sequência 2: ${config.sequence2}`,
    `Match: ${config.match}`,
    `Mismatch: ${config.mismatch}`,
    `Gap: ${config.gap}`,
    `Score final: ${score}`,
    `Tamanho do alinhamento: ${Math.max(seq1.length, seq2.length)}`,
    "",
    "ALINHAMENTO",
    `Seq1: ${seq1}`,
    `      ${indicator}`,
    `Seq2: ${seq2}`,
    "",
    "MATRIZ DE PONTUAÇÃO",
    scoreMatrixToCSV(matrix, config.sequence1, config.sequence2),
    "",
    "MATRIZ DE TRACEBACK",
    tracebackMatrixToCSV(traceback, config.sequence1, config.sequence2),
  ].join("\n");

  return (
    <main className="result-page">
      <header className="topbar">
        <button className="text-button" onClick={onBack}>← Configuração</button>
        <div className="brand"><span className="brand-icon">⌁</span>DNA ALIGN</div>
        <button className="text-button" onClick={onHome}>Tela inicial</button>
      </header>

      <section className="results-container">
        <div className="section-heading">
          <span className="eyebrow">RESULTADO DO PROCESSAMENTO</span>
          <h1>Relatório de alinhamento</h1>
          <p>{config.method === "global" ? "Needleman-Wunsch · Alinhamento global" : "Smith-Waterman · Alinhamento local"}</p>
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

        {/* 01 — ALINHAMENTO */}
        <section className="panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow">01</span>
              <h2>Alinhamento</h2>
            </div>
            <span className="status-badge">Concluído</span>
          </div>
          <AlignmentSelector alignments={alignments} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
          <AlignmentView seq1={seq1} seq2={seq2} />
        </section>

        {/* 02 — MATRIZ DE PONTUAÇÃO */}
        <section className="panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow">02</span>
              <h2>Matriz de pontuação</h2>
            </div>
          </div>
          <p className="panel-description">Os valores representam os melhores scores calculados para cada posição das sequências.</p>
          <StepByStep totalCells={totalCells} onStepChange={handleStepChange} />
          <ScoreMatrix matrix={matrix} seq1={config.sequence1} seq2={config.sequence2} path={path} visibleCells={visibleCells} />
        </section>

        {/* 03 — MATRIZ DE TRACEBACK */}
        <section className="panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow">03</span>
              <h2>Matriz de traceback</h2>
            </div>
          </div>
          <p className="panel-description">As setas indicam a origem da pontuação de cada célula.</p>
          <TracebackMatrix matrix={traceback} seq1={config.sequence1} seq2={config.sequence2} path={path} />
        </section>

        {/* 04 — COMPARAÇÃO LOCAL × GLOBAL */}
        <section className="panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow">04</span>
              <h2>Comparação Local × Global</h2>
            </div>
          </div>
          <p className="panel-description">
            Execute o mesmo par de sequências com o método oposto e compare os resultados sem precisar voltar à tela de configuração.
          </p>
          <ComparisonPanel
            method={config.method}
            seq1={config.sequence1}
            seq2={config.sequence2}
            match={config.match}
            mismatch={config.mismatch}
            gap={config.gap}
          />
        </section>

        {/* 05 — COMPLEXIDADE */}
        <section className="panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow">05</span>
              <h2>Complexidade do algoritmo</h2>
            </div>
          </div>
          <p className="panel-description">
            Ambos os algoritmos (Needleman-Wunsch e Smith-Waterman) utilizam programação dinâmica e compartilham a mesma complexidade assintótica.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div style={{ background: "#0f2318", border: "1px solid #1e3a27", borderRadius: 10, padding: "20px 24px" }}>
              <p style={{ fontSize: 13, color: "#7aab8a", margin: "0 0 6px", fontWeight: 600 }}>TEMPO</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: "#4caf50", margin: "0 0 8px", fontFamily: "monospace" }}>O(m × n)</p>
              <p style={{ fontSize: 13, color: "#7aab8a", margin: 0, lineHeight: 1.6 }}>
                Cada célula da matriz é calculada exatamente uma vez, levando em conta apenas três vizinhos (diagonal, acima e à esquerda).
                Com sequências de comprimentos <strong style={{ color: "#b2d8b8" }}>m</strong> e{" "}
                <strong style={{ color: "#b2d8b8" }}>n</strong>, o total de operações é{" "}
                <strong style={{ color: "#b2d8b8" }}>m × n</strong>.
              </p>
            </div>

            <div style={{ background: "#0f2318", border: "1px solid #1e3a27", borderRadius: 10, padding: "20px 24px" }}>
              <p style={{ fontSize: 13, color: "#7aab8a", margin: "0 0 6px", fontWeight: 600 }}>MEMÓRIA</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: "#4caf50", margin: "0 0 8px", fontFamily: "monospace" }}>O(m × n)</p>
              <p style={{ fontSize: 13, color: "#7aab8a", margin: 0, lineHeight: 1.6 }}>
                A matriz completa de pontuação (<strong style={{ color: "#b2d8b8" }}>m+1</strong> ×{" "}
                <strong style={{ color: "#b2d8b8" }}>n+1</strong>) e a matriz de traceback precisam ser mantidas inteiras em memória
                para permitir a reconstrução do alinhamento e a visualização.
              </p>
            </div>
          </div>

          <div style={{ background: "#0f2318", border: "1px solid #1e3a27", borderRadius: 10, padding: "16px 24px" }}>
            <p style={{ fontSize: 13, color: "#7aab8a", margin: "0 0 8px", fontWeight: 600 }}>ESTE ALINHAMENTO</p>
            <p style={{ fontSize: 13, color: "#b2d8b8", margin: 0, lineHeight: 1.8 }}>
              Seq1: <strong style={{ color: "#e8f5e9" }}>{config.sequence1.length}</strong> bases (m) ·{" "}
              Seq2: <strong style={{ color: "#e8f5e9" }}>{config.sequence2.length}</strong> bases (n) ·{" "}
              Células calculadas: <strong style={{ color: "#4caf50" }}>
                {config.sequence1.length} × {config.sequence2.length} = {config.sequence1.length * config.sequence2.length}
              </strong>
            </p>
          </div>
        </section>

        {/* 06 — PARÂMETROS */}
        <section className="panel">
          <span className="eyebrow">06</span>
          <h2>Parâmetros utilizados</h2>
          <div className="parameters-summary">
            <div><span>Match</span><strong>{config.match}</strong></div>
            <div><span>Mismatch</span><strong>{config.mismatch}</strong></div>
            <div><span>Gap</span><strong>{config.gap}</strong></div>
          </div>
        </section>

        {/* 07 — EXPORTAR */}
        <section className="panel">
          <span className="eyebrow">07</span>
          <h2>Exportar resultados</h2>
          <p className="panel-description">Salve o relatório completo ou exporte os arquivos separadamente.</p>

          <div className="export-buttons">
            <button
              className="secondary-button"
              onClick={() => {
                downloadFile("relatorio.txt", report);
                downloadFile("relatorio_matrizes.csv", reportCSV, "text/csv;charset=utf-8");
              }}
            >
              ↓ Relatório TXT + Matrizes CSV
            </button>

            <button
              className="secondary-button"
              onClick={() => downloadFile("matriz_pontuacao.csv", scoreMatrixToCSV(matrix, config.sequence1, config.sequence2), "text/csv;charset=utf-8")}
            >
              ↓ Matriz de pontuação CSV
            </button>

            <button
              className="secondary-button"
              onClick={() => downloadFile("matriz_traceback.csv", tracebackMatrixToCSV(traceback, config.sequence1, config.sequence2), "text/csv;charset=utf-8")}
            >
              ↓ Matriz traceback CSV
            </button>

            <button
              className="secondary-button"
              onClick={() => downloadFile("alinhamento.csv", alignmentToCSV(seq1, seq2), "text/csv;charset=utf-8")}
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