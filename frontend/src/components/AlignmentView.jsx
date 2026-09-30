function getPositionType(a, b) {
  if (a === "-" || b === "-") return "gap";
  if (a === b) return "match";
  return "mismatch";
}

export default function AlignmentView({ seq1, seq2 }) {
  if (!seq1 || !seq2) {
    return <p>Não há alinhamento para exibir.</p>;
  }

  const indicator = Array.from(seq1, (base, index) => {
    if (base === "-" || seq2[index] === "-") return "-";
    return base === seq2[index] ? "|" : ".";
  });

  return (
    <div className="alignment-view">
      <div className="alignment-legend">
        <span><i className="legend-dot match" /> Match</span>
        <span><i className="legend-dot mismatch" /> Mismatch</span>
        <span><i className="legend-dot gap" /> Gap</span>
      </div>

      <div className="alignment-scroll">
        <div className="alignment-row">
          {Array.from(seq1, (base, index) => {
            const type = getPositionType(base, seq2[index]);

            return (
              <div className={`alignment-cell ${type}`} key={index}>
                <span>{base}</span>
                <span>{seq2[index]}</span>
              </div>
            );
          })}
        </div>

        <div className="indicator-row">
          {indicator.map((symbol, index) => (
            <span className="indicator-cell" key={index}>
              {symbol}
            </span>
          ))}
        </div>

        <div className="alignment-labels">
          <span>Sequência 1</span>
          <span>Indicador</span>
          <span>Sequência 2</span>
        </div>
      </div>

      <p className="alignment-caption">
        Cada caixa representa uma posição do alinhamento. O indicador usa
        <strong> | </strong> para match, <strong>.</strong> para mismatch e
        <strong> - </strong> para gap.
      </p>
    </div>
  );
}