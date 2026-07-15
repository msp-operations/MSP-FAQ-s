# MSP Student FAQ

A sleek, search-first FAQ for Maastricht Science Programme students. It runs as a static web app (installable, works offline), pulls all its content from one file, and lets students see a personal status by loading their transcript locally.

## How it works
- **`content.json`** is the single source of truth: every question, answer, topic and office. Edit this, and every student sees the update on their next visit. No re-download.
- **`index.html`** is the whole app: search (MiniSearch), topic cards, answer view with the owning office + a pre-filled contact email, and the transcript welcome header.
- **`sw.js`** is the service worker: caches the app for offline use and refreshes `content.json` in the background (stale-while-revalidate).
- The transcript is parsed **entirely in the browser** (pdf.js). It is never uploaded or stored anywhere off the student's device.

## Editing content
`content.json` is generated from the master FAQ (`ESD/_Inventory/Knowledge Base/MSP Student FAQ - MASTER.md`) by `tools/convert.mjs`. Two ways to update:
1. Edit the master `.md` and re-run the converter, or
2. Edit `content.json` directly for small fixes.

Each entry:
```json
{ "id": "...", "q": "question", "a": "answer (markdown)", "topic": "Exams & Grades",
  "office": "exams", "category": "...", "tags": [...], "note": "internal-only, hidden from students" }
```
`note` holds the `[NEEDS MARTIJN: ...]` flags from the master. They never show to students. Add `?staff` to the URL (or `localStorage.faqStaff = '1'`) to see them inline while editing.

## Gaps students couldn't find
When a search returns nothing, the query is logged to `localStorage.faqGaps` on that device. (A future version can collect these centrally.)

## Run locally
Any static server, e.g. `npx serve` or `python -m http.server`, then open the page. Opening `index.html` as a file works for the basics, but the service worker/offline install needs to be served over http(s).

## Deploy
Push to GitHub and enable GitHub Pages (Settings → Pages → deploy from `main`). Push = deploy.

## Status
Scaffold. Content is auto-generated from the master and still carries `[NEEDS MARTIJN]` flags to resolve. Logo, colours and question clean-up are the next pass.
