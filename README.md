# 🌺 한글정원 (Hangeul Garden)

**외국인을 위한 AI 기반 한국어 학습 플랫폼**

한글정원은 외국인 학습자가 한국어를 쉽고 재미있게 배울 수 있도록 돕는 웹 애플리케이션입니다.

---

## ✨ 주요 기능

### 📚 한글 학습
- 자음/모음 단계별 학습
- 손글씨 연습 + AI 인식
- 발음 연습 (음성 인식)

### 📖 사전
- 표준 국어 사전 + 신조어/밈 검색
- Gemini AI 기반 의미 설명
- 예문 제공

### 🎮 미니게임
- 단어 맞추기 (유사도 계산)
- 재미있게 학습하는 게임 모드

### 📕 도서 추천
- 레벨별 한국어 도서 추천
- 기분/상황 기반 맞춤 추천
- 알라딘 API 연동 (표지, 상세정보)

### 🌱 나만의 화단 (단어장)
- 단어 저장 및 폴더 관리
- 플래시카드 학습 모드

---

## 🚀 빠른 시작

### 1. 프론트엔드 실행
```bash
npm install
npm run dev
```

### 2. 백엔드 실행 (선택사항)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

> 백엔드 없이도 Gemini만으로 모든 기능 사용 가능!

---

## 🔑 환경 변수 설정

### `.env.local` (루트 폴더)
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
VITE_BACKEND_URL=http://localhost:5001
```

### `backend/.env` (백엔드 폴더)
```env
GEMINI_API_KEY=your_gemini_api_key_here
ALADIN_API_KEY=your_aladin_ttb_key
```

**API 키 발급 방법은 `/docs` 폴더의 가이드를 참고하세요!**

---

## 📁 프로젝트 구조

```
한글정원/
├─ src/                  ← 소스 코드
│  ├─ components/        ← React 컴포넌트
│  │  ├─ auth/          ← 로그인/회원가입
│  │  └─ shared/        ← 공통 컴포넌트
│  ├─ contexts/          ← Context API
│  ├─ services/          ← API 서비스
│  ├─ App.tsx           ← 메인 앱
│  └─ index.tsx         ← 진입점
├─ backend/              ← Python Flask 백엔드
│  ├─ app.py            ← Flask 서버
│  └─ backend/          ← AI 모델들
├─ public/               ← 정적 파일
│  ├─ fonts/            ← 폰트 파일
│  ├─ locales/          ← 다국어 지원
│  └─ data/             ← 학습 데이터
├─ docs/                 ← 문서 및 가이드
└─ dist/                 ← 빌드 결과물
```

---

## 🛠 기술 스택

### Frontend
- ⚛️ **React 19** + TypeScript
- 🎨 **TailwindCSS** (스타일링)
- 🔥 **Firebase** (인증)
- 🤖 **Google Gemini AI** (메인 AI 엔진)
- 📚 **i18next** (7개 언어 지원)

### Backend (선택)
- 🐍 **Flask** (Python)
- 🧠 **TrOCR** (손글씨 인식)
- 🎤 **Whisper** (음성 인식)
- 📊 **KoBERT** (텍스트 유사도)

---

## 📖 상세 문서

`/docs` 폴더에서 더 많은 정보를 확인하세요:
- `SETUP_STEPS.md` - 프로젝트 설정 가이드
- `FIREBASE_SETUP.md` - Firebase 설정
- `BOOK_RECOMMENDATION_GUIDE.md` - 도서 추천 시스템
- `ENV_SETUP_GUIDE.md` - 환경 변수 상세 설명

---

## 🌍 지원 언어

- 🇰🇷 한국어
- 🇺🇸 영어
- 🇯🇵 일본어
- 🇨🇳 중국어
- 🇻🇳 베트남어
- 🇫🇷 프랑스어
- 🇸🇪 스웨덴어

---

## 📄 라이선스

This project is licensed under the MIT License.

---

## 💬 문의

문제가 있거나 제안사항이 있으시면 이슈를 남겨주세요!

**즐거운 한국어 학습 되세요! 🌺**
