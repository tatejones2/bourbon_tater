# Bourbon Tater — Full Build Documentation
### For GitHub Copilot / AI-Assisted Development

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Repository Setup](#3-repository-setup)
4. [Project Scaffolding](#4-project-scaffolding)
5. [Firebase Setup](#5-firebase-setup)
6. [Environment Variables & Secrets](#6-environment-variables--secrets)
7. [Application Architecture](#7-application-architecture)
8. [Design System — Mid Century Modern](#8-design-system--mid-century-modern)
9. [Data Models](#9-data-models)
10. [Feature Specifications](#10-feature-specifications)
    - 10.1 [Add a Bottle (AI Auto-Population)](#101-add-a-bottle-ai-auto-population)
    - 10.2 [Collection Shelf View](#102-collection-shelf-view)
    - 10.3 [Sorting & Filtering](#103-sorting--filtering)
    - 10.4 [Bottle Detail Page](#104-bottle-detail-page)
    - 10.5 [Tasting Notes & Scoring](#105-tasting-notes--scoring)
    - 10.6 [Photo Upload](#106-photo-upload)
    - 10.7 [Edit & Delete a Bottle](#107-edit--delete-a-bottle)
11. [Component Tree](#11-component-tree)
12. [Routing](#12-routing)
13. [State Management](#13-state-management)
14. [GitHub Actions CI/CD Pipeline](#14-github-actions-cicd-pipeline)
15. [GitHub Pages Deployment](#15-github-pages-deployment)
16. [File & Folder Structure](#16-file--folder-structure)
17. [Step-by-Step Build Order](#17-step-by-step-build-order)
18. [Acceptance Criteria Checklist](#18-acceptance-criteria-checklist)

---

## 1. Project Overview

**Bourbon Tater** is a personal digital shelf and tasting journal for a single bourbon collector. The collector can:

- Search for a bourbon bottle by name and have its details (distillery, age, proof, mashbill, MSRP, etc.) automatically populated via the OpenAI GPT-4o API.
- Store their collection persistently in Firebase Firestore (cloud, free tier, no backend required).
- Browse their collection in a visually rich "shelf" layout styled with a **Mid Century Modern** aesthetic.
- Sort and filter bottles by name, distillery, age, proof, rating, date added, and bottle status (sealed / open / empty).
- View a full detail page for each bottle.
- Write free-form tasting notes, score each bottle on nose, palate, finish, and overall (0–100 scale), and upload a photo of the bottle.
- Edit or delete any bottle entry.

The site is a **static single-page application** — no server, no backend. All data lives in Firestore (accessed client-side via Firebase SDK). It is hosted on **GitHub Pages** and deployed automatically via **GitHub Actions** on every push to `main`.

---

## 2. Tech Stack & Dependencies

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite 5 |
| Styling | CSS Modules + CSS custom properties (no Tailwind, no component library) |
| Routing | React Router DOM v6 |
| State Management | React Context API + `useReducer` |
| Database | Firebase Firestore (Web SDK v9, modular) |
| File Storage | Firebase Storage (for bottle photos) |
| AI Integration | OpenAI API — `gpt-4o` model |
| Icons | `lucide-react` |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |
| Font | Google Fonts — `Playfair Display` (headings) + `DM Sans` (body) |

### npm packages to install

```bash
npm install react-router-dom firebase openai lucide-react
npm install --save-dev vite @vitejs/plugin-react gh-pages
```

---

## 3. Repository Setup

The GitHub repository already exists at:
`https://github.com/tatejones2/bourbon_tater.git`

### Steps

1. Clone the repository locally:
   ```bash
   git clone https://github.com/tatejones2/bourbon_tater.git
   cd bourbon_tater
   ```

2. Scaffold the Vite + React project **inside** the cloned repo (do not create a new subfolder):
   ```bash
   npm create vite@latest . -- --template react
   ```
   When prompted about the existing directory, choose to continue.

3. Install all dependencies listed in Section 2.

4. Set the `base` in `vite.config.js` to the repository name (required for GitHub Pages):
   ```js
   // vite.config.js
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     base: '/bourbon_tater/',
   })
   ```

5. Add the following to `package.json` under `"scripts"`:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview",
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

---

## 4. Project Scaffolding

After scaffolding, delete all boilerplate content from Vite (`src/App.jsx`, `src/App.css`, `src/index.css`, `public/vite.svg`, `src/assets/react.svg`). Start fresh from the file structure described in Section 16.

---

## 5. Firebase Setup

### 5.1 Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com).
2. Click **Add Project** → name it `bourbon-tater` → disable Google Analytics (not needed).
3. Once created, click **Web** (`</>`) to register a web app. Name it `bourbon-tater-web`.
4. Copy the `firebaseConfig` object that Firebase provides — it will look like:
   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
5. Store all of these values as GitHub Secrets (see Section 6). They will be injected at build time via Vite environment variables.

### 5.2 Enable Firestore

1. In the Firebase console, go to **Firestore Database** → **Create database**.
2. Choose **Production mode**.
3. Select a region (e.g., `us-east1`).
4. After creation, go to **Rules** and set:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   > Note: This is appropriate for a single-user personal site with no authentication. The data is not sensitive. If security becomes a concern in the future, Firebase Authentication can be added.

### 5.3 Enable Firebase Storage

1. In the Firebase console, go to **Storage** → **Get started**.
2. Accept production mode defaults.
3. Set Storage Rules to:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true;
       }
     }
   }
   ```

### 5.4 Firebase Initialization File

Create `src/firebase/firebaseConfig.js`:
```js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

---

## 6. Environment Variables & Secrets

### 6.1 Local Development (.env.local)

Create a `.env.local` file in the project root (this file must be in `.gitignore`):

```env
VITE_FIREBASE_API_KEY=your_value
VITE_FIREBASE_AUTH_DOMAIN=your_value
VITE_FIREBASE_PROJECT_ID=your_value
VITE_FIREBASE_STORAGE_BUCKET=your_value
VITE_FIREBASE_MESSAGING_SENDER_ID=your_value
VITE_FIREBASE_APP_ID=your_value
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 6.2 GitHub Secrets (for CI/CD)

In the GitHub repository, go to **Settings → Secrets and variables → Actions → New repository secret** and add each of the following secrets individually:

| Secret Name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_OPENAI_API_KEY` | OpenAI API key |

### 6.3 .gitignore

Ensure `.gitignore` includes:
```
node_modules/
dist/
.env.local
.env
```

---

## 7. Application Architecture

```
App
├── Router (HashRouter — required for GitHub Pages)
│   ├── Route "/" → ShelfPage (collection overview)
│   ├── Route "/bottle/:id" → BottleDetailPage
│   └── Route "/add" → AddBottlePage
├── CollectionContext (global state via Context + useReducer)
└── Firebase (Firestore + Storage accessed directly from components/hooks)
```

> **Important:** Use `HashRouter` (not `BrowserRouter`) from React Router. GitHub Pages does not support HTML5 history routing for SPAs. HashRouter uses `/#/` style URLs which work correctly on static hosts.

---

## 8. Design System — Mid Century Modern

The entire application must follow a cohesive Mid Century Modern design language. This style is characterized by:

- **Warm, earthy palette** — amber, walnut brown, cream, burnt orange, olive green, and muted gold
- **Bold geometric shapes** — circles, sunbursts, tapered legs, atomic motifs used as decorative elements
- **Clean typography** — strong serif headings paired with a clean sans-serif body font
- **Flat, textured surfaces** — no gradients; use flat color blocks with subtle noise/grain texture on backgrounds
- **Intentional whitespace** — generous padding and breathing room
- **Warm card surfaces** — off-white / cream cards with a slight shadow and no sharp borders

### 8.1 Color Palette (CSS Custom Properties)

Define these in `src/styles/variables.css` and import globally:

```css
:root {
  /* Backgrounds */
  --color-bg:           #F5EFE0;   /* warm cream — main page background */
  --color-bg-dark:      #2C1A0E;   /* deep walnut — header/nav */
  --color-surface:      #FDF6E3;   /* off-white — cards */
  --color-surface-alt:  #EDE0C4;   /* tan — secondary surfaces */

  /* Brand / Accent */
  --color-amber:        #C8732A;   /* bourbon amber — primary accent */
  --color-amber-light:  #E8A95C;   /* light amber — hover states */
  --color-gold:         #B8923A;   /* muted gold — borders, highlights */
  --color-olive:        #6B7545;   /* olive green — secondary accent */
  --color-rust:         #A04B2D;   /* rust / burnt orange — destructive actions */

  /* Text */
  --color-text-primary: #1E1208;   /* near-black walnut */
  --color-text-secondary: #5C3D1E; /* warm brown */
  --color-text-muted:   #9C7B55;   /* muted tan */
  --color-text-on-dark: #F5EFE0;   /* cream — text on dark bg */

  /* Typography */
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;

  /* Spacing scale */
  --space-xs:   4px;
  --space-sm:   8px;
  --space-md:   16px;
  --space-lg:   24px;
  --space-xl:   40px;
  --space-2xl:  64px;

  /* Border radius */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  16px;
  --radius-pill: 999px;

  /* Shadows */
  --shadow-card: 0 2px 12px rgba(44, 26, 14, 0.12);
  --shadow-hover: 0 6px 24px rgba(44, 26, 14, 0.2);
}
```

### 8.2 Typography

Import in `index.html` `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

Typography rules:
- All `<h1>` – `<h3>` elements use `var(--font-heading)`, bold weight, `var(--color-text-primary)`
- All body text uses `var(--font-body)`
- The site logo/wordmark uses `Playfair Display` at a large size, dark amber color
- Page titles use `Playfair Display` 700 weight

### 8.3 Global Styles

`src/styles/global.css`:
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-body);
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  min-height: 100vh;
}

h1, h2, h3, h4, h5 {
  font-family: var(--font-heading);
}

button {
  cursor: pointer;
  font-family: var(--font-body);
}

img {
  max-width: 100%;
  display: block;
}
```

### 8.4 Button Styles

Define three button variants:
- **Primary** — filled amber background (`var(--color-amber)`), cream text, subtle rounded corners
- **Secondary** — transparent with amber border and amber text
- **Danger** — filled rust/burnt orange (`var(--color-rust)`) for delete actions

All buttons should have a smooth `transition` on hover (background color and box-shadow, 150ms ease).

### 8.5 Card Component

Bottle cards should look like:
- White/cream background (`var(--color-surface)`)
- 1px solid `var(--color-gold)` border
- `var(--shadow-card)` box shadow
- `var(--radius-md)` border radius
- On hover: `var(--shadow-hover)` and a slight `translateY(-3px)` lift
- Transition: `all 0.2s ease`

### 8.6 Mid Century Decorative Details

- Use a subtle **wood grain texture** or **linen texture** as a background pattern on the main shelf page (a CSS `background-image` using a repeating SVG or a very subtle noise via `filter: url()` or a base64-encoded texture image)
- The top navigation bar should be the deep walnut color (`var(--color-bg-dark)`) with cream text and a thin amber border on the bottom
- Geometric decorative elements (starburst, atomic dot pattern, diamond rule lines) should be used sparingly as accent SVGs in the header or section dividers
- Bottle score badges should be circular, filled with `var(--color-amber)`, and use the serif font

---

## 9. Data Models

### 9.1 Bottle Document (Firestore collection: `bottles`)

```js
{
  id: string,                    // Firestore auto-generated document ID
  
  // --- AI-populated fields (auto-filled via GPT-4o) ---
  name: string,                  // Full bottle name (e.g., "Buffalo Trace Kentucky Straight Bourbon")
  distillery: string,            // Distillery name (e.g., "Buffalo Trace Distillery")
  brand: string,                 // Brand name (e.g., "Buffalo Trace")
  type: string,                  // Spirit type (e.g., "Kentucky Straight Bourbon Whiskey")
  age: number | null,            // Age statement in years (null if NAS)
  proof: number,                 // Proof (e.g., 90)
  abv: number,                   // ABV percentage (e.g., 45.0)
  mashbill: string,              // Mashbill description (e.g., "Corn-heavy, exact recipe undisclosed")
  distillationStyle: string,     // (e.g., "Column still followed by pot still")
  maturation: string,            // Cask/barrel type and warehouse info
  region: string,                // Geographic region (e.g., "Frankfort, Kentucky")
  msrp: number | null,           // Suggested retail price in USD (null if unknown)
  releaseYear: number | null,    // Year of this specific release (null if ongoing)
  limitedRelease: boolean,       // Whether this is a limited/allocated release
  description: string,           // 2–3 sentence editorial description from AI

  // --- Collector-entered fields ---
  status: 'sealed' | 'open' | 'empty',   // Bottle status
  purchasePrice: number | null,          // What the collector paid (USD)
  purchaseDate: string | null,           // ISO date string (YYYY-MM-DD)
  purchaseLocation: string,              // Where purchased
  bottleCount: number,                   // How many of this bottle they own (default: 1)
  personalNotes: string,                 // Free-form personal notes (not tasting notes)
  photoURL: string | null,               // Firebase Storage download URL for bottle photo

  // --- Tasting Notes ---
  tastingNotes: {
    nose: string,                // Free-form nose tasting notes
    palate: string,              // Free-form palate tasting notes
    finish: string,              // Free-form finish tasting notes
    overall: string,             // Free-form overall impressions
    noseScore: number | null,    // 0–100
    palateScore: number | null,  // 0–100
    finishScore: number | null,  // 0–100
    overallScore: number | null, // 0–100
  },

  // --- Metadata ---
  dateAdded: string,             // ISO timestamp — set automatically on creation
  dateModified: string,          // ISO timestamp — updated on every edit
  aiPopulated: boolean,          // Whether AI was used to populate details
  aiRawResponse: string,         // Raw JSON string from GPT-4o (for debugging)
}
```

---

## 10. Feature Specifications

### 10.1 Add a Bottle (AI Auto-Population)

**Route:** `/add`

**Page:** `AddBottlePage`

**Purpose:** Allow the user to type a bottle name and have GPT-4o populate all known details automatically, then let the user review and fill in collector-specific fields before saving.

#### Step-by-step behavior:

1. The page renders a single prominent text input labeled **"Bottle Name"** with placeholder text: `e.g. Pappy Van Winkle 15 Year Family Reserve`

2. Below the input, a button labeled **"Look Up Bottle"** triggers the OpenAI API call.

3. While the API is loading, show a tasteful loading indicator — a spinning amber-colored ring or animated bourbon bottle fill — with the text "Consulting the bourbon oracle…"

4. On success, the form below the search input auto-populates with all AI-returned fields. Each field is editable by the user so they can correct any inaccuracies.

5. Fields that the AI populates (and the user can override):
   - Name (text input)
   - Distillery (text input)
   - Brand (text input)
   - Type (text input)
   - Age (number input, labeled "Age Statement (years)" — leave blank for NAS)
   - Proof (number input)
   - ABV (number input, step 0.1)
   - Mashbill (text input)
   - Distillation Style (text input)
   - Maturation (text input)
   - Region (text input)
   - MSRP (number input, USD)
   - Release Year (number input, leave blank if ongoing)
   - Limited Release (checkbox)
   - Description (textarea, 4 rows)

6. Below AI fields, collector-specific fields appear (always manual, never AI-filled):
   - Status (segmented button toggle: `Sealed` / `Open` / `Empty`, default: `Sealed`)
   - Purchase Price (number input, USD)
   - Purchase Date (date input)
   - Purchase Location (text input)
   - Bottle Count (number input, default `1`)
   - Personal Notes (textarea, 4 rows, labeled "Personal Notes / Provenance")

7. Photo upload section (see Section 10.6).

8. At the bottom: **"Add to My Shelf"** (primary button) and **"Cancel"** (secondary button/link back to shelf).

9. On save: write the full bottle document to Firestore, then navigate to the new bottle's detail page (`/bottle/:id`).

#### OpenAI API Call

Use the following prompt structure. The call must be made from the frontend using the OpenAI JavaScript SDK with the API key from `VITE_OPENAI_API_KEY`.

```js
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

async function lookUpBottle(bottleName) {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert bourbon and American whiskey sommelier with encyclopedic knowledge of distilleries, brands, expressions, and releases. When given a bourbon or whiskey bottle name, return a JSON object with accurate details. Always respond ONLY with valid JSON and nothing else. If a field is unknown, use null. Do not fabricate information.`
      },
      {
        role: 'user',
        content: `Look up this bourbon/whiskey bottle and return a JSON object with the following fields:
name, distillery, brand, type, age (number or null), proof (number), abv (number), mashbill (string), distillationStyle (string), maturation (string), region (string), msrp (number or null), releaseYear (number or null), limitedRelease (boolean), description (2-3 sentences).

Bottle: "${bottleName}"`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  return JSON.parse(response.choices[0].message.content);
}
```

#### Error Handling

- If the API call fails (network error, rate limit, bad key): show an inline error message in amber/rust color: "We couldn't look up that bottle right now. You can fill in the details manually."
- The form should remain fully usable for manual entry even when AI lookup fails.
- If GPT returns null for most fields (bottle not recognized): show a warning banner: "We found limited information for this bottle. Please review and complete the details below."

---

### 10.2 Collection Shelf View

**Route:** `/`

**Page:** `ShelfPage`

This is the main landing page — the collector's digital shelf. It displays all bottles in the Firestore `bottles` collection.

#### Layout

- **Two view modes** selectable by the user via toggle buttons in the toolbar:
  - **Grid View (default):** 3-column responsive grid on desktop, 2 columns on tablet, 1 column on mobile. Each bottle rendered as a `BottleCard` component.
  - **List View:** A dense horizontal list with one bottle per row showing key info.

#### BottleCard Component (Grid View)

Each card displays:
- Bottle photo (if uploaded) OR a stylized bourbon bottle silhouette SVG placeholder in amber
- Bottle name (serif heading)
- Distillery name (muted body text)
- Age statement (e.g., "15 Year") OR "NAS" if no age statement
- Proof (e.g., "90 Proof")
- Status badge — a small pill badge: `Sealed` (olive green), `Open` (amber), `Empty` (muted gray)
- Overall score badge (circular amber badge with the score number, only shown if a score has been entered)
- On hover: card lifts (`translateY(-3px)`) and shadow deepens

Clicking anywhere on a card navigates to `/bottle/:id`.

#### BottleListRow Component (List View)

Each row displays in columns:
- Photo thumbnail (40×40px circle crop) OR placeholder icon
- Name
- Distillery
- Age
- Proof
- Status badge
- Overall score
- Date added
- Action icons: edit (pencil), delete (trash)

#### Shelf Page Header

At the top of the shelf page, display:
- The site wordmark: **"Bourbon Tater"** in large Playfair Display
- A short tagline beneath it in smaller muted text: *"Your Personal Bourbon Collection"*
- A decorative geometric SVG rule line beneath the tagline (Mid Century Modern horizontal divider — diamond or starburst motif)
- Collection stats bar: "**X bottles** in your collection · **X sealed** · **X open** · **X empty**"

#### Empty State

If the collection is empty, show a centered empty state:
- A large decorative bourbon bottle SVG illustration
- Heading: "Your shelf is empty"
- Body: "Start building your collection by adding your first bottle."
- A prominent **"+ Add Your First Bottle"** button

---

### 10.3 Sorting & Filtering

A toolbar sits between the header and the bottle grid/list. It must contain:

#### Sort Controls

A labeled dropdown (`Sort by:`) with the following options:
- Date Added (Newest First) — **default**
- Date Added (Oldest First)
- Name (A → Z)
- Name (Z → A)
- Distillery (A → Z)
- Age (Youngest First)
- Age (Oldest First)
- Proof (Lowest First)
- Proof (Highest First)
- Overall Score (Highest First)
- Purchase Price (Highest First)
- Purchase Price (Lowest First)

Sorting is done client-side in JavaScript — no additional Firestore queries needed.

#### Filter Controls

Collapsible filter panel (collapsed by default, toggled by a "Filters" button):
- **Status filter:** Checkbox group — `Sealed`, `Open`, `Empty` (all checked by default)
- **Age filter:** Range slider — min/max across the collection's actual age values
- **Proof filter:** Range slider — min/max across the collection's actual proof values
- **Distillery filter:** Multi-select dropdown populated with the unique distilleries in the collection
- **Limited Release filter:** Toggle — "Show limited releases only"
- **Search:** Text input (already present in main toolbar) that filters by bottle name or distillery name in real time

All filters are applied simultaneously (AND logic). Show a count of results ("Showing X of Y bottles") beneath the toolbar when any filter is active.

---

### 10.4 Bottle Detail Page

**Route:** `/bottle/:id`

**Page:** `BottleDetailPage`

This page shows the full details of a single bottle.

#### Layout

Two-column layout on desktop (left: photo + quick stats; right: full details), single-column stacked on mobile.

**Left column:**
- Large bottle photo (if uploaded, 300×400px, object-fit: cover, rounded corners) OR large placeholder SVG
- Below photo: status badge, overall score badge
- Action buttons: **"Edit Bottle"** (secondary), **"Delete Bottle"** (danger)

**Right column — sections:**

**1. Identity**
- Bottle name (large serif `h1`)
- Distillery + Brand (subtitle)
- Type, Region
- Age statement, Proof, ABV

**2. Production Details**
- Mashbill
- Distillation Style
- Maturation
- Release Year
- Limited Release (yes/no badge)
- MSRP (if known)
- AI Description (displayed in a styled blockquote with a Mid Century decorative quote mark)

**3. My Collection Info**
- Purchase Price
- Purchase Date
- Purchase Location
- Bottle Count
- Personal Notes (if any)

**4. Tasting Notes & Scores**
This section is prominently styled and divided into four sub-sections:

For each of **Nose**, **Palate**, **Finish**, and **Overall**:
- A styled section header
- The free-form text notes (if entered)
- A visual score display — a horizontal progress bar filled with amber, with the numeric score displayed at the end (e.g., `87/100`). If no score entered, show an "Add score" prompt.

The four scores (Nose, Palate, Finish, Overall) should also be summarized in a **score card** at the top of the tasting notes section — a 2×2 grid of circular score badges.

---

### 10.5 Tasting Notes & Scoring

Tasting notes are entered on the **Edit Bottle page** (same form as Add Bottle, but pre-populated for editing).

The tasting notes section of the form should be clearly separated from the bottle details section with a section heading: **"Tasting Notes"**.

For each of the four tasting categories (Nose, Palate, Finish, Overall):

1. A `<label>` with the category name and a descriptive sub-label:
   - **Nose:** "First impressions on the nose — aromas, scents"
   - **Palate:** "The taste — flavors, texture, body"
   - **Finish:** "The aftertaste — length, warmth, lingering notes"
   - **Overall:** "Your overall impressions and verdict"

2. A `<textarea>` (5 rows) for free-form notes.

3. A **score input** labeled `Score (0–100)`:
   - A number input with `min="0"` `max="100"` `step="1"`
   - A live-updating horizontal slider (`<input type="range">`) that stays in sync with the number input (bidirectional binding)
   - The slider should be styled amber-colored

---

### 10.6 Photo Upload

Photo upload is available on both the Add Bottle and Edit Bottle forms.

#### Implementation

1. Display a styled dropzone/upload area with:
   - A dashed amber border
   - A camera/upload icon in the center
   - Text: "Drop a photo here or click to upload"
   - Accepted formats label: "JPG, PNG, WEBP up to 10MB"

2. When a file is selected:
   - Show a preview of the selected image before upload (use `URL.createObjectURL`)
   - Show a **"Remove"** button (X icon) to deselect

3. On form submit, upload the image to Firebase Storage at path: `bottles/{bottleId}/photo.jpg`

4. After upload, get the download URL via `getDownloadURL()` and save it to the `photoURL` field in Firestore.

5. If no photo is uploaded, `photoURL` remains `null`.

6. If editing a bottle and a new photo is uploaded, replace the existing photo at the same path.

---

### 10.7 Edit & Delete a Bottle

#### Edit

- The **Edit Bottle page** uses the exact same form as Add Bottle, but is pre-populated with all existing data.
- Route: `/bottle/:id/edit`
- On save, update the Firestore document and navigate back to `/bottle/:id`.
- Do NOT re-run the AI lookup on edit (the user has already reviewed AI data). The AI lookup button should not appear on the edit form. All fields remain editable manually.

#### Delete

- The **Delete** button appears on both the Bottle Detail page and the List View row.
- Clicking **Delete** shows a confirmation modal with:
  - Title: "Delete this bottle?"
  - Body: "Are you sure you want to remove **[Bottle Name]** from your shelf? This cannot be undone."
  - Buttons: **"Yes, Delete"** (danger style) and **"Cancel"** (secondary style)
- On confirm: delete the Firestore document, delete the photo from Firebase Storage (if a photo exists), then navigate back to `/`.

---

## 11. Component Tree

```
src/
├── App.jsx                        # Router setup, global providers
├── context/
│   └── CollectionContext.jsx      # Context + useReducer for bottles state
├── hooks/
│   ├── useCollection.js           # Fetches all bottles from Firestore (real-time listener)
│   ├── useBottle.js               # Fetches single bottle by ID
│   └── useOpenAI.js               # OpenAI lookup hook
├── pages/
│   ├── ShelfPage.jsx              # "/" — Main shelf/collection view
│   ├── AddBottlePage.jsx          # "/add" — Add new bottle
│   ├── BottleDetailPage.jsx       # "/bottle/:id" — Full bottle view
│   └── EditBottlePage.jsx         # "/bottle/:id/edit" — Edit existing bottle
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx             # Top navigation bar
│   │   └── PageWrapper.jsx        # Consistent page padding wrapper
│   ├── shelf/
│   │   ├── BottleCard.jsx         # Grid view card
│   │   ├── BottleListRow.jsx      # List view row
│   │   ├── ShelfToolbar.jsx       # Sort + filter + search toolbar
│   │   ├── FilterPanel.jsx        # Collapsible filter controls
│   │   └── EmptyShelf.jsx         # Empty state illustration
│   ├── bottle/
│   │   ├── BottleForm.jsx         # Shared form for Add and Edit
│   │   ├── AILookupBar.jsx        # Search input + "Look Up Bottle" button
│   │   ├── TastingNotesForm.jsx   # Tasting notes + score sliders section
│   │   ├── PhotoUpload.jsx        # Photo dropzone component
│   │   ├── ScoreCard.jsx          # 2x2 score badge summary
│   │   ├── ScoreBar.jsx           # Horizontal progress bar for single score
│   │   └── StatusBadge.jsx        # Sealed / Open / Empty pill badge
│   └── ui/
│       ├── Button.jsx             # Primary / Secondary / Danger variants
│       ├── Modal.jsx              # Reusable confirmation modal
│       ├── LoadingSpinner.jsx     # Amber loading animation
│       ├── ScoreSlider.jsx        # Linked number input + range slider
│       └── PlaceholderBottle.jsx  # SVG placeholder for bottles without photos
```

---

## 12. Routing

```jsx
// src/App.jsx
import { HashRouter, Routes, Route } from 'react-router-dom';
import ShelfPage from './pages/ShelfPage';
import AddBottlePage from './pages/AddBottlePage';
import BottleDetailPage from './pages/BottleDetailPage';
import EditBottlePage from './pages/EditBottlePage';
import Navbar from './components/layout/Navbar';
import { CollectionProvider } from './context/CollectionContext';

export default function App() {
  return (
    <CollectionProvider>
      <HashRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<ShelfPage />} />
          <Route path="/add" element={<AddBottlePage />} />
          <Route path="/bottle/:id" element={<BottleDetailPage />} />
          <Route path="/bottle/:id/edit" element={<EditBottlePage />} />
        </Routes>
      </HashRouter>
    </CollectionProvider>
  );
}
```

---

## 13. State Management

### CollectionContext

```jsx
// src/context/CollectionContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const CollectionContext = createContext(null);

const initialState = {
  bottles: [],
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_BOTTLES':    return { ...state, bottles: action.payload, loading: false };
    case 'SET_LOADING':    return { ...state, loading: action.payload };
    case 'SET_ERROR':      return { ...state, error: action.payload, loading: false };
    default:               return state;
  }
}

export function CollectionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const q = query(collection(db, 'bottles'), orderBy('dateAdded', 'desc'));
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const bottles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        dispatch({ type: 'SET_BOTTLES', payload: bottles });
      },
      (error) => dispatch({ type: 'SET_ERROR', payload: error.message })
    );
    return () => unsubscribe();
  }, []);

  return (
    <CollectionContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CollectionContext.Provider>
  );
}

export const useCollectionContext = () => useContext(CollectionContext);
```

Sorting and filtering happen **client-side** in `ShelfPage.jsx` using `useMemo` — derive the sorted/filtered list from `state.bottles` based on the user's current toolbar selections. Never re-query Firestore for sorting/filtering.

---

## 14. GitHub Actions CI/CD Pipeline

Create the file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

This workflow:
1. Triggers on every push to `main`
2. Installs dependencies
3. Builds the Vite app, injecting all secrets as environment variables
4. Deploys the `dist/` folder to the `gh-pages` branch

---

## 15. GitHub Pages Deployment

### Initial Setup (one-time, done manually)

1. Push the code to `main` and let the GitHub Action run once. It will create a `gh-pages` branch.
2. In the GitHub repository, go to **Settings → Pages**.
3. Under **Source**, select **Deploy from a branch**.
4. Under **Branch**, select `gh-pages` and `/ (root)`.
5. Click **Save**.
6. After a minute, the site will be live at: `https://tatejones2.github.io/bourbon_tater/`

### Important: HashRouter

The app uses `HashRouter` (not `BrowserRouter`). This means all routes will appear as `https://tatejones2.github.io/bourbon_tater/#/bottle/123`. This is required because GitHub Pages does not support server-side routing for SPAs. Do not attempt to add a `404.html` redirect workaround — just use `HashRouter` from the start.

---

## 16. File & Folder Structure

```
bourbon_tater/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   └── favicon.ico              # Bourbon glass or bottle favicon
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── firebase/
│   │   └── firebaseConfig.js
│   ├── context/
│   │   └── CollectionContext.jsx
│   ├── hooks/
│   │   ├── useCollection.js
│   │   ├── useBottle.js
│   │   └── useOpenAI.js
│   ├── pages/
│   │   ├── ShelfPage.jsx
│   │   ├── AddBottlePage.jsx
│   │   ├── BottleDetailPage.jsx
│   │   └── EditBottlePage.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── PageWrapper.jsx
│   │   ├── shelf/
│   │   │   ├── BottleCard.jsx
│   │   │   ├── BottleListRow.jsx
│   │   │   ├── ShelfToolbar.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   └── EmptyShelf.jsx
│   │   ├── bottle/
│   │   │   ├── BottleForm.jsx
│   │   │   ├── AILookupBar.jsx
│   │   │   ├── TastingNotesForm.jsx
│   │   │   ├── PhotoUpload.jsx
│   │   │   ├── ScoreCard.jsx
│   │   │   ├── ScoreBar.jsx
│   │   │   └── StatusBadge.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Modal.jsx
│   │       ├── LoadingSpinner.jsx
│   │       ├── ScoreSlider.jsx
│   │       └── PlaceholderBottle.jsx
│   └── styles/
│       ├── variables.css
│       └── global.css
├── index.html
├── vite.config.js
├── package.json
└── .env.local                   # NOT committed to git
```

---

## 17. Step-by-Step Build Order

Follow this exact order to avoid dependency issues:

**Phase 1 — Foundation**
1. Clone repo, scaffold Vite + React project
2. Install all npm dependencies
3. Configure `vite.config.js` (base path)
4. Set up `.env.local` with all keys
5. Create file/folder structure (empty files)
6. Set up `src/styles/variables.css` and `src/styles/global.css`
7. Import fonts in `index.html`
8. Configure Firebase project (Firestore + Storage + rules)
9. Create `src/firebase/firebaseConfig.js`
10. Create `CollectionContext.jsx`
11. Configure `App.jsx` with `HashRouter` and all routes

**Phase 2 — UI Shell**
12. Build `Navbar.jsx`
13. Build `PageWrapper.jsx`
14. Build `Button.jsx` (all three variants)
15. Build `Modal.jsx`
16. Build `LoadingSpinner.jsx`
17. Build `PlaceholderBottle.jsx` (SVG)
18. Build `StatusBadge.jsx`

**Phase 3 — Shelf Page**
19. Build `BottleCard.jsx`
20. Build `BottleListRow.jsx`
21. Build `EmptyShelf.jsx`
22. Build `FilterPanel.jsx`
23. Build `ShelfToolbar.jsx`
24. Build `ShelfPage.jsx` (wires everything together, connects to context)

**Phase 4 — Bottle Form**
25. Build `ScoreSlider.jsx`
26. Build `TastingNotesForm.jsx`
27. Build `PhotoUpload.jsx`
28. Build `AILookupBar.jsx` + `useOpenAI.js` hook
29. Build `BottleForm.jsx` (full form, no submission logic yet)
30. Build `AddBottlePage.jsx` (wires form + Firestore write + Firebase Storage upload)

**Phase 5 — Detail & Edit**
31. Build `ScoreBar.jsx`
32. Build `ScoreCard.jsx`
33. Build `BottleDetailPage.jsx`
34. Build `EditBottlePage.jsx` (reuses `BottleForm.jsx` with pre-populated data)

**Phase 6 — CI/CD**
35. Create `.github/workflows/deploy.yml`
36. Add all secrets to GitHub repo settings
37. Push to `main`, verify Action runs and deploys
38. Configure GitHub Pages to serve from `gh-pages` branch
39. Verify live site at `https://tatejones2.github.io/bourbon_tater/`

---

## 18. Acceptance Criteria Checklist

Before considering the build complete, verify every item:

### Core Functionality
- [ ] Typing a bottle name and clicking "Look Up Bottle" calls GPT-4o and populates the form
- [ ] The form is fully editable after AI population
- [ ] Saving a bottle writes a complete document to Firestore
- [ ] The shelf page loads all bottles from Firestore in real time
- [ ] Clicking a bottle card navigates to the full detail page
- [ ] All 12+ sort options work correctly
- [ ] All filter controls work and can be combined
- [ ] Text search filters by name and distillery in real time
- [ ] Editing a bottle updates the Firestore document correctly
- [ ] Deleting a bottle shows a confirmation modal before proceeding
- [ ] Deleting removes both the Firestore document and the Firebase Storage photo
- [ ] Photo upload works and the URL is saved to Firestore
- [ ] Photos display on both the shelf card and the detail page
- [ ] Tasting notes (all four categories) save and display correctly
- [ ] Score sliders and number inputs stay in sync bidirectionally
- [ ] Scores display as progress bars on the detail page

### Design
- [ ] Mid Century Modern color palette is consistently applied throughout
- [ ] Playfair Display is used for all headings
- [ ] Bottle cards have hover lift effect
- [ ] Status badges appear on cards and detail page
- [ ] Score badges are circular and amber
- [ ] Empty shelf state shows illustration and CTA button
- [ ] Loading spinner appears during AI lookup
- [ ] Mobile layout is readable and functional (single column)

### Deployment
- [ ] GitHub Actions workflow runs successfully on push to `main`
- [ ] All environment variables are injected from GitHub Secrets at build time
- [ ] `vite.config.js` has `base: '/bourbon_tater/'`
- [ ] App uses `HashRouter`
- [ ] Live site loads at `https://tatejones2.github.io/bourbon_tater/`
- [ ] All routes work on the live site (including direct navigation to `/bottle/:id`)
- [ ] No API keys are committed to the repository

### Data Integrity
- [ ] `dateAdded` is set automatically on creation and never changed
- [ ] `dateModified` is updated on every edit
- [ ] `aiPopulated` is `true` when AI was used, `false` for manual entry
- [ ] NAS bottles show "NAS" (not null or 0) wherever age is displayed
- [ ] Null MSRP / purchase price displays as "—" or "Unknown", not 0

---

*End of Documentation*
*Version 1.0 — Built for tatejones2/bourbon_tater*
