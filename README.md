# MSP Student FAQ

A search-first FAQ for Maastricht Science Programme students. Static, installable (PWA), works offline. Live: **https://msp-operations.github.io/MSP-FAQ-s/** (the old `beebzoo.github.io` URL redirects here)

---

## ✏️ Where the answers live (read this first)

**All the questions and answers live in one file: `content.json`.** That is the single source of truth the app reads. You do not edit the app code to change an answer.

`content.json` is generated from the master document
`MSP/_Inventory/Knowledge Base/MSP Student FAQ - MASTER.md`, which is organised by office (Board of Examiners, Exams, BTR, and so on).

### To change or add an answer
1. Edit the master document (`MSP Student FAQ - MASTER.md`) in the right office section.
2. Regenerate the app content:  `node tools/convert.mjs`
3. Commit and push. The live site rebuilds automatically in about a minute (push = deploy).

That is the whole loop. For small one-off fixes you *can* edit `content.json` directly instead of the master, but the master is the friendlier place and keeps everything in sync.

## 👤 Who owns what (twice-a-year review)

Each office owns its own answers. The ownership list and each owner's review list is generated at
`MSP/_Inventory/Knowledge Base/_FAQ Maintenance/FAQ Maintenance & Ownership.md`
(regenerate with `node "build-overview.mjs"` in that folder). That is the document to send each office at review time.

---

## What each file is

| File | What it is | Do you edit it? |
|---|---|---|
| **`content.json`** | Every question, answer, topic and office. The source of truth. | Rarely (edit the master instead) |
| `index.html` | The whole app (search, cards, answer view). Renders `content.json`. | Only for features/design |
| `sw.js` | Service worker: offline cache. Bump `CACHE` version after changes. | Only when files change |
| `manifest.webmanifest` · `icon.svg` · `assets/` | PWA manifest, icon, logos and the building photo. | Rarely |
| `tools/convert.mjs` | Turns the master document into `content.json`. Also holds the office → topic → colour map. | When adding an office/topic |
| `tools/serve.mjs` | Local preview: `node tools/serve.mjs` → http://localhost:8099 | No |

## Notes
- **Staff / editor view:** add `?staff` to the URL to see the open `[NEEDS MARTIJN]` review flags inline, plus a "flags remaining" panel.
- **Search synonyms** (sick → attendance, money → tuition, …) are in the `SYN` map in `index.html`.
- **Quick-links** (Student Portal, Canvas, Collent…) are the `QUICK` array in `index.html`.
- Deploy: push to `main` → GitHub Pages rebuilds.
