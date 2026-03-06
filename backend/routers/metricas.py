from fastapi import APIRouter
from services.metric_service import obtener_metricas

router = APIRouter()

@router.get("/api/metricas")
def metricas():
    return obtener_metricas()