import { useRef, useState } from "react";
import { runAlignment } from "../services/api.js";

/* ─── estilos inline ────────────────────────────────────────────────── */
const S = {
  page: {
    minHeight: "100vh",
    background: "#0a1a12",
    color: "#e8f5e9",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: "0 0 80px",
  },
  hero: {
    padding: "48px 40px 32px",
    maxWidth: 900,
    margin: "0 auto",
  },
  heroTitle: {
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: 700,
    margin: "0 0 8px",
    color: "#e8f5e9",
    letterSpacing: "-0.5px",
  },
  heroSub: {
    fontSize: 16,
    color: "#7aab8a",
    margin: 0,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#4caf50",
    fontSize: 14,
    cursor: "pointer",
    padding: "16px 40px 0",
    display: "block",
    fontFamily: "inherit",
  },
  section: {
    maxWidth: 900,
    margin: "0 auto 24px",
    padding: "0 40px",
  },
  sectionCard: {
    background: "#0f2318",
    border: "1px solid #1e3a27",
    borderRadius: 16,
    padding: "32px",
  },
  sectionNumber: {
    fontSize: 13,
    fontWeight: 600,
    color: "#4caf50",
    letterSpacing: "0.04em",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#e8f5e9",
    margin: "0 0 6px",
  },
  sectionDesc: {
    fontSize: 14,
    color: "#7aab8a",
    margin: "0 0 24px",
  },
  /* cards de método */
  methodGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  methodCard: (chosen) => ({
    background: chosen ? "#122b1a" : "#0a1a12",
    border: chosen ? "2px solid #4caf50" : "1px solid #1e3a27",
    borderRadius: 12,
    padding: "24px 20px 20px",
    cursor: "pointer",
    textAlign: "left",
    color: "#e8f5e9",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  }),
  methodIcon: {
    fontSize: 20,
    marginBottom: 12,
    display: "block",
    color: "#4caf50",
  },
  methodName: {
    display: "block",
    fontWeight: 700,
    fontSize: 16,
    marginBottom: 6,
    color: "#e8f5e9",
  },
  methodDesc: {
    display: "block",
    fontSize: 13,
    color: "#7aab8a",
    marginBottom: 16,
    lineHeight: 1.5,
  },
  selectedBadge: {
    fontSize: 13,
    color: "#4caf50",
    fontWeight: 600,
  },
  selectLink: {
    fontSize: 13,
    color: "#4caf50",
    fontWeight: 600,
    cursor: "pointer",
    background: "none",
    border: "none",
    fontFamily: "inherit",
    padding: 0,
  },
  /* upload */
  uploadZone: {
    border: "1.5px dashed #2e5c3a",
    borderRadius: 12,
    padding: "36px 20px",
    textAlign: "center",
    marginBottom: 24,
    background: "#0a1a12",
  },
  uploadArrow: {
    fontSize: 24,
    color: "#4caf50",
    marginBottom: 8,
  },
  uploadTitle: {
    fontWeight: 700,
    fontSize: 15,
    color: "#e8f5e9",
    marginBottom: 4,
  },
  uploadFormats: {
    fontSize: 13,
    color: "#7aab8a",
    marginBottom: 12,
  },
  chooseBtn: {
    background: "none",
    border: "1px solid #7aab8a",
    color: "#e8f5e9",
    borderRadius: 6,
    padding: "6px 16px",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    marginRight: 8,
  },
  fileNameSpan: {
    fontSize: 13,
    color: "#7aab8a",
  },
  successText: {
    color: "#4caf50",
    fontSize: 13,
    marginTop: 8,
  },
  /* sequências */
  seqGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  seqLabel: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 14,
    fontWeight: 600,
    color: "#b2d8b8",
  },
  seqCount: {
    fontWeight: 400,
    color: "#7aab8a",
    fontSize: 13,
  },
  textarea: {
    background: "#0a1a12",
    border: "1px solid #1e3a27",
    borderRadius: 8,
    color: "#e8f5e9",
    fontFamily: "'Courier New', monospace",
    fontSize: 13,
    padding: "10px 12px",
    resize: "vertical",
    minHeight: 140,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    lineHeight: 1.6,
  },
  hint: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 16,
    background: "#0a1a12",
    border: "1px solid #1e3a27",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#7aab8a",
  },
  hintIcon: { color: "#4caf50", flexShrink: 0 },
  /* parâmetros */
  paramsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },
  paramLabel: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 14,
    fontWeight: 600,
    color: "#b2d8b8",
  },
  numberInput: {
    background: "#0a1a12",
    border: "1px solid #1e3a27",
    borderRadius: 8,
    color: "#e8f5e9",
    fontFamily: "inherit",
    fontSize: 16,
    padding: "10px 12px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  /* erro */
  errorBox: {
    maxWidth: 900,
    margin: "0 auto 16px",
    padding: "0 40px",
  },
  errorInner: {
    background: "#2a1010",
    border: "1px solid #7c2020",
    borderRadius: 10,
    padding: "14px 18px",
    color: "#f28b82",
    fontSize: 14,
  },
  /* ações */
  actions: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "0 40px",
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },
  clearBtn: {
    background: "none",
    border: "1px solid #2e5c3a",
    color: "#7aab8a",
    borderRadius: 10,
    padding: "12px 24px",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  submitBtn: (loading) => ({
    background: loading ? "#2e5c3a" : "#4caf50",
    border: "none",
    color: "#0a1a12",
    borderRadius: 10,
    padding: "12px 32px",
    fontSize: 15,
    fontWeight: 700,
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    opacity: loading ? 0.7 : 1,
    transition: "background 0.15s",
  }),
};

/* ─── parser de arquivo ─────────────────────────────────────────────── */
function parseFile(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.some((line) => line.startsWith(">"))) {
    const sequences = [];
    let current = "";
    for (const line of lines) {
      if (line.startsWith(">")) {
        if (current) sequences.push(current);
        current = "";
      } else {
        current += line.replace(/\s/g, "");
      }
    }
    if (current) sequences.push(current);
    return sequences;
  }

  if (lines.length === 2) return lines;
  return [];
}

/* ─── componente ────────────────────────────────────────────────────── */
export default function SetupPage({ config, setConfig, onBack, onResult }) {
  const [mode, setMode] = useState("manual");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState("");

  const fileInput = useRef(null);

  function updateConfig(key, value) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function cleanSequence(value) {
    return String(value ?? "").toUpperCase().replace(/\s/g, "");
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!/\.(txt|fasta|fa)$/i.test(file.name)) {
      setError("Escolha um arquivo .txt, .fasta ou .fa.");
      return;
    }

    try {
      const text = await file.text();
      const sequences = parseFile(text);

      if (sequences.length !== 2) {
        setError("O arquivo precisa conter exatamente duas sequências.");
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
    setError("");

    const sequence1 = cleanSequence(config.sequence1);
    const sequence2 = cleanSequence(config.sequence2);

    if (!sequence1) { setError("Informe a sequência 1."); return; }
    if (!sequence2) { setError("Informe a sequência 2."); return; }
    if (!/^[ACGT]+$/.test(sequence1)) {
      setError("A sequência 1 contém caracteres inválidos. Use apenas A, C, G e T.");
      return;
    }
    if (!/^[ACGT]+$/.test(sequence2)) {
      setError("A sequência 2 contém caracteres inválidos. Use apenas A, C, G e T.");
      return;
    }

    const match = Number(config.match);
    const mismatch = Number(config.mismatch);
    const gap = Number(config.gap);

    if (!Number.isInteger(match) || match === 0) { setError("Match deve ser um inteiro diferente de zero."); return; }
    if (!Number.isInteger(mismatch) || mismatch === 0) { setError("Mismatch deve ser um inteiro diferente de zero."); return; }
    if (!Number.isInteger(gap) || gap === 0) { setError("Gap deve ser um inteiro diferente de zero."); return; }

    setLoading(true);
    try {
      const result = await runAlignment({ method: config.method, seq1: sequence1, seq2: sequence2, match, mismatch, gap });
      onResult(result);
    } catch (err) {
      setError(err?.message || "Não foi possível executar o alinhamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={S.page}>

      <button style={S.backBtn} onClick={onBack}>← Voltar</button>

      {/* HERO */}
      <div style={S.hero}>
        <h1 style={S.heroTitle}>Configure seu alinhamento</h1>
        <p style={S.heroSub}>Escolha o método, informe as sequências e defina os parâmetros.</p>
      </div>

      {/* 01 — MÉTODO */}
      <div style={S.section}>
        <div style={S.sectionCard}>
          <div style={S.sectionNumber}>01. Método de alinhamento</div>
          <p style={S.sectionDesc}>Escolha como deseja comparar as sequências.</p>

          <div style={S.methodGrid}>

            <button
              style={S.methodCard(config.method === "global")}
              onClick={() => updateConfig("method", "global")}
            >
              <span style={S.methodIcon}>↔</span>
              <span style={S.methodName}>Alinhamento Global</span>
              <span style={S.methodDesc}>
                Needleman-Wunsch: compara as sequências de ponta a ponta.
              </span>
              {config.method === "global"
                ? <span style={S.selectedBadge}>✓ Selecionado</span>
                : <span style={S.selectLink}>Selecionar</span>
              }
            </button>

            <button
              style={S.methodCard(config.method === "local")}
              onClick={() => updateConfig("method", "local")}
            >
              <span style={S.methodIcon}>🔍</span>
              <span style={S.methodName}>Alinhamento Local</span>
              <span style={S.methodDesc}>
                Smith-Waterman: procura regiões semelhantes entre as sequências.
              </span>
              {config.method === "local"
                ? <span style={S.selectedBadge}>✓ Selecionado</span>
                : <span style={S.selectLink}>Selecionar</span>
              }
            </button>

          </div>
        </div>
      </div>

      {/* 02 — SEQUÊNCIAS */}
      <div style={S.section}>
        <div style={S.sectionCard}>
          <div style={S.sectionNumber}>02. Sequências de DNA</div>
          <p style={S.sectionDesc}>Digite as sequências ou carregue um arquivo com as duas.</p>

          {/* upload zone */}
          <div style={S.uploadZone}>
            <div style={S.uploadArrow}>↑</div>
            <div style={S.uploadTitle}>Carregar arquivo</div>
            <div style={S.uploadFormats}>Formatos .txt, .fasta e .fa</div>

            <input
              ref={fileInput}
              hidden
              type="file"
              accept=".txt,.fasta,.fa"
              onChange={handleFileChange}
            />

            <button style={S.chooseBtn} onClick={() => fileInput.current?.click()}>
              Escolher arquivo
            </button>
            <span style={S.fileNameSpan}>
              {filename || "Nenhum arquivo escolhido"}
            </span>

            {filename && <p style={S.successText}>✓ {filename} carregado com sucesso</p>}
          </div>

          {/* textareas */}
          <div style={S.seqGrid}>
            <label style={S.seqLabel}>
              <span>
                Sequência 1{" "}
                <span style={S.seqCount}>
                  {cleanSequence(config.sequence1).length} caracteres
                </span>
              </span>
              <textarea
                style={S.textarea}
                spellCheck="false"
                value={config.sequence1}
                onChange={(e) => updateConfig("sequence1", e.target.value)}
                placeholder="EX.: ACGTACGT"
              />
            </label>

            <label style={S.seqLabel}>
              <span>
                Sequência 2{" "}
                <span style={S.seqCount}>
                  {cleanSequence(config.sequence2).length} caracteres
                </span>
              </span>
              <textarea
                style={S.textarea}
                spellCheck="false"
                value={config.sequence2}
                onChange={(e) => updateConfig("sequence2", e.target.value)}
                placeholder="EX.: ACGTTCGT"
              />
            </label>
          </div>

          <div style={S.hint}>
            <span style={S.hintIcon}>ℹ</span>
            <span>São aceitas somente as bases A, C, G e T. Letras minúsculas são convertidas automaticamente.</span>
          </div>
        </div>
      </div>

      {/* 03 — PARÂMETROS */}
      <div style={S.section}>
        <div style={S.sectionCard}>
          <div style={S.sectionNumber}>03. Parâmetros de pontuação</div>
          <p style={S.sectionDesc}>Valores inteiros diferentes de zero. Ex.: Match 2, Mismatch −1, Gap −2.</p>

          <div style={S.paramsGrid}>
            <label style={S.paramLabel}>
              Match
              <input
                style={S.numberInput}
                type="number"
                step="1"
                value={config.match}
                onChange={(e) => updateConfig("match", e.target.value)}
              />
            </label>
            <label style={S.paramLabel}>
              Mismatch
              <input
                style={S.numberInput}
                type="number"
                step="1"
                value={config.mismatch}
                onChange={(e) => updateConfig("mismatch", e.target.value)}
              />
            </label>
            <label style={S.paramLabel}>
              Gap
              <input
                style={S.numberInput}
                type="number"
                step="1"
                value={config.gap}
                onChange={(e) => updateConfig("gap", e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      {/* ERRO */}
      {error && (
        <div style={S.errorBox}>
          <div style={S.errorInner}>⚠ {error}</div>
        </div>
      )}

      {/* AÇÕES */}
      <div style={S.actions}>
        <button
          style={S.clearBtn}
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
          style={S.submitBtn(loading)}
          disabled={loading}
          onClick={submit}
        >
          {loading ? "Calculando…" : "Iniciar alinhamento →"}
        </button>
      </div>

    </main>
  );
}