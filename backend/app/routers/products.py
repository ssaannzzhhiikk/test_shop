from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from httpx import HTTPError
from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.dependencies import get_admin_user, get_db
from app.models import Product, User
from app.schemas import ProductRead, ProductSyncResult
from app.services.flimod_client import fetch_flimod_products
from app.services.product_mapper import FLIMOD_SOURCE, map_external_product

router = APIRouter(prefix="/api/products", tags=["products"])


@router.post("/sync-external", response_model=ProductSyncResult)
async def sync_external_products(
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_admin_user),
) -> ProductSyncResult:
    try:
        return await _sync_external_products(db)
    except HTTPError as exc:
        raise HTTPException(status_code=502, detail="External catalog sync failed") from exc


@router.get("", response_model=list[ProductRead])
async def list_products(
    search: str | None = None,
    brand: str | None = None,
    category: str | None = None,
    priceMin: Decimal | None = Query(default=None, ge=0),
    priceMax: Decimal | None = Query(default=None, ge=0),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=24, ge=1, le=100),
    sort: Literal["date,desc", "date,asc", "price,desc", "price,asc", "name,asc", "name,desc"] = "date,desc",
    db: Session = Depends(get_db),
) -> list[Product]:
    await _ensure_minimum_products(db)

    statement = select(Product)

    if search:
        term = f"%{search}%"
        statement = statement.where(
            or_(
                Product.name.ilike(term),
                Product.description.ilike(term),
                Product.brand.ilike(term),
                Product.category.ilike(term),
            )
        )
    if brand:
        statement = statement.where(Product.brand.ilike(f"%{brand}%"))
    if category:
        statement = statement.where(Product.category.ilike(f"%{category}%"))
    if priceMin is not None:
        statement = statement.where(Product.price >= priceMin)
    if priceMax is not None:
        statement = statement.where(Product.price <= priceMax)

    statement = statement.order_by(_sort_column(sort)).offset(offset).limit(limit)
    return list(db.scalars(statement).all())


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(product_id: int, db: Session = Depends(get_db)) -> Product:
    await _ensure_minimum_products(db)

    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


async def _ensure_minimum_products(db: Session) -> None:
    total_products = db.scalar(select(func.count()).select_from(Product)) or 0
    if total_products < 20:
        try:
            await _sync_external_products(db)
        except HTTPError:
            return


async def _sync_external_products(db: Session) -> ProductSyncResult:
    raw_products = await fetch_flimod_products(limit=24)
    saved = 0
    skipped = 0

    for raw_product in raw_products:
        product_data = map_external_product(raw_product)
        if product_data is None:
            skipped += 1
            continue

        exists = db.scalar(
            select(Product).where(
                Product.external_id == product_data["external_id"],
                Product.source == FLIMOD_SOURCE,
            )
        )
        if exists:
            skipped += 1
            continue

        try:
            with db.begin_nested():
                db.add(Product(**product_data))
            saved += 1
        except IntegrityError:
            skipped += 1

    db.commit()
    total_products = db.scalar(select(func.count()).select_from(Product)) or 0

    return ProductSyncResult(
        fetched=len(raw_products),
        saved=saved,
        skipped=skipped,
        total_products=total_products,
    )


def _sort_column(sort: str):
    sort_field, sort_direction = sort.split(",", maxsplit=1)
    columns = {
        "date": Product.created_at,
        "price": Product.price,
        "name": Product.name,
    }
    column = columns[sort_field]
    return desc(column) if sort_direction == "desc" else asc(column)
