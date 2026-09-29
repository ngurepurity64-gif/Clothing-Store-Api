from datetime import date
from decimal import Decimal
from pydantic import BaseModel, Field


# Pydantic model for creating and updating clothes
class ClothesCreate(BaseModel):
    name: str
    size: str
    quantity: int = Field(ge=0)
    price: Decimal


# Pydantic model for responses
class ClothesResponse(BaseModel):
    clothing_id: int
    name: str
    size: str
    quantity: int
    price: Decimal

    class Config:
        from_attributes = True
        # Pydantic model for creating a customer
class CustomerCreate(BaseModel):
    name: str
    phone: str


# Pydantic model for returning a customer
class CustomerResponse(BaseModel):
    customer_id: int
    name: str
    phone: str

    class Config:
        from_attributes = True


# Pydantic model for creating an order
class OrderCreate(BaseModel):
    customer_id: int
    order_date: date


# Pydantic model for returning an order item
class OrderItemResponse(BaseModel):
    order_item_id: int
    clothing_id: int
    quantity: int
    unit_price: Decimal

    class Config:
        from_attributes = True


# Pydantic model for returning an order with its items
class OrderResponse(BaseModel):
    order_id: int
    customer_id: int
    order_date: date
    items: list[OrderItemResponse]

    class Config:
        from_attributes = True