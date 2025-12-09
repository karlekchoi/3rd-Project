# 폰트 적용 가이드

## 1. 폰트 파일 준비
폰트 파일을 `public/fonts/` 디렉토리에 업로드해주세요.

### 지원되는 폰트 형식:
- `.woff2` (권장 - 가장 작은 파일 크기)
- `.woff`
- `.ttf`
- `.otf`

### 폰트 파일 이름 예시:
- `CustomFont-Regular.woff2`
- `CustomFont-Bold.woff2`
- `CustomFont-Light.woff2`

## 2. 폰트 파일 업로드 방법
1. `public/fonts/` 폴더에 폰트 파일을 복사하세요
2. 또는 파일 탐색기에서 직접 드래그 앤 드롭하세요

## 3. 폰트 적용
폰트 파일을 업로드하신 후, 다음 정보를 알려주세요:
- 폰트 이름 (예: "나눔고딕", "Pretendard" 등)
- 폰트 파일 이름들 (예: `NanumGothic-Regular.woff2`, `NanumGothic-Bold.woff2`)

그러면 제가 자동으로 CSS에 폰트를 적용해드리겠습니다!

## 4. 폰트 파일 구조 예시
```
public/
  fonts/
    CustomFont-Regular.woff2
    CustomFont-Bold.woff2
    CustomFont-Light.woff2
```

## 참고사항
- 여러 굵기(Regular, Bold, Light 등)의 폰트가 있다면 모두 업로드해주세요
- 폰트 이름은 한글 또는 영문 모두 가능합니다
- 파일 이름에 공백이 있으면 안 됩니다 (공백은 `-` 또는 `_`로 대체)

