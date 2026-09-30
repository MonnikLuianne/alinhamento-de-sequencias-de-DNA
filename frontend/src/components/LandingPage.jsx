export default function LandingPage({ onStart }) {
  return (
    <main className="landing">
      <div className="landing-overlay" />

      <section className="landing-content">
        <span className="eyebrow">BIOINFORMÁTICA</span>

        <h1>
          Automatização de
          <br />
          alinhamentos de
          <br />
          <span>sequências de DNA</span>
        </h1>

        <p>
          Explore o alinhamento global e local de sequências genéticas
          por meio da programação dinâmica.
        </p>

        <button className="primary-button landing-button" onClick={onStart}>
          INICIAR <span aria-hidden="true">→</span>
        </button>

        <div className="landing-footer">
          SMITH-WATERMAN · NEEDLEMAN-WUNSCH
        </div>
      </section>
    </main>
  );
}