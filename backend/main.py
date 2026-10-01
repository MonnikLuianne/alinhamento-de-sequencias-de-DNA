from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.alignment import run_alignment


app = FastAPI(
    title="API de Alinhamento de Sequências",
    description="API para alinhamento LOCAL e GLOBAL de duas sequências de DNA.",
    version="1.0.0"
)


# Permite que o frontend React se comunique com o backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AlignmentRequest(BaseModel):
    seq1: str
    seq2: str
    method: str
    match: int
    mismatch: int
    gap: int


@app.get("/")
def root():
    return {
        "message": "API de alinhamento de sequências funcionando."
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.post("/align")
def align(data: AlignmentRequest):
    try:
        result = run_alignment(
            seq1=data.seq1,
            seq2=data.seq2,
            method=data.method,
            match=data.match,
            mismatch=data.mismatch,
            gap=data.gap
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Erro interno durante o processamento do alinhamento."
        )