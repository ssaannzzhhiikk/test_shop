from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.orm import Session, selectinload

from app.dependencies import get_current_user, get_db
from app.models import Order, OrderItem, User
from app.schemas import OrderCreateRequest, OrderRead
from app.services.payment_service import create_pending_order

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderRead)
def create_order(
    payload: OrderCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Order:
    return create_pending_order(db, current_user, payload.items)


@router.get("/me", response_model=list[OrderRead])
def list_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Order]:
    orders = db.scalars(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.user_id == current_user.id)
        .order_by(desc(Order.created_at))
    ).all()
    return list(orders)
