from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from routers import ambulancias, emergencias, hospitales, metricas, riesgo

app = FastAPI()

# ─── CAMBIO: orígenes explícitos incluyendo el puerto de Vite ────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:4173",   # Vite preview
        "http://127.0.0.1:5173",
        "*"                        # quitar en producción
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ambulancias.router)
app.include_router(emergencias.router)
app.include_router(hospitales.router)
app.include_router(metricas.router)
app.include_router(riesgo.router)

app.mount("/static", StaticFiles(directory="static"), name="static")
