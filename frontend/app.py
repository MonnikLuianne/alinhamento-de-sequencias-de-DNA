import base64
import html
import io
import csv
import sys
from pathlib import Path

import streamlit as st


# ============================================================
# LOCALIZA A RAIZ DO PROJETO
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# ============================================================
# CONFIGURAÇÃO DA PÁGINA
# ============================================================

st.set_page_config(
    page_title="Alinhamento de Sequências de DNA",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded"
)


# ============================================================
# CAMINHO DA IMAGEM DE FUNDO
# ============================================================

BACKGROUND_PATH = (
    Path(__file__).parent
    / "assets"
    / "fundo_dna.png"
)


# ============================================================
# FUNDO DA APLICAÇÃO
# ============================================================

if BACKGROUND_PATH.exists():

    with open(BACKGROUND_PATH, "rb") as image_file:
        encoded_image = base64.b64encode(
            image_file.read()
        ).decode()

    st.markdown(
        f"""
        <style>

        /* ====================================================
           FUNDO
           ==================================================== */

        .stApp {{
            background-image:
                linear-gradient(
                    rgba(248, 252, 255, 0.40),
                    rgba(248, 252, 255, 0.40)
                ),
                url("data:image/png;base64,{encoded_image}");

            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
        }}

        [data-testid="stAppViewContainer"] {{
            background: transparent;
        }}

        [data-testid="stMain"] {{
            background: transparent;
        }}


        /* ====================================================
           SIDEBAR
           ==================================================== */

        [data-testid="stSidebar"] {{
            background-color: rgba(255, 255, 255, 0.94);
            border-right: 1px solid #d5e1e9;
        }}


        /* ====================================================
           CONTAINER PRINCIPAL
           ==================================================== */

        .block-container {{
            max-width: 1400px;
            padding-top: 2rem;
            padding-bottom: 3rem;
        }}


        /* ====================================================
           TÍTULOS
           ==================================================== */

        h1,
        h2,
        h3,
        h4 {{
            color: #16324f !important;
        }}

        p {{
            color: #334e5f;
        }}


        .main-title {{
            text-align: center;
            color: #16324f;
            font-size: 2.6rem;
            font-weight: 800;
            margin-top: 0.5rem;
            margin-bottom: 0.2rem;
        }}

        .main-subtitle {{
            text-align: center;
            color: #587083;
            font-size: 1.05rem;
            margin-bottom: 2rem;
        }}


        /* ====================================================
           CARDS
           ==================================================== */

        .card {{
            background-color: rgba(255, 255, 255, 0.95);
            border: 1px solid #d7e3ea;
            border-radius: 14px;
            padding: 1.3rem;
            margin-bottom: 1rem;
            box-shadow: 0 3px 12px rgba(20, 50, 70, 0.07);
        }}


        /* ====================================================
           TEXTAREA
           ==================================================== */

        [data-testid="stTextArea"] textarea {{
            background-color: #ffffff !important;
            color: #17212b !important;

            border: 1px solid #c7d6df !important;
            border-radius: 10px !important;

            font-family: "Courier New", monospace !important;
            font-size: 1rem !important;
        }}

        [data-testid="stTextArea"] textarea::placeholder {{
            color: #8b9aa5 !important;
        }}


        /* ====================================================
           NUMBER INPUT
           ==================================================== */

        [data-testid="stNumberInput"] input {{
            background-color: #ffffff !important;
            color: #17212b !important;

            border: 1px solid #c7d6df !important;
            border-radius: 8px !important;
        }}

        [data-testid="stNumberInput"] button {{
            background-color: #eef5f8 !important;
            color: #16324f !important;
            border: none !important;
        }}


        /* ====================================================
           RADIO
           ==================================================== */

        [data-testid="stRadio"] label {{
            color: #263746 !important;
        }}

        [data-testid="stRadio"] p {{
            color: #263746 !important;
        }}


        /* ====================================================
           BOTÕES
           ==================================================== */

        .stButton > button {{
            width: 100%;
            min-height: 3rem;

            background-color: #1976a8 !important;
            color: #ffffff !important;

            border: none !important;
            border-radius: 10px !important;

            font-size: 1.05rem !important;
            font-weight: 700 !important;
        }}

        .stButton > button:hover {{
            background-color: #125d86 !important;
            color: #ffffff !important;
        }}


        /* ====================================================
           SCORE
           ==================================================== */

        .score-card {{
            background-color: rgba(255, 255, 255, 0.96);

            border: 1px solid #d5e1e8;
            border-radius: 12px;

            padding: 1rem;

            text-align: center;

            box-shadow: 0 2px 8px rgba(20, 50, 70, 0.05);
        }}

        .score-label {{
            color: #657b8b;
            font-size: 0.9rem;
            margin-bottom: 0.2rem;
        }}

        .score-value {{
            color: #16324f;
            font-size: 1.8rem;
            font-weight: 800;
        }}


        /* ====================================================
           ALINHAMENTO
           ==================================================== */

        .alignment-box {{
            background-color: #ffffff;

            border: 1px solid #d1dfe7;
            border-radius: 12px;

            padding: 1.3rem;

            font-family: "Courier New", monospace;
            font-size: 1.15rem;
            line-height: 1.8;

            overflow-x: auto;

            box-shadow: 0 2px 8px rgba(20, 50, 70, 0.06);
        }}


        /* ====================================================
           MATRIZ
           ==================================================== */

        .matrix-container {{
            background-color: rgba(255, 255, 255, 0.97);

            border: 1px solid #d1dfe7;
            border-radius: 12px;

            padding: 1rem;

            overflow-x: auto;

            box-shadow: 0 2px 8px rgba(20, 50, 70, 0.06);
        }}

        .matrix-table {{
            border-collapse: collapse;
            margin: auto;

            font-family: "Courier New", monospace;
        }}

        .matrix-table th,
        .matrix-table td {{
            border: 1px solid #c7d3dc;

            min-width: 48px;
            height: 42px;

            text-align: center;

            padding: 6px 10px;

            color: #17212b;

            background-color: #ffffff;
        }}

        .matrix-table th {{
            background-color: #edf5f9;
            color: #16324f;
            font-weight: 700;
        }}

        .traceback-cell {{
            background-color: #dff2fb !important;
            border: 2px solid #1976a8 !important;
            font-weight: 700;
        }}

        .start-cell {{
            background-color: #e8f8ef !important;
            border: 2px dashed #159957 !important;
            font-weight: 700;
        }}


        /* ====================================================
           FILE UPLOADER
           ==================================================== */

        [data-testid="stFileUploader"] {{
            background-color: rgba(255, 255, 255, 0.94);
            border-radius: 10px;
        }}

        [data-testid="stFileUploader"] section {{
            background-color: #ffffff !important;
            border: 1px dashed #b8ccd8 !important;
        }}


        /* ====================================================
           EXPANDER
           ==================================================== */

        [data-testid="stExpander"] {{
            background-color: rgba(255, 255, 255, 0.95);
            border: 1px solid #d1dfe7;
            border-radius: 10px;
        }}


        /* ====================================================
           DOWNLOAD
           ==================================================== */

        [data-testid="stDownloadButton"] button {{
            background-color: #ffffff !important;
            color: #16324f !important;

            border: 1px solid #b8ccd8 !important;
            border-radius: 8px !important;
        }}

        [data-testid="stDownloadButton"] button:hover {{
            background-color: #edf6fb !important;
        }}


        /* ====================================================
           LEGENDA
           ==================================================== */

        .legend {{
            color: #607686;
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }}


        /* ====================================================
           RESPONSIVIDADE
           ==================================================== */

        @media (max-width: 768px) {{

            .main-title {{
                font-size: 1.9rem;
            }}

            .main-subtitle {{
                font-size: 0.9rem;
            }}

            .alignment-box {{
                font-size: 0.9rem;
            }}

            .matrix-table th,
            .matrix-table td {{
                min-width: 38px;
                height: 35px;
                padding: 4px;
            }}
        }}

        </style>
        """,
        unsafe_allow_html=True
    )

else:

    st.markdown(
        """
        <style>

        .stApp {
            background-color: #f5f9fc;
        }

        [data-testid="stSidebar"] {
            background-color: #ffffff;
        }

        </style>
        """,
        unsafe_allow_html=True
    )


# ============================================================
# IMPORTAÇÃO DO BACKEND
# ============================================================

try:

    from backend.validation import validate_input

except ImportError as error:

    validate_input = None
    validation_import_error = str(error)


try:

    from backend.needleman_wunsch import run_global

except ImportError as error:

    run_global = None
    global_import_error = str(error)


try:

    from backend.smith_waterman import run_local

except ImportError as error:

    run_local = None
    local_import_error = str(error)


# ============================================================
# FUNÇÕES AUXILIARES
# ============================================================

def normalize_sequence(sequence):
    """
    Remove espaços externos e converte para maiúsculas.
    """

    if sequence is None:
        return ""

    return sequence.strip().upper()


def parse_fasta_or_txt(content):
    """
    Lê um arquivo TXT ou FASTA e obtém exatamente
    duas sequências.
    """

    lines = [
        line.strip()
        for line in content.splitlines()
        if line.strip()
    ]

    if not lines:

        return (
            False,
            "O arquivo está vazio."
        )

    # --------------------------------------------------------
    # FASTA
    # --------------------------------------------------------

    if any(
        line.startswith(">")
        for line in lines
    ):

        sequences = []
        current = ""

        for line in lines:

            if line.startswith(">"):

                if current:

                    sequences.append(
                        current
                    )

                    current = ""

            else:

                current += line

        if current:

            sequences.append(
                current
            )

    # --------------------------------------------------------
    # TXT
    # --------------------------------------------------------

    else:

        sequences = lines

    if len(sequences) != 2:

        return (
            False,
            "O arquivo deve conter exatamente "
            "duas sequências de DNA."
        )

    seq1 = normalize_sequence(
        sequences[0]
    )

    seq2 = normalize_sequence(
        sequences[1]
    )

    return True, (seq1, seq2)


def load_uploaded_file(uploaded_file):
    """
    Processa arquivo enviado pelo usuário.
    """

    extension = Path(
        uploaded_file.name
    ).suffix.lower()

    if extension not in [
        ".txt",
        ".fasta"
    ]:

        return (
            False,
            "Formato inválido. "
            "Use .txt ou .fasta."
        )

    try:

        content = (
            uploaded_file
            .getvalue()
            .decode("utf-8")
        )

    except UnicodeDecodeError:

        return (
            False,
            "Não foi possível ler o arquivo."
        )

    return parse_fasta_or_txt(
        content
    )


def direction_symbol(direction):
    """
    Converte direção para símbolo visual.
    """

    if direction is None:

        return ""

    direction = str(
        direction
    ).upper()

    if direction in [
        "DIAGONAL",
        "DIAG",
        "↖"
    ]:

        return "↖"

    if direction in [
        "VERTICAL",
        "UP",
        "↑"
    ]:

        return "↑"

    if direction in [
        "HORIZONTAL",
        "LEFT",
        "←"
    ]:

        return "←"

    return str(direction)


def alignment_indicator(
    seq1,
    seq2
):
    """
    Cria o indicador visual:

    | = match
    . = mismatch
    espaço = gap
    """

    result = ""

    for char1, char2 in zip(
        seq1,
        seq2
    ):

        if (
            char1 == "-"
            or char2 == "-"
        ):

            result += " "

        elif char1 == char2:

            result += "|"

        else:

            result += "."

    return result


def find_traceback_path(
    matrix,
    traceback_matrix,
    mode
):
    """
    Encontra as células percorridas pelo traceback.
    """

    if not matrix:

        return set(), None

    rows = len(matrix)
    cols = len(matrix[0])

    # --------------------------------------------------------
    # GLOBAL
    # --------------------------------------------------------

    if mode == "GLOBAL":

        i = rows - 1
        j = cols - 1

    # --------------------------------------------------------
    # LOCAL
    # --------------------------------------------------------

    else:

        max_value = max(
            max(row)
            for row in matrix
        )

        position = None

        for r in range(rows):

            for c in range(cols):

                if matrix[r][c] == max_value:

                    position = (
                        r,
                        c
                    )

                    break

            if position:

                break

        if position is None:

            return set(), None

        i, j = position

    start = (
        i,
        j
    )

    path = set()

    while (
        i >= 0
        and j >= 0
    ):

        path.add(
            (i, j)
        )

        if (
            mode == "LOCAL"
            and matrix[i][j] == 0
        ):

            break

        if (
            i == 0
            and j == 0
        ):

            break

        direction = (
            traceback_matrix[i][j]
        )

        if direction is None:

            break

        direction = str(
            direction
        ).upper()

        if direction in [
            "DIAGONAL",
            "DIAG",
            "↖"
        ]:

            i -= 1
            j -= 1

        elif direction in [
            "VERTICAL",
            "UP",
            "↑"
        ]:

            i -= 1

        elif direction in [
            "HORIZONTAL",
            "LEFT",
            "←"
        ]:

            j -= 1

        else:

            break

    return path, start


def render_score_matrix(
    matrix,
    seq1,
    seq2,
    traceback_matrix,
    mode
):
    """
    Mostra a matriz de pontuação.
    """

    if not matrix:

        st.info(
            "A matriz está vazia."
        )

        return

    path, start = find_traceback_path(
        matrix,
        traceback_matrix,
        mode
    )

    table = []

    # Cabeçalho

    header = "<tr>"
    header += "<th>-</th>"

    for char in seq2:

        header += (
            f"<th>{html.escape(char)}</th>"
        )

    header += "</tr>"

    table.append(header)

    # Linhas

    for i, row in enumerate(
        matrix
    ):

        row_html = "<tr>"

        if i == 0:

            row_html += "<th>-</th>"

        else:

            row_html += (
                "<th>"
                f"{html.escape(seq1[i - 1])}"
                "</th>"
            )

        for j, value in enumerate(
            row
        ):

            classes = []

            if (
                i,
                j
            ) in path:

                classes.append(
                    "traceback-cell"
                )

            if (
                mode == "LOCAL"
                and start == (
                    i,
                    j
                )
            ):

                classes.append(
                    "start-cell"
                )

            if classes:

                class_name = (
                    " ".join(classes)
                )

                row_html += (
                    f'<td class="{class_name}">'
                    f"{value}"
                    "</td>"
                )

            else:

                row_html += (
                    f"<td>{value}</td>"
                )

        row_html += "</tr>"

        table.append(
            row_html
        )

    table_html = (
        '<div class="matrix-container">'
        '<table class="matrix-table">'
        + "".join(table)
        + "</table>"
        "</div>"
    )

    st.markdown(
        table_html,
        unsafe_allow_html=True
    )

    st.caption(
        "As células destacadas representam "
        "o caminho utilizado pelo traceback."
    )


def render_traceback_matrix(
    traceback_matrix
):
    """
    Mostra a matriz de traceback.
    """

    if not traceback_matrix:

        st.info(
            "A matriz de traceback está vazia."
        )

        return

    data = []

    for row in traceback_matrix:

        data.append(
            [
                direction_symbol(direction)
                for direction in row
            ]
        )

    st.dataframe(
        data,
        use_container_width=True,
        hide_index=True
    )

    st.caption(
        "↖ Diagonal   |   ↑ Vertical   |   ← Horizontal"
    )


def create_matrix_csv(
    matrix,
    seq1,
    seq2
):
    """
    Cria CSV da matriz.
    """

    output = io.StringIO()

    writer = csv.writer(
        output
    )

    writer.writerow(
        ["-"] + list(seq2)
    )

    for i, row in enumerate(
        matrix
    ):

        label = (
            "-"
            if i == 0
            else seq1[i - 1]
        )

        writer.writerow(
            [label] + row
        )

    return output.getvalue()


def create_traceback_csv(
    traceback_matrix,
    seq1,
    seq2
):
    """
    Cria CSV do traceback.
    """

    output = io.StringIO()

    writer = csv.writer(
        output
    )

    writer.writerow(
        ["-"] + list(seq2)
    )

    for i, row in enumerate(
        traceback_matrix
    ):

        label = (
            "-"
            if i == 0
            else seq1[i - 1]
        )

        writer.writerow(
            [label]
            + [
                direction_symbol(
                    direction
                )
                for direction in row
            ]
        )

    return output.getvalue()


def create_alignment_csv(
    seq1_aln,
    seq2_aln
):
    """
    Cria CSV do alinhamento.
    """

    output = io.StringIO()

    writer = csv.writer(
        output
    )

    writer.writerow(
        [
            "Posição",
            "Seq1",
            "Indicador",
            "Seq2"
        ]
    )

    indicator = alignment_indicator(
        seq1_aln,
        seq2_aln
    )

    for i, (
        char1,
        middle,
        char2
    ) in enumerate(
        zip(
            seq1_aln,
            indicator,
            seq2_aln
        ),
        start=1
    ):

        writer.writerow(
            [
                i,
                char1,
                middle,
                char2
            ]
        )

    return output.getvalue()


def create_full_report_txt(
    algorithm_name,
    seq1_original,
    seq2_original,
    match,
    mismatch,
    gap,
    score,
    seq1_aln,
    seq2_aln,
    traceback_matrix,
    matrix
):
    """
    Cria um relatório TXT completo da execução do alinhamento.
    """

    alignment_size = len(seq1_aln)
    indicator = alignment_indicator(seq1_aln, seq2_aln)

    lines = []

    lines.append("=" * 70)
    lines.append("RELATÓRIO COMPLETO - ALINHAMENTO DE SEQUÊNCIAS DE DNA")
    lines.append("=" * 70)
    lines.append("")

    lines.append("ALGORITMO")
    lines.append("-" * 70)
    lines.append(algorithm_name)
    lines.append("")

    lines.append("SEQUÊNCIAS ORIGINAIS")
    lines.append("-" * 70)
    lines.append(f"Sequência 1: {seq1_original}")
    lines.append(f"Sequência 2: {seq2_original}")
    lines.append("")

    lines.append("PARÂMETROS")
    lines.append("-" * 70)
    lines.append(f"Match: {match}")
    lines.append(f"Mismatch: {mismatch}")
    lines.append(f"Gap: {gap}")
    lines.append("")

    lines.append("RESULTADO")
    lines.append("-" * 70)
    lines.append(f"Score final: {score}")
    lines.append(f"Tamanho do alinhamento: {alignment_size}")
    lines.append("")

    lines.append("ALINHAMENTO FINAL")
    lines.append("-" * 70)
    lines.append(f"Seq1: {seq1_aln}")
    lines.append(f"      {indicator}")
    lines.append(f"Seq2: {seq2_aln}")
    lines.append("")

    lines.append("MATRIZ DP")
    lines.append("-" * 70)
    if matrix:
        lines.append("\t".join(["-"] + list(seq2_original)))
        for i, row in enumerate(matrix):
            label = "-" if i == 0 else seq1_original[i - 1]
            lines.append("\t".join([label] + [str(value) for value in row]))
    lines.append("")

    lines.append("MATRIZ DE TRACEBACK")
    lines.append("-" * 70)
    if traceback_matrix:
        lines.append("\t".join(["-"] + list(seq2_original)))
        for i, row in enumerate(traceback_matrix):
            label = "-" if i == 0 else seq1_original[i - 1]
            directions = [direction_symbol(direction) for direction in row]
            lines.append("\t".join([label] + directions))
    lines.append("")

    lines.append("LEGENDA")
    lines.append("-" * 70)
    lines.append("| = Match")
    lines.append(". = Mismatch")
    lines.append("espaço = Gap")
    lines.append("↖ = Diagonal")
    lines.append("↑ = Vertical")
    lines.append("← = Horizontal")
    lines.append("")

    lines.append("=" * 70)
    lines.append("FIM DO RELATÓRIO")
    lines.append("=" * 70)

    return "\n".join(lines).encode("utf-8")


def execute_alignment(
    mode,
    seq1,
    seq2,
    match,
    mismatch,
    gap
):
    """
    Executa o algoritmo selecionado.
    """

    if mode == "GLOBAL":

        if run_global is None:

            return (
                None,
                "O algoritmo "
                "Needleman-Wunsch ainda "
                "não está disponível."
            )

        result = run_global(
            seq1,
            seq2,
            match,
            mismatch,
            gap
        )

        return result, None

    else:

        if run_local is None:

            return (
                None,
                "O algoritmo "
                "Smith-Waterman ainda "
                "não está disponível."
            )

        result = run_local(
            seq1,
            seq2,
            match,
            mismatch,
            gap
        )

        return result, None


# ============================================================
# CABEÇALHO
# ============================================================

st.markdown(
    """
    <div class="main-title">
        🧬 Alinhamento de Sequências de DNA
    </div>

    <div class="main-subtitle">
        Needleman-Wunsch · Smith-Waterman
    </div>
    """,
    unsafe_allow_html=True
)


# ============================================================
# SIDEBAR
# ============================================================

with st.sidebar:

    st.markdown(
        "## ⚙️ Configurações"
    )

    st.markdown(
        "### Tipo de alinhamento"
    )

    alignment_type = st.radio(
        "Método",
        [
            "Global — Needleman-Wunsch",
            "Local — Smith-Waterman"
        ],
        label_visibility="collapsed"
    )

    st.divider()

    st.markdown(
        "### Parâmetros de pontuação"
    )

    match = st.number_input(
        "Match",
        value=2,
        step=1
    )

    mismatch = st.number_input(
        "Mismatch",
        value=-1,
        step=1
    )

    gap = st.number_input(
        "Gap",
        value=-2,
        step=1
    )

    st.divider()

    st.markdown(
        "### Sobre a entrada"
    )

    st.caption(
        "Use somente as bases A, C, G e T."
    )

    st.caption(
        "Letras minúsculas são convertidas "
        "automaticamente para maiúsculas."
    )


# ============================================================
# ENTRADA
# ============================================================

st.header(
    "1. Entrada das sequências"
)

input_type = st.radio(
    "Como deseja informar as sequências?",
    [
        "✏️ Digitar manualmente",
        "📁 Carregar arquivo"
    ],
    horizontal=True
)


seq1 = ""
seq2 = ""


# ============================================================
# ENTRADA MANUAL
# ============================================================

if input_type == "✏️ Digitar manualmente":

    col1, col2 = st.columns(2)

    with col1:

        st.markdown(
            "**Sequência 1**"
        )

        seq1 = st.text_area(
            "seq1",
            placeholder="Ex.: ACGTAC",
            height=130,
            label_visibility="collapsed"
        )

    with col2:

        st.markdown(
            "**Sequência 2**"
        )

        seq2 = st.text_area(
            "seq2",
            placeholder="Ex.: ACGTTC",
            height=130,
            label_visibility="collapsed"
        )


# ============================================================
# ARQUIVO
# ============================================================

else:

    uploaded_file = st.file_uploader(
        "Selecione um arquivo .txt ou .fasta",
        type=[
            "txt",
            "fasta"
        ]
    )

    if uploaded_file is not None:

        valid_file, file_result = (
            load_uploaded_file(
                uploaded_file
            )
        )

        if valid_file:

            seq1, seq2 = file_result

            st.success(
                "Arquivo carregado com sucesso."
            )

            col1, col2 = st.columns(2)

            with col1:

                st.text_area(
                    "Sequência 1",
                    value=seq1,
                    disabled=True,
                    height=120
                )

            with col2:

                st.text_area(
                    "Sequência 2",
                    value=seq2,
                    disabled=True,
                    height=120
                )

        else:

            st.error(
                f"❌ {file_result}"
            )


# ============================================================
# PARÂMETROS
# ============================================================

st.divider()

st.subheader(
    "2. Parâmetros selecionados"
)

p1, p2, p3, p4 = st.columns(4)

with p1:

    st.metric(
        "Match",
        match
    )

with p2:

    st.metric(
        "Mismatch",
        mismatch
    )

with p3:

    st.metric(
        "Gap",
        gap
    )

with p4:

    if alignment_type.startswith(
        "Global"
    ):

        st.metric(
            "Método",
            "Global"
        )

    else:

        st.metric(
            "Método",
            "Local"
        )


# ============================================================
# BOTÃO
# ============================================================

st.divider()

execute = st.button(
    "🚀 Executar alinhamento",
    type="primary"
)


# ============================================================
# PROCESSAMENTO
# ============================================================

if execute:

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    if validate_input is None:

        st.error(
            "❌ Não foi possível importar "
            "`validate_input` do backend."
        )

        st.code(
            validation_import_error,
            language="text"
        )

        st.info(
            "Verifique se existe o arquivo "
            "`backend/validation.py`."
        )

        st.stop()

    # --------------------------------------------------------
    # VALIDAÇÃO
    # --------------------------------------------------------

    valid, message = validate_input(
        seq1,
        seq2,
        match,
        mismatch,
        gap
    )

    if not valid:

        st.error(
            f"❌ {message}"
        )

        st.stop()

    # --------------------------------------------------------
    # NORMALIZAÇÃO
    # --------------------------------------------------------

    seq1 = normalize_sequence(
        seq1
    )

    seq2 = normalize_sequence(
        seq2
    )

    # --------------------------------------------------------
    # MÉTODO
    # --------------------------------------------------------

    if alignment_type.startswith(
        "Global"
    ):

        mode = "GLOBAL"

        algorithm_name = (
            "Needleman-Wunsch"
        )

    else:

        mode = "LOCAL"

        algorithm_name = (
            "Smith-Waterman"
        )

    # --------------------------------------------------------
    # EXECUÇÃO
    # --------------------------------------------------------

    result, error = execute_alignment(
        mode,
        seq1,
        seq2,
        match,
        mismatch,
        gap
    )

    if error:

        st.warning(
            f"⚠️ {error}"
        )

        if mode == "GLOBAL":

            if run_global is None:

                st.code(
                    global_import_error,
                    language="text"
                )

        else:

            if run_local is None:

                st.code(
                    local_import_error,
                    language="text"
                )

        st.stop()

    # --------------------------------------------------------
    # RESULTADO
    # --------------------------------------------------------

    st.success(
        f"Alinhamento executado com sucesso — "
        f"{algorithm_name}"
    )

    st.header(
        "3. Resultado do alinhamento"
    )

    # ========================================================
    # INFORMAÇÕES
    # ========================================================

    st.subheader(
        "📋 Informações da execução"
    )

    info1, info2 = st.columns(2)

    with info1:

        st.markdown(
            f"""
            <div class="card">

            <strong>Método:</strong>
            {algorithm_name}

            <br><br>

            <strong>Sequência 1 original:</strong>
            <br>

            <code>{html.escape(seq1)}</code>

            <br><br>

            <strong>Sequência 2 original:</strong>
            <br>

            <code>{html.escape(seq2)}</code>

            </div>
            """,
            unsafe_allow_html=True
        )

    with info2:

        st.markdown(
            f"""
            <div class="card">

            <strong>Parâmetros:</strong>

            <br><br>

            Match:
            <strong>{match}</strong>

            <br>

            Mismatch:
            <strong>{mismatch}</strong>

            <br>

            Gap:
            <strong>{gap}</strong>

            <br><br>

            <strong>Score final:</strong>

            <br>

            <span style="
                font-size: 2rem;
                font-weight: 800;
                color: #1976a8;
            ">
                {result["score"]}
            </span>

            </div>
            """,
            unsafe_allow_html=True
        )


    # ========================================================
    # SCORE
    # ========================================================

    st.subheader(
        "🏆 Score final"
    )

    alignment_size = len(result["seq1_aln"])

    score_col, size_col = st.columns(2)

    with score_col:
        st.markdown(
            f"""
            <div class="score-card">

                <div class="score-label">
                    SCORE DO ALINHAMENTO
                </div>

                <div class="score-value">
                    {result["score"]}
                </div>

            </div>
            """,
            unsafe_allow_html=True
        )

    with size_col:
        st.markdown(
            f"""
            <div class="score-card">

                <div class="score-label">
                    TAMANHO DO ALINHAMENTO
                </div>

                <div class="score-value">
                    {alignment_size}
                </div>

            </div>
            """,
            unsafe_allow_html=True
        )


    # ========================================================
    # ALINHAMENTO
    # ========================================================

    st.subheader(
        "🧬 Alinhamento final"
    )

    seq1_aln = result["seq1_aln"]
    seq2_aln = result["seq2_aln"]

    indicator = alignment_indicator(
        seq1_aln,
        seq2_aln
    )

    st.markdown(
        f"""
        <div class="alignment-box">

            <div>
                {html.escape(seq1_aln)}
            </div>

            <div>
                {html.escape(indicator)}
            </div>

            <div>
                {html.escape(seq2_aln)}
            </div>

        </div>
        """,
        unsafe_allow_html=True
    )

    st.markdown(
        """
        <div class="legend">

            <strong>|</strong> = Match
            &nbsp;&nbsp;&nbsp;

            <strong>.</strong> = Mismatch
            &nbsp;&nbsp;&nbsp;

            <strong>espaço</strong> = Gap

        </div>
        """,
        unsafe_allow_html=True
    )


    # ========================================================
    # MATRIZ DP
    # ========================================================

    st.subheader(
        "📊 Matriz de programação dinâmica"
    )

    matrix = result[
        "matrix"
    ]

    traceback_matrix = result[
        "traceback_matrix"
    ]

    render_score_matrix(
        matrix,
        seq1,
        seq2,
        traceback_matrix,
        mode
    )


    # ========================================================
    # TRACEBACK
    # ========================================================

    st.subheader(
        "🧭 Matriz de traceback"
    )

    render_traceback_matrix(
        traceback_matrix
    )


    # ========================================================
    # EXPLICAÇÃO
    # ========================================================

    with st.expander(
        "ℹ️ Como interpretar o resultado?"
    ):

        if mode == "GLOBAL":

            st.markdown(
                """
                ### Needleman-Wunsch — alinhamento global

                O alinhamento considera as duas sequências
                inteiras.

                O traceback começa na célula inferior direita
                da matriz e segue até a origem.

                **Direções:**

                - ↖ Diagonal → alinhamento de duas bases
                - ↑ Vertical → gap na sequência 2
                - ← Horizontal → gap na sequência 1
                """
            )

        else:

            st.markdown(
                """
                ### Smith-Waterman — alinhamento local

                O algoritmo procura a região de maior
                similaridade entre as duas sequências.

                O traceback começa na célula de maior valor
                e termina quando chega a zero.

                **Direções:**

                - ↖ Diagonal → alinhamento de duas bases
                - ↑ Vertical → gap na sequência 2
                - ← Horizontal → gap na sequência 1
                """
            )


    # ========================================================
    # EXPORTAÇÃO
    # ========================================================

    st.subheader(
        "📥 Exportar resultados"
    )

    matrix_csv = create_matrix_csv(
        matrix,
        seq1,
        seq2
    )

    traceback_csv = create_traceback_csv(
        traceback_matrix,
        seq1,
        seq2
    )

    alignment_csv = create_alignment_csv(
        seq1_aln,
        seq2_aln
    )

    txt_report = create_full_report_txt(
        algorithm_name=algorithm_name,
        seq1_original=seq1,
        seq2_original=seq2,
        match=match,
        mismatch=mismatch,
        gap=gap,
        score=result["score"],
        seq1_aln=seq1_aln,
        seq2_aln=seq2_aln,
        traceback_matrix=traceback_matrix,
        matrix=matrix
    )

    d1, d2, d3, d4 = st.columns(4)

    with d1:
        st.download_button(
            "📊 Baixar matriz",
            matrix_csv,
            file_name="matriz_dp.csv",
            mime="text/csv",
            use_container_width=True
        )

    with d2:
        st.download_button(
            "🧭 Baixar traceback",
            traceback_csv,
            file_name="matriz_traceback.csv",
            mime="text/csv",
            use_container_width=True
        )

    with d3:
        st.download_button(
            "🧬 Baixar alinhamento",
            alignment_csv,
            file_name="alinhamento.csv",
            mime="text/csv",
            use_container_width=True
        )

    with d4:
        st.download_button(
            "📄 Baixar relatório TXT",
            txt_report,
            file_name="relatorio_alinhamento.txt",
            mime="text/plain",
            use_container_width=True
        )