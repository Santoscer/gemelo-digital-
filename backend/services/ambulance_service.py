ambulancias = [
    {"id": 1, "placa": "AMB-001", "lat": 4.6097, "lng": -74.0817, "estado": "DISPONIBLE", "destino": None},
    {"id": 2, "placa": "AMB-002", "lat": 4.5550, "lng": -74.1126, "estado": "DISPONIBLE", "destino": None},
    {"id": 3, "placa": "AMB-003", "lat": 4.7110, "lng": -74.0721, "estado": "DISPONIBLE", "destino": None},
    {"id": 4, "placa": "AMB-004", "lat": 4.6351, "lng": -74.1570, "estado": "DISPONIBLE", "destino": None},
    {"id": 5, "placa": "AMB-005", "lat": 4.6900, "lng": -74.1000, "estado": "DISPONIBLE", "destino": None},
]

def get_ambulancias():
    return ambulancias

def update_ambulancia(id: int, data: dict):
    amb = next(a for a in ambulancias if a["id"] == id)
    amb.update(data)
    return {"ok": True}