from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Clothes, Users
from schemas import ClothesCreate, ClothesResponse
from routers.auth import require_admin


router = APIRouter()


# GET all clothes - Public access
@router.get("/clothes", response_model=list[ClothesResponse])
def get_clothes(db: Session = Depends(get_db)):
    clothes = db.query(Clothes).all()
    return clothes


# GET one clothing item - Public access
@router.get(
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found"
        )

    return clothing


# POST - Add new clothes - Admin only
@router.post(
    "/clothes",
    response_model=ClothesResponse,
    status_code=status.HTTP_201_CREATED
)
def create_clothes(
    clothes_data: ClothesCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(require_admin)
):
    new_clothes = Clothes(
        name=clothes_data.name,
        brand=clothes_data.brand,
        color=clothes_data.color,
        size=clothes_data.size,
        quantity=clothes_data.quantity,
        price=clothes_data.price,
        image_url=clothes_data.image_url
    )

    db.add(new_clothes)
    db.commit()
    db.refresh(new_clothes)

    return new_clothes


# PUT - Update clothing - Admin only
@router.put(
    "/clothes/{clothing_id}",
    response_model=ClothesResponse
)
def update_clothing(
    clothing_id: int,
    clothes_data: ClothesCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(require_admin)
):
    clothing = db.query(Clothes).filter(
        Clothes.clothing_id == clothing_id
    ).first()

    if clothing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found"
        )

    clothing.name = clothes_data.name
    clothing.brand = clothes_data.brand
    clothing.color = clothes_data.color
    clothing.size = clothes_data.size
    clothing.quantity = clothes_data.quantity
    clothing.price = clothes_data.price
    clothing.image_url = clothes_data.image_url

    db.commit()
    db.refresh(clothing)

    return clothing


# DELETE - Delete clothing - Admin only
@router.delete("/clothes/{clothing_id}")
def delete_clothing(
    clothing_id: int,
    db: Session = Depends(get_db),
    current_user: Users = Depends(require_admin)
):
    clothing = db.query(Clothes).filter(
        Clothes.clothing_id == clothing_id
    ).first()

    if clothing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clothing item not found"
        )

    db.delete(clothing)
    db.commit()

    return {
        "message": "Clothing item deleted successfully"
    }
    