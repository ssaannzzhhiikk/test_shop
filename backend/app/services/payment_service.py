from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP

import stripe
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import settings
from app.models import Order, OrderItem, Product, User
from app.schemas import CartItemInput

ZERO_DECIMAL_CURRENCIES = {
    "BIF",
    "CLP",
    "DJF",
    "GNF",
    "JPY",
    "KMF",
    "KRW",
    "MGA",
    "PYG",
    "RWF",
    "UGX",
    "VND",
    "VUV",
    "XAF",
    "XOF",
    "XPF",
}


def create_pending_order(db: Session, user: User, cart_items: list[CartItemInput]) -> Order:
    quantities = _aggregate_quantities(cart_items)
    products = db.scalars(select(Product).where(Product.id.in_(quantities.keys()))).all()
    products_by_id = {product.id: product for product in products}

    missing_product_ids = sorted(set(quantities) - set(products_by_id))
    if missing_product_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown product IDs: {missing_product_ids}",
        )

    currencies = {product.currency for product in products_by_id.values()}
    if len(currencies) != 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Checkout requires all products to use the same currency",
        )

    currency = currencies.pop()
    order_items = []
    total_amount = Decimal("0")

    for product_id, quantity in quantities.items():
        product = products_by_id[product_id]
        unit_price = Decimal(product.price)
        total_amount += unit_price * quantity
        order_items.append(OrderItem(product=product, quantity=quantity, unit_price=unit_price))

    order = Order(
        user_id=user.id,
        status="pending",
        total_amount=total_amount,
        currency=currency,
        items=order_items,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    saved_order = db.scalar(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.id == order.id)
    )
    if saved_order is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Order could not be loaded after creation",
        )

    return saved_order


def create_checkout_session(db: Session, user: User, cart_items: list[CartItemInput]) -> tuple[str, Order]:
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe secret key is not configured",
        )

    stripe.api_key = settings.STRIPE_SECRET_KEY
    order = create_pending_order(db, user, cart_items)
    line_items = [_to_stripe_line_item(item, order.currency) for item in order.items]

    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=line_items,
        client_reference_id=str(order.id),
        customer_email=user.email,
        success_url=f"{settings.FRONTEND_URL}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.FRONTEND_URL}/checkout/cancel?order_id={order.id}",
        metadata={"order_id": str(order.id), "user_id": str(user.id)},
    )

    order.stripe_checkout_session_id = session.id
    db.commit()
    db.refresh(order)

    if not session.url:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Stripe did not return a checkout URL",
        )

    return session.url, order


def mark_order_paid_from_checkout_session(db: Session, session: dict) -> Order | None:
    metadata = session.get("metadata") or {}
    order_id = metadata.get("order_id") or session.get("client_reference_id")
    if not order_id:
        return None

    try:
        order_id_int = int(order_id)
    except (TypeError, ValueError):
        return None

    order = db.get(Order, order_id_int)
    if order is None:
        return None

    order.status = "paid"
    order.paid_at = datetime.now(timezone.utc)
    order.stripe_checkout_session_id = session.get("id") or order.stripe_checkout_session_id
    db.commit()
    db.refresh(order)

    return order


def _aggregate_quantities(cart_items: list[CartItemInput]) -> dict[int, int]:
    quantities: dict[int, int] = {}
    for item in cart_items:
        quantities[item.product_id] = quantities.get(item.product_id, 0) + item.quantity
    return quantities


def _to_stripe_line_item(order_item: OrderItem, currency: str) -> dict:
    product = order_item.product
    product_data = {
        "name": product.name,
        "metadata": {"product_id": str(product.id)},
    }
    if product.description:
        product_data["description"] = product.description[:500]
    if product.image_url:
        product_data["images"] = [product.image_url]

    return {
        "price_data": {
            "currency": currency.lower(),
            "product_data": product_data,
            "unit_amount": _to_stripe_unit_amount(order_item.unit_price, currency),
        },
        "quantity": order_item.quantity,
    }


def _to_stripe_unit_amount(amount: Decimal, currency: str) -> int:
    currency_code = currency.upper()
    multiplier = Decimal("1") if currency_code in ZERO_DECIMAL_CURRENCIES else Decimal("100")
    return int((Decimal(amount) * multiplier).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
