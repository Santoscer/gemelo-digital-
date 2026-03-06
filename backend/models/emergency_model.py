from pydantic import BaseModel

class Ambulancia(BaseModel):
    id: int
    placa: str
    lat: float
    lng: float
    estado: str