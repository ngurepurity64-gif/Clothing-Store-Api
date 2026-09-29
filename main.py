from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Clothes, Customers, Orders, OrderItems
from schemas import (
    ClothesCreate,
    ClothesResponse,
    CustomerCreate,
    CustomerResponse,
    OrderCreate,
    OrderResponse
)


# Create the FastAPI application
app = FastAPI()


# Health check endpoint
@app.get("/health")
def health():
    return {"status": "ok"}


# GET all clothes
@app.get("/clothes", response_model=list[ClothesResponse])
def get_clothes(db: Session = Depends(get_db)):
    clothes = db.query(Clothes).all()
    return clothes


# GET one clothing item by ID
@app.get("/clothes/{clothing_id}", response_model=ClothesResponse)
def get_clothing(
    clothing_id: int,
    db: Session = Depends(get_db)
):
    clothing = db.query(Clothes).filter(
        Clothes.clothing_id == clothing_id
    ).first()

    if clothing is None:
        raise HTTPException(
            status_code=404,
            detail="Clothing item not found"
        )

    return clothing


# POST - Add new clothes
@app.post("/clothes", response_model=ClothesResponse)
def create_clothes(
    clothes_data: ClothesCreate,
    db: Session = Depends(get_db)
):
    new_clothes = Clothes(
        name=clothes_data.name,
        size=clothes_data.size,
        quantity=clothes_data.quantity,
        price=clothes_data.price
    )

    db.add(new_clothes)
    db.commit()
    db.refresh(new_clothes)

    return new_clothes


# PUT - Update one clothing item
@app.put("/clothes/{clothing_id}", response_model=ClothesResponse)
def update_clothing(
    clothing_id: int,
    clothes_data: ClothesCreate,
    db: Session = Depends(get_db)
):
    clothing = db.query(Clothes).filter(
        Clothes.clothing_id == clothing_id
    ).first()

    if clothing is None:
        raise HTTPException(
            status_code=404,
            detail="Clothing item not found"
        )

    clothing.name = clothes_data.name
    clothing.size = clothes_data.size
    clothing.quantity = clothes_data.quantity
    clothing.price = clothes_data.price

    db.commit()
    db.refresh(clothing)

    return clothing


# DELETE - Delete one clothing item
@app.delete("/clothes/{clothing_id}")
def delete_clothing(
    clothing_id: int,
    db: Session = Depends(get_db)
):
    clothing = db.query(Clothes).filter(
        Clothes.clothing_id == clothing_id
    ).first()

    if clothing is None:
        raise HTTPException(
            status_code=404,
            detail="Clothing item not found"
        )

    db.delete(clothing)
    db.commit()

    return {
        "message": "Clothing item deleted successfully"
    }


# POST - Add a customer
@app.post("/customers", response_model=CustomerResponse)
def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db)
):
    new_customer = Customers(
        name=customer_data.name,
        phone=customer_data.phone
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


# GET all customers
@app.get("/customers", response_model=list[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(Customers).all()

    return customers


# POST - Add an order
@app.post("/orders")
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db)
):
    new_order = Orders(
        customer_id=order_data.customer_id,
        order_date=order_data.order_date
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order


# GET one order with its items
@app.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    order = db.query(Orders).filter(
        Orders.order_id == order_id
    ).first()

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return order