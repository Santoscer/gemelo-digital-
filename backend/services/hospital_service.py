import math
import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RUTA_CSV = os.path.join(BASE_DIR, "..", "data", "Hospitales.csv")

# Mapeo de número → romano (lo que viene del frontend es 1, 2 o 3)
NIVEL_MAP = {
    1: "I",
    2: "II",
    3: "III"
}

def distancia(lat1, lng1, lat2, lng2):
    return math.sqrt((lat1 - lat2)**2 + (lng1 - lng2)**2)

def obtener_hospital_mas_cercano(nivel, lat_acc, lng_acc):

    df = pd.read_csv(RUTA_CSV, sep=";")

    nivel_romano = NIVEL_MAP.get(nivel)
    if not nivel_romano:
        return None

    # Filtrar por nivel — la columna se llama "Nivel de atención"
    df_nivel = df[df["Nivel de atención"] == nivel_romano]

    if df_nivel.empty:
        return None

    # Encontrar el más cercano
    df_nivel = df_nivel.copy()
    df_nivel["distancia"] = df_nivel.apply(
        lambda row: distancia(lat_acc, lng_acc, row["Latitud"], row["Longitud"]),
        axis=1
    )

    hospital = df_nivel.loc[df_nivel["distancia"].idxmin()]

    return {
        "nombre": hospital["Nombre sede"],
        "lat": float(hospital["Latitud"]),
        "lng": float(hospital["Longitud"]),
        "nivel": nivel
    }