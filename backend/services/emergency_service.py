import random
import math
from datetime import datetime
from services.ambulance_service import ambulancias
from services.metric_service import registrar_servicio
from services.riesgo_service import df

accidente_activo = None

def distancia(lat1, lon1, lat2, lon2):
    return math.sqrt((lat1-lat2)**2 + (lon1-lon2)**2)

def generar_emergencia():
    global accidente_activo

    if accidente_activo:
        return {"error": "Ya hay emergencia activa"}

    lat = random.uniform(4.55, 4.75)
    lng = random.uniform(-74.20, -74.05)

    disponibles = [a for a in ambulancias if a["estado"] == "DISPONIBLE"]

    if not disponibles:
        return {"error": "No hay ambulancias disponibles"}

    amb = min(
        disponibles,
        key=lambda a: distancia(a["lat"], a["lng"], lat, lng)
    )

    amb["estado"] = "EN_RUTA"

    accidente_activo = {
        "lat": lat,
        "lng": lng,
        "ambulancia": amb["id"],
        "inicio": datetime.now()
    }

    return accidente_activo

def obtener_emergencia(id: int):
    global accidente_activo

    if not accidente_activo:
        return {"activa": False}

    if accidente_activo["ambulancia"] != id:
        return {"activa": False}

    return {
        "activa": True,
        "lat": accidente_activo["lat"],
        "lng": accidente_activo["lng"]
    }

def finalizar_servicio(id: int, hora_actual: int = None):
    global accidente_activo

    amb = next(a for a in ambulancias if a["id"] == id)

    if accidente_activo:
        tiempo = (datetime.now() - accidente_activo["inicio"]).seconds
        registrar_servicio(id, tiempo)

    amb["estado"] = "DISPONIBLE"
    accidente_activo = None

    # 🔥 Redistribuir ambulancias
    if hora_actual is not None:
        redistribuir_ambulancias(hora_actual)

    return {"ok": True}
def redistribuir_ambulancias(hora: int):

    df_hora = df[df["HORA_NUM"] == hora]

    if df_hora.empty:
        return []

    zonas = (
        df_hora.groupby(["LATITUD","LONGITUD"])
        .size()
        .sort_values(ascending=False)
        .head(len(ambulancias))
        .reset_index()
    )

    disponibles = [a for a in ambulancias if a["estado"] == "DISPONIBLE"]

    for amb, (_, row) in zip(disponibles, zonas.iterrows()):
        amb["destino"] = {
            "lat": float(row["LATITUD"]),
            "lng": float(row["LONGITUD"])
        }

    return {"ok": True}