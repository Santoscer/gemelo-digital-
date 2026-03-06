import pandas as pd
import os

def cargar_accidentes():

    ruta = os.path.join(os.path.dirname(__file__), "datos_accidentes.csv")

    df = pd.read_csv(ruta, sep=";")

    df["FECHA_HORA"] = pd.to_datetime(
        df["FECHA"] + " " + df["HORA"],
        errors="coerce"
    )

    df["HORA_NUM"] = df["FECHA_HORA"].dt.hour
    df = df.dropna(subset=["LATITUD", "LONGITUD"])

    return df