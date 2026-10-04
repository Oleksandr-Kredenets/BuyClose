from fake_useragent import UserAgent
import json
import requests

API_URL = (
    "https://sf-ecom-api.silpo.ua/v1/uk/branches/"
    "00000000-0000-0000-0000-000000000000/products"
)
PRODUCT_BASE_URL = "https://silpo.ua/product"
IMAGE_BASE_URL = "https://images.silpo.ua/v2/products/300x300/webp"
PRODUCTS_PER_PAGE = 10


def parse(title, market):
    products = []
    offset = 0
    total = None
    ua = UserAgent()

    try:
        while total is None or offset < total:
            response = requests.get(
                API_URL,
                params={
                    "search": title,
                    "limit": PRODUCTS_PER_PAGE,
                    "offset": offset,
                    "sortBy": "productsList",
                },
                headers={"User-Agent": ua.random},
                timeout=15,
            )
            response.raise_for_status()
            data = response.json()

            items = data.get("items", [])
            if not isinstance(items, list):
                print("Помилка парсингу Silpo: некоректний формат списку товарів")
                return []

            total = data.get("total", len(items))
            if not items:
                break

            for item in items:
                product_title = item.get("title")
                if not product_title:
                    continue

                slug = item.get("slug")
                product_url = f"{PRODUCT_BASE_URL}/{slug}" if slug else ""
                try:
                    price_value = item.get("displayPrice")
                    if price_value is None:
                        price_value = item.get("price", 0.00)
                    price = float(price_value)
                except (TypeError, ValueError):
                    price = 0.00

                image = item.get("icon") or ""
                if image and not image.startswith(("http://", "https://")):
                    image = f"{IMAGE_BASE_URL}/{image}"

                products.append({
                    "title": product_title.strip(),
                    "price": price,
                    "imgUrl": image,
                    "url": product_url,
                    "market": market
                })

            offset += len(items)

        return products
    except requests.RequestException as error:
        print(f"Помилка запиту до API Silpo: {error}")
        return []
    except (ValueError, TypeError) as error:
        print(f"Помилка обробки відповіді API Silpo: {error}")
        return []

if __name__ == "__main__":
    title = "хліб"
    products = parse(title)
    print(json.dumps(products, ensure_ascii=False, indent=4))