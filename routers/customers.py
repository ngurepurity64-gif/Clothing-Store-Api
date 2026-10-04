from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Customers, Users
from schemas import CustomerCreate, CustomerResponse
from routers.auth import get_current_user


router = APIRouter()


# POST - Add customer
@router.post(
    "/customers",
    response_model=CustomerResponse
)
def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
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
@router.get(
    "/customers",
    response_model=list[CustomerResponse]
)
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(Customers).all()
    return customers