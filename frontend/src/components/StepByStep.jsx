import { useEffect, useState } from "react";

export default function StepByStep({ totalCells, onStepChange }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [totalCells]);

  useEffect(() => {
    onStepChange(step);
  }, [step, onStepChange]);

  useEffect(() => {
    if (!playing) return;

    const timer = setInterval(() => {
      setStep((current) => {
        if (current >= totalCells) {
          setPlaying(false);
          return totalCells;
        }

        return current + 1;
      });
    }, 250);

    return () => clearInterval(timer);
  }, [playing, totalCells]);

  return (
    <section className="step-controls">
      <div>
        <span className="eyebrow">VISUALIZAÇÃO PROGRESSIVA</span>
        <h3>Explore a matriz</h3>
        <p>
          Células reveladas: {Math.min(step, totalCells)} de {totalCells}
        </p>
      </div>

      <div className="step-buttons">
        <button
          className="secondary-button"
          onClick={() => {
            setPlaying(false);
            setStep((current) => Math.max(0, current - 1));
          }}
          disabled={step === 0}
        >
          ← Voltar
        </button>

        <button
          className="secondary-button"
          onClick={() => {
            setPlaying(false);
            setStep((current) => Math.min(totalCells, current + 1));
          }}
          disabled={step >= totalCells}
        >
          Próximo passo →
        </button>

        <button
          className="primary-button compact-button"
          onClick={() => {
            if (step >= totalCells) {
              setStep(0);
              setPlaying(true);
            } else {
              setPlaying((current) => !current);
            }
          }}
        >
          {playing ? "Pausar" : step >= totalCells ? "Reproduzir novamente" : "▶ Reproduzir"}
        </button>
      </div>
    </section>
  );
}