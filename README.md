# P-Racing 웹사이트

평택대학교 자작자동차 동아리 소개용 반응형 정적 웹사이트 기본 틀입니다.

## 공개 사이트

- 웹사이트: https://rwd0327.github.io/p-racing/
- GitHub: https://github.com/RWD0327/p-racing

GitHub Pages는 `gh-pages` 브랜치의 루트를 배포합니다. `main`에는 편집용 소스가 있고, `gh-pages`에는 `dist` 안의 공개 파일만 있습니다.

수정 후 아래 순서로 반영합니다.

```powershell
git add dist README.md
git commit -m "Update website"
git push origin main
git subtree push --prefix=dist origin gh-pages
```

## 실행

Node.js 설치 환경에서 `node server.mjs` 실행 후 http://127.0.0.1:4173 에 접속합니다. npm이 있으면 `npm run dev`로도 실행할 수 있습니다. 패키지 설치는 필요하지 않습니다. 보안 정책을 일관되게 적용하려면 파일을 직접 열기보다 로컬 HTTP 주소를 사용합니다.

## 수정

- `dist/index.html`: 팀 소개, 차량, 활동 기록, 모집 안내
- `dist/styles.css`: 디자인과 반응형 레이아웃. `:root`에서 색상 변경
- `dist/scroll-snap.css`: 모바일·데스크톱 전체 화면 섹션 레이아웃. `app.js`에서 휠 또는 세로 스와이프당 한 섹션을 전환합니다. 방향키·PageUp/Down·Home/End 및 메뉴 이동을 지원합니다. 작은 화면이나 확대 상태에서 넘치는 내용은 섹션 내부에서 읽고, 끝에서 다음 스와이프로 이동합니다. 모션 감소 설정에서는 즉시 전환합니다.
- `dist/app.js`: 모바일 메뉴와 연도 표시
- `dist/`: 정적 호스팅에 올릴 전체 파일

평택대학교 공식 색상 안내 https://www.ptu.ac.kr/www/433/subview.do 에서 확인한 초록 #009B64, 빨강 #EE0031, 회색 #CDCDCD를 적용했습니다. 본문 대비를 위해 어두운 초록과 검정 보조색을 사용합니다.

팀 소개 문구는 초안입니다. 실제 차량명·사진·제원, 활동 실적, 연락처, 모집 일정은 제공되지 않아 준비 중으로 표시했습니다. 폼이나 게시판 서버는 연결하지 않았습니다. 사진 확보 후 차량 영역의 타이포그래피를 실제 차량 사진으로 교체할 수 있습니다. 워드마크는 임시 텍스트이며 공식 동아리 로고가 아닙니다.

Google Fonts를 불러오며 연결되지 않을 때 시스템 글꼴로 표시합니다.

## 동작 검사

`node tests/navigation.cjs`로 터치·휠 전환, 긴 내용의 스크롤 경계, 현재 메뉴 표시와 주소 동기화를 검사합니다. 이 검사는 입력 처리 로직에 대한 검사이며 실제 기기 렌더링 검사를 대체하지 않습니다.

현재 섹션은 메뉴의 밑줄과 URL 해시에 반영됩니다. 모바일 메뉴는 바깥을 누르거나 메뉴 밖으로 키보드 포커스를 옮기면 닫힙니다. JavaScript가 실행되지 않을 때는 일반 문서 스크롤로 내용을 읽을 수 있습니다.

## 보안 설정

- HTML의 CSP는 같은 출처 스크립트와 CSS, Google Fonts CSS·폰트만 허용합니다. 인라인 스크립트, 플러그인, iframe, 폼 전송과 fetch 연결은 허용하지 않습니다. 외부 Google Forms 지원 링크의 새 탭 이동은 유지됩니다.
- `no-referrer` 정책으로 외부 리소스와 링크에 현재 페이지 주소를 보내지 않습니다.
- 로컬 미리보기는 loopback에서만 실행하고, 잘못된 URL은 400으로 반환합니다. 공개 파일 외 경로는 404 처리합니다.
- `node tests/security.cjs`는 임시 포트에서 오류 요청 후 서버 생존, 정상 파일, 비공개 경로 차단과 정책 구성을 검사합니다. 실제 브라우저의 CSP 집행을 대신하는 검사는 아닙니다.
- GitHub Pages에서는 임의 HTTP 응답 헤더를 이 저장소로 설정할 수 없습니다. HTML meta CSP로는 `frame-ancestors`를 적용할 수 없으며, 로컬 서버의 `X-Frame-Options`가 공개 사이트에도 적용되는 것은 아닙니다.
- 지원서 응답 접근 권한·수집 항목·보관 정책은 Google Forms 관리자가 별도로 관리합니다. 사이트 코드 점검은 해당 설정의 검증을 포함하지 않습니다.
