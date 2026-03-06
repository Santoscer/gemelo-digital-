from fastapi import APIRouter, HTTPException
from services.hospital_service import obtener_hospital_mas_cercano

router = APIRouter()

# ─── sin cambios: recibe nivel, lat, lng y devuelve el hospital más cercano ──
@router.get("/api/hospital/{nivel}")
def hospital(nivel: int, lat: float, lng: float):

    if nivel not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="Nivel no válido")

    resultado = obtener_hospital_mas_cercano(nivel, lat, lng)

    # ─── CAMBIO: si no hay hospital, devolver error legible en vez de None ───
    if resultado is None:
        raise HTTPException(
            status_code=404,
            detail=f"No hay hospitales de nivel {nivel} disponibles"
        )

    return resultado