import { useRef, useState } from "react";
import { runAlignment } from "../services/api.js";

function parseFile(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // FASTA
  if (lines.some((line) => line.startsWith(">"))) {
    const sequences = [];
    let current = "";

    for (const line of lines) {
      if (line.startsWith(">")) {
        if (current) {
          sequences.push(current);
        }
        current = "";
      } else {
        current += line.replace(/\s/g, "");
      }
    }

    if (current) {
      sequences.push(current);
    }

    return sequences;
  }

  // TXT simples: duas linhas = duas sequências
  if (lines.length === 2) {
    return lines;
  }

  return [];
}

export default function SetupPage({
  config,
  setConfig,
  onBack,
  onResult,
}) {
  const [mode, setMode] = useState("manual");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState("");

  const fileInput = useRef(null);

  function updateConfig(key, value) {
    setConfig((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function cleanSequence(value) {
    return String(value ?? "")
      .toUpperCase()
      .replace(/\s/g, "");
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!/\.(txt|fasta)$/i.test(file.name)) {
      setError("Escolha um arquivo .txt ou .fasta.");
      return;
    }

    try {
      const text = await file.text();
      const sequences = parseFile(text);

      if (sequences.length !== 2) {
        setError(
          "O arquivo precisa conter exatamente duas sequências."
        );
        return;
      }

      updateConfig("sequence1", cleanSequence(sequences[0]));
      updateConfig("sequence2", cleanSequence(sequences[1]));

      setFilename(file.name);
      setError("");
    } catch {
      setError("Não foi possível ler o arquivo.");
    }
  }

  async function submit() {
    console.log("SUBMIT EXECUTADO");

    setError("");

    const sequence1 = cleanSequence(config.sequence1);
    const sequence2 = cleanSequence(config.sequence2);

    console.log("Sequência 1:", sequence1);
    console.log("Sequência 2:", sequence2);

    // =========================
    // VALIDAÇÃO DAS SEQUÊNCIAS
    // =========================

    if (!sequence1) {
      setError("Informe a sequência 1.");
      return;
    }

    if (!sequence2) {
      setError("Informe a sequência 2.");
      return;
    }

    if (!/^[ACGT]+$/.test(sequence1)) {
      setError(
        "A sequência 1 contém caracteres inválidos. Use apenas A, C, G e T."
      );
      return;
    }

    if (!/^[ACGT]+$/.test(sequence2)) {
      setError(
        "A sequência 2 contém caracteres inválidos. Use apenas A, C, G e T."
      );
      return;
    }

    // =========================
    // VALIDAÇÃO DOS PARÂMETROS
    // =========================

    const match = Number(config.match);
    const mismatch = Number(config.mismatch);
    const gap = Number(config.gap);

    if (!Number.isInteger(match) || match === 0) {
      setError("Match deve ser um inteiro diferente de zero.");
      return;
    }

    if (!Number.isInteger(mismatch) || mismatch === 0) {
      setError("Mismatch deve ser um inteiro diferente de zero.");
      return;
    }

    if (!Number.isInteger(gap) || gap === 0) {
      setError("Gap deve ser um inteiro diferente de zero.");
      return;
    }

    // =========================
    // EXECUÇÃO
    // =========================

    setLoading(true);

    try {
      console.log("Iniciando cálculo...");

      const result = await runAlignment({
        method: config.method,
        seq1: sequence1,
        seq2: sequence2,
        match,
        mismatch,
        gap,
      });

      console.log("Resultado:", result);

      onResult(result);
    } catch (error) {
      console.error("Erro no alinhamento:", error);

      setError(
        error?.message ||
          "Não foi possível executar o alinhamento."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">

      <button className="back" onClick={onBack}>
        ← Voltar
      </button>

      <div className="heading">
        <small>CONFIGURAÇÃO</small>

        <h1>Prepare seu alinhamento</h1>

        <p>
          Trocar o método não apaga as sequências preenchidas.
        </p>
      </div>

      {/* MÉTODO */}

      <section className="panel">

        <h2>1. Método</h2>

        <div className="methods">

          <button
            className={
              config.method === "global"
                ? "chosen"
                : ""
            }
            onClick={() =>
              updateConfig("method", "global")
            }
          >
            <b>Alinhamento Global</b>

            <small>
              Needleman-Wunsch · sequência inteira
            </small>
          </button>

          <button
            className={
              config.method === "local"
                ? "chosen"
                : ""
            }
            onClick={() =>
              updateConfig("method", "local")
            }
          >
            <b>Alinhamento Local</b>

            <small>
              Smith-Waterman · regiões semelhantes
            </small>
          </button>

        </div>

      </section>

      {/* SEQUÊNCIAS */}

      <section className="panel">

        <h2>2. Sequências de DNA</h2>

        <div className="tabs">

          <button
            className={
              mode === "manual"
                ? "chosen"
                : ""
            }
            onClick={() => setMode("manual")}
          >
            Digitar
          </button>

          <button
            className={
              mode === "file"
                ? "chosen"
                : ""
            }
            onClick={() => setMode("file")}
          >
            Arquivo .txt / .fasta
          </button>

        </div>

        {mode === "file" && (
          <div className="upload">

            <input
              ref={fileInput}
              hidden
              type="file"
              accept=".txt,.fasta"
              onChange={handleFileChange}
            />

            <button
              className="secondary"
              onClick={() =>
                fileInput.current?.click()
              }
            >
              ↑ Escolher arquivo
            </button>

            {filename && (
              <p className="success">
                {filename} carregado
              </p>
            )}

            <small>
              O arquivo deve conter exatamente duas sequências.
            </small>

          </div>
        )}

        <div className="seq-grid">

          <label>
            Sequência 1

            <small>
              {cleanSequence(config.sequence1).length} bases
            </small>

            <textarea
              spellCheck="false"
              value={config.sequence1}
              onChange={(event) =>
                updateConfig(
                  "sequence1",
                  event.target.value
                )
              }
              placeholder="Ex.: ACGTACGT"
            />
          </label>

          <label>
            Sequência 2

            <small>
              {cleanSequence(config.sequence2).length} bases
            </small>

            <textarea
              spellCheck="false"
              value={config.sequence2}
              onChange={(event) =>
                updateConfig(
                  "sequence2",
                  event.target.value
                )
              }
              placeholder="Ex.: ACGTTCGT"
            />
          </label>

        </div>

        <p className="hint">
          São aceitas apenas A, C, G e T.
          Letras minúsculas são convertidas automaticamente.
        </p>

      </section>

      {/* PARÂMETROS */}

      <section className="panel">

        <h2>3. Parâmetros</h2>

        <div className="params">

          <label>
            Match

            <input
              type="number"
              step="1"
              value={config.match}
              onChange={(event) =>
                updateConfig(
                  "match",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Mismatch

            <input
              type="number"
              step="1"
              value={config.mismatch}
              onChange={(event) =>
                updateConfig(
                  "mismatch",
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Gap

            <input
              type="number"
              step="1"
              value={config.gap}
              onChange={(event) =>
                updateConfig(
                  "gap",
                  event.target.value
                )
              }
            />
          </label>

        </div>

        <p className="hint">
          Valores inteiros diferentes de zero.
          Exemplo: Match 2, Mismatch -1, Gap -2.
        </p>

      </section>

      {/* ERRO */}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* BOTÕES */}

      <div className="actions">

        <button
          className="secondary"
          onClick={() => {
            updateConfig("sequence1", "");
            updateConfig("sequence2", "");
            setFilename("");
            setError("");
          }}
        >
          Limpar sequências
        </button>

        <button
          className="primary"
          disabled={loading}
          onClick={submit}
        >
          {loading
            ? "Calculando…"
            : "INICIAR ALINHAMENTO →"}
        </button>

      </div>

    </main>
  );
}