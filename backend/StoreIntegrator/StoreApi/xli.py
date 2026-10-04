from fake_useragent import UserAgent
import json
import re
from html.parser import HTMLParser
from urllib.parse import urljoin

import requests

ua = UserAgent()
BASE_URL = "https://xli.com.ua/"
SEARCH_URL = "https://xli.com.ua/index.php"
HEADERS = {
    "User-Agent": ua.random,
    "Accept-Language": "uk-UA,uk;q=0.9"
}


class ProductParser(HTMLParser):
    _void_tags = {
        "area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr",
    }

    def __init__(self, market):
        super().__init__()
        self.products = []
        self.product = None
        self.depth = 0
        self.captures = []
        self.market = market

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        classes = attributes.get("class", "").split()

        if self.product is None:
            if tag == "div" and "ds-module-item" in classes:
                self.product = {
                    "title": "",
                    "price_text": "",
                    "imgUrl": "",
                    "url": "",
                    "market": self.market
                }
                self.depth = 1
            else:
                return
        elif tag not in self._void_tags:
            self.depth += 1

        if tag == "a" and "ds-module-title" in classes:
            href = attributes.get("href", "")
            self.product["url"] = urljoin(BASE_URL, href) if href else ""
            self.captures.append(("title", self.depth))
        elif tag == "div" and "ds-price-new" in classes:
            self.captures.append(("price_text", self.depth))
        elif tag == "img" and not self.product["imgUrl"]:
            image_url = attributes.get("src", "")
            if image_url:
                self.product["imgUrl"] = urljoin(BASE_URL, image_url)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self._void_tags:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if self.product is None:
            return

        self.captures = [
            capture for capture in self.captures if capture[1] != self.depth
        ]
        if tag not in self._void_tags:
            self.depth -= 1

        if self.depth == 0:
            title = re.sub(r"\s+", " ", self.product["title"]).strip()
            if title:
                self.products.append({
                    "title": title,
                    "price": self._parse_price(self.product["price_text"]),
                    "imgUrl": self.product["imgUrl"],
                    "url": self.product["url"],
                    "market": self.market
                })
            self.product = None
            self.captures = []

    def handle_data(self, data):
        if self.product is None:
            return

        for field, _ in self.captures:
            self.product[field] += data

    @staticmethod
    def _parse_price(value):
        match = re.search(r"\d[\d\s\u00a0\u202f]*(?:[.,]\d{1,2})?", value)
        if not match:
            return 0.00

        normalized = re.sub(r"\s", "", match.group())
        normalized = normalized.replace("\u00a0", "").replace("\u202f", "")
        if "," in normalized and "." in normalized:
            decimal_separator = "," if normalized.rfind(",") > normalized.rfind(".") else "."
            grouping_separator = "." if decimal_separator == "," else ","
            normalized = normalized.replace(grouping_separator, "")
            normalized = normalized.replace(decimal_separator, ".")
        else:
            normalized = normalized.replace(",", ".")

        try:
            return float(normalized)
        except ValueError:
            return 0.00


def parse(title, market):
    try:
        response = requests.get(
            SEARCH_URL,
            params={"route": "product/search", "search": title},
            headers=HEADERS,
            timeout=15,
        )
        response.raise_for_status()
    except requests.RequestException as error:
        print(f"Помилка запиту до XLI: {error}")
        return []

    parser = ProductParser(market)
    parser.feed(response.text)
    return parser.products


if __name__ == "__main__":
    products = parse("комп'ютер")
    print(json.dumps(products, ensure_ascii=False, indent=4))
