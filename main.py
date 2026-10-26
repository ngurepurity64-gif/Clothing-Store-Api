
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from routers import auth, clothes, customers, orders, item_requests


# Create any missing database tables
Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="Clothing Store API",
    description="API for managing clothes, customers, and orders.",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "null"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(clothes.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(item_requests.router)
