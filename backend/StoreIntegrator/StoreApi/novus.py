from fake_useragent import UserAgent
import json
import requests

API_URL = "https://stores-api.zakaz.ua/stores/48201031/products/search/"
ua = UserAgent()

def parse(title, market):
    try:
        response = requests.get(
            API_URL,
            params={"q": title},
            headers={
                "User-Agent": ua.random,
                "Accept-Language": "uk-UA,uk;q=0.9",
            },
            timeout=15,
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as error:
        print(f"Помилка запиту до API NOVUS: {error}")
        return []
    except ValueError as error:
        print(f"Помилка обробки відповіді API NOVUS: {error}")
        return []

    items = data.get("results") if isinstance(data, dict) else None
    if not isinstance(items, list):
        print("Помилка парсингу NOVUS: некоректний формат списку товарів")
        return []

    products = []
    for item in items:
        if not isinstance(item, dict):
            continue

        product_title = item.get("title")
        if not isinstance(product_title, str) or not product_title.strip():
            continue

        try:
            price = float(item.get("price", 0)) / 100
        except (TypeError, ValueError):
            price = 0.00

        image = item.get("img") or {}
        if isinstance(image, dict):
            image = image.get("s350x350") or image.get("s200x200") or image.get("s150x150") or ""
        if not isinstance(image, str):
            image = ""

        product_url = item.get("web_url") or ""
        if not isinstance(product_url, str):
            product_url = ""

        products.append({
            "title": product_title.strip(),
            "price": price,
            "imgUrl": image,
            "url": product_url,
            "market": market
        })

    return products


if __name__ == "__main__":
    title = "хліб"
    products = parse(title)
    print(json.dumps(products, ensure_ascii=False, indent=4))
