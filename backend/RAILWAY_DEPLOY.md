# 🚂 Railway 백엔드 배포 가이드

## ✅ 사전 준비

1. [Railway](https://railway.app) 계정 생성
2. GitHub 저장소 준비 완료
3. API 키 준비:
   - `GEMINI_API_KEY` (필수)
   - `ALADIN_API_KEY` (필수)
   - `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` (선택사항)

---

## 📝 배포 단계

### 1️⃣ Railway 프로젝트 생성

1. [Railway Dashboard](https://railway.app/dashboard) 접속
2. **"New Project"** 클릭
3. **"Deploy from GitHub repo"** 선택
4. GitHub 저장소 선택: `3rd-Project`
5. **"Add Service"** → **"Empty Service"** 선택

### 2️⃣ 백엔드 디렉토리 설정

1. Railway 대시보드에서 생성된 서비스 클릭
2. **Settings** 탭으로 이동
3. **Root Directory** 설정:
   ```
   backend
   ```
4. **Save** 클릭

### 3️⃣ 빌드 및 시작 명령어 설정

**Settings** → **Deploy** 섹션에서:

- **Build Command**: (비워두기 - Railway가 자동으로 `pip install -r requirements.txt` 실행)
- **Start Command**: 
  ```
  python app.py
  ```

또는 **Procfile** 사용 (이미 생성됨):
```
web: python app.py
```

### 4️⃣ 환경 변수 설정 ⭐ (중요!)

**Variables** 탭에서 다음 환경 변수 추가:

| 변수 이름 | 값 | 설명 |
|-----------|-------|------|
| `GEMINI_API_KEY` | `AIzaSy...` | Gemini API 키 (필수) |
| `ALADIN_API_KEY` | `ttb...` | 알라딘 API 키 (필수) |
| `NAVER_CLIENT_ID` | `...` | 네이버 API Client ID (선택) |
| `NAVER_CLIENT_SECRET` | `...` | 네이버 API Client Secret (선택) |
| `PORT` | `5001` | 포트 번호 (Railway가 자동 설정하지만 명시 가능) |

> ⚠️ **주의**: 
> - Railway는 자동으로 `PORT` 환경 변수를 제공합니다
> - 코드에서 `os.getenv('PORT', 5001)`로 처리하도록 수정됨

### 5️⃣ 배포 실행

1. **Settings** 저장 후 자동으로 배포 시작
2. 또는 **Deployments** 탭에서 **"Redeploy"** 클릭
3. 배포 로그 확인 (약 5-10분 소요)

### 6️⃣ 도메인 설정

1. **Settings** → **Networking** 섹션
2. **"Generate Domain"** 클릭
3. 생성된 도메인 복사 (예: `your-project.up.railway.app`)

---

## 🔗 프론트엔드 연결

### Vercel 환경 변수 추가

1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 다음 변수 추가:

```
VITE_BACKEND_URL=https://your-project.up.railway.app
```

4. **Save** 후 **재배포** (Deployments → Redeploy)

---

## 🧪 배포 확인

### 백엔드 헬스 체크

브라우저에서 접속:
```
https://your-project.up.railway.app/health
```

응답 예시:
```json
{
  "status": "ok",
  "message": "한글정원 AI 백엔드 서버가 정상 작동 중입니다."
}
```

### API 엔드포인트 테스트

1. **책 추천 API**:
   ```
   POST https://your-project.up.railway.app/recommend/books
   ```

2. **손글씨 인식 API**:
   ```
   POST https://your-project.up.railway.app/recognize/handwriting
   ```

---

## ⚙️ Railway 설정 최적화

### 리소스 설정

**Settings** → **Resources**:
- **Memory**: 최소 2GB 권장 (ML 모델 로딩)
- **CPU**: 1 vCPU 이상 권장

### 자동 배포

**Settings** → **Source**:
- GitHub 연결 시 자동 배포 활성화
- `main` 브랜치에 푸시 시 자동 재배포

---

## 🚨 자주 발생하는 문제

### 1. "Out of Memory" 에러

**원인**: ML 모델이 메모리를 많이 사용

**해결**:
1. **Settings** → **Resources** → **Memory** 증가
2. 또는 모델 로딩을 지연 로딩으로 변경

### 2. 배포 실패 (requirements.txt)

**원인**: 일부 패키지 설치 실패

**해결**:
1. `requirements.txt` 확인
2. Railway 로그에서 에러 확인
3. 문제가 되는 패키지 버전 조정

### 3. 포트 에러

**원인**: 하드코딩된 포트 사용

**해결**:
- 코드에서 `os.getenv('PORT', 5001)` 사용 확인
- Railway가 자동으로 `PORT` 환경 변수 제공

### 4. CORS 에러

**원인**: 프론트엔드 도메인이 CORS 허용 목록에 없음

**해결**:
- `app.py`에서 `CORS(app, resources={r"/*": {"origins": "*"}})` 확인
- 이미 모든 출처 허용으로 설정됨

---

## 💰 Railway 요금제

### 무료 크레딧
- 월 $5 크레딧 제공
- 소진 후 유료 전환

### 유료 플랜
- **Hobby**: $5/월 (추가 크레딧)
- **Pro**: $20/월 (더 많은 리소스)

> 💡 **팁**: 무료 크레딧으로도 충분히 테스트 가능합니다!

---

## 📚 참고 자료

- [Railway 공식 문서](https://docs.railway.app)
- [Railway Python 가이드](https://docs.railway.app/guides/python)
- [환경 변수 설정](https://docs.railway.app/develop/variables)

---

## ✅ 체크리스트

배포 전 확인:
- [ ] `backend/Procfile` 생성됨
- [ ] `backend/runtime.txt` 생성됨
- [ ] `app.py`에서 `PORT` 환경 변수 사용 확인
- [ ] `requirements.txt` 최신 상태
- [ ] GitHub에 코드 푸시 완료
- [ ] Railway 프로젝트 생성
- [ ] Root Directory를 `backend`로 설정
- [ ] 환경 변수 모두 추가
- [ ] 도메인 생성 완료
- [ ] Vercel에 `VITE_BACKEND_URL` 추가

**준비 완료! 🎉**

