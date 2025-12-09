# 한글정원 프로젝트 설정 가이드

## ✅ 현재 사용 중인 기능

### 1. Gemini API
- 사전 검색 (한국어 단어 의미 + 신조어)
- 도서 추천 (레벨별, 기분별)
- 손글씨 인식 (빠른 속도)
- 음성 인식 (보조)

### 2. 알라딘 API
- 책 정보 조회 (표지, ISBN, 설명)
- 도서 메타데이터

### 3. Firebase
- 사용자 인증 (로그인/회원가입)
- 사용자 데이터 저장

### 4. Flask 백엔드
- TrOCR 손글씨 인식 (정확도 높음)
- Whisper 음성 인식
- KoBERT 텍스트 유사도 계산

---

## 🚀 빠른 시작

### 프론트엔드 실행
```bash
npm install
npm run dev
```

### 백엔드 실행 (선택사항)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

---

## 📁 프로젝트 구조

```
3rd_Hangeul_Garden/
├─ src/              ← 소스 코드
│  ├─ components/    ← React 컴포넌트
│  ├─ contexts/      ← Context API
│  └─ services/      ← API 서비스
├─ backend/          ← Python Flask 백엔드
├─ public/           ← 정적 파일
├─ docs/             ← 문서
└─ dist/             ← 빌드 결과물
```

---

## 🔑 환경 변수 설정

### `.env.local` (프론트엔드)
```
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_BACKEND_URL=http://localhost:5001
```

### `backend/.env` (백엔드)
```
ALADIN_API_KEY=your_aladin_api_key
GEMINI_API_KEY=your_gemini_api_key
```

---

## 📖 상세 문서

다른 가이드 파일들을 확인하세요:
- `FIREBASE_SETUP.md` - Firebase 설정
- `BOOK_RECOMMENDATION_GUIDE.md` - 도서 추천 시스템
- `ENV_SETUP_GUIDE.md` - 환경 변수 상세 가이드
