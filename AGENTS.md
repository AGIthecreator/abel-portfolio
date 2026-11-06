# AGENTS.md

## Cursor Cloud specific instructions

This is a **Next.js 16 portfolio SPA** (single service, no backend, no database, no external APIs at runtime).

### Quick reference

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` (ESLint 9 flat config) |
| Build | `npm run build` |
| Start prod | `npm run start` |

### Notes

- The dev server uses `--webpack` flag (see `package.json` scripts). Turbopack is not used.
- No `.env` files or environment variables are needed. All Supabase/Airtable/Stripe references in the UI are purely presentational.
- `puppeteer` is listed as a dependency but is only used by offline utility scripts in `/scripts/`; it is **not** required for the app to run.
- The ESLint config (`eslint.config.mjs`) uses the flat config format with `eslint-config-next` and explicitly ignores `/scripts/`.
- Hot reload works out of the box with `npm run dev`.
