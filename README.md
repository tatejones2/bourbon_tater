# Bourbon Tater

A React + Vite bourbon shelf, wishlist, tasting journal, and analytics app backed by Firebase.

## Local Development

Create `.env.local` from `.env.example`, then run:

```bash
npm install
npm run dev
```

Local development can use `VITE_OPENAI_API_KEY` directly. That key must not be exposed in a hosted static build.

## GitHub Pages Deployment

GitHub Pages only hosts static files. It cannot run the files in `api/`, so the AI lookup and wishlist suggestions need a separate serverless host such as Vercel, Netlify Functions, Cloudflare Workers, or Firebase Functions.

The included files are Vercel-style serverless functions:

- `api/lookup-bottle.js`
- `api/suggest-bottles.js`

Deploy those functions to a backend host with the server-side environment variable:

```env
OPENAI_API_KEY=your_openai_api_key
```

If you use Vercel, set the Vercel project's production branch to `main`, not `gh-pages`. The `gh-pages` branch is generated output for GitHub Pages and should not be used as the source branch for Vercel.

Then add these repository secrets in GitHub under **Settings -> Secrets and variables -> Actions**:

```env
VITE_OPENAI_API_URL=https://your-backend.example/api/lookup-bottle
VITE_OPENAI_SUGGEST_API_URL=https://your-backend.example/api/suggest-bottles
```

The GitHub Actions workflow injects those URLs during `npm run build`. If either URL is missing, that AI feature is disabled in the production Pages build.

Do not add `VITE_OPENAI_API_KEY` as a GitHub Pages secret. Any `VITE_` value is bundled into the browser app and can be read by users.

## Firebase Secrets

Add these GitHub Actions secrets for the hosted build:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```
