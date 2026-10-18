# 🧬 DNA Align — Alinhamento de Duas Sequências de DNA

Trabalho prático da disciplina **Tópicos em Bioinformática** — Ciência da Computação · UFPI  
**Professor:** Luiz Cláudio Demes da Mata Sousa  
**Integrantes:** Monnik Luianne Oliveira Nascimento Veloso Barbosa · Benjamin Pessoa Vale Filho

---

## 📋 Descrição

Aplicação web para alinhamento de exatamente duas sequências de DNA por execução, implementando dois algoritmos clássicos de programação dinâmica:

- **Needleman-Wunsch** — alinhamento global: compara as sequências de ponta a ponta
- **Smith-Waterman** — alinhamento local: encontra a região de maior similaridade entre as sequências

O programa constrói e exibe a matriz de programação dinâmica, registra as direções do traceback, reconstrói o alinhamento, calcula o score final e permite exportar todos os resultados em arquivos.

---

## 🗂️ Estrutura do projeto

```
alinhamento-de-sequencias-de-DNA/
│
├── backend/
│   ├── main.py              # API FastAPI — endpoints /align e /health
│   ├── alignment.py         # Orquestra a execução e monta o resultado
│   ├── needleman_wunsch.py  # Implementação do alinhamento global
│   ├── smith_waterman.py    # Implementação do alinhamento local
│   ├── matrix.py            # Criação e inicialização das matrizes
│   └── validation.py        # Validação das entradas e leitura de arquivos
│
├── frontend/
│   └── src/
│       ├── App.jsx                        # Componente raiz e controle de telas
│       ├── main.jsx                       # Ponto de entrada React
│       ├── styles.css                     # Estilos globais
│       ├── services/
│       │   └── api.js                     # Algoritmos, validação e lógica cliente
│       └── components/
│           ├── LandingPage.jsx            # Tela inicial
│           ├── SetupPage.jsx              # Configuração do alinhamento
│           ├── ResultPage.jsx             # Resultados, matrizes e exportação
│           ├── AlignmentView.jsx          # Exibição visual do alinhamento
│           ├── AlignmentSelector.jsx      # Seletor de alinhamentos (local)
│           ├── ScoreMatrix.jsx            # Tabela da matriz de pontuação
│           ├── TracebackMatrix.jsx        # Tabela da matriz de traceback
│           └── StepByStep.jsx             # Animação célula a célula
│
├── data/
│   └── exemplos/
│       ├── duas_sequencias.fasta          # Exemplo de arquivo FASTA
│       ├── seq1.txt                       # Exemplo sequência 1
│       └── seq2.txt                       # Exemplo sequência 2
│
├── requirements.txt         # Dependências Python
└── README.md
```

---

## ⚙️ Pré-requisitos

Antes de rodar o projeto, certifique-se de ter instalado:

| Ferramenta | Versão mínima | Como verificar |
|---|---|---|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |

---

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/alinhamento-de-sequencias-de-DNA.git
cd alinhamento-de-sequencias-de-DNA
```

### 2. Instale as dependências do backend

Na pasta raiz do projeto:

```bash
pip install -r requirements.txt
```

### 3. Instale as dependências do frontend

```bash
cd frontend
npm install
cd ..
```

---

## ▶️ Como rodar

O projeto precisa de dois terminais rodando ao mesmo tempo.

### Terminal 1 — Backend

Na pasta raiz do projeto:

```bash
uvicorn backend.main:app --reload
```

O servidor vai iniciar em `http://localhost:8000`. Para confirmar, abra essa URL no navegador — deve aparecer:

```json
{"message": "API de alinhamento de sequências funcionando."}
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

O servidor de desenvolvimento vai iniciar em `http://localhost:5173`.

Abra **http://localhost:5173** no navegador para usar a aplicação.

---

## 🖥️ Como usar

### 1. Tela inicial

Ao abrir a aplicação, clique em **Iniciar** para ir à tela de configuração.

---

### 2. Configuração do alinhamento

#### Método de alinhamento
Escolha entre:
- **Alinhamento Global (Needleman-Wunsch):** alinha as sequências do início ao fim, inserindo gaps onde necessário. Ideal para sequências de tamanho similar e alta similaridade global.
- **Alinhamento Local (Smith-Waterman):** encontra a subregião de maior similaridade entre as sequências, ignorando as extremidades menos similares.

#### Sequências de DNA
As sequências podem ser inseridas de duas formas:

**Digitando manualmente:**
- Cole ou digite as sequências nos campos Sequência 1 e Sequência 2
- Apenas as bases `A`, `C`, `G` e `T` são aceitas
- Letras minúsculas são convertidas automaticamente para maiúsculas

**Carregando arquivo:**
- Clique em **Escolher arquivo**
- São aceitos arquivos `.txt` e `.fasta`
- O arquivo deve conter exatamente duas sequências

Formato `.fasta` esperado:
```
>Seq1
ACGTAC
>Seq2
ACGTTC
```

Formato `.txt` esperado (uma sequência por linha):
```
ACGTAC
ACGTTC
```

#### Parâmetros de pontuação

| Parâmetro | Regra | Exemplo |
|---|---|---|
| Match | Inteiro **positivo** | `2` |
| Mismatch | Inteiro **negativo** | `-1` |
| Gap | Inteiro **negativo** | `-2` |

Clique em **Iniciar alinhamento** para executar.

---

### 3. Tela de resultados

A tela de resultados é dividida em 7 painéis:

#### 01 — Alinhamento
Exibe as duas sequências alinhadas com indicação visual:
- `|` — match (bases iguais)
- `.` — mismatch (bases diferentes)
- ` ` (espaço) — gap (inserção ou deleção)

No alinhamento local, se houver mais de um alinhamento com o mesmo score máximo, um seletor permite navegar entre eles.

#### 02 — Matriz de pontuação
Tabela completa com os valores calculados para cada célula (i, j). O caminho do traceback aparece destacado. O controle **passo a passo** permite visualizar o preenchimento célula a célula, útil para entender a progressão da programação dinâmica.

#### 03 — Matriz de traceback
Tabela com as direções registradas durante o preenchimento:
- `↖` — diagonal (match ou mismatch)
- `↑` — vertical (gap em Seq2)
- `←` — horizontal (gap em Seq1)

O caminho percorrido no traceback aparece destacado.

#### 04 — Comparação Local × Global
Permite executar o método oposto com as mesmas sequências e parâmetros sem precisar voltar à tela de configuração. O resultado aparece inline com o score e o alinhamento formatado.

#### 05 — Complexidade do algoritmo
Exibe a complexidade assintótica dos algoritmos:
- **Tempo:** O(m × n) — cada célula é calculada exatamente uma vez
- **Memória:** O(m × n) — a matriz completa é mantida para traceback e visualização
- Mostra os valores reais de m, n e o total de células calculadas para o alinhamento atual

#### 06 — Parâmetros utilizados
Resumo dos valores de Match, Mismatch e Gap usados no alinhamento.

#### 07 — Exportar resultados
Quatro opções de exportação:

| Botão | Arquivo gerado | Conteúdo |
|---|---|---|
| Relatório TXT + Matrizes CSV | `relatorio.txt` + `relatorio_matrizes.csv` | Resumo completo + matrizes |
| Matriz de pontuação CSV | `matriz_pontuacao.csv` | Valores numéricos da matriz |
| Matriz traceback CSV | `matriz_traceback.csv` | Direções de cada célula (↖ ↑ ←) |
| Alinhamento CSV | `alinhamento.csv` | Posição, Seq1, Indicador, Seq2 |

---

## 🔬 Exemplo de uso

**Entrada:**
- Seq1: `ACGTAC`
- Seq2: `ACGTTC`
- Método: Global
- Match: `2` · Mismatch: `-1` · Gap: `-2`

**Saída esperada:**
```
Seq1: A C G T A C
      | | | | . |
Seq2: A C G T T C

Score: 9
```

---

## 📐 Algoritmos implementados

### Needleman-Wunsch (Global)

Inicialização:
```
F(i, 0) = i × gap
F(0, j) = j × gap
```

Recorrência:
```
F(i,j) = max(
  F(i-1, j-1) + score(Seq1[i], Seq2[j]),
  F(i-1, j)   + gap,
  F(i,   j-1) + gap
)
```

Traceback: da célula inferior direita até a origem.

### Smith-Waterman (Local)

Inicialização: toda a primeira linha e coluna com `0`.

Recorrência:
```
H(i,j) = max(
  0,
  H(i-1, j-1) + score(Seq1[i], Seq2[j]),
  H(i-1, j)   + gap,
  H(i,   j-1) + gap
)
```

Traceback: da célula de maior valor até encontrar uma célula com valor `0`.

**Prioridade em empates:** diagonal > vertical > horizontal — garante resultados determinísticos para qualquer entrada.

---

## 🧪 Casos de teste

| Seq1 | Seq2 | Método | Match | Mismatch | Gap | Score esperado |
|---|---|---|---|---|---|---|
| `ACGTAC` | `ACGTTC` | Global | 2 | -1 | -2 | 9 |
| `ACGT` | `ACGT` | Global | 2 | -1 | -2 | 8 |
| `TTTACGTACGTTT` | `ACGT` | Local | 2 | -1 | -2 | 8 |
| `AAAA` | `TTTT` | Local | 2 | -1 | -2 | 0 |