from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    pass


class UserRead(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    external_id: str | None = None
    source: str = "manual"
    name: str
    brand: str | None = None
    category: str | None = None
    description: str | None = None
    image_url: str | None = None
    price: Decimal = Field(ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    stock_quantity: int = Field(default=0, ge=0)


class ProductCreate(ProductBase):
    pass


class ProductRead(ProductBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductSyncResult(BaseModel):
    fetched: int
    saved: int
    skipped: int
    total_products: int


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(ge=0)


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemRead(OrderItemBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class OrderBase(BaseModel):
    user_id: int
    status: str = "pending"
    total_amount: Decimal = Field(ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)


class OrderCreate(OrderBase):
    items: list[OrderItemCreate] = Field(default_factory=list)


class OrderRead(OrderBase):
    id: int
    created_at: datetime
    items: list[OrderItemRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
