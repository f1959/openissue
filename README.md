# Open Issue Tracker (초보자용 아주 쉬운 가이드)

이 프로젝트는 **별도 서버를 직접 만들지 않고**,

- 코드는 **GitHub**에 올리고,
- 로그인/DB/이미지 저장은 **Firebase**를 쓰는 방식입니다.

즉, "서버 한 대 파서 운영"하는 구조가 아닙니다.

---

## 0. 먼저 이해하기 (아주 중요)

이 앱은 아래 4개가 같이 동작합니다.

1. **GitHub**: 코드 보관소 (소스코드 올리는 곳)
2. **GitHub Pages**: 화면을 인터넷에 공개하는 정적 웹 호스팅
3. **Firebase Authentication**: 아이디/비밀번호 로그인
4. **Firebase Firestore + Storage**: 이슈 데이터/이미지 저장

---

## 1. 준비물

- 구글 계정 1개
- GitHub 계정 1개
- 내 컴퓨터에 설치
  - Node.js 20 이상: https://nodejs.org/
  - Git: https://git-scm.com/downloads
  - VS Code(권장): https://code.visualstudio.com/

설치 확인(터미널/명령프롬프트):

```bash
node -v
git --version
npm -v
```

---

## 2. Firebase 프로젝트 만들기 (클릭 순서 자세히)

### 2-1) Firebase 새 프로젝트 생성

1. 브라우저에서 https://console.firebase.google.com 접속
2. **"프로젝트 추가"** 버튼 클릭
3. 프로젝트 이름 입력 (예: `open-issue-tracker`)
4. "Google Analytics 사용"은 MVP에서는 꺼도 됩니다
5. **"프로젝트 만들기"** 클릭

### 2-2) 웹 앱 등록

1. Firebase 프로젝트 화면에서 `</>` (웹 아이콘) 클릭
2. 앱 닉네임 입력 (예: `open-issue-web`)
3. "Firebase Hosting 설정" 체크는 지금 당장 필수 아님
4. **"앱 등록"** 클릭
5. 화면에 보이는 `firebaseConfig` 값들을 메모해두기

### 2-3) Authentication 켜기

1. 왼쪽 메뉴 **Build → Authentication** 클릭
2. **"시작하기"** 클릭
3. 상단 탭 **Sign-in method** 클릭
4. **Email/Password** 클릭
5. **사용 설정** ON
6. 저장

### 2-4) Firestore 생성

1. 왼쪽 메뉴 **Build → Firestore Database** 클릭
2. **"데이터베이스 만들기"** 클릭
3. "프로덕션 모드" 선택 (권장)
4. 리전(위치) 선택 후 생성

### 2-5) Storage 생성

1. 왼쪽 메뉴 **Build → Storage** 클릭
2. **"시작하기"** 클릭
3. 보안 규칙 확인 후 진행
4. 리전 선택 후 완료

### 2-6) 계정 직접 만들기 (회원가입 UI 없음)

1. Authentication → **Users** 탭 이동
2. **"사용자 추가"** 클릭
3. 이메일/비밀번호 입력해서 팀원 계정 생성

---

## 3. Firebase 보안 규칙 넣기 (복사/붙여넣기)

### 3-1) Firestore Rules

1. Firestore Database → **규칙(Rules)** 탭 클릭
2. 기존 내용을 아래로 교체
3. **게시(Publish)** 클릭

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

### 3-2) Storage Rules

1. Storage → **Rules** 탭 클릭
2. 기존 내용을 아래로 교체
3. **게시(Publish)** 클릭

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

## 4. 내 컴퓨터에서 프로젝트 실행 (처음 1회)

### 4-1) 코드 받기

```bash
git clone <여러분-레포-주소>
cd openissue
```

### 4-2) 패키지 설치

```bash
npm install
```

### 4-3) 환경변수 파일 만들기

1. 프로젝트 루트에서 `.env.example` 파일 복사
2. 파일 이름을 `.env`로 변경
3. 안에 Firebase 값 입력

`.env` 예시:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4-4) 실행

```bash
npm run dev
```

터미널에 나오는 주소(예: `http://localhost:5173`)를 브라우저에서 열기.

---

## 5. GitHub에 코드 올리기 (서버 대신 GitHub + Firebase)

> 핵심: 코드는 GitHub에, 데이터/이미지는 Firebase에 저장됩니다.

### 5-1) GitHub 저장소 만들기

1. GitHub 로그인
2. 오른쪽 상단 `+` → **New repository**
3. Repository name 입력 (예: `openissue`)
4. **Create repository** 클릭

### 5-2) 첫 push

아래 명령을 로컬 터미널에서 실행:

```bash
git init
git add .
git commit -m "Initial open issue tracker"
git branch -M main
git remote add origin <깃허브-레포-URL>
git push -u origin main
```

---

## 6. GitHub Pages로 배포 (버튼 클릭 순서)

이 저장소에는 `.github/workflows/deploy-pages.yml` 이 들어 있습니다.
`main` 브랜치에 push 하면 자동 배포됩니다.

### 6-1) GitHub Secrets 넣기

1. GitHub 저장소 화면 접속
2. **Settings** 클릭
3. 왼쪽 메뉴 **Secrets and variables → Actions** 클릭
4. **New repository secret** 클릭
5. 아래 키를 하나씩 추가

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### 6-2) Pages 활성화

1. 저장소 **Settings → Pages** 이동
2. Source가 "GitHub Actions"인지 확인
3. 없다면 GitHub Actions 방식으로 선택

### 6-3) 배포 확인

1. 상단 **Actions** 탭 클릭
2. `Deploy to GitHub Pages` 워크플로우가 초록 체크인지 확인
3. 완료 후 Pages URL 접속
   - 보통: `https://<github-id>.github.io/<repo-name>/`

---

## 7. 실제 사용 방법 (팀원 입장)

1. 배포된 URL 접속
2. Firebase Console에서 미리 만들어둔 이메일/비번으로 로그인
3. 왼쪽 상단 **New Open Issue** 눌러 새 이슈 생성
4. 오른쪽 흰색 문서 영역에 내용 작성
5. `problem`, `solution` 입력
6. 이미지 붙여넣기: 문제/해결 텍스트칸에서 `Ctrl+V`
7. **Save** 클릭
8. 내보내기: **Export to PPTX** → 이슈 체크 → **Download PPTX**

---

## 8. 이미 구현된 핵심 기능

- 이메일/비밀번호 로그인
- 이슈 목록(검색/필터/정렬)
- archive 토글
- 새 이슈 자동 번호(issueNo)
- 상세 수정 + 저장 + required 검증(title/problem)
- unsaved change 경고
- 붙여넣기 이미지 업로드(Firebase Storage)
- PPTX 보고서 export (상세 내용/긴 텍스트 분할/이미지 포함)

---

## 9. 파일 구조 핵심

- `src/firebase.ts`: Firebase 연결
- `src/App.tsx`: 메인 로직
- `src/components/*`: 화면 컴포넌트
- `src/utils/exportPptx.ts`: PPTX 생성
- `.github/workflows/deploy-pages.yml`: GitHub Pages 자동 배포
- `.env.example`: 환경변수 템플릿

---

## 10. 자주 하는 실수 체크리스트

1. `.env`를 GitHub에 올리면 안 됩니다 (`.gitignore`에 이미 제외)
2. Firebase Rules 게시 안 하면 권한 오류가 납니다
3. GitHub Secrets 이름 오타가 나면 배포 빌드 실패합니다
4. Firebase Authorized domain 설정이 필요할 수 있습니다
   - Authentication → Settings → Authorized domains에 `github.io` 도메인 확인

---

## 11. 한 줄 요약

- **서버 직접 구축 없이**
- **GitHub로 코드/배포**
- **Firebase로 로그인 + DB + Storage**
- 이 조합으로 내부용 Open Issue Tracker 운영 가능합니다.
