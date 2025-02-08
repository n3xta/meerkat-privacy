from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)

@app.route('/crawl', methods=['POST'])
def crawl():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({'error': '未提供 URL'}), 400

    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    soup = BeautifulSoup(resp.text, 'html.parser')
    text = soup.get_text(separator='\n')
    return jsonify({'text': text})

if __name__ == '__main__':
    app.run(debug=True)
