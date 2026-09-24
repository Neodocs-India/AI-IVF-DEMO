# Anvaya — AI fertility navigation (concept demo)

A front-end-only concept demo for IVF clinics. All patients, staff and records are fictional; every "AI" output is pre-written. The demo clock is fixed at **Monday 12 October 2026, 09:10 IST**. See `CLAUDE.md` for the full specification.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run verify-data  # asserts every KPI target in CLAUDE.md §7
npm run build        # production build into dist/
```

## Recording the demo

Record at 1920×1080 or 1440×900. Press `R` before each take to reset.

| Key | What happens |
|---|---|
| `B` | Beta hCG result arrives for Fatima Shaikh (412 mIU/mL, positive); routed to Dr. Mehta to call |
| `O` | Critical OHSS alert for Pooja Reddy across all staff screens |
| `A` | Anjali Nair misses her 08:30 scan; task escalates to High |
| `R` | Reset everything to 09:10 |
| `T` | Show or hide the guided tour (the 10 storyline steps, with Previous / Next) |
| `?` | Shortcuts panel |

Shortcuts never fire while typing in a field.

Storyline (§12): Command Centre → click "37 patients" → Priya's row → Open full record → back → Log call → Save and complete → switch role to Doctor (Priya at 16:30, summary types out) → switch to Patient (phone) → `B`, `O` → Cryo-Storage (Kavita Iyer) → Analytics → Integrations.

## Deploy to Netlify

`netlify.toml` is included (build `npm run build`, publish `dist`, SPA redirect). Either connect the repository in Netlify ("Add new site → Import an existing project"), or from a machine with the Netlify CLI:

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

`index.html` carries `noindex` so the demo is not indexed.

## Before recording

- Marathi and Hindi strings are marked `// TODO: native-speaker review` in `src/data/` and must be checked by a native speaker.
- Fonts load from Google Fonts; check they render on the recording machine.
