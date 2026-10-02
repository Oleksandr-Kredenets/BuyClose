from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/')
def index():
    url = 'http://127.0.0.1:5000/api/products/search'
    payload = {'title': 'cola', 'location': {'lng': 49.8383, 'lat': 24.0232}}

    response = requests.post(url, json=payload)

    return f"<h1>{response.json()}</h1>"

if __name__ == '__main__':
    app.run(debug=True, port=4000)