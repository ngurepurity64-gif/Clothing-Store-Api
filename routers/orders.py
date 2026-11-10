from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Clothes, Customers, Orders, OrderItems, Users
from schemas import (
    OrderCreate,
    OrderItemCreate,
    OrderItemResponse,
    OrderResponse,
)
from routers.auth import get_current_user


router = APIRouter()


# Helper - Check whether a user owns an order
def check_order_access(order, current_user):
    if current_user.role == "admin":
        return

    if order.customer.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to access this order"
        )


# POST - Create an order for the logged-in customer
@router.post(
    "/orders",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED
)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    customer = db.query(Customers).filter(
        Customers.user_id == current_user.id
    ).first()

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Create your customer profile before placing an order"
        )

    new_order = Orders(
        customer_id=customer.customer_id,
        order_date=order_data.order_date
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order


# GET all orders - Admin sees all; customer sees their own
@router.get(
    "/orders",
    response_model=list[OrderResponse]
)
def get_orders(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    query = db.query(Orders)

    if current_user.role != "admin":
        query = query.join(Customers).filter(
            Customers.user_id == current_user.id
        )

    return query.all()


# GET one order - Owner or administrator only
@router.get(
    "/orders/{order_id}",
    response_model=OrderResponse
)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    order = db.query(Orders).filter(
        Orders.order_id == order_id
    ).first()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    check_order_access(order, current_user)

    return order


# POST - Add an item to an order
@router.post(
    "/orders/{order_id}/items",
    response_model=OrderItemResponse,
    status_code=status.HTTP_201_CREATED
)
def add_order_item(
    order_id: int,
    item_data: OrderItemCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    # 1. Find the order
    order = db.query(Orders).filter(
        Orders.order_id == order_id
    ).first()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # 2. Check order ownership
    check_order_access(order, current_user)

    # 3. Find the clothing item
    clothing = db.query(Clothes).filter(
        Clothes.clothing_id == item_data.clothing_id
    ).with_for_update().first()

    if clothing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found"
        )

    # 4. Check available stock
    if clothing.quantity < item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock"
        )

    # 5. Create the order item and update stock
    new_item = OrderItems(
        order_id=order_id,
        clothing_id=item_data.clothing_id,
        quantity=item_data.quantity,
        unit_price=clothing.price
    )

    try:
        db.add(new_item)

        clothing.quantity -= item_data.quantity

        db.commit()
        db.refresh(new_item)

        return new_item

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not add order item"
        )
    