# 📚 한글정원 - 책 추천 기능 설정 가이드

## 🎯 목표
Gemini AI로 책을 추천받고, 알라딘 API로 실제 책 표지 이미지를 가져오기!

---

## 🚀 빠른 시작 (3단계)

### 1️⃣ Gemini API 키 발급

1. **Google AI Studio 접속**
   ```
   https://makersuite.google.com/app/apikey
   ```

2. **"Create API key" 클릭**

3. **프로젝트 선택**
   - 새 프로젝트 생성 또는 기존 프로젝트 선택
   - ⚠️ Firebase 프로젝트와 다른 프로젝트 추천!

4. **API 키 복사 후 저장**
   ```
   예: AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q
   ```

5. **`.env.local` 파일 수정**
   ```bash
   # 프로젝트 루트 폴더의 .env.local
   VITE_GEMINI_API_KEY=여기에_새_API_키_붙여넣기
   ```

---

### 2️⃣ 백엔드 서버 실행

**알라딘 API는 CORS 문제 때문에 백엔드를 통해야 해요!**

#### **Windows CMD 방법:**

```cmd
:: 1. 백엔드 폴더로 이동
cd C:\workspace\3rd_Hangeul_Garden\backend

:: 2. 파이썬 가상환경 활성화 (있다면)
:: venv\Scripts\activate

:: 3. 필요한 패키지 설치 (처음 한 번만)
pip install -r requirements.txt

:: 4. 서버 실행!
python app.py
```

**성공 메시지:**
```
✅ 모든 모델 로딩 완료!
✨ 손글씨 인식: EasyOCR (한글 특화)
🎯 문장 유사도 모델: ko-sroberta-multitask
 * Running on http://0.0.0.0:5001
```

---

### 3️⃣ 프론트엔드 실행

**새 터미널 열기** (백엔드는 계속 실행 중)

```cmd
:: 1. 프로젝트 루트로 이동
cd C:\workspace\3rd_Hangeul_Garden

:: 2. 개발 서버 실행
npm run dev
```

**브라우저에서 확인:**
```
http://localhost:3001
```

---

## 🎨 사용 방법

### **책 추천 받기:**

1. **"Books" 메뉴** 클릭
2. **레벨 선택** (초급/중급/고급) 또는 **기분 기반 추천**
3. **추천 받기 버튼** 클릭
4. **책 표지와 정보** 확인! 📚✨

---

## 🔧 문제 해결

### **문제 1: "Gemini API has not been used" 에러**

**원인:** API 키가 잘못되었거나 프로젝트에서 활성화되지 않음

**해결:**
1. Gemini API 키 재발급
2. `.env.local` 파일에 새 키 입력
3. **개발 서버 재시작** (중요!)
   ```cmd
   Ctrl + C (중지)
   npm run dev (재시작)
   ```

---

### **문제 2: 책 표지가 안 나와요**

**원인:** 백엔드 서버가 실행되지 않음

**해결:**
```cmd
:: 백엔드 실행 확인
cd backend
python app.py
```

**확인 방법:**
```
브라우저에서 접속:
http://localhost:5001/test

→ 🌸 서버 메시지가 보이면 정상!
```

---

### **문제 3: CORS 에러**

**원인:** 브라우저가 알라딘 API 직접 접근 차단

**해결:** 이제 백엔드를 통해 호출하도록 수정했으니 해결됨! ✅

---

## 📊 전체 구조

```
사용자
  ↓
프론트엔드 (React) - Port 3001
  ↓
1. Gemini AI
   └→ 책 추천 (제목, 저자, 설명)
  
2. 백엔드 (Flask) - Port 5001
   └→ 알라딘 API
       └→ 책 표지 이미지, ISBN, 출판사 등
  
최종 결과: 📚 + 🖼️
```

---

## 💡 팁

### **개발 시 권장 순서:**

1. ✅ 백엔드 먼저 실행
2. ✅ 프론트엔드 실행
3. ✅ 브라우저에서 테스트

### **API 키 보안:**

```bash
# .env.local은 Git에 올리지 마세요!
# .gitignore에 이미 포함되어 있어요

✅ .env.local (로컬 전용)
❌ GitHub에 업로드
```

---

## 🎉 완성!

이제 다음 기능들을 사용할 수 있어요:

- ✅ AI 책 추천 (Gemini)
- ✅ 실제 책 표지 (알라딘)
- ✅ ISBN, 출판사 정보
- ✅ 책 설명

**즐거운 개발 되세요!** 🚀
