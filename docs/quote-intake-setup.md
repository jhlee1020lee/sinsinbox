# 견적 접수 설정과 배포

`quote.html`은 Apps Script 웹 앱으로 견적 요청을 보내고 Google Sheets의 `견적접수` 시트에 저장합니다. GitHub에 코드를 푸시해도 Apps Script 배포는 바뀌지 않습니다. 서버 코드를 수정하면 기존 웹 앱 배포를 새 버전으로 갱신해야 합니다. [Google 배포 안내](https://developers.google.com/apps-script/concepts/deployments)

## 1. 접수용 스프레드시트 연결

1. 기존 접수용 Google Sheets를 엽니다. 처음 설정할 때만 새 스프레드시트를 만듭니다.
2. 주소의 `/spreadsheets/d/`와 다음 `/` 사이에 있는 스프레드시트 ID를 확인합니다.
3. `확장 프로그램 > Apps Script`를 엽니다. 기존 웹 앱이 별도 Apps Script 프로젝트에 있으면 그 프로젝트를 엽니다.
4. 기존 접수 코드와 설정을 보존한 뒤, 해당 프로젝트의 `doPost`와 관련 함수를 [`apps-script/quote-intake.gs`](../apps-script/quote-intake.gs)의 내용으로 갱신합니다. 다른 기능의 코드까지 지우지 않습니다.
5. `프로젝트 설정 > 스크립트 속성`에 `QUOTE_SPREADSHEET_ID`를 추가하고 2번에서 확인한 ID를 값으로 저장합니다.

서버는 `SpreadsheetApp.openById`로 지정한 파일을 엽니다. 웹 앱에서는 컨테이너 전용 `getActiveSpreadsheet`에 의존하지 않습니다. [Google 컨테이너 스크립트 안내](https://developers.google.com/apps-script/guides/bound#special_methods)

`견적접수` 시트가 없으면 첫 유효한 요청 때 생성하고, 비어 있으면 제목 행을 추가합니다. 기존 행과 열 순서는 유지합니다. 스프레드시트 ID는 공개 사이트의 `assets/config.js`에 넣지 않습니다.

## 2. 웹 앱 배포

### 기존 배포 갱신

1. 코드를 저장한 뒤 `배포 > 배포 관리`를 엽니다.
2. 현재 `assets/config.js`에서 사용하는 웹 앱 배포를 선택하고 수정합니다.
3. 버전에서 `새 버전`을 선택하고 배포합니다. 기존 배포를 갱신하면 같은 웹 앱 URL을 사용할 수 있습니다.
4. 실행 계정이 접수용 스프레드시트를 편집할 수 있는지 확인하고, 새 권한 승인이 필요하면 완료합니다.

### 처음 배포

1. `배포 > 새 배포`에서 `웹 앱`을 선택합니다.
2. 실행 사용자는 접수용 스프레드시트를 편집할 수 있는 운영 계정으로 지정합니다.
3. 일반 방문객의 문의를 받으려면 로그인하지 않은 방문객도 접근할 수 있도록 설정합니다. 조직 정책상 허용되지 않으면 이 구성으로 공개 폼을 운영할 수 없습니다.
4. 배포 후 `/exec`로 끝나는 웹 앱 URL을 확인합니다. `/dev` 주소는 편집 권한이 있는 사용자의 테스트용이므로 공개 사이트에 사용하지 않습니다. [Google 웹 앱 안내](https://developers.google.com/apps-script/guides/web)

## 3. 사이트의 접수 주소 확인

[`assets/config.js`](../assets/config.js)의 `window.APP_CONFIG.QUOTE_ENDPOINT`에 배포 URL을 지정합니다. 기존 배포 URL이 같으면 바꾸지 않습니다. 분석 도구 설정 등 다른 값은 유지합니다.

접수 주소가 없거나 서버가 정상 접수를 확인하지 않으면 폼은 성공으로 처리하지 않습니다. 브라우저는 응답 JSON의 `ok`가 `true`일 때만 입력 내용을 지웁니다.

## 4. 요청 형식과 저장 열

현재 폼은 `application/x-www-form-urlencoded` 요청을 보내며 서버는 `e.parameter`로 읽습니다. 기존 JSON 요청도 지원합니다. [Google 요청 매개변수 안내](https://developers.google.com/apps-script/guides/web#request_parameters)

| 현재 폼의 필드 | 저장 열 | 기존 JSON 필드 |
| --- | --- | --- |
| `item` | `item` | `item` |
| `size` | `size` | `size` |
| `strength` | `strength` | `strength` |
| `qty` | `quantity` | `quantity` |
| `print_type` | `print` | `print` |
| `shipping_method` | `shipping` | `shipping` |
| `due_text` | `dueDate` | `dueDate` |
| `company` | `company` | `company` |
| `phone` | `phone` | `phone` |
| `email` | `email` | `email` |
| `extra` | `extra` | `extra` |
| `source_page` | `sourcePage` | `sourcePage` |

첫 열 `submittedAt`에는 서버의 접수 시각을 기록합니다. 필수 항목은 품목, 규격 또는 문의 내용, 상호 또는 담당자명, 연락처입니다. 상담 문의는 수량이 없어도 접수합니다. 자동 입력 방지용 `website`가 채워져 있으면 저장하지 않습니다. `=`로 시작하는 입력은 수식이 실행되지 않도록 텍스트로 저장하고, 연락처도 텍스트로 저장해 앞자리 0을 보존합니다.

저장이 끝나면 `{"ok":true}`, 입력 또는 저장 오류가 나면 `{"ok":false,"message":"안내 문구"}`를 반환합니다.

## 5. 배포 전후 확인

저장소 루트에서 `node --test tools/quote-intake.test.cjs`를 실행하면 실제 서버 소스를 모의 Google 서비스와 함께 검사합니다. 이 테스트는 운영 스프레드시트나 웹 앱에 접속하지 않으며, 실제 배포 상태를 보증하지 않습니다.

실제 수신 확인은 운영 데이터와 구분할 수 있는 테스트용 스프레드시트와 별도 웹 앱 배포에서 진행합니다. 제품 견적과 수량 없는 상담 문의를 각각 보내고, 성공 응답뿐 아니라 시트에 모든 입력값이 저장됐는지 대조합니다. 운영 배포에서는 설정한 스프레드시트 ID, 실행 계정, 접근 권한과 배포 버전도 확인합니다.
