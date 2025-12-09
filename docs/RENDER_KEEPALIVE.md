# Render 백엔드 항상 깨어있게 하기

## 문제
Render 무료 플랜은 15분간 요청이 없으면 sleep 모드로 전환됩니다.

## 해결 방법

### 방법 1: UptimeRobot (추천, 무료)
1. https://uptimerobot.com 가입
2. "+ Add New Monitor" 클릭
3. 설정:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Hangeul Garden Backend
   - **URL**: https://threerd-project.onrender.com/
   - **Monitoring Interval**: 5 minutes
4. "Create Monitor" 클릭

**효과:** 5분마다 자동으로 핑을 보내서 sleep 방지!

### 방법 2: Cron-job.org (무료)
1. https://cron-job.org 가입
2. "Create cronjob" 클릭
3. 설정:
   - **URL**: https://threerd-project.onrender.com/
   - **Schedule**: */10 * * * * (10분마다)
4. 저장

### 방법 3: GitHub Actions (무료)
`.github/workflows/keep-alive.yml` 파일 생성:

```yaml
name: Keep Render Backend Alive

on:
  schedule:
    - cron: '*/10 * * * *'  # 10분마다 실행

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping backend
        run: curl https://threerd-project.onrender.com/
```

---

## 현재 상태

### ✅ 장점
- 3초 타임아웃으로 Gemini 백업 작동 중
- 백엔드가 깨어있으면 빠름 (표지 포함)
- 백엔드가 자면 Gemini가 대신 응답

### ⚠️ 개선 가능
- UptimeRobot 설정하면 백엔드가 항상 깨어있음
- 첫 요청도 빠르게 응답 가능

---

## 추천

**UptimeRobot 설정 추천!** (5분 소요)
→ 백엔드가 항상 깨어있어서 책 표지 이미지를 볼 수 있어요!
