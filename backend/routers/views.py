from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")

router = APIRouter()

@router.get("/control", response_class=HTMLResponse)
def panel_control(request: Request):
    return templates.TemplateResponse(
        "panel_control.html",
        {"request": request}
    )

@router.get("/ambulancia/{id}", response_class=HTMLResponse)
def panel_ambulancia(request: Request, id: int):
    return templates.TemplateResponse(
        "panel_ambulancia.html",
        {"request": request, "id": id}
    )