# Judge pitch deck (~60s, 9 slides)

Served at `/pitch-judges` (HTML copied from `pitch-judges.html` at build time).

| File | Purpose |
|------|---------|
| `pitch-judges.html` | Presentable deck (source of truth) |
| `pitch-judges.md` | Markdown + speaker notes |
| `pitch-judges.pdf` | Printable 9-page PDF (16:9) |
| `script.md` | Verbatim ~60s script |

## Slides

1. **Title** — Canton Names positioning
2. **The Problem** — Opaque party IDs
3. **The Solution** — Resolver + safety states
4. **Who It's For** — Canton app teams
5. **Proof** — Prototype + Phase 0 resolve path
6. **Real network access** — DevNet allowlisting vs hackathon timeline; Phase 0; honest verification
7. **Demo** — Claim → share → resolve
8. **How We Make Money** — Planned revenue model
9. **The Ask** — DevNet sponsorship + pilot partner

Regenerate PDF after HTML edits: `node scripts/generate-pdf-judges.mjs` (or replace `pitch-judges.pdf` manually).
