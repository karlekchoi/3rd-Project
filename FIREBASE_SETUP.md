# 🔥 Firebase Google 로그인 설정 가이드

## 📋 Step 1: Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. **프로젝트 추가** 클릭
3. 프로젝트 이름 입력 (예: `hangeul-garden`)
4. Google Analytics 설정 (선택사항)
5. **프로젝트 만들기** 클릭

---

## 🔑 Step 2: Firebase 설정 정보 가져오기

1. Firebase Console에서 프로젝트 선택
2. 왼쪽 상단 **⚙️ 프로젝트 설정** 클릭
3. **일반** 탭 선택
4. 아래로 스크롤하여 **내 앱** 섹션 찾기
5. **</> 웹** 아이콘 클릭
6. 앱 닉네임 입력 (예: `한글정원`)
7. **앱 등록** 클릭
8. **Firebase SDK 추가** 화면에서 설정 정보 복사

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 🔐 Step 3: Google 인증 활성화

1. Firebase Console에서 왼쪽 메뉴
2. **빌드** → **Authentication** 클릭
3. **시작하기** 클릭 (처음인 경우)
4. **Sign-in method** 탭 선택
5. **Google** 찾아서 클릭
6. **사용 설정** 스위치 ON
7. 프로젝트의 공개용 이름 입력
8. 프로젝트 지원 이메일 선택
9. **저장** 클릭

---

## 📝 Step 4: 환경 변수 설정

### `.env.local` 파일 생성 (프로젝트 루트에)

```bash
# OpenAI API Key
VITE_OPENAI_API_KEY=sk-proj-your-existing-key

# Firebase Configuration (Step 2에서 복사한 값)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**⚠️ 중요**: `.env.local` 파일은 Git에 커밋하지 마세요! (이미 `.gitignore`에 포함되어 있습니다)

---

## 🔧 Step 5: Firebase 패키지 설치

터미널에서 실행:

```bash
npm install
```

(이미 `package.json`에 firebase가 추가되어 있습니다)

---

## 🧪 Step 6: 테스트

1. 서버 재시작:
   ```bash
   npm run dev
   ```

2. 브라우저에서 http://localhost:3000 접속

3. **로그인** 클릭

4. **Google로 로그인** 버튼 확인

5. Google 계정으로 로그인 테스트

---

## ✅ 완료 체크리스트

- [ ] Firebase 프로젝트 생성
- [ ] Firebase 설정 정보 복사
- [ ] Google 인증 활성화
- [ ] `.env.local` 파일 생성 및 설정
- [ ] `npm install` 실행
- [ ] 서버 재시작
- [ ] Google 로그인 테스트

---

## 🚨 문제 해결

### Firebase 초기화 실패
```
❌ Firebase 초기화 실패
```
**해결**: `.env.local` 파일의 Firebase 환경 변수를 확인하세요.

### Google 로그인 팝업 안 뜸
**해결**: Firebase Console에서 Google 인증이 활성화되어 있는지 확인하세요.

### 도메인 인증 오류
**해결**: Firebase Console → Authentication → Settings → Authorized domains에 `localhost`가 있는지 확인

---

## 📚 참고 자료

- [Firebase 공식 문서](https://firebase.google.com/docs/web/setup)
- [Firebase Authentication 가이드](https://firebase.google.com/docs/auth/web/google-signin)

