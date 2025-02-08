from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)

### OpenAI API and project id
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
    crawled_text = soup.get_text(separator='\n').strip()
    # return jsonify({'text': text})

    messages = [
        {
            "role": "system",
            "content": "你是一名专业法律分析助手，请阅读以下服务条款，并以200字的精炼总结保留最重要的信息，尤其关注用户隐私相关的部分，同时警告用户可能存在的数据泄露风险。请对隐私风险进行评分（0分为非常不安全，10分为非常安全）。"
        },
        {
            "role": "user",
            "content": f"请总结以下网站的服务条款，保留所有关键点，特别关注涉及用户数据收集、存储、共享或隐私相关的内容：\n\n{crawled_text}"
        }
    ]

    try:
        response = requests.post(OPENAI_URL, json={
            "model": "gpt-4o",
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