# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

Next.js 12 corporate website for a Brazilian HVAC company (Clean Air). Portuguese-language content throughout.

**Path aliases** (defined in `jsconfig.json`):
- `@components/*` → `components/`
- `@styles/*` → `styles/`
- `@lib/*` → `lib/`

**Page structure**: `pages/` contains `index.js`, `sobre-nos.js`, `servicos.js`, `portfolio.js`, `contato.js`, plus `api/` routes.

**Global layout**: `_app.js` wraps every page with Navbar, Footer, and a floating WhatsApp widget. Fonts (Poppins) and favicon are set in `_document.js`.

**API routes** (`pages/api/`): `sendEmail.js`, `saveEmail.js`, `saveApplicant.js`, `uploadFile.js` — use Nodemailer, Multer, and Formidable.

**Config/data files** in `lib/`: `menuItems.json` (nav), `social.json` (WhatsApp/social links), `bubbles.json`, `trackers.js` (Google Analytics: G-H7YWTQELST).

## Environment Variables

Configured via `next.config.js`. Required vars:
- `NEXT_PUBLIC_RECAPTCHA_KEY` — Google reCAPTCHA v2 public key
- `BACK_DOMAIN` — Backend API domain
- `BACK_TOKEN` — Backend auth token
- `ENV` — Environment name

## Key Dependencies

- **Bootstrap 5** — responsive layout (imported globally)
- **FontAwesome 6** — icons via `@fortawesome/react-fontawesome`
- **Axios** — HTTP client for API calls
- **React Google reCAPTCHA** — form protection on contact forms
- **@svgr/webpack** — SVG files importable as React components
