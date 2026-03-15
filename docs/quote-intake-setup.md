# 견적 접수 스캐폴드 설정

이 문서는 `quote.html`의 견적 요청 폼을 Google Sheets + Apps Script로 연결하기 위한 최소 설정 절차입니다.

## 1) Google Sheets 만들기

1. Google Drive에서 새 Google Sheets 문서를 만듭니다.
2. 시트 이름은 `견적접수`로 두거나 비워둬도 됩니다.
3. Apps Script 예제는 시트가 없으면 자동으로 `견적접수` 시트를 생성합니다.

## 2) Apps Script 붙여넣기

1. 방금 만든 Google Sheets에서 `확장 프로그램 > Apps Script`를 엽니다.
2. 기본 코드가 있으면 지우고 [`apps-script/quote-intake.gs`](../apps-script/quote-intake.gs)의 내용을 붙여넣습니다.
3. 저장합니다.

## 3) 웹앱 배포

1. Apps Script 상단의 `배포 > 새 배포`를 클릭합니다.
2. 유형은 `웹 앱`을 선택합니다.
3. 실행 사용자는 본인 계정으로 둡니다.
4. 접근 권한은 운영 방식에 맞게 설정합니다.
5. 배포 후 발급되는 웹앱 URL을 복사합니다.

## 4) 배포 URL 넣는 위치

1. [`assets/config.example.js`](../assets/config.example.js)를 복사해 `assets/config.js` 파일을 만듭니다.
2. `window.APP_CONFIG.QUOTE_ENDPOINT = '';` 부분의 빈 문자열에 배포 URL을 넣습니다.
3. 실제 endpoint를 넣기 전까지는 폼이 성공 처리되지 않고 설정 필요 메시지를 보여줍니다.

## 5) 접수 내역 보는 위치

1. 견적 접수 데이터는 연결한 Google Sheets의 `견적접수` 시트에 쌓입니다.
2. 각 행은 한 건의 견적 요청입니다.
3. 열에는 접수 시각, 품목, 규격, 수량, 연락처, 추가 요청사항 등이 기록됩니다.
