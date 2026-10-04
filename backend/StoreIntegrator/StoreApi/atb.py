from fake_useragent import UserAgent
import requests
from bs4 import BeautifulSoup
import json

def parse(title, market):
    url = f"https://www.atbmarket.com/sch?lang=uk&location=1154&query={title}"
    
    userAgent = UserAgent()

    headers = {
        "User-Agent": userAgent.random,
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"Помилка запиту: {response.status_code}")
            return []
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        products = []
        product_cards = soup.find_all('article', class_='catalog-item')
        for card in product_cards:
            try:
                title_tag = card.find('div', class_='catalog-item__title')
                title_tag = title_tag.find('a') if title_tag else None
                title = title_tag.text.strip() if title_tag else "Без назви"

                photo_tag = card.find('a', class_='catalog-item__photo-link').picture.source['srcset'] if card.find('a', class_='catalog-item__photo-link') else ""
                
                price_integer = card.find('data', class_='product-price__top')
                price_fraction = card.find('data', class_='product-price__bottom')

                url_tag = card.find('a', class_='catalog-item__title')
                url = url_tag['href'] if url_tag else ""
                
                price = "0.00"
                if price_integer:
                    price = f"{price_integer.text.strip()}.{price_fraction.text.strip() if price_fraction else '00'}"
                
                products.append({
                    "title": title,
                    "price": price,
                    "imgUrl": photo_tag,
                    "url": url,
                    "market": market
                })
            except Exception as e:
                continue
                
        return products

    except Exception as e:
        print(f"Сталася помилка при парсингу: {e}")
        return []

if __name__ == "__main__":
    title = "хліб"
    products = parse(title)
    print(json.dumps(products, ensure_ascii=False, indent=4))