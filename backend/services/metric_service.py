servicios = []

def registrar_servicio(ambulancia_id: int, tiempo: int):
    servicios.append({
        "ambulancia": ambulancia_id,
        "tiempo": tiempo
    })

def obtener_metricas():
    if not servicios:
        return {"promedio": 0, "total": 0}

    promedio = sum(s["tiempo"] for s in servicios) / len(servicios)

    return {
        "promedio": round(promedio, 2),
        "total": len(servicios)
    }