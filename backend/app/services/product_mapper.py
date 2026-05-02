import re
from decimal import Decimal, InvalidOperation
from typing import Any

FLIMOD_SOURCE = "flimod"
DEFAULT_CATEGORY = "\u0436\u0435\u043d\u0449\u0438\u043d\u044b"
DEFAULT_CURRENCY = "KZT"


def map_external_product(raw_product: dict[str, Any]) -> dict[str, Any] | None:
    if not isinstance(raw_product, dict):
        return None

    external_id = _first_text(raw_product, ("id", "_id", "productId", "product_id", "sku", "slug", "code"))
    name = _first_text(raw_product, ("name", "title", "productName", "product_name"))
    price = _first_decimal(raw_product, ("price", "currentPrice", "current_price", "salePrice", "sale_price", "amount"))

    if not external_id or not name or price is None:
        return None

    image_url = _extract_image_url(raw_product)
    brand = _extract_named_value(raw_product.get("brand")) or _first_text(raw_product, ("brandName", "brand_name", "manufacturer"))
    category = (
        _extract_named_value(raw_product.get("category"), preferred_keys=("full", "name", "title", "label"))
        or _extract_named_value(raw_product.get("categories"))
        or _first_text(raw_product, ("categoryName", "category_name", "section"))
        or DEFAULT_CATEGORY
    )

    return {
        "external_id": external_id,
        "source": FLIMOD_SOURCE,
        "name": name,
        "brand": brand or "Unknown",
        "category": category,
        "description": _first_text(raw_product, ("description", "shortDescription", "short_description")),
        "image_url": image_url,
        "price": price,
        "currency": _first_text(raw_product, ("currency", "currencyCode", "currency_code")) or DEFAULT_CURRENCY,
        "stock_quantity": _extract_stock_quantity(raw_product),
    }


def _first_text(raw_product: dict[str, Any], keys: tuple[str, ...]) -> str | None:
    for key in keys:
        value = raw_product.get(key)
        if value is None:
            continue
        if isinstance(value, (int, float)):
            return str(value)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


def _first_decimal(raw_product: dict[str, Any], keys: tuple[str, ...]) -> Decimal | None:
    for key in keys:
        value = raw_product.get(key)
        price = _to_decimal(value)
        if price is not None and price >= 0:
            return price
    return None


def _first_int(raw_product: dict[str, Any], keys: tuple[str, ...]) -> int | None:
    for key in keys:
        value = raw_product.get(key)
        try:
            if value is not None:
                return max(int(value), 0)
        except (TypeError, ValueError):
            continue
    return None


def _to_decimal(value: Any) -> Decimal | None:
    if isinstance(value, dict):
        for key in ("value", "amount", "price", "current"):
            price = _to_decimal(value.get(key))
            if price is not None:
                return price
        return None

    if isinstance(value, str):
        value = value.replace("\xa0", "").replace(" ", "").replace(",", ".")
        value = re.sub(r"[^0-9.]", "", value)

    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return None


def _extract_image_url(raw_product: dict[str, Any]) -> str | None:
    direct_image = _first_text(raw_product, ("image", "imageUrl", "image_url", "photo", "photoUrl", "photo_url", "thumbnail"))
    if direct_image:
        return direct_image

    for key in ("images", "photos", "gallery"):
        value = raw_product.get(key)
        image = _extract_named_value(value, preferred_keys=("url", "src", "imageUrl", "image_url", "path"))
        if image:
            return image

    return None


def _extract_stock_quantity(raw_product: dict[str, Any]) -> int:
    stock = raw_product.get("stock")
    if isinstance(stock, list):
        return len(stock)

    return _first_int(raw_product, ("stock", "stockQuantity", "stock_quantity", "quantity")) or 0


def _extract_named_value(value: Any, preferred_keys: tuple[str, ...] = ("name", "title", "label")) -> str | None:
    if isinstance(value, str) and value.strip():
        return value.strip()

    if isinstance(value, dict):
        for key in preferred_keys:
            nested = value.get(key)
            if isinstance(nested, str) and nested.strip():
                return nested.strip()
        return None

    if isinstance(value, list):
        for item in value:
            nested = _extract_named_value(item, preferred_keys)
            if nested:
                return nested

    return None
