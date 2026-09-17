# P-Racing 현재 상태 / AI 인수인계

마지막 갱신: 2026-09-17 (한국 시간). 이후 작업자는 현재 Git 상태와 공개 페이지를 다시 확인하세요.

## 현재 진행 상태

- 다른 AI에서도 이어서 사용할 수 있는 문서 및 지속 기록 지침 작성 완료.
- 문서 커밋 `b1f71df`의 GitHub `main` 푸시 성공을 확인했습니다. 이 갱신은 완료 상태 기록이며 사이트 파일은 변경하지 않았습니다.
- 진행 중: 기기별 화면 최적화 구현·검증 완료, GitHub Pages 공개 반영 확인 단계.

## 프로젝트 목적과 사용자 결정

- 평택대학교 자작자동차 동아리 P-Racing 소개·지원 웹사이트.
- 대학 공식 색상: 초록 `#009B64`, 빨강 `#EE0031`, 회색 `#CDCDCD`.
- 중요: 단순 스크롤 스냅이 아니라 **모바일·PC에서 한 화면에 한 섹션씩** 표시하는 방식을 사용자가 선택했습니다.
- 지원 영역의 눈에 띄는 버튼으로 Google Forms를 새 탭에서 엽니다.
- 사용자는 구현뿐 아니라 검증과 실제 공개 배포까지 기대합니다.

## 위치와 주소

| 항목 | 값 |
|---|---|
| 이 환경의 저장소 | `G:\p-racing\web` |
| 공개 사이트 | https://rwd0327.github.io/p-racing/ |
| 지원 영역 | https://rwd0327.github.io/p-racing/#join |
| GitHub | https://github.com/RWD0327/p-racing |
| 지원서 | https://forms.gle/u3tfTipc82PUKxjr7 |
| 로컬 실행 | `node server.mjs` → http://127.0.0.1:4173 |
| 원격 / 브랜치 | `origin`, 편집 소스 `main`, 배포 파일 `gh-pages` |

이전 Sites 미리보기는 별도 서비스에 남아 있습니다. 현재 공개 기준은 GitHub Pages이며, 이후 GitHub 수정분이 Sites에도 자동 반영되는 것은 아닙니다.

## 구성

- HTML/CSS/JavaScript 정적 사이트. 프레임워크·패키지 설치·빌드 과정 없음.
- `dist/index.html`: 팀 소개, 차량, 활동 기록, 지원 링크.
- `dist/styles.css`: 기본 디자인, Google Fonts.
- `dist/scroll-snap.css`: 전체 화면 레이아웃, 모바일 대응, 접근성 대체 스타일, 지원 버튼.
- `dist/app.js`: 휠·터치·키보드 전환, 메뉴, URL 해시 및 현재 메뉴 표시.
- `server.mjs`: loopback 전용 로컬 미리보기. 공개 사이트의 서버가 아님.
- `tests/navigation.cjs`: 입력 이벤트 로직 회귀 검사.
- `tests/security.cjs`: 임시 포트에서 오류 요청·서버 생존·경로 제한·보안 정책 검사.
- `dist/.nojekyll`: GitHub Pages 정적 게시용.
- `.openai/hosting.json`: 초기 Sites 설정. 인증 비밀이 아닌 프로젝트 식별자 포함.

## 완료된 기능

- 반응형 팀 소개 / 차량 프로젝트 / 활동 기록 / 함께하기 5개 섹션.
- 모바일·PC 한 화면씩 전환, 긴 콘텐츠 내부 스크롤, 관성으로 연속 섹션 이동 방지.
- 현재 메뉴 강조 및 주소 해시 동기화, 메뉴 외부 클릭·포커스 이동으로 닫기.
- JavaScript 미실행 시 일반 문서 스크롤, 모션 감소 설정 대응.
- Google Forms 지원 버튼과 외부 새 탭 안내.
- GitHub 공개 저장소 및 GitHub Pages 배포.

## 보안과 검증 상태

마지막 애플리케이션 수정 커밋: `444f4d9` — Handle malformed preview requests and restrict browser resources.

- 로컬 URL 파싱 오류로 서버가 종료되는 낮은 심각도의 문제 1건을 재현·수정했습니다. `try/catch`로 400을 반환합니다.
- 수정 후 오류 요청 5종, 직후 정상 요청 200, 미등록·비공개 경로 404 확인.
- CSP: 자체 스크립트/CSS, Google Fonts 스타일/폰트만 허용. 인라인 스크립트·플러그인·iframe·폼 제출·fetch 연결 금지.
- 외부 지원 폼은 앵커 링크이므로 CSP의 `form-action 'none'`과 양립합니다.
- `no-referrer` 및 외부 링크 `noopener noreferrer` 적용.
- GitHub Pages HTTPS 강제 설정과 HSTS 응답 확인.
- 마지막 실행: JS 문법 검사, `tests/security.cjs`, `tests/navigation.cjs` 모두 통과.
- 마지막 공개 응답: HTTP 200, CSP·referrer meta·지원 링크 포함 확인.
- Edge 실제 브라우저의 11개 뷰포트(320×568~1920×1080)에서 가로 넘침 없음, 패널 높이 일치, 지원 버튼 접근, 브라우저 오류 및 CSP 오류 없음 확인. CDP 터치 입력과 마우스 휠 전환도 통과했습니다. 실물 휴대폰·iOS Safari 검증은 미완료입니다.
- GitHub Pages에서 로컬 서버의 X-Frame-Options가 적용되지는 않습니다. meta CSP는 frame-ancestors를 지원하지 않습니다.
- Google Forms 응답 공개 범위·소유자 권한·수집 항목·보관 정책은 **점검하지 않았습니다**.
- 보안 스캔은 수정 전 커밋 `2cbd8e2` 기준 기록입니다. 현재 코드까지 재스캔한 것으로 혼동하지 마세요.

## 남은 작업 / 사용자 결정이 필요한 자료

1. 실물 휴대폰, 특히 iOS Safari의 주소창·노치·화면 회전 동작 확인. Edge 뷰포트 및 터치 에뮬레이션 검사와 구분합니다.
2. 팀의 실제 차량 사진·제원·활동 기록·공식 로고·문의 채널 추가. 자료가 없어 현재 준비 중으로 표시합니다.
3. Google Forms 관리자의 응답 권한 및 개인정보 안내 확인. 사이트 코드만으로 보장할 수 없습니다.
4. `www.rwd0327.xyz`: 연결 가능성만 확인했고 **연결하지 않았습니다**. 당시 가비아 네임서버, www 레코드 없음. 변경 전 재조회 필요.
   - 계획: GitHub Pages Custom domain 등록 → 가비아 `CNAME`, 호스트 `www`, 값 `rwd0327.github.io` → DNS/HTTPS 검증.
   - 사용자에게 도메인 구매나 인증정보 공개를 요구하지 말고, 설정 가능한 로그인 상태·권한을 먼저 확인합니다.

## 다음 AI의 실행 순서

1. `AGENTS.md` 및 이 문서를 읽고 `git status --short`, `git log -5 --oneline` 확인.
2. 현재 요청을 진행 중 항목에 기록하고 필요한 수정 수행.
3. 변경 범위에 맞는 검사 실행, 실행 결과 및 한계 기록.
4. 관련 파일만 커밋 후 `git push origin main`.
5. 사이트 파일 변경 시 `git subtree push --prefix=dist origin gh-pages`.
6. 공개 배포 확인 후 이 문서와 `WORK_LOG.md` 갱신. 문서 최종 갱신만 남으면 문서 커밋을 `main`에 추가 푸시.

인증은 실행 환경의 정상적인 Git 로그인 수단을 사용합니다. 토큰을 파일·로그·명령 출력에 남기지 않습니다. 기존 Windows 환경에서는 `gh`/`npm` 명령을 찾지 못했지만 `git`과 `node`로 작업했으며, 다른 환경에서는 재확인하세요.
