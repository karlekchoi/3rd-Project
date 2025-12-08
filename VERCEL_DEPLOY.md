# 🚀 Vercel 배포 가이드

## ✅ 사전 준비

이 프로젝트는 Vercel 배포에 완벽하게 최적화되어 있습니다!

---

## 📝 배포 단계

### 1️⃣ GitHub에 코드 푸시

```bash
git add .
git commit -m "feat: 한글정원 프로젝트 완성"
git push origin main
```

### 2️⃣ Vercel 배포

1. [Vercel](https://vercel.com)에 로그인
2. **"New Project"** 클릭
3. GitHub 리포지토리 선택
4. **"Import"** 클릭

### 3️⃣ 환경 변수 설정 ⭐ (중요!)

Vercel 대시보드에서:

**Settings** → **Environment Variables** → 다음 변수 추가:

| 변수 이름 | 값 | 설명 |
|-----------|-------|------|
| `VITE_OPENAI_API_KEY` | `sk-proj-...` | OpenAI API 키 (필수) |
| `VITE_BACKEND_URL` | `http://localhost:5001` | TrOCR 백엔드 URL (선택) |

> ⚠️ **주의**: 
> - 모든 환경 변수는 `VITE_` 접두사가 필요합니다
> - 환경 변수 추가 후 **재배포** 필요 (Deployments → 점 3개 → Redeploy)
> - **배포 환경에서는 TrOCR 백엔드를 자동으로 사용합니다** (MCP는 개발 환경에서만 사용 가능)

### 4️⃣ 빌드 설정 확인

Vercel이 자동으로 감지하지만, 수동 설정 시:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5️⃣ 배포 완료!

배포 완료 후 Vercel이 제공하는 URL로 접속:

```
https://your-project.vercel.app
```

---

## 🔧 백엔드 서버 관련

### 옵션 A: 백엔드 없이 배포

현재 코드는 **자동 Fallback**이 구현되어 있습니다:

```
TrOCR 백엔드 없음 → 자동으로 OpenAI 사용 ✅
```

**설정:**
- `VITE_BACKEND_URL` 환경 변수 설정 **안 함**
- 또는 빈 값으로 설정

**결과:**
- TrOCR 백엔드 연결 실패 시 자동으로 OpenAI로 전환
- 사용자는 아무 문제 없이 사용 가능

### ⚠️ 중요: 배포 환경의 손글씨 인식

**배포 환경에서는 TrOCR 백엔드를 우선적으로 사용합니다:**
- ✅ 프로덕션 빌드에서는 MCP를 사용하지 않음
- ✅ TrOCR 백엔드가 있으면 TrOCR 사용
- ✅ TrOCR 백엔드가 없으면 OpenAI로 자동 fallback

**개발 환경에서 MCP 사용하려면:**
- `.env.local`에 `VITE_USE_MCP=true` 추가 (로컬 개발용)
- 배포 환경에서는 이 변수를 설정하지 않음

### 옵션 B: 백엔드도 배포

백엔드를 **Railway** 또는 **Render**에 배포:

1. `backend` 폴더를 별도 리포지토리로 분리
2. Railway/Render에 배포
3. 배포 URL 받기: `https://your-backend.railway.app`
4. Vercel 환경 변수에 추가:
   ```
   VITE_BACKEND_URL=https://your-backend.railway.app
   ```

---

## 🧪 배포 후 테스트

### 체크리스트:

- [ ] 메인 페이지 로딩
- [ ] 로그인/회원가입
- [ ] 사전 검색
- [ ] 한국어 공부 (쓰기, 읽기, 말하기)
- [ ] 미니게임
- [ ] 도서 추천
- [ ] 단어장
- [ ] 프로필 이미지 업로드

### 디버깅:

브라우저 개발자 도구 (F12) → Console 탭에서 에러 확인

---

## 🚨 자주 발생하는 문제

### 1. "Failed to load results" 에러

**원인**: OpenAI API 키가 설정되지 않음

**해결**:
1. Vercel 대시보드 → Settings → Environment Variables
2. `VITE_OPENAI_API_KEY` 추가
3. 재배포

### 2. 로그인 정보가 사라짐

**원인**: Local Storage는 도메인별로 분리됨 (정상 동작)

**설명**: 
- `localhost:3000`과 `your-project.vercel.app`은 다른 도메인
- 각각 별도의 Local Storage 사용

### 3. 환경 변수가 적용 안 됨

**원인**: 환경 변수 추가 후 재배포 안 함

**해결**:
1. Vercel 대시보드 → Deployments
2. 최신 배포 → 점 3개 → **Redeploy**

---

## 💡 최적화 팁

### 1. 커스텀 도메인 연결

Vercel 대시보드 → Settings → Domains

### 2. 환경별 환경 변수

- **Production**: 실제 서비스용
- **Preview**: PR 미리보기용
- **Development**: 로컬 개발용

### 3. Analytics 활성화

Vercel 대시보드 → Analytics → Enable

---

## 📚 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html#vercel)
- [환경 변수 설정](https://vercel.com/docs/projects/environment-variables)

---

## ✅ 체크리스트

배포 전 최종 확인:

- [ ] `.env` 파일이 `.gitignore`에 포함됨
- [ ] `vercel.json` 파일이 프로젝트 루트에 있음
- [ ] OpenAI API 키가 준비됨
- [ ] GitHub에 코드가 푸시됨
- [ ] 로컬에서 `npm run build` 테스트 완료

**준비 완료! 🎉**

















