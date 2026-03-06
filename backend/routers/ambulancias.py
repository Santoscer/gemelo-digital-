from fastapi import APIRouter
from services.ambulance_service import get_ambulancias, update_ambulancia

router = APIRouter()

@router.get("/api/ambulancias")
def ambulancias():
    return get_ambulancias()

@router.post("/api/update/{id}")
def update(id: int, data: dict):
    return update_ambulancia(id, data)