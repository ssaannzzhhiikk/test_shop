import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import get_current_user, get_db
from app.models import User
from app.schemas import CheckoutSessionCreate, CheckoutSessionRead, WebhookRead
from app.services.payment_service import create_checkout_session, mark_order_paid_from_checkout_session

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("/create-checkout-session", response_model=CheckoutSessionRead)
def create_checkout(
    payload: CheckoutSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CheckoutSessionRead:
    try:
        checkout_url, order = create_checkout_session(db, current_user, payload.items)
    except stripe.error.StripeError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Stripe Checkout failed") from exc

    return CheckoutSessionRead(checkout_url=checkout_url, order_id=order.id)


@router.post("/webhook", response_model=WebhookRead)
async def stripe_webhook(
    request: Request,
    stripe_signature: str | None = Header(default=None, alias="stripe-signature"),
    db: Session = Depends(get_db),
) -> WebhookRead:
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe webhook secret is not configured",
        )
    if not stripe_signature:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing Stripe signature")

    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=stripe_signature,
            secret=settings.STRIPE_WEBHOOK_SECRET,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook payload") from exc
    except stripe.error.SignatureVerificationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature") from exc

    if event.get("type") == "checkout.session.completed":
        session = event["data"]["object"]
        mark_order_paid_from_checkout_session(db, session)

    return WebhookRead()
