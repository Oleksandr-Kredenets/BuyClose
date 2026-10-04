from fake_useragent import UserAgent
import json
import re
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


SEARCH_URL = "https://core4ik.com/ua/site_search"
ua = UserAgent()

def _parse_price(value):
    if not isinstance(value, str):
        return 0.00

    normalized = re.sub(r"[^\d,.]", "", value.replace("\xa0", "").replace(" ", ""))
    if not normalized:
        return 0.00

    decimal_index = max(normalized.rfind(","), normalized.rfind("."))
    if decimal_index >= 0:
        whole = re.sub(r"\D", "", normalized[:decimal_index])
        fraction = re.sub(r"\D", "", normalized[decimal_index + 1:])
        normalized = f"{whole}.{fraction}" if fraction else whole
    else:
        normalized = re.sub(r"\D", "", normalized)

    try:
        return float(normalized)
    except ValueError:
        return 0.00


def parse(title, market):
    try:
        response = requests.get(
            SEARCH_URL,
            params={"search_term": title},
            headers={
                "User-Agent": ua.random,
                "Accept-Language": "uk-UA,uk;q=0.9",
            },
            timeout=15,
        )
        response.raise_for_status()
    except requests.RequestException as error:
        print(f"Помилка запиту до Core4ik: {error}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    products = []

    for card in soup.select(
        'li[data-qaid="product_block"], li[data-qaid="product-block"], '
        "li.cs-product-gallery__item"
    ):
        title_tag = card.select_one('[data-qaid="product_name"]')
        title_link = card.select_one('a[aria-label="product_name"]')
        if not title_link:
            title_link = card.select_one("a.cs-goods-title")
        if not title_link:
            title_link = card.select_one(".cs-product-gallery__title a")

        product_title = (
            title_tag.get_text(" ", strip=True)
            if title_tag
            else title_link.get_text(" ", strip=True) if title_link else ""
        )
        if not product_title:
            continue

        price_tag = (
            card.select_one('[data-qaid="price-field"]')
            or card.select_one(".cs-goods-price__value_type_current")
            or card.select_one(
                ".cs-product-gallery__price "
                ".cs-goods-price__value:not(.cs-goods-price__value_type_old)"
            )
            or card.select_one(".cs-product-gallery__price")
        )
        price_text = price_tag.get_text(" ", strip=True) if price_tag else ""

        image_tag = card.select_one(".cs-image-holder__image, img")
        image_url = ""
        if image_tag:
            image_url = (
                image_tag.get("src")
                or image_tag.get("data-src")
                or image_tag.get("data-lazy-src")
                or ""
            )

        image_link = card.select_one("a[href]")
        product_url = (
            title_link.get("href", "")
            if title_link
            else image_link.get("href", "") if image_link else ""
        )
        products.append({
            "title": product_title,
            "price": _parse_price(price_text),
            "imgUrl": urljoin(response.url, image_url) if image_url else "",
            "url": urljoin(response.url, product_url) if product_url else "",
            "market": market
        })

    return products


if __name__ == "__main__":
    title = "комп'ютер"
    products = parse(title)
    print(json.dumps(products, ensure_ascii=False, indent=4))
