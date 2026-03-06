from fastapi import APIRouter
from services.riesgo_service import obtener_incidentes_por_hora, calcular_riesgo

router = APIRouter()

@router.get("/api/incidentes")
def incidentes(hora: int):
    return obtener_incidentes_por_hora(hora)

@router.get("/api/riesgo/{hora}")
def riesgo(hora: int):
    return calcular_riesgo(hora)