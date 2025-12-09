from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import os
import json
import re

# .env 파일 로드
load_dotenv()

app = Flask(__name__)

# CORS 설정 - 모든 출처 허용
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

# Gemini API 설정
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

# 알라딘 API 설정
ALADIN_API_KEY = os.getenv('ALADIN_API_KEY')
ALADIN_API_URL = "http://www.aladin.co.kr/ttb/api/ItemSearch.aspx"

@app.route('/')
def home():
    return jsonify({
        "status": "ok", 
        "message": "Hangeul Garden Backend - Light Version",
        "endpoints": ["/recommend/books"]
    })

@app.route('/recommend/books', methods=['POST', 'OPTIONS'])
def recommend_books():
    """책 추천 API - Gemini AI + 알라딘 API"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        rec_type = data.get('type', 'level')
        
        # Gemini로 책 추천 받기
        if rec_type == 'level':
            level = data.get('level', '초급')
            books = recommend_by_level_gemini(level)
        else:  # mood
            mood = data.get('mood', '')
            situation = data.get('situation', '')
            purpose = data.get('purpose', '')
            books = recommend_by_mood_gemini(mood, situation, purpose)
        
        if not books:
            return jsonify([]), 200
        
        # 알라딘 API로 책 정보 보강
        enriched_books = []
        for book in books[:5]:
            aladin_info = search_aladin_book(book.get('title', ''), book.get('author', ''))
            if aladin_info:
                # Gemini 추천 + 알라딘 정보 결합
                enriched_books.append({
                    'title': aladin_info.get('title', book.get('title')),
                    'author': aladin_info.get('author', book.get('author')),
                    'description': book.get('description', ''),
                    'coverImageUrl': aladin_info.get('cover', ''),
                    'isbn': aladin_info.get('isbn13', ''),
                    'publisher': aladin_info.get('publisher', ''),
                    'pubdate': aladin_info.get('pubDate', ''),
                    'price': aladin_info.get('priceStandard', 0),
                    'link': aladin_info.get('link', '')
                })
            else:
                # 알라딘에서 못 찾으면 Gemini 정보만
                enriched_books.append(book)
        
        return jsonify(enriched_books)
    
    except Exception as e:
        print(f"Error in recommend_books: {e}")
        return jsonify({"error": str(e)}), 500

def recommend_by_level_gemini(level):
    """Gemini API로 레벨별 책 추천"""
    if not GEMINI_API_KEY:
        return []
    
    prompt = f"""한국어 학습자를 위한 {level} 수준의 책 5권을 추천해주세요.

응답은 반드시 다음 JSON 형식으로만 작성하세요:
[
  {{"title": "책 제목", "author": "저자명", "description": "왜 이 책을 추천하는지 2-3문장으로 설명"}}
]

중요:
- 한국어로 된 책만 추천
- {level} 수준에 맞는 난이도
- 실제로 존재하는 인기 도서만
- 반드시 JSON 배열로만 응답"""

    try:
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            json={
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.8,
                    "maxOutputTokens": 2048
                }
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            text = data['candidates'][0]['content']['parts'][0]['text']
            
            # JSON 추출
            json_match = re.search(r'\[[\s\S]*\]', text)
            if json_match:
                return json.loads(json_match.group())
        
        return []
    except Exception as e:
        print(f"Gemini API error: {e}")
        return []

def recommend_by_mood_gemini(mood, situation='', purpose=''):
    """Gemini API로 기분별 책 추천"""
    if not GEMINI_API_KEY:
        return []
    
    prompt = f"""한국어 학습자를 위한 책 추천:
- 기분: {mood}
{f"- 상황: {situation}" if situation else ""}
{f"- 목적: {purpose}" if purpose else ""}

위 조건에 맞는 한국어 책 5권을 추천해주세요.

응답은 반드시 다음 JSON 형식으로만 작성하세요:
[
  {{"title": "책 제목", "author": "저자명", "description": "왜 이 책이 현재 기분/상황에 맞는지 2-3문장으로 설명"}}
]

중요:
- 한국어로 된 책만 추천
- 실제로 존재하는 인기 도서만
- 현재 기분과 상황에 공감하는 추천 이유 작성
- 반드시 JSON 배열로만 응답"""

    try:
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            json={
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.9,
                    "maxOutputTokens": 2048
                }
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            text = data['candidates'][0]['content']['parts'][0]['text']
            
            json_match = re.search(r'\[[\s\S]*\]', text)
            if json_match:
                return json.loads(json_match.group())
        
        return []
    except Exception as e:
        print(f"Gemini API error: {e}")
        return []

def search_aladin_book(title, author=''):
    """알라딘 API로 책 정보 검색"""
    if not ALADIN_API_KEY:
        return None
    
    try:
        params = {
            'TTBKey': ALADIN_API_KEY,
            'Query': title,
            'QueryType': 'Title',
            'MaxResults': 3,
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
                # 저자명이 주어진 경우 매칭 시도
                if author:
                    for item in items:
                        if author in item.get('author', ''):
                            return item
                
                # 매칭 실패하면 첫 번째 결과 반환
                return items[0]
        
        return None
    except Exception as e:
        print(f"Aladin API error: {e}")
        return None

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
