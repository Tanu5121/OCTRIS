from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import router
from .database import init_db


app = FastAPI(
    title="OCTRIS MSG Operator",
    description=(
        "Notification and operator decision service "
        "for the OCTRIS traffic-risk control room."
    ),
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "msg-operator",
    }


app.include_router(router)