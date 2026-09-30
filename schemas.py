from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field


# =========================
# CLOTHES
# =========================

# Used when adding or updating clothes
class ClothesCreate(BaseModel):
    name: str
    brand: str
    color: str
    size: str
    quantity: int = Field(ge=0)
    price: Decimal


# Used when returning clothes
class ClothesResponse(BaseModel):
    clothing_id: int
    name: str
    brand: str
    color: str
    size: str
    quantity: int
    price: Decimal

    class Config:
        from_attributes = True


# =========================
# CUSTOMERS
# =========================

# Used when creating a customer
class CustomerCreate(BaseModel):
    name: str
    phone: str


# Used when returning a customer
class CustomerResponse(BaseModel):
    customer_id: int
    name: str
    phone: str

    class Config:
        from_attributes = True


# =========================
# ORDERS
# =========================

# Used when creating an order
class OrderCreate(BaseModel):
    customer_id: int
    order_date: date


# Used when adding an item to an order
class OrderItemCreate(BaseModel):
    clothing_id: int
    quantity: int = Field(gt=0)


# Used when returning an order item
class OrderItemResponse(BaseModel):
    order_item_id: int
    clothing_id: int
    quantity: int
    unit_price: Decimal

    class Config:
        from_attributes = True


# Used when returning an order
class OrderResponse(BaseModel):
    order_id: int
    customer_id: int
    order_date: date
    items: list[OrderItemResponse]

    class Config:
        from_attributes = True
        # User registration request
        
        
class UserCreate(BaseModel):
    email: str
    password: str


# User response
class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True