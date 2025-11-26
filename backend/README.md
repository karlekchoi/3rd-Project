# TrOCR 백엔드 서버

한글정원 프로젝트의 손글씨 인식 백엔드 서버입니다.

## 설치 방법

### 1. Python 가상환경 생성 (권장)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. 패키지 설치
```bash
pip install -r requirements.txt
```

### 3. 서버 실행
```bash
python app.py
```

서버가 실행되면: http://localhost:5001

## API 엔드포인트

### GET /health
서버 상태 확인

### POST /recognize
손글씨 인식

**요청 예시:**
```json
{
  "image": "data:image/png;base64,iVBORw0KG..."
}
```

**응답 예시:**
```json
{
  "text": "ㄱ",
  "confidence": 1.0
}
```

## 주의사항

- 첫 실행 시 TrOCR 모델을 다운로드합니다 (약 500MB)
- GPU가 있으면 자동으로 GPU를 사용합니다
- CPU만 있어도 작동하지만 느릴 수 있습니다




















