# Canton Names Pitch Decks

Hackathon pitch materials for Canton Names.

## Full Pitch Deck (13 slides)

| File | Format | Purpose |
|------|--------|---------|
| `canton-names-pitch.md` | Markdown | Source deck with speaker notes |
| `canton-names-pitch.html` | HTML | Source presentable deck |
| `canton-names-pitch.pdf` | PDF | Printable version (13 pages, 16:9) |

**Served at:** `/pitch`

## Judge Pitch Deck (8 slides, ~60s)

| File | Format | Purpose |
|------|--------|---------|
| `pitch-judges/script.md` | Markdown | Verbatim script with timing |
| `pitch-judges/pitch-judges.md` | Markdown | Slide source with speaker notes |
| `pitch-judges/pitch-judges.html` | HTML | Source presentable deck |
| `pitch-judges/pitch-judges.pdf` | PDF | Printable version (8 pages, 16:9) |

**Served at:** `/pitch-judges`

## Deployment

Both pitch decks are served on the deployed site.

During build, the HTML files are copied to `public/` via the `prebuild` script in `package.json`:
- `docs/pitches/canton-names-pitch.html` → `public/pitch/index.html`
- `docs/pitches/pitch-judges/pitch-judges.html` → `public/pitch-judges/index.html`

Edit the source files here, and the deployed version will update on next build.

## Regenerating the PDF

To regenerate the PDF after editing the HTML:

```bash
node scripts/generate-pdf.mjs
```

This requires Playwright (`pnpm add -D playwright && npx playwright install chromium`).

## Presenting

### HTML Deck (Recommended)

Open `canton-names-pitch.html` in any modern browser.

**Navigation:**
- **→** or **Space** — Next slide
- **←** — Previous slide
- **Home** — First slide
- **End** — Last slide
- **Swipe** — Touch navigation (mobile)

The deck is self-contained with no external dependencies.

### Markdown Source

The Markdown file contains the full content with speaker notes under each slide. Use it to:
- Edit content
- Export to other formats
- Copy sections for other materials

Slides are separated by `---` dividers.

## Slide Overview

1. **Title** — One-liner positioning
2. **Problem** — Copy-paste errors with party IDs
3. **Solution** — Search, registration, resolver component
4. **Who It's For** — Canton app teams and party holders
5. **What's Built** — Routes and demo flow
6. **Hardest Problems** — Resolution safety, adapters, state machine
7. **Tech Stack** — Next.js, TypeScript, Tailwind, etc.
8. **Validation** — 55 tests, clean build, honest gaps
9. **Go-to-Market** — Developer-first, first 10/100 targets
10. **Pilot Metrics** — Planned measurements
11. **Roadmap** — What's not built yet
12. **Business Model** — Revenue plan (verified names, paid resolver, fees, grants)
13. **The Ask** — Network access + one pilot partner

## Design

The HTML deck matches the landing page design:
- White background
- Indigo/violet accent (#4f46e5)
- Clean typography
- Subtle shadows and borders

## Honesty Policy

This deck follows a strict no-fake-metrics rule:
- Zero users acknowledged
- Live registration marked as untested
- Wallet connection marked as simulated
- 10/100 user counts are targets, not claims
