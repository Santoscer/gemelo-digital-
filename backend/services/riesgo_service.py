from data.accidentes_loader import cargar_accidentes

df = cargar_accidentes()

def obtener_incidentes_por_hora(hora: int):
    df_filtrado = df[df["HORA_NUM"] == hora]
    datos = df_filtrado[["LATITUD", "LONGITUD"]].copy()
    datos = datos.sample(n=min(1000, len(datos)))
    return datos.values.tolist()

def calcular_riesgo(hora: int):

    accidentes_por_hora = df.groupby("HORA_NUM").size()
    promedio = accidentes_por_hora.mean()
    cantidad = accidentes_por_hora.get(hora, 0)

    if cantidad < promedio * 0.8:
        nivel = "BAJO"
        color = "green"
    elif cantidad < promedio * 1.2:
        nivel = "MEDIO"
        color = "orange"
    else:
        nivel = "ALTO"
        color = "red"

    return {
        "nivel": nivel,
        "color": color,
        "cantidad": int(cantidad)
    }