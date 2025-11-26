# 🔧 환경 변수 설정 가이드

## 📝 Step 1: .env.local 파일 만들기

프로젝트 루트 폴더(`C:\hangeul_garden`)에 `.env.local` 파일을 만들어주세요.

---

## 🔑 Step 2: OpenAI API Key 추가 (필수)

`.env.local` 파일에 다음을 추가:

```
VITE_OPENAI_API_KEY=sk-proj-여기에-당신의-OpenAI-키
```

> 이미 사용 중인 OpenAI API 키를 넣으면 됩니다!

---

## 🔐 Step 3: Firebase 설정 (Google 로그인용)

### 옵션 A: Firebase 설정하기 (추천)

#### 1️⃣ Firebase Console 접속
https://console.firebase.google.com/

#### 2️⃣ 프로젝트 만들기
- **"프로젝트 추가"** 클릭
- 프로젝트 이름: `hangeul-garden` (또는 원하는 이름)
- Google Analytics: 선택사항 (끄셔도 됩니다)

#### 3️⃣ Google 로그인 활성화
- 왼쪽 메뉴: **빌드** → **Authentication**
- **시작하기** 클릭
- **Google** 제공업체 클릭
- **사용 설정** 스위치 ON
- 프로젝트 지원 이메일 선택
- **저장** 클릭

#### 4️⃣ 웹 앱 추가
- 왼쪽 상단 **⚙️ 프로젝트 설정** 클릭
- **일반** 탭에서 아래로 스크롤
- **내 앱** 섹션에서 **</> 웹** 아이콘 클릭
- 앱 닉네임: `한글정원`
- **앱 등록** 클릭

#### 5️⃣ 설정 정보 복사
화면에 나오는 `firebaseConfig` 정보를 `.env.local`에 추가:

```
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 옵션 B: 나중에 설정하기

Firebase 설정 없이도 앱은 정상 작동합니다!
- ✅ 이메일/비밀번호 로그인 가능
- ❌ Google 로그인만 사용 불가

---

## ✅ Step 4: 완성된 .env.local 예시

```
# OpenAI API Key
VITE_OPENAI_API_KEY=sk-proj-abc123...

# Firebase (Google 로그인용)
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=hangeul-garden.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hangeul-garden
VITE_FIREBASE_STORAGE_BUCKET=hangeul-garden.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Backend URL (선택사항)
VITE_BACKEND_URL=http://localhost:5001
```

---

## 🚀 Step 5: 서버 재시작

```bash
npm run dev
```

---

## 🧪 테스트

1. 브라우저에서 http://localhost:3000 접속
2. **로그인** 클릭
3. **Google로 로그인** 버튼 확인
4. Firebase 설정했으면 → Google 로그인 팝업 ✅
5. 설정 안 했으면 → 안내 메시지 표시

---

## 💡 문제 해결

### "Firebase가 초기화되지 않았습니다"
→ `.env.local` 파일의 Firebase 설정을 확인하세요

### Google 로그인 버튼이 안 보여요
→ 서버를 재시작하세요 (`Ctrl+C` 후 `npm run dev`)

### 팝업이 안 떠요
→ 팝업 차단을 해제하세요

---

## 📁 파일 위치

```
C:\hangeul_garden\
├── .env.local          ← 여기에 만드세요!
├── package.json
├── vite.config.ts
└── ...
```

**중요**: `.env.local` 파일은 절대 Git에 커밋하지 마세요!
(이미 `.gitignore`에 포함되어 있습니다)

