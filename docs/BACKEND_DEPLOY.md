# 백엔드 배포 가이드 (Render)

## 🚀 Render에 Flask 백엔드 배포하기

### 1단계: Render 회원가입
1. https://render.com 접속
2. GitHub 계정으로 가입

### 2단계: requirements.txt 확인
백엔드 폴더에 이미 있음!

### 3단계: Render 배포
1. Render 대시보드 → "New +" → "Web Service"
2. GitHub 저장소 연결: `karlekchoi/3rd-Project`
3. 설정:
   - **Name**: hangeul-garden-backend
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free

### 4단계: 환경 변수 설정
Render 대시보드 → Environment → Add Environment Variable:
```
GEMINI_API_KEY=your_gemini_api_key
ALADIN_API_KEY=your_aladin_api_key
```

### 5단계: 프론트엔드 환경 변수 업데이트
Vercel → Settings → Environment Variables:
```
VITE_BACKEND_URL=https://hangeul-garden-backend.onrender.com
```

### 6단계: 재배포
- Render: 자동 배포
- Vercel: Deployments → Redeploy

---

## ⚠️ 주의사항

### Render 무료 플랜 제약
- 15분간 요청이 없으면 sleep 모드
- 첫 요청은 느림 (30초-1분)
- 월 750시간 제한

### 해결책
- Gemini 백업 시스템이 있어서 괜찮아요!
- 첫 요청만 느리고, 이후는 빠름

---

## 💰 비용

| 서비스 | 비용 |
|--------|------|
| Vercel (프론트) | 무료 |
| Render (백엔드) | 무료 |
| Gemini API | 무료 (제한 있음) |
| 알라딘 API | 무료 |

**총: 완전 무료!** 🎉
