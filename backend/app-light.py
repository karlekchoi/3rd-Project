from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import os
import google.generativeai as genai

# .env 파일 로드
load_dotenv()

app = Flask(__name__)

# CORS 설정
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Gemini API 설정
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# 알라딘 API 설정
ALADIN_API_KEY = os.getenv('ALADIN_API_KEY')
ALADIN_API_URL = "http://www.aladin.co.kr/ttb/api/ItemSearch.aspx"

@app.route('/')
def home():
    return jsonify({"status": "ok", "message": "Hangeul Garden Backend (Light)"})

@app.route('/recommend/books', methods=['POST'])
def recommend_books():
    """
    책 추천 API (Gemini + 알라딘)
    """
    try:
        data = request.json
        rec_type = data.get('type', 'level')
        
        if rec_type == 'level':
            level = data.get('level', '초급')
            books = recommend_by_level(level)
        else:  # mood
            mood = data.get('mood', '')
            situation = data.get('situation', '')
            books = recommend_by_mood(mood, situation)
        
        # 알라딘 API로 책 정보 가져오기
        enriched_books = []
        for book in books[:5]:  # 최대 5권
            aladin_info = search_aladin(book['title'], book.get('author', ''))
            if aladin_info:
                enriched_books.append({
                    **book,
                    **aladin_info
                })
            else:
                enriched_books.append(book)
        
        return jsonify(enriched_books)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def recommend_by_level(level):
    """Gemini로 레벨별 책 추천"""
    if not GEMINI_API_KEY:
        return []
    
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    prompt = f"""한국어 학습자를 위한 {level} 수준의 책 5권을 추천해주세요.

응답은 반드시 다음 JSON 형식으로만 작성하세요:
[
  {{"title": "책 제목", "author": "저자명", "description": "추천 이유 2-3문장"}}
]

중요: 한국어로 된 책만 추천, {level} 수준에 맞는 난이도, 실제 존재하는 인기 도서만"""
    
    try:
        response = model.generate_content(prompt)
        text = response.text
        # JSON 추출
        import json
        import re
        json_match = re.search(r'\[[\s\S]*\]', text)
        if json_match:
            return json.loads(json_match.group())
        return []
    except:
        return []

def recommend_by_mood(mood, situation):
    """Gemini로 기분별 책 추천"""
    if not GEMINI_API_KEY:
        return []
    
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    prompt = f"""한국어 학습자를 위한 책 추천:
- 기분: {mood}
- 상황: {situation if situation else '일반'}

위 조건에 맞는 한국어 책 5권을 추천해주세요.

응답은 반드시 다음 JSON 형식으로만 작성하세요:
[
  {{"title": "책 제목", "author": "저자명", "description": "추천 이유 2-3문장"}}
]"""
    
    try:
        response = model.generate_content(prompt)
        text = response.text
        import json
        import re
        json_match = re.search(r'\[[\s\S]*\]', text)
        if json_match:
            return json.loads(json_match.group())
        return []
    except:
        return []

def search_aladin(title, author=''):
    """알라딘 API로 책 정보 검색"""
    if not ALADIN_API_KEY:
        return None
    
    try:
        params = {
            'TTBKey': ALADIN_API_KEY,
            'Query': title,
            'QueryType': 'Title',
            'MaxResults': 1,
            'start': 1,
            'SearchTarget': 'Book',
            'output': 'js',
            'Version': '20131101'
        }
        
        response = requests.get(ALADIN_API_URL, params=params, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            items = data.get('item', [])
            
            if items:
                book = items[0]
                return {
                    'coverImageUrl': book.get('cover', ''),
                    'isbn': book.get('isbn13', ''),
                    'publisher': book.get('publisher', ''),
                    'pubdate': book.get('pubDate', ''),
                    'price': book.get('priceStandard', 0),
                    'link': book.get('link', '')
                }
        
        return None
    except:
        return None

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
