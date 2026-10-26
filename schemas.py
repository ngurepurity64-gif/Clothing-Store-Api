
from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# =========================
# CLOTHES
# =========================

class ClothesCreate(BaseModel):
    name: str
    brand: str
    color: str
    size: str
    quantity: int = Field(ge=0)
    price: Decimal


class ClothesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    clothing_id: int
    name: str
    brand: str
    color: str
    size: str
    quantity: int
    price: Decimal


# =========================
# CUSTOMERS
# =========================

class CustomerCreate(BaseModel):
    name: str
    phone: str


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    customer_id: int
    name: str
    phone: str


# =========================
# ORDERS
# =========================

class OrderCreate(BaseModel):
    customer_id: int
    order_date: date


class OrderItemCreate(BaseModel):
    clothing_id: int
    quantity: int = Field(gt=0)


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_item_id: int
    clothing_id: int
    quantity: int
    unit_price: Decimal


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_id: int
    customer_id: int
    order_date: date
    items: list[OrderItemResponse]


# =========================
# USERS
# =========================

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr

# Schema for creating a special clothing request
class ItemRequestCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=100)
    customer_phone: str = Field(min_length=7, max_length=20)
    item_name: str = Field(min_length=2, max_length=100)
    brand: str | None = None
    color: str | None = None
    size: str | None = None
    quantity: int = Field(gt=0)
    description: str | None = None


# Schema for returning a special clothing request
class ItemRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    request_id: int
    customer_name: str
    customer_phone: str
    item_name: str
    brand: str | None
    color: str | None
    size: str | None
    quantity: int
    description: str | None
    status: str
