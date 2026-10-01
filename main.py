import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi import status

from database import get_db
from models import Clothes, Customers, Orders, OrderItems, Users

from schemas import (
    ClothesCreate,
    ClothesResponse,
    CustomerCreate,
    CustomerResponse,
    OrderCreate,
    OrderItemCreate,
    OrderItemResponse,
    OrderResponse,
    UserCreate,
    UserResponse
)


# Create FastAPI application
app = FastAPI()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing from .env")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(Users).filter(Users.email == email).first()

    if user is None:
        raise credentials_exception

    return user

@app.post("/login")
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(Users).filter(
        Users.email == form_data.username
    ).first()

    if not user or not pwd_context.verify(
        form_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token_expires = timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# =========================
# HEALTH CHECK
# =========================

@app.get("/health")
def health():
    return {"status": "ok"}


# =========================
# CLOTHES
# =========================

# GET all clothes
@app.get("/clothes", response_model=list[ClothesResponse])
def get_clothes(db: Session = Depends(get_db)):
    clothes = db.query(Clothes).all()
    return clothes

# GET one clothing item
@app.get(
    "/clothes/{clothing_id}",
    response_model=ClothesResponse
)
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
@app.post(
    "/clothes",
    response_model=ClothesResponse
)
def create_clothes(
    clothes_data: ClothesCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):

    new_clothes = Clothes(
        name=clothes_data.name,
        brand=clothes_data.brand,
        color=clothes_data.color,
        size=clothes_data.size,
        quantity=clothes_data.quantity,
        price=clothes_data.price
    )

    db.add(new_clothes)
    db.commit()
    db.refresh(new_clothes)

    return new_clothes


# PUT - Update clothing
@app.put(
    "/clothes/{clothing_id}",
    response_model=ClothesResponse
)
def update_clothing(
    clothing_id: int,
    clothes_data: ClothesCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
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
    clothing.brand = clothes_data.brand
    clothing.color = clothes_data.color
    clothing.size = clothes_data.size
    clothing.quantity = clothes_data.quantity
    clothing.price = clothes_data.price

    db.commit()
    db.refresh(clothing)

    return clothing


# DELETE - Delete clothing
@app.delete("/clothes/{clothing_id}")
def delete_clothing(
    clothing_id: int,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
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


# =========================
# CUSTOMERS
# =========================

# POST - Add customer
@app.post(
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
@app.get(
    "/customers",
    response_model=list[CustomerResponse]
)
def get_customers(db: Session = Depends(get_db)):

    customers = db.query(Customers).all()

    return customers


# =========================
# ORDERS
# =========================

# POST - Add an order
@app.post(
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
@app.get(
    "/orders",
    response_model=list[OrderResponse]
)
def get_orders(db: Session = Depends(get_db)):

    orders = db.query(Orders).all()

    return orders


# GET one order with its items
@app.get(
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


# =========================
# ORDER ITEMS
# =========================

# POST - Add item to an order
@app.post(
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

        # Refresh the new order item
        db.refresh(new_item)

        return new_item

    except Exception:

        # 8. Undo everything if something fails
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Could not add order item"
        )
        
#===================================================
# USER REGISTRATION
#====================================================

@app.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # Check whether the email is already registered
    existing_user = db.query(Users).filter(
        Users.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered"
        )

    # Hash the password before storing it
    hashed_password = pwd_context.hash(user_data.password)

    # Create the new user
    new_user = Users(
        email=user_data.email,
        hashed_password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user