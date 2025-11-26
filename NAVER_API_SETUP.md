# 네이버 검색 API 설정 가이드

책 추천 기능에서 네이버 검색 API를 사용하여 실제 도서 정보를 가져옵니다.

## 1. 네이버 개발자 센터에서 API 키 발급

1. [네이버 개발자 센터](https://developers.naver.com/)에 접속
2. 로그인 후 "Application" → "애플리케이션 등록"
3. 애플리케이션 정보 입력:
   - 애플리케이션 이름: `한글정원`
   - 사용 API: **검색** 선택
   - 비로그인 오픈 API 서비스 환경: **웹** 선택
   - 서비스 URL: `http://localhost:5173` (또는 실제 도메인)
4. 등록 후 **Client ID**와 **Client Secret** 확인

## 2. 환경 변수 설정

### 프론트엔드 (.env 파일)

프로젝트 루트에 `.env` 파일을 생성하거나 수정:

```env
VITE_NAVER_CLIENT_ID=suZ4AbzZs5IAuo7SansX
VITE_NAVER_CLIENT_SECRET=HejBLGclyc
```

### 백엔드 (.env 파일)

백엔드 디렉토리에 `.env` 파일을 생성:

```env
NAVER_CLIENT_ID=suZ4AbzZs5IAuo7SansX
NAVER_CLIENT_SECRET=HejBLGclyc
```

**중요**: 백엔드에서 `.env` 파일을 읽으려면 `python-dotenv` 패키지가 필요합니다:
```bash
cd backend
pip install python-dotenv
```

## 3. 백엔드 의존성 설치

백엔드에서 `requests` 라이브러리가 필요합니다:

```bash
cd backend
pip install requests
```

또는 `requirements.txt`에 추가:

```
requests
```

## 4. 사용 방법

### 프론트엔드에서 직접 호출 (CORS 문제 가능)

프론트엔드에서 직접 네이버 API를 호출하려고 시도합니다. CORS 문제가 발생할 수 있습니다.

### 백엔드를 통한 호출 (권장)

백엔드가 실행 중이면 자동으로 백엔드를 통해 네이버 API를 호출합니다. 이 방법이 더 안정적입니다.

## 5. 테스트

1. 프론트엔드와 백엔드 모두 실행
2. 책 추천 탭으로 이동
3. 레벨 또는 장르를 선택하여 검색
4. 네이버 검색 결과가 표시되는지 확인

## 문제 해결

### CORS 오류 발생 시

백엔드를 통해 호출하도록 설정되어 있으므로, 백엔드가 실행 중인지 확인하세요.

### API 키 오류

- 환경 변수가 제대로 설정되었는지 확인
- 네이버 개발자 센터에서 API 키가 활성화되어 있는지 확인
- 서비스 URL이 올바르게 설정되었는지 확인

### 검색 결과가 없을 때

- 검색어를 더 구체적으로 변경
- 네이버 검색 API 할당량 확인 (일일 25,000건)

