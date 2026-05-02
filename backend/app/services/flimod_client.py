from typing import Any

import httpx

FLIMOD_CATALOG_URL = "https://flimod.com/api/v1/catalog/women"
DEFAULT_PARAMS = {
    "categories": "\u0436\u0435\u043d\u0449\u0438\u043d\u044b",
    "offset": 0,
    "limit": 24,
    "priceMin": 5000,
    "priceMax": 10000000,
    "sort": "date,desc",
}


async def fetch_flimod_products(limit: int = 24) -> list[dict[str, Any]]:
    params = DEFAULT_PARAMS | {"limit": max(limit, 20)}

    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
        response = await client.get(FLIMOD_CATALOG_URL, params=params)
        response.raise_for_status()
        payload = response.json()

    return _extract_product_list(payload)


def _extract_product_list(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]

    if not isinstance(payload, dict):
        return []

    for key in ("products", "items", "data", "results", "catalog"):
        value = payload.get(key)
        if isinstance(value, list):
            return [item for item in value if isinstance(item, dict)]
        if isinstance(value, dict):
            nested = _extract_product_list(value)
            if nested:
                return nested

    return []
