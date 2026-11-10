import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from routers import auth, clothes, customers, orders, item_requests


app = FastAPI(
    title="Clothing Store API",
    description="API for managing clothes, customers, and orders.",
    version="1.0.0",
)
# Create missing database tables outside the test environment
if os.getenv("TESTING") != "1":
    Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pure-style-clothing-store.netlify.app",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
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
