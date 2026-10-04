from fastapi import APIRouter, Depends, HTTPException
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


# POST - Add an order
@router.post(
    "/orders",
    response_model=OrderResponse
)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    # Check that customer exists
    customer = db.query(Customers).filter(
        Customers.customer_id == order_data.customer_id
    ).first()

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    new_order = Orders(
        customer_id=order_data.customer_id,
        order_date=order_data.order_date
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order


# GET all orders
@router.get(
    "/orders",
    response_model=list[OrderResponse]
)
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(Orders).all()
    return orders


# GET one order with its items
@router.get(
    "/orders/{order_id}",
    response_model=OrderResponse
)
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


# POST - Add item to an order
@router.post(
    "/orders/{order_id}/items",
    response_model=OrderItemResponse
)
def add_order_item(
    order_id: int,
    item_data: OrderItemCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    # 1. Check that order exists
    order = db.query(Orders).filter(
        Orders.order_id == order_id
    ).first()

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # 2. Check that customer exists
    customer = db.query(Customers).filter(
        Customers.customer_id == order.customer_id
    ).first()

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    # 3. Check that clothing exists
    clothing = db.query(Clothes).filter(
        Clothes.clothing_id == item_data.clothing_id
    ).first()

    if clothing is None:
        raise HTTPException(
            status_code=404,
            detail="Clothing item not found"
        )

    # 4. Check stock
    if clothing.quantity < item_data.quantity:
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock"
        )

    # 5. Create order item
    new_item = OrderItems(
        order_id=order_id,
        clothing_id=item_data.clothing_id,
        quantity=item_data.quantity,
        unit_price=clothing.price
    )

    try:
        # Add order item
        db.add(new_item)

        # 6. Decrease clothing quantity
        clothing.quantity = (
            clothing.quantity - item_data.quantity
        )

        # 7. Commit both changes together
        db.commit()
        db.refresh(new_item)

        return new_item

    except Exception:
        # 8. Undo everything if something fails
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Could not add order item"
        )