export default function ScoreMatrix({
  matrix,
  seq1,
  seq2,
  path = [],
  visibleCells = Infinity,
}) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return <p>Matriz de pontuação indisponível.</p>;
  }

  const pathSet = new Set(path.map(([i, j]) => `${i},${j}`));
  const columns = matrix[0].length;
  let cellNumber = 0;

  return (
    <div className="matrix-scroll">
      <table className="matrix-table">
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

              {row.map((value, j) => {
                const current = cellNumber++;
                const hidden = current >= visibleCells;
                const onPath = pathSet.has(`${i},${j}`);

                return (
                  <td
                    key={j}
                    className={[
                      "matrix-cell",
                      onPath ? "path-cell" : "",
                      hidden ? "hidden-cell" : "",
                    ].join(" ")}
                    title={`Linha ${i}, coluna ${j}`}
                  >
                    {hidden ? "·" : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="matrix-caption">
        Linhas e colunas representam as bases das duas sequências. O caminho
        destacado indica as células percorridas no traceback.
      </p>

      <span className="matrix-dimensions">
        {matrix.length} × {columns}
      </span>
    </div>
  );
}