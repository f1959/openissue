# Open Issue Tracker (Firebase + React + Vite)

Internal MVP web app for managing project open issues with shared login, issue editing, image attachment, and PPTX reporting.

## Stack

- React + TypeScript + Vite
- Firebase Authentication (email/password)
- Cloud Firestore (`openIssues` collection)
- Firebase Storage (`issue-images/...`)
- PPTX export with `pptxgenjs`

## Quick Start

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy environment file and fill Firebase values
   ```bash
   cp .env.example .env
   ```
3. Run dev server
   ```bash
   npm run dev
   ```
4. Build production bundle
   ```bash
   npm run build
   ```

## Firebase Setup

### 1) Authentication

- Enable **Email/Password** provider.
- Create user accounts directly in Firebase Console.

### 2) Firestore

- Create database.
- Use collection name: `openIssues`.
- Documents follow the `OpenIssue` shape defined in `src/types.ts`.

### 3) Storage

- Ensure bucket is configured.
- App uploads images to `issue-images/{issueId}/{timestamp-fileName}`.

### 4) Environment variables

`.env` values:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Security Rules (MVP)

### Firestore

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

### Storage

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

## Implemented Features

- Login/logout with Firebase auth state persistence
- Sidebar list with search, filter, sort, archive toggle
- New issue creation with monotonic `issueNo`
- White document-style editor with Save flow
- Required validation (`title`, `problem`)
- Unsaved changes warning for page unload, issue switching, new issue, logout
- Paste image upload to Firebase Storage and preview/remove attachments
- Export modal with multi-selection, select all/clear
- PPTX export that uses full issue detail data (not sidebar-only)
- Auto text pagination for long Problem/Solution and image slide batching

## Notes

- Designed desktop-first (>=1280px target).
- Export utility is split (`exportModel.ts` and `exportPptx.ts`) to ease future JSON/CSV export extensions.
- For deployment, you can adapt this app to Firebase Hosting or GitHub Pages.
