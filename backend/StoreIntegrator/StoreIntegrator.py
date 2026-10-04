from flask import Flask, request, jsonify
from StoreApi import atb, auchan, core4ik, novus, rukavychka, silpo, xli

app = Flask(__name__)

storeApis = {
    "atbmarket": atb,
    "auchan": auchan,
    "core4ik": core4ik,
    "novus": novus,
    "rukavychka": rukavychka,
    "silpo": silpo,
    "xli": xli
}

@app.route('/')
def index():
    return jsonify({'response': 'ok'})

@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    title = data.get('title')
    links = data.get('links')
    print(links)

    response = []

    for link in links:
        for storeKey in storeApis.keys():
            if storeKey in link.get("market").lower():
                products = storeApis.get(storeKey).parse(title, link.get("market"))
                response += products
                break
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, port=4568)