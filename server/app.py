from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import requests
from bs4 import BeautifulSoup
import re

app = Flask(__name__)
CORS(app)

### key and id here
OPENAI_URL = "https://api.openai.com/v1/chat/completions"

@app.route('/crawl_and_summarize', methods=['POST', 'OPTIONS'])
@cross_origin()
def crawl_and_summarize():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({'error': 'no URL'}), 400

    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    soup = BeautifulSoup(resp.text, 'html.parser')
    for tag in soup(["script", "style", "header", "footer", "nav", "aside"]):
        tag.decompose()
    raw_text = soup.get_text(separator='\n').strip()
    crawled_text = re.sub(r'\s+', ' ', raw_text)

    messages = [
        {
            "role": "system",
            "content": "You are a professional legal analysis assistant. Please read the following terms of service and provide a 200-word concise summary, highlighting the most important information, with a particular focus on user privacy. Additionally, warn users about potential data leakage risks and provide a privacy risk rating (0 being very unsafe, 10 being very secure)."
        },
        {
            "role": "user",
            "content": f"Please summarize the website’s terms of service, ensuring that all key points are retained, especially those related to user data collection, storage, sharing, or privacy policies: \n\n{crawled_text}"
        }
    ]

    try:
        response = requests.post(OPENAI_URL, json={
            "model": "gpt-4o-mini",
            "messages": messages,
            "temperature": 0,
            "max_tokens": 300
        }, headers={
            "Authorization": f"Bearer {API_KEY}",
            "OpenAI-Project": PROJECT_ID,
            "Content-Type": "application/json"
        })
        response.raise_for_status()
        result_json = response.json()
        summary = result_json["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return jsonify({"error": f"Failed to use API lol: {e}"}), 500
    
    return jsonify({'summary': summary})

if __name__ == '__main__':
    app.run(debug=True)