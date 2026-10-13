
from fastapi import FastAPI

from routers import auth, clothes, customers, orders


app = FastAPI(
    title="Clothing Store API",
    description="API for managing clothes, customers, and orders.",
    version="1.0.0"
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(clothes.router)
app.include_router(customers.router)
app.include_router(orders.router)
