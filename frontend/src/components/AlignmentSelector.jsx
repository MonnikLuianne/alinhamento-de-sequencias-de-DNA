export default function AlignmentSelector({
  alignments,
  selectedIndex,
  onSelect,
}) {
  if (!alignments || alignments.length <= 1) return null;

  return (
    <section className="alignment-selector">
      <label htmlFor="alignment-select">Escolha o alinhamento:</label>

      <select
        id="alignment-select"
        value={selectedIndex}
        onChange={(event) => onSelect(Number(event.target.value))}
      >
        {alignments.map((alignment, index) => (
          <option key={index} value={index}>
            Alinhamento {index + 1} — score {alignment.score}
          </option>
        ))}
      </select>
    </section>
  );
}