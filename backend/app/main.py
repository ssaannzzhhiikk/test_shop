from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import User
from app.routers import auth, products
from app.services.security import get_password_hash

_ = models

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
    description="Educational full-stack ecommerce catalog demo.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    create_dev_admin_user()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


def create_dev_admin_user() -> None:
    if not settings.CREATE_DEV_ADMIN or not settings.DEV_ADMIN_EMAIL or not settings.DEV_ADMIN_PASSWORD:
        return

    admin_email = settings.DEV_ADMIN_EMAIL.lower()
    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == admin_email).first()
        if existing_user:
            existing_user.password_hash = get_password_hash(settings.DEV_ADMIN_PASSWORD)
            existing_user.full_name = existing_user.full_name or settings.DEV_ADMIN_FULL_NAME
            existing_user.role = "admin"
            db.commit()
            return

        admin = User(
            email=admin_email,
            password_hash=get_password_hash(settings.DEV_ADMIN_PASSWORD),
            full_name=settings.DEV_ADMIN_FULL_NAME,
            role="admin",
        )
        db.add(admin)
        db.commit()
    finally:
        db.close()
