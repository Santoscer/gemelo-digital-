import pandas as pd
import os

def convertir_nivel(n):

    n = str(n).upper().strip()

    if "IV" in n:
        return 4
    elif "III" in n:
        return 3
    elif "II" in n:
        return 2
    elif "I" in n:
        return 1

    return None


def cargar_hospitales():

    ruta = os.path.join(os.path.dirname(__file__), "Hospitales.csv")

    df = pd.read_csv(ruta, sep=";")

    df = df.rename(columns={
        "Nombre sede": "nombre",
        "Nivel de atención": "nivel",
        "Latitud": "lat",
        "Longitud": "lng"
    })

    df["nivel_maximo"] = df["nivel"].apply(convertir_nivel)

    return df