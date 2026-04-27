# Open Issue Tracker (완전 무설치 운영 가이드)

좋습니다. **내 컴퓨터에 아무것도 설치 안 하는 방식**으로 설명드립니다.

이 프로젝트는 아래처럼 운영하면 됩니다.

- 코드는 GitHub에 보관/수정 (브라우저로)
- 웹 배포는 GitHub Pages (자동)
- 로그인/DB/이미지 저장은 Firebase
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

### 2-5. Storage 만들기

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

### 3-2. Storage Rules

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
3. **New repository secret** 클릭해서 아래 6개를 하나씩 추가

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

값은 Firebase 웹앱 등록 때 받은 `firebaseConfig` 값 넣으면 됩니다.

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
5. 이미지 붙여넣기(Ctrl+V)
6. **Save**
7. **Export to PPTX** 클릭 후 항목 선택해서 다운로드

---

## 7) 지금 구현되어 있는 기능

- Firebase 이메일/비번 로그인
- Open issue 목록 조회/검색/필터/정렬
- archived 숨김/표시
- 새 이슈 자동 번호 부여
- 이슈 상세 수정 + 저장
- 필수값 검증(title/problem)
- 저장 안 한 변경 경고
- 이미지 붙여넣기 업로드(Firebase Storage)
- PPTX export (요약 + 상세 + 긴 텍스트 분할 + 이미지 분할)

---

## 8) 트러블슈팅 (무설치 기준)

### 배포가 실패해요

- 대부분 Secrets 오타입니다.
- Actions 로그에서 어떤 `VITE_...` 값이 비었는지 확인하세요.

### 로그인은 되는데 데이터가 안 보여요

- Firestore Rules 게시 여부 확인
- 로그인한 계정인지 확인

### 이미지 업로드가 안 돼요

- Storage Rules 게시 여부 확인
- Firebase 프로젝트의 Storage가 생성됐는지 확인

### GitHub Pages에서 404가 나와요

- Settings → Pages가 GitHub Actions인지 확인
- 최근 Actions 실행이 성공(초록체크)인지 확인

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
