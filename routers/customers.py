
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Customers, Users
from schemas import CustomerCreate, CustomerResponse
from routers.auth import get_current_user, require_admin


router = APIRouter()


# POST - Create a customer profile for the logged-in user
@router.post(
    "/customers",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED
)
def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    existing_customer = db.query(Customers).filter(
        Customers.user_id == current_user.id
    ).first()

    if existing_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a customer profile"
        )

    new_customer = Customers(
        name=customer_data.name,
        phone=customer_data.phone,
        user_id=current_user.id
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


# GET - Get the logged-in user's own customer profile
@router.get(
    "/customers/me",
    response_model=CustomerResponse
)
def get_my_customer_profile(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    customer = db.query(Customers).filter(
        Customers.user_id == current_user.id
    ).first()

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer profile not found"
        )

    return customer


# GET - Retrieve all customers (Administrator only)
@router.get(
    "/customers",
    response_model=list[CustomerResponse]
)
def get_customers(
    db: Session = Depends(get_db),
    current_user: Users = Depends(require_admin)
):
    return db.query(Customers).all()
