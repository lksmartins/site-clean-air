# Design: Supabase + MailerSend Form Integration

**Date:** 2026-03-20
**Status:** Approved

## Overview

Replace the existing backend API proxy calls (`BACK_DOMAIN`) with direct Supabase integration for data storage and MailerSend for transactional email. Three forms are in scope: the newsletter widget, the "Atualizações" contact form, and the "Vagas" job application form.

---

## Component → Form mapping

| Component | Form | Current API call |
|---|---|---|
| `components/Cta/newsletter.js` | Newsletter widget (email only) | None (not wired up) |
| `components/NewsForm.js` | "Atualizações" contact form (name, email, message) | `/api/saveEmail` |
| `components/ContactForm/ContactForm.js` | "Vagas" job application (name, email, message, optional CV) | `/api/saveApplicant` + `/api/uploadFile` |

Note: `pages/contato.js` currently renders `ContactForm` for **both** tabs. After the migration, the "Atualizações" tab will render `NewsForm` and the "Vagas" tab will continue to render `ContactForm`.

---

## Data Layer (Supabase)

### Tables

**`newsletter`**
| column | type | notes |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| email | text | required |
| created_at | timestamptz | default `now()` |

**`updates`**
| column | type | notes |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| name | text | required |
| email | text | required |
| created_at | timestamptz | default `now()` |

> Note: `message` is intentionally not stored in `updates`. It is emailed via MailerSend and discarded.

**`jobs`**
| column | type | notes |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| name | text | required |
| email | text | required |
| message | text | required |
| cv_url | text | nullable — public URL from Supabase Storage |
| created_at | timestamptz | default `now()` |

### Storage

- Bucket name: `cvs`
- Files stored as `{uuid}-{original_filename}` to avoid collisions
- Public read access
- Enforce a 10 MB max file size server-side via formidable's `maxFileSize` option

---

## API Routes

### `/api/saveEmail.js` — Newsletter subscription
- **Replace the implementation entirely** (current implementation proxies to old backend)
- Accepts JSON: `{ email }`
- Inserts into `newsletter` table via Supabase client
- Returns 200 on success, 400 with `{ message }` on error

### `/api/saveApplicant.js` → **renamed to `/api/saveUpdate.js`** — "Atualizações" form
- Rename file from `saveApplicant.js` to `saveUpdate.js` to reflect its new purpose
- **Replace the implementation entirely**
- Accepts JSON: `{ name, email, message }`
- Inserts `{ name, email }` into `updates` table (message is intentionally not persisted)
- Calls MailerSend API to send email to `comercial@cleanairarcondicionado.com.br` with name, email, and message in the body
- Returns 200 on success, 400 with `{ message }` on error

### `/api/uploadFile.js` — "Vagas" job application
- **Replace the implementation entirely**
- Must export `export const config = { api: { bodyParser: false } }` to disable Next.js's default body parser so formidable can read the raw multipart stream
- Accepts multipart form data with fields `name`, `email`, `message`, and optional file `cv`
- Parse body using **formidable** (already in `package.json`) to extract text fields and the file
- Inserts `{ name, email, message }` into `jobs` table
- If CV file present: uploads to `cvs` bucket, updates `cv_url` on the row with the public URL
- **Partial failure handling:** if the DB insert succeeds but the Storage upload fails, delete the `jobs` row and return 400. The form can be retried cleanly.
- Returns 200 with `{ jobId }` on success, 400 with `{ message }` on error

### `/api/sendEmail.js` — Deleted
- Unused legacy Nodemailer route. No component in the codebase calls it. Safe to delete.

---

## Environment Variables

> **Important:** These are server-side only. Do NOT add them to the `env` block in `next.config.js` — that block exposes variables to the browser bundle and would leak the Supabase service key. Access them directly via `process.env` inside API routes.

**Add:**
| variable | purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Service role key (server-side only, never expose to client) |
| `MAILERSEND_API_KEY` | MailerSend API key |
| `MAILERSEND_FROM_EMAIL` | Verified sender email address |

**Remove after migration (no longer used):**
- `BACK_DOMAIN`
- `BACK_TOKEN`

---

## Frontend Changes

### `pages/contato.js`
- "Atualizações" tab: replace `<ContactForm>` with `<NewsForm>`, passing `fields` (name, email, message) and `apiBody` that returns `{ name, email, message }`
- "Vagas" tab: keep `<ContactForm>` unchanged, update the fetch target to `/api/uploadFile` (remove the `hasFile` prop — it is no longer needed)

### `components/Cta/newsletter.js`
- Wire the submit button to POST `{ email }` to `/api/saveEmail`
- Show success/error feedback to the user after the call

### `components/NewsForm.js`
- Change the hardcoded fetch URL (line 95) from `/api/saveEmail` to `/api/saveUpdate`
- No changes to the `apiBody` prop handling — the caller (`contato.js`) already supplies the correct fields

### `components/ContactForm/ContactForm.js`
- Remove the `/api/saveApplicant` call and the `hasFile` conditional branching
- Submit name, email, message, and optional CV as multipart form data directly to `/api/uploadFile`

---

## Dependencies

**Add:**
- `@supabase/supabase-js` — Supabase client
- `mailersend` — MailerSend Node.js SDK

**Already present:**
- `formidable` — used for multipart parsing in `/api/uploadFile`

No visual/UI changes. Same fields, same form UX.
