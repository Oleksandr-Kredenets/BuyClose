from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

@app.route('/')
def index():
    return jsonify({'response': 'ok'})

@app.route('/predict')
def predict():
    title = request.args.get('title')

    model = joblib.load('model.joblib')
    prediction = model.predict([title])[0]
    return jsonify({'prediction': prediction})

if __name__ == '__main__':
    app.run(debug=True, port=4567)