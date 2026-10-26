
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from database import get_db
from models import ItemRequests, Users
from schemas import ItemRequestCreate, ItemRequestResponse
from routers.auth import get_current_user


router = APIRouter(
    prefix="/item-requests",
    tags=["Item Requests"]
)


# Allowed statuses when updating a request
class ItemRequestStatusUpdate(BaseModel):
    status: Literal["Pending", "Accepted", "Rejected"]

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, value):
        if isinstance(value, str):
            value = value.strip().capitalize()
        return value


# Submit a request for clothing not in the inventory
@router.post(
    "",
    response_model=ItemRequestResponse,
    status_code=201
)
def create_item_request(
    request_data: ItemRequestCreate,
    db: Session = Depends(get_db)
):
    new_request = ItemRequests(
        customer_name=request_data.customer_name,
        customer_phone=request_data.customer_phone,
        item_name=request_data.item_name,
        brand=request_data.brand,
        color=request_data.color,
        size=request_data.size,
        quantity=request_data.quantity,
        description=request_data.description,
        status="Pending"
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


# View all special requests (requires login)
@router.get(
    "",
    response_model=list[ItemRequestResponse]
)
def get_item_requests(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    return (
        db.query(ItemRequests)
        .order_by(ItemRequests.request_id.desc())
        .all()
    )


# View one special request (requires login)
@router.get(
    "/{request_id}",
    response_model=ItemRequestResponse
)
def get_item_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    item_request = db.query(ItemRequests).filter(
        ItemRequests.request_id == request_id
    ).first()

    if item_request is None:
        raise HTTPException(
            status_code=404,
            detail="Item request not found"
        )

    return item_request


# Accept or reject a request (requires login)
@router.patch(
    "/{request_id}",
    response_model=ItemRequestResponse
)
def update_item_request_status(
    request_id: int,
    status_data: ItemRequestStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    item_request = db.query(ItemRequests).filter(
        ItemRequests.request_id == request_id
    ).first()

    if item_request is None:
        raise HTTPException(
            status_code=404,
            detail="Item request not found"
        )

    item_request.status = status_data.status

    db.commit()
    db.refresh(item_request)

    return item_request
