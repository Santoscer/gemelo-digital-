from fastapi import APIRouter
from services.emergency_service import (
    generar_emergencia,
    obtener_emergencia,
    finalizar_servicio,
    redistribuir_ambulancias
)

router = APIRouter()

@router.post("/api/generar")
def generar():
    return generar_emergencia()

@router.get("/api/emergencia/{id}")
def emergencia(id: int):
    return obtener_emergencia(id)

# ─── CAMBIO: hora es opcional (query param con default 0) ────────────────────
@router.post("/api/finalizar/{id}")
def finalizar(id: int, hora: int = 0):
    return finalizar_servicio(id, hora)

@router.get("/api/redistribuir/{hora}")
def redistribuir(hora: int):
    return redistribuir_ambulancias(hora)