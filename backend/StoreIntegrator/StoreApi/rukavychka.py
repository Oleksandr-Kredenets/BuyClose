import json
import re
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

SEARCH_URL = "https://market.rukavychka.ua/search/"
PRODUCT_CARD_SELECTORS = (
    '[itemtype*="Product"]',
    "[data-product-id]",
    ".product-layout",
    ".product-card",
    ".product-item",
    ".catalog-item",
    ".product",
)


def _as_text(value):
    if isinstance(value, dict):
        value = value.get("url") or value.get("src") or value.get("content")
    if isinstance(value, (int, float)):
        return str(value)
    return value.strip() if isinstance(value, str) else ""


def _as_price(value):
    if isinstance(value, dict):
        value = value.get("value") or value.get("amount")
    if isinstance(value, (int, float)):
        return float(value)
    if not isinstance(value, str):
        return None

    normalized = re.sub(r"[^\d,.]", "", value.replace("\xa0", "").replace(" ", ""))
    normalized = normalized.rstrip(".,")
    if "," in normalized and "." in normalized:
        decimal_index = max(normalized.rfind(","), normalized.rfind("."))
        normalized = (
            re.sub(r"[^\d]", "", normalized[:decimal_index])
            + "."
            + re.sub(r"[^\d]", "", normalized[decimal_index + 1:])
        )
    else:
        normalized = normalized.replace(",", ".")
        if normalized.count(".") > 1:
            decimal_index = normalized.rfind(".")
            normalized = (
                re.sub(r"[^\d]", "", normalized[:decimal_index])
                + "."
                + re.sub(r"[^\d]", "", normalized[decimal_index + 1:])
            )
    try:
        return float(normalized)
    except ValueError:
        return None


def _product_from_data(data):
    if not isinstance(data, dict):
        return None

    product_type = data.get("@type", "")
    if isinstance(product_type, list):
        product_type = " ".join(product_type)
    title = _as_text(
        data.get("title")
        or data.get("name")
        or data.get("productName")
    )
    has_product_fields = any(
        key in data
        for key in (
            "productName",
            "displayPrice",
            "priceValue",
            "sellingPrice",
            "imgUrl",
            "imageUrl",
            "icon",
        )
    )
    has_product_fields = has_product_fields or (
        bool(title)
        and any(key in data for key in ("price", "image", "images"))
    )
    if "Product" not in str(product_type) and not has_product_fields:
        return None

    if not title:
        return None

    price_data = data.get("offers") or {}
    if isinstance(price_data, list):
        price_data = price_data[0] if price_data else {}
    price = None
    price_values = (
        data.get("price"),
        data.get("displayPrice"),
        data.get("priceValue"),
        data.get("sellingPrice"),
        price_data.get("price") if isinstance(price_data, dict) else None,
    )
    for value in price_values:
        price = _as_price(value)
        if price is not None:
            break

    image = (
        data.get("imgUrl")
        or data.get("imageUrl")
        or data.get("image")
        or data.get("images")
        or data.get("icon")
        or ""
    )
    if isinstance(image, list):
        image = image[0] if image else ""

    return {
        "title": title,
        "price": price if price is not None else 0.00,
        "imgUrl": _as_text(image),
    }


def _products_from_data(data):
    products = []
    product = _product_from_data(data)
    if product:
        products.append(product)
    if isinstance(data, dict):
        for value in data.values():
            products.extend(_products_from_data(value))
    elif isinstance(data, list):
        for value in data:
            products.extend(_products_from_data(value))
    return products


def _text_from_card(card, selectors):
    for selector in selectors:
        element = card.select_one(selector)
        if element:
            value = element.get("content") or element.get("data-price") or element.get_text(" ", strip=True)
            if value:
                return value
    return ""


def _product_from_card(card, page_url, market):
    title = _text_from_card(
        card,
        (
            '[itemprop="name"]',
            ".fm-module-title a",
            ".fm-module-title",
            ".product-card__title",
            ".product-item__title",
            ".product-title",
            ".product__title",
            ".catalog-item__title",
            "h2",
            "h3",
            "h4",
        ),
    )
    if not title:
        title = card.get("title") or ""

    price_text = _text_from_card(
        card,
        (
            '[itemprop="price"]',
            "[data-price]",
            ".fm-module-price-new",
            ".product-card__price",
            ".product-item__price",
            ".product-price",
            ".price",
        ),
    )
    price = _as_price(price_text)

    image = ""
    image_tag = card.select_one("img")
    if image_tag:
        image = (
            image_tag.get("data-src")
            or image_tag.get("data-original")
            or image_tag.get("data-lazy-src")
            or image_tag.get("src")
            or image_tag.get("data-srcset")
            or ""
        )
        if " " in image or "," in image:
            image = image.split(",")[0].strip().split(" ")[0]
    if not image:
        source = card.select_one("source[srcset]")
        if source:
            image = source.get("srcset", "").split(",")[0].strip().split(" ")[0]

    url = card.select_one("a").get("href") if card.select_one("a") else ""

    if not title:
        return None

    return {
        "title": title.strip(),
        "price": price if price is not None else 0.00,
        "imgUrl": urljoin(page_url, image),
        "url": url,
        "market": market
    }


def parse(title, market):
    try:
        response = requests.get(
            SEARCH_URL,
            params={"search": title},
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=15,
        )
        response.raise_for_status()
    except requests.RequestException as error:
        print(f"Помилка запиту до Рукавички: {error}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    products = []

    for script in soup.select('script[type="application/ld+json"], script#__NEXT_DATA__'):
        try:
            data = json.loads(script.string or script.get_text())
        except (json.JSONDecodeError, TypeError):
            continue
        for product in _products_from_data(data):
            if product["imgUrl"]:
                product["imgUrl"] = urljoin(response.url, product["imgUrl"])
            products.append(product)

    for selector in PRODUCT_CARD_SELECTORS:
        for card in soup.select(selector):
            product = _product_from_card(card, response.url, market)
            if product:
                products.append(product)

    unique_products = []
    seen = set()
    for product in products:
        key = (product["title"], product["price"], product["imgUrl"])
        if key not in seen:
            seen.add(key)
            unique_products.append(product)

    return unique_products

if __name__ == "__main__":
    title = "хліб"
    products = parse(title)
    print(json.dumps(products, ensure_ascii=False, indent=4))