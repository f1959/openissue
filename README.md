# Open Issue Tracker (완전 무설치 운영 가이드)

좋습니다. **내 컴퓨터에 아무것도 설치 안 하는 방식**으로 설명드립니다.

이 프로젝트는 아래처럼 운영하면 됩니다.

- 코드는 GitHub에 보관/수정 (브라우저로)
- 웹 배포는 GitHub Pages (자동)
- 로그인/DB는 Firebase (이미지는 선택: Storage 사용/미사용)
- 내 컴퓨터 설치: **불필요**

---

## 0) 진짜로 무설치 가능한가?

네, 가능합니다.

- Node.js 설치 안 해도 됨
- Git 설치 안 해도 됨
- VS Code 설치 안 해도 됨

대신,

- GitHub 웹 화면에서 파일 수정
- Firebase 콘솔에서 설정
- GitHub Actions가 자동 빌드/배포

로 진행합니다.

---

## 1) 계정 준비

1. Google 계정 1개
2. GitHub 계정 1개

끝입니다.

---


## 1-1) 이미 Firebase 키는 코드에 넣어둠

요청하신 Firebase 설정값(apiKey 등)은 이미 코드(`src/firebase.ts`)에 기본값으로 넣어두었습니다.
그래서 **지금은 GitHub Secrets / .env를 안 넣어도 기본 접속은 됩니다.**

다만 아래 2가지는 반드시 필요합니다:
1. Firebase Authentication에서 사용자 계정 생성
2. Firestore Rules(그리고 Storage 쓸 경우 Storage Rules) 게시

## 2) Firebase 설정 (클릭만 하면 됨)

### 2-1. 프로젝트 생성

1. https://console.firebase.google.com 접속
2. **프로젝트 추가** 클릭
3. 프로젝트 이름 입력 (예: `open-issue-tracker`)
4. Analytics는 꺼도 됨
5. **프로젝트 만들기** 클릭

### 2-2. 웹 앱 등록

1. 프로젝트 홈에서 `</>` 아이콘 클릭
2. 앱 이름 입력 (예: `open-issue-web`)
3. **앱 등록** 클릭
4. 보이는 `firebaseConfig` 값 메모

### 2-3. 로그인 기능 켜기

1. 왼쪽 메뉴 **Build → Authentication**
2. **시작하기** 클릭
3. **Sign-in method** 탭
4. **Email/Password** 클릭 후 활성화
5. 저장

### 2-4. Firestore 만들기

1. **Build → Firestore Database**
2. **데이터베이스 만들기**
3. 프로덕션 모드 선택
4. 리전 선택 후 완료

### 2-5. (선택) Storage 만들기

> 이미지 첨부 기능이 필요 없으면 이 단계는 건너뛰어도 됩니다.

1. **Build → Storage**
2. **시작하기**
3. 안내 따라 생성

### 2-6. 사용자 계정 추가

1. Authentication → **Users**
2. **사용자 추가**
3. 이메일/비밀번호 입력

---

## 3) Firebase 보안 규칙 붙여넣기

### 3-1. Firestore Rules

Firestore → Rules 탭에 아래 붙여넣고 **게시**:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /openIssues/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3-2. (선택) Storage Rules

> Storage를 사용할 때만 설정합니다. (이미지 미사용이면 생략 가능)

Storage → Rules 탭에 아래 붙여넣고 **게시**:

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /issue-images/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 4) GitHub에서 무설치로 배포하기 (핵심)

> 아래 과정은 전부 브라우저에서 합니다.

### 4-1. GitHub 레포 준비

- 이미 이 저장소를 쓰고 있으면 그대로 사용
- 없다면 New repository로 새로 만들기

### 4-2. GitHub Secrets 입력 (아주 중요)

1. 레포 화면 → **Settings**
2. 왼쪽 메뉴 **Secrets and variables → Actions**
3. **New repository secret** 클릭해서 아래 항목을 필요 시 추가

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET` (Storage 쓸 때만)
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_ENABLE_STORAGE` (`true` 또는 `false`)

이 프로젝트는 Firebase 키 기본값이 코드에 들어있어서, 필수는 `VITE_ENABLE_STORAGE` 하나입니다.

- 최소 권장: `VITE_ENABLE_STORAGE=false`
- 이미지 기능 ON: `VITE_ENABLE_STORAGE=true`
- 다른 `VITE_FIREBASE_*` 값은 필요하면 덮어쓰기용(선택)

### 4-3. Pages 활성화

1. 레포 **Settings → Pages**
2. Source를 **GitHub Actions**로 설정

### 4-4. 첫 배포 실행

1. 레포 상단 **Actions** 탭 이동
2. `Deploy to GitHub Pages` 워크플로우 확인
3. main 브랜치에 커밋이 있으면 자동 실행됨
4. 초록 체크 완료되면 URL 생성됨
   - `https://<github-id>.github.io/<repo-name>/`

---

## 5) 코드 수정도 무설치로 하는 방법

1. GitHub에서 파일 클릭
2. 우측 상단 연필 아이콘(Edit this file) 클릭
3. 내용 수정
4. 맨 아래 **Commit changes...**
5. main에 커밋되면 Actions가 자동 배포

즉, VS Code / Git / Node 없이도 수정+배포 됩니다.

---

## 6) 실제 사용 방법 (팀원)

1. 배포 URL 접속
2. Firebase에서 만든 이메일/비번으로 로그인
3. **New Open Issue** 클릭
4. 문제/해결 내용 입력
5. (선택) 이미지 붙여넣기(Ctrl+V) - Storage ON/OFF 모두 가능
6. **Save**
7. **Export to PPTX** 클릭 후 항목 선택해서 다운로드

---


## 6-1) Storage 없이 전체 시스템 운영하는 방법

질문하신 내용의 핵심 답변입니다: **가능합니다.**

아래처럼 하면 됩니다.

1. GitHub Secrets에서 `VITE_ENABLE_STORAGE=false` 설정
2. `VITE_FIREBASE_STORAGE_BUCKET`는 비워둬도 됨
3. Firebase Storage 생성/Rules 설정 생략 가능
4. 이미지는 Firestore 문서 안에 inline(base64)로 저장됨
5. 권장: 이미지 1장당 700KB 이하
6. 나머지 기능(로그인/이슈 작성/수정/PPTX)은 그대로 동작


## 6-2) Storage 없이 이미지 업로드도 가능한가?

**가능합니다.** 이번 버전부터 Storage OFF에서도 이미지 붙여넣기를 지원합니다.

동작 방식:
- Storage ON: Firebase Storage URL 저장
- Storage OFF: Firestore에 base64(data URL)로 직접 저장

주의사항(중요):
- Firestore 문서 크기 제한(약 1MiB)이 있어서 큰 이미지는 저장 실패할 수 있습니다.
- 그래서 Storage OFF 모드에서는 이미지 1장당 700KB 이하를 권장합니다.
- 이미지가 많거나 큰 경우에는 `VITE_ENABLE_STORAGE=true` 전환을 추천합니다.

## 7) 지금 구현되어 있는 기능

- Firebase 이메일/비번 로그인
- Open issue 목록 조회/검색/필터/정렬
- archived 숨김/표시
- 새 이슈 자동 번호 부여
- 이슈 상세 수정 + 저장
- 필수값 검증(title/problem)
- 저장 안 한 변경 경고
- Storage OFF 모드 지원 (이미지도 inline 업로드 가능, 용량 제한 있음)
- 이미지 붙여넣기 업로드(Firebase Storage, ON일 때)
- PPTX export (요약 + 상세 + 긴 텍스트 분할 + 이미지 분할)

---

## 8) 트러블슈팅 (무설치 기준)

### 배포가 실패해요

- 대부분 Secrets 오타입니다.
- Actions 로그에서 어떤 `VITE_...` 값이 비었는지 확인하세요.
- CI는 `npm run build:ci`(vite build)로 배포 빌드를 수행합니다.
- `Dependencies lock file is not found` 에러가 나면, 워크플로우가 `npm ci` 고정인지 확인하세요. 이 저장소는 lockfile 없어도 `npm install`로 진행되도록 설정되어야 합니다.
- `No matching version found for pptxgenjs` 에러가 나면 `package.json`의 버전을 `^3.12.0`으로 맞췄는지 확인하세요.
- `auth/invalid-api-key`가 뜨면 GitHub Secrets에 빈 문자열이 들어가서 기본값을 덮어쓴 경우가 많습니다. Firebase 관련 `VITE_FIREBASE_*` secret을 비우거나 삭제하고 재배포하세요.


### `Process completed with exit code 1`가 떠요

아래 순서로 확인하세요:
1. Actions 실행 클릭 → 실패한 job 클릭 → **첫 번째 빨간 줄** 확인
2. 실패 위치가 `Install dependencies`면 패키지 설치 오류입니다.
3. 실패 위치가 `Build`면 프론트 빌드 오류입니다.
4. `Settings → Actions → General → Workflow permissions`가 **Read and write permissions**인지 확인
5. `Settings → Pages → Source`가 **GitHub Actions**인지 확인

에러 로그 첫 줄만 공유해도 원인 바로 잡아드릴 수 있습니다.

### 로그인은 되는데 데이터가 안 보여요

- Firestore Rules 게시 여부 확인
- 로그인한 계정인지 확인

### 이미지 업로드가 안 돼요

- Storage Rules 게시 여부 확인
- Firebase 프로젝트의 Storage가 생성됐는지 확인

### GitHub Pages에서 404가 나와요

- Settings → Pages가 GitHub Actions인지 확인
- 최근 Actions 실행이 성공(초록체크)인지 확인


### `main.tsx` 404가 보여요

- 이건 보통 GitHub Pages가 `dist` 결과물이 아니라 소스 루트를 직접 서빙할 때 생깁니다.
- 반드시 **Settings → Pages → Source = GitHub Actions**로 설정하세요.
- Actions의 `Deploy to GitHub Pages`가 성공(초록 체크)했는지 확인하세요.


---

## 9) 참고: 로컬 설치 방식은 선택사항

원하면 나중에만 아래 설치해서 로컬 개발 가능:

- Node.js
- Git
- VS Code

하지만 **지금 당장은 전혀 필요 없습니다.**

---

## 10) 한 줄 결론

**완전 무설치로도 운영 가능**합니다.

- GitHub: 코드/배포
- Firebase: 로그인/DB/이미지
