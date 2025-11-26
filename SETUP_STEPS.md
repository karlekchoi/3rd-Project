# 네이버 API 설정 완료 - 다음 단계

## ✅ 완료된 작업
- ✅ 프론트엔드 `.env` 파일 생성 (VITE_NAVER_CLIENT_ID, VITE_NAVER_CLIENT_SECRET)
- ✅ 백엔드 `.env` 파일 생성 (NAVER_CLIENT_ID, NAVER_CLIENT_SECRET)
- ✅ 백엔드 코드에 python-dotenv 추가
- ✅ 코드 수정 완료

## 📋 다음 단계

### 1단계: 백엔드 의존성 설치

터미널에서 다음 명령어를 실행하세요:

```bash
cd backend
pip install python-dotenv
```

또는 requirements.txt의 모든 패키지를 설치:

```bash
cd backend
pip install -r requirements.txt
```

### 2단계: 백엔드 서버 실행

백엔드가 실행 중이 아니라면 실행하세요:

```bash
cd backend
python app.py
```

백엔드가 정상적으로 실행되면 다음과 같은 메시지가 표시됩니다:
```
🚀 한글정원 AI 백엔드 서버 시작 중...
✅ 모든 모델 로딩 완료!
 * Running on http://0.0.0.0:5001
```

### 3단계: 프론트엔드 개발 서버 재시작

**중요**: Vite는 서버 시작 시에만 `.env` 파일을 읽습니다!

1. 현재 실행 중인 `npm run dev`를 **중지**하세요 (Ctrl+C)
2. 다시 시작하세요:

```bash
npm run dev
```

### 4단계: 테스트

1. 브라우저에서 앱을 열기
2. **책 추천** 탭으로 이동
3. **레벨별 추천** 또는 **장르별 추천** 선택
4. 검색 버튼 클릭
5. 네이버 검색 결과가 표시되는지 확인

## 🔍 문제 해결

### 백엔드가 실행되지 않을 때
- 백엔드 디렉토리에서 `python app.py` 실행
- 포트 5001이 이미 사용 중인지 확인

### 여전히 API 키 오류가 발생할 때
1. `.env` 파일이 올바른 위치에 있는지 확인:
   - 프론트엔드: `C:\hangeul_garden\.env`
   - 백엔드: `C:\hangeul_garden\backend\.env`
2. 프론트엔드 개발 서버를 **완전히 재시작**했는지 확인
3. 백엔드가 실행 중인지 확인

### 백엔드 연결 오류
- 백엔드가 `http://localhost:5001`에서 실행 중인지 확인
- 브라우저 콘솔에서 네트워크 오류 확인

## 📝 현재 설정된 API 키

- **Client ID**: `suZ4AbzZs5IAuo7SansX`
- **Client Secret**: `HejBLGclyc`

이 키들은 `.env` 파일에 저장되어 있습니다.










