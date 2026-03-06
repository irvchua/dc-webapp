# Deal Calculator Web App

Excel-inspired real estate deal calculator built with Next.js.

## Tech Stack
- Next.js (App Router)
- React + TypeScript
- Firebase Auth (Google sign-in)
- Firebase Firestore for cloud persistence
- Local storage fallback when not signed in

## Getting Started

Install dependencies:

```bash
npm install
```

### Firebase Setup

1. Create a Firebase project.
2. Enable **Authentication** and turn on **Google** provider.
3. Enable **Firestore Database**.
4. Add your local and Vercel domains to Firebase Auth authorized domains.
5. Create a Web App in Firebase and copy config values.
6. Add to `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Firestore Rules

Use `firestore.rules` from this repo in Firebase Console ? Firestore Database ? Rules.
The rules scope deals to each signed-in user path: `users/{uid}/deals/{dealId}`.

## Run

```bash
npm run dev
```

Open http://localhost:3000

## Data Behavior
- Signed-in users: data persists to Firestore under their own user path.
- Signed-out users: data stays in browser localStorage fallback.
- Deals include `lastSavedAt` timestamp.

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
