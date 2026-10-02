from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return jsonify({'response': 'ok'})

@app.route('/search', methods=['POST'])
def search():
    title = data.get('title')
    links = data.get('links')
    print("[!] Title: ", title)
    print("[!] Links: ", links)

    result = [{
        title: "",
        price: 0.00,
        description: "",
        imgUrl: "",
        market: "atb"
    }]
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=4568)