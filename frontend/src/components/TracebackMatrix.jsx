function getArrow(direction) {
  if (!direction) return "·";

  const value = String(direction).toUpperCase();

  if (value.includes("DIAGONAL") || value === "↖") return "↖";
  if (value.includes("VERTICAL") || value === "↑") return "↑";
  if (value.includes("HORIZONTAL") || value === "←") return "←";

  return value;
}

export default function TracebackMatrix({
  matrix,
  seq1,
  seq2,
  path = [],
}) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return <p>Matriz de traceback indisponível.</p>;
  }

  const pathSet = new Set(path.map(([i, j]) => `${i},${j}`));

  return (
    <div className="matrix-scroll">
      <table className="matrix-table traceback-table">
        <thead>
          <tr>
            <th className="matrix-header">∅</th>
            <th className="matrix-header">∅</th>
            {seq2.split("").map((base, index) => (
              <th className="matrix-header" key={index}>{base}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <th className="matrix-header">
                {i === 0 ? "∅" : seq1[i - 1]}
              </th>

              {row.map((direction, j) => (
                <td
                  key={j}
                  className={`matrix-cell ${
                    pathSet.has(`${i},${j}`) ? "path-cell" : ""
                  }`}
                  title={`Linha ${i}, coluna ${j}`}
                >
                  {getArrow(direction)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="traceback-legend">
        <span>↖ Diagonal</span>
        <span>↑ Vertical</span>
        <span>← Horizontal</span>
        <span>· Sem direção</span>
      </div>
    </div>
  );
}