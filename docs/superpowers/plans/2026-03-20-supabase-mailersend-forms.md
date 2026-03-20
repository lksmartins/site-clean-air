# Supabase + MailerSend Forms Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all backend proxy calls in the three contact forms with direct Supabase (data storage) and MailerSend (transactional email) integration.

**Architecture:** Each Next.js API route is rewritten to write directly to Supabase tables/storage using the service-role key. The "Atualizações" form additionally fires a MailerSend email. Frontend components are updated to point to the correct endpoints and submit the right shape of data. No new UI is added.

**Tech Stack:** Next.js 14 API routes, `@supabase/supabase-js` v2, `mailersend` SDK, `formidable` v2 (already installed)

> **Note on testing:** This project has no test framework configured. Each task uses manual `curl` verification against the running dev server (`npm run dev`) and browser smoke tests in place of automated tests.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `pages/api/saveEmail.js` | Modify | Newsletter subscription → insert into `newsletter` table |
| `pages/api/saveUpdate.js` | Create | Atualizações form → insert into `updates` table + MailerSend email |
| `pages/api/saveApplicant.js` | Delete | Replaced by `saveUpdate.js` |
| `pages/api/uploadFile.js` | Modify | Vagas form → insert into `jobs` table + upload CV to Supabase Storage |
| `pages/api/sendEmail.js` | Delete | Unused legacy Nodemailer route |
| `components/Cta/newsletter.js` | Modify | Wire submit button to `/api/saveEmail` |
| `components/NewsForm.js` | Modify | Change endpoint to `/api/saveUpdate`, remove dead variable |
| `components/ContactForm/ContactForm.js` | Modify | Remove two-step flow, single multipart POST to `/api/uploadFile` |
| `pages/contato.js` | Modify | Swap Atualizações tab from `ContactForm` to `NewsForm` |
| `next.config.js` | Modify | Remove `BACK_DOMAIN` and `BACK_TOKEN` from browser env block |
| `package.json` | Modify | Add `@supabase/supabase-js`, `mailersend`; remove `nodemailer`, `multer`, `dotenv` |
| `.env` | Modify | Fill in `SUPABASE_URL`; remove `BACK_DOMAIN`, `BACK_TOKEN` |

---

## Task 1: Install dependencies and configure env

**Files:**
- Modify: `package.json`
- Modify: `.env`

- [ ] **Step 1: Add new packages**

```bash
npm install @supabase/supabase-js mailersend
```

Expected: both packages appear in `package.json` dependencies, `node_modules` updated.

- [ ] **Step 2: Remove unused packages**

```bash
npm uninstall nodemailer multer dotenv
```

Expected: `nodemailer`, `multer`, `dotenv` removed from `package.json`.

- [ ] **Step 3: Fill in `SUPABASE_URL` in `.env`**

Open `.env` and set `SUPABASE_URL` to your Supabase project URL (found in Supabase dashboard → Project Settings → API → Project URL). Example format: `https://abcdefgh.supabase.co`

The file already has `SUPABASE_SERVICE_KEY`, `MAILERSEND_API_KEY`, and `MAILERSEND_FROM_EMAIL` set.

- [ ] **Step 4: Remove unused env vars from `.env`**

Remove `BACK_DOMAIN` and `BACK_TOKEN` lines from `.env` (they are not present in the current `.env` file — skip if already absent, as confirmed).

- [ ] **Step 5: Remove `BACK_DOMAIN` and `BACK_TOKEN` from `next.config.js`**

In `next.config.js`, remove lines 14–15 from the `env` block:
```js
// Remove these two lines:
BACK_DOMAIN: process.env.BACK_DOMAIN,
BACK_TOKEN: process.env.BACK_TOKEN,
```

Also remove the `require('dotenv').config()` call on line 3 (dotenv is uninstalled and Next.js loads `.env` automatically).

- [ ] **Step 6: Commit**

> Note: Do NOT stage `.env` — it contains secrets and should remain untracked/gitignored.

```bash
git add package.json package-lock.json next.config.js
git commit -m "chore: install supabase+mailersend, remove backend proxy deps"
```

---

## Task 2: Create Supabase tables and storage bucket

These are manual steps in the Supabase dashboard (no code). Complete them before writing any API routes.

- [ ] **Step 1: Create `newsletter` table**

In Supabase dashboard → Table Editor → New table:
- Name: `newsletter`
- Enable Row Level Security: off (server-side only access via service key)
- Columns:
  - `id` uuid, PK, default `gen_random_uuid()`
  - `email` text, not null
  - `created_at` timestamptz, default `now()`

- [ ] **Step 2: Create `updates` table**

New table:
- Name: `updates`
- Enable Row Level Security: off
- Columns:
  - `id` uuid, PK, default `gen_random_uuid()`
  - `name` text, not null
  - `email` text, not null
  - `created_at` timestamptz, default `now()`

- [ ] **Step 3: Create `jobs` table**

New table:
- Name: `jobs`
- Enable Row Level Security: off
- Columns:
  - `id` uuid, PK, default `gen_random_uuid()`
  - `name` text, not null
  - `email` text, not null
  - `message` text, not null
  - `cv_url` text, nullable
  - `created_at` timestamptz, default `now()`

- [ ] **Step 4: Create `cvs` storage bucket**

In Supabase dashboard → Storage → New bucket:
- Name: `cvs`
- Public bucket: yes (enables public URLs)

- [ ] **Step 5: Verify**

In Table Editor, confirm all three tables exist. In Storage, confirm `cvs` bucket exists and is public.

---

## Task 3: Rewrite `/api/saveEmail.js` — newsletter subscription

**Files:**
- Modify: `pages/api/saveEmail.js`

- [ ] **Step 1: Replace the implementation**

Replace the entire contents of `pages/api/saveEmail.js` with:

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email } = JSON.parse(req.body)

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  const { error } = await supabase
    .from('newsletter')
    .insert({ email })

  if (error) {
    console.error(error)
    return res.status(400).json({ message: error.message })
  }

  return res.status(200).json({ status: 200 })
}
```

- [ ] **Step 2: Start dev server and test with curl**

```bash
npm run dev
```

In a separate terminal:

```bash
curl -X POST http://localhost:3000/api/saveEmail \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected response: `{"status":200}`

Verify in Supabase dashboard → Table Editor → `newsletter` that a row with `test@example.com` was inserted.

- [ ] **Step 3: Commit**

```bash
git add pages/api/saveEmail.js
git commit -m "feat: rewrite saveEmail to insert into supabase newsletter table"
```

---

## Task 4: Create `/api/saveUpdate.js` — Atualizações form

**Files:**
- Create: `pages/api/saveUpdate.js`
- Delete: `pages/api/saveApplicant.js`

- [ ] **Step 1: Create `pages/api/saveUpdate.js`**

```js
import { createClient } from '@supabase/supabase-js'
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const mailerSend = new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name, email, message } = JSON.parse(req.body)

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'name, email, and message are required' })
  }

  // Save name + email to updates table (message is not persisted)
  const { error: dbError } = await supabase
    .from('updates')
    .insert({ name, email })

  if (dbError) {
    console.error(dbError)
    return res.status(400).json({ message: dbError.message })
  }

  // Send email notification via MailerSend
  const sentFrom = new Sender(process.env.MAILERSEND_FROM_EMAIL, 'Clean Air Site')
  const recipients = [new Recipient('comercial@cleanairarcondicionado.com.br', 'Comercial')]

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(`Nova mensagem de ${name}`)
    .setHtml(
      `<p><strong>Nome:</strong> ${name}</p>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Mensagem:</strong> ${message}</p>`
    )
    .setText(`Nome: ${name}\nEmail: ${email}\nMensagem: ${message}`)

  try {
    await mailerSend.email.send(emailParams)
  } catch (emailError) {
    // Row is already saved — log email failure but don't block the response
    console.error('MailerSend error:', emailError)
  }

  return res.status(200).json({ status: 200 })
}
```

- [ ] **Step 2: Delete `pages/api/saveApplicant.js`**

```bash
rm pages/api/saveApplicant.js
```

- [ ] **Step 3: Test with curl**

```bash
curl -X POST http://localhost:3000/api/saveUpdate \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Hello from test"}'
```

Expected response: `{"status":200}`

Verify in Supabase → `updates` table that a row was inserted with name and email (no message column).

Check that `comercial@cleanairarcondicionado.com.br` received the email (or check MailerSend dashboard → Activity for a sent event).

- [ ] **Step 4: Commit**

```bash
git add pages/api/saveUpdate.js pages/api/saveApplicant.js
git commit -m "feat: add saveUpdate route with supabase insert and mailersend notification"
```

---

## Task 5: Rewrite `/api/uploadFile.js` — Vagas job application

**Files:**
- Modify: `pages/api/uploadFile.js`

- [ ] **Step 1: Replace the implementation**

Replace the entire contents of `pages/api/uploadFile.js` with:

```js
import { createClient } from '@supabase/supabase-js'
import formidable from 'formidable'
import fs from 'fs'
import { randomUUID } from 'crypto'

export const config = {
  api: { bodyParser: false },
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 }) // 10 MB

  let fields, files
  try {
    ;[fields, files] = await form.parse(req)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }

  const name = fields.name?.[0]
  const email = fields.email?.[0]
  const message = fields.message?.[0]

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'name, email, and message are required' })
  }

  // Insert job application row
  const { data: job, error: dbError } = await supabase
    .from('jobs')
    .insert({ name, email, message })
    .select('id')
    .single()

  if (dbError) {
    console.error(dbError)
    return res.status(400).json({ message: dbError.message })
  }

  const jobId = job.id
  const cvFile = files.cv?.[0]

  if (cvFile) {
    const fileBuffer = fs.readFileSync(cvFile.filepath)
    const storagePath = `${randomUUID()}-${cvFile.originalFilename}`

    const { error: storageError } = await supabase.storage
      .from('cvs')
      .upload(storagePath, fileBuffer, { contentType: cvFile.mimetype })

    if (storageError) {
      // Rollback: delete the job row so the form can be retried cleanly
      await supabase.from('jobs').delete().eq('id', jobId)
      console.error(storageError)
      return res.status(400).json({ message: 'File upload failed. Please try again.' })
    }

    const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(storagePath)

    await supabase
      .from('jobs')
      .update({ cv_url: urlData.publicUrl })
      .eq('id', jobId)
  }

  return res.status(200).json({ jobId })
}
```

- [ ] **Step 2: Delete `pages/api/sendEmail.js`**

```bash
rm pages/api/sendEmail.js
```

- [ ] **Step 3: Test without file**

```bash
curl -X POST http://localhost:3000/api/uploadFile \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "message=I want to apply"
```

Expected response: `{"jobId":"<uuid>"}`.
Verify in Supabase → `jobs` table: row inserted with `cv_url = null`.

- [ ] **Step 4: Test with a file**

```bash
curl -X POST http://localhost:3000/api/uploadFile \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "message=I want to apply" \
  -F "cv=@/path/to/test.pdf"
```

Expected response: `{"jobId":"<uuid>"}`.
Verify in Supabase → `jobs` table: row has a non-null `cv_url` pointing to the `cvs` bucket.
Verify in Supabase → Storage → `cvs` bucket: file is present.

- [ ] **Step 5: Commit**

```bash
git add pages/api/uploadFile.js pages/api/sendEmail.js
git commit -m "feat: rewrite uploadFile to insert jobs row and upload cv to supabase storage"
```

---

## Task 6: Wire up `newsletter.js` submit button

**Files:**
- Modify: `components/Cta/newsletter.js`

- [ ] **Step 1: Update the component**

Replace the entire contents of `components/Cta/newsletter.js` with:

```js
import React, { useState } from 'react'
import styles from './styles/newsletter.module.css'
import Section from '../Section/Section'
import Image from 'next/image'

export default function Newsletter() {

  const [status, setStatus] = useState('') // '' | 'success' | 'error'
  const [message, setMessage] = useState('')

  const saveEmail = async () => {
    const email = document.getElementById('newsEmail').value

    if (!email) {
      setStatus('error')
      setMessage('Por favor, insira seu e-mail.')
      return
    }

    try {
      const res = await fetch('/api/saveEmail', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus('success')
        setMessage('E-mail cadastrado com sucesso!')
      } else {
        setStatus('error')
        setMessage('Houve um erro. Tente novamente.')
      }
    } catch {
      setStatus('error')
      setMessage('Houve um erro. Tente novamente.')
    }
  }

  return (
    <Section className={styles.newsletter}>
      <div className={styles.container}>
        <div className={styles.image}>
          <Image
            src="/newsletter.png"
            fill
            style={{ objectFit: 'contain' }}
            alt="ar condicionado central midea"
          />
        </div>
        <div className={styles.content}>
          <div className={styles.title}>Não perca nossas atualizações</div>
          <div className={styles.text}>Preencha o campo abaixo e receba novidades por e-mail.</div>
          <div className={styles.field}>
            <input id="newsEmail" type="email" placeholder="E-mail" />
            <button onClick={saveEmail}>Enviar</button>
          </div>
          {message && (
            <div style={{ marginTop: '0.5rem', color: status === 'success' ? 'green' : 'red', fontSize: '0.875rem' }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
```

- [ ] **Step 2: Smoke test in browser**

Open `http://localhost:3000` (or whichever page renders the newsletter component), enter an email, click Enviar.

Expected: success message appears. Verify row in Supabase → `newsletter` table.

- [ ] **Step 3: Commit**

```bash
git add components/Cta/newsletter.js
git commit -m "feat: wire newsletter submit button to saveEmail api"
```

---

## Task 7: Update `NewsForm.js` endpoint

**Files:**
- Modify: `components/NewsForm.js`

- [ ] **Step 1: Change endpoint URL and remove dead code**

In `components/NewsForm.js`:
- Line 22: delete `const backendDomain = 'https://clean-air-backend-production.up.railway.app'` (unused variable)
- Line 95: change `/api/saveEmail` to `/api/saveUpdate`

The two edits together:

```js
// Delete line 22 entirely — remove:
const backendDomain = 'https://clean-air-backend-production.up.railway.app'
```

```js
// Line 95 — change:
fetch(`/api/saveEmail`, {
// to:
fetch(`/api/saveUpdate`, {
```

- [ ] **Step 2: Smoke test in browser**

Navigate to `http://localhost:3000/contato` (after Task 9 updates contato.js to use NewsForm in the Atualizações tab — or test by temporarily visiting the form if already rendered).

Fill in name, email, message and submit. Expected: success message. Verify row in Supabase → `updates` table. Check MailerSend dashboard for sent email.

- [ ] **Step 3: Commit**

```bash
git add components/NewsForm.js
git commit -m "feat: update NewsForm to call saveUpdate endpoint"
```

---

## Task 8: Simplify `ContactForm.js` to single multipart POST

**Files:**
- Modify: `components/ContactForm/ContactForm.js`

- [ ] **Step 1: Replace `handleSubmit` body**

In `components/ContactForm/ContactForm.js`, replace the `handleSubmit` function (lines 47–177) with the following. Everything outside `handleSubmit` (state management, `handleInputChange`, the JSX return) stays unchanged.

> Note: The existing `handleSubmit` contains a `matchPasswords` block (lines 79–87). The `ContactForm` is only used for the Vagas tab in `contato.js`, which never passes a `matchPasswords` prop — so dropping it has no functional impact. The new implementation below omits it intentionally.

```js
async function handleSubmit(e) {
  e.preventDefault()

  setRecaptchaHelp(false)
  setSentMessage('')
  setError(false)

  if (window.location.hostname !== 'localhost') {
    const recaptchaValue = recaptchaRef.current.getValue()
    if (recaptchaValue === '') {
      setRecaptchaHelp(true)
      return false
    }
  }

  let filledFields = 0
  let requiredFields = 0

  state.map(item => {
    if (item.type === 'text' || item.type === 'email') {
      requiredFields++
      if (item.value !== '') filledFields++
    }
  })

  if (filledFields !== requiredFields) {
    setError(true)
    setSentMessage('Algum campo ficou vazio.')
    return false
  }

  setButtonContent(<i className="fa-solid fa-spin fa-spinner"></i>)
  setButtonDisabled(true)

  const name = state[0].value
  const email = state[1].value
  const message = state[2].value
  const cv = state[3]?.value || null

  const formData = new FormData()
  formData.append('name', name)
  formData.append('email', email)
  formData.append('message', message)
  if (cv) formData.append('cv', cv)

  try {
    const res = await fetch('/api/uploadFile', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      setButtonDisabled(false)
      setButtonContent(buttonText)
      setError(false)
      setSentMessage(successMessage)
      onSuccess(await res.json())
    } else {
      throw new Error('Server error')
    }
  } catch {
    setButtonDisabled(false)
    setButtonContent(buttonText)
    setError(true)
    setSentMessage(errorMessage)
  }
}
```

- [ ] **Step 2: Remove the `hasFile` prop from the PropTypes at the bottom of the file**

```js
// Remove this line from Form.propTypes:
hasFile: PropTypes.bool || true,
```

- [ ] **Step 3: Remove the unused `axios` import at line 5**

```js
// Remove:
import axios from 'axios'
```

- [ ] **Step 4: Smoke test in browser**

After Task 9 updates `contato.js`, navigate to `http://localhost:3000/contato` → "Vagas" tab. Fill in all fields without a file and submit. Expected: success message. Verify row in Supabase → `jobs` table with `cv_url = null`.

Then test again with a file attached. Verify row has a non-null `cv_url`.

- [ ] **Step 5: Commit**

```bash
git add components/ContactForm/ContactForm.js
git commit -m "feat: simplify ContactForm to single multipart POST to uploadFile"
```

---

## Task 9: Update `contato.js` — swap Atualizações tab to `NewsForm`

**Files:**
- Modify: `pages/contato.js`

- [ ] **Step 1: Add `NewsForm` import**

At the top of `pages/contato.js`, add:

```js
import NewsForm from '@components/NewsForm'
```

> Important: keep the existing `import { findValueById, findFilenameById } from '@lib/helper'` line — it is still needed by the `apiBody` prop passed to `NewsForm` in the Atualizações tab.

- [ ] **Step 2: Replace the "Atualizações" tab content**

Find the "Atualizações" `<Tab>` block (lines 78–105). Replace the `<ContactForm>` inside it with `<NewsForm>`:

```js
<Tab title="Atualizações" color="#001E60">
  <div className="text-center mb-3 mt-0 px-2 py-4" style={{backgroundColor:'#001E60', color:'white'}}>
    Fique por dentro das nossas atualizações.<br/>Envie sugestões, elogios e/ou críticas.
  </div>

  <NewsForm
    fields={talkToUsFields}
    apiBody={(state) => ({
      name: findValueById(state, 'name'),
      email: findValueById(state, 'email'),
      message: findValueById(state, 'message'),
    })}
    errorMessage="Houve um erro na tentativa de enviar seu email. Recarregue a página e tente novamente."
    successMessage="Email enviado com sucesso!"
    onSuccess={() => {}}
    footerLeftEl={null}
    buttonText="Enviar"
  />
</Tab>
```

- [ ] **Step 3: Remove `hasFile` prop from the "Vagas" tab's `ContactForm`**

In the "Vagas" `<Tab>` block, remove the `hasFile={true}` (or absent) prop from `<ContactForm>` — it no longer exists on the component.

Also update the `apiBody` prop of the "Vagas" `<ContactForm>` to remove the `cv` field (it is now sent as a raw file via FormData, not through `apiBody`):

```js
// The Vagas ContactForm apiBody only needs name, email, message now.
// The cv file is sent separately as FormData by ContactForm internally.
// If apiBody is no longer used in the new ContactForm, remove the prop entirely.
```

After Task 8, `ContactForm` no longer uses `apiBody` — it builds FormData internally. Remove the `apiBody` prop from the "Vagas" tab's `<ContactForm>` usage in `contato.js`.

- [ ] **Step 4: Full smoke test in browser**

Navigate to `http://localhost:3000/contato`.

- "Atualizações" tab: fill in name, email, message → submit. Expect success message. Verify Supabase `updates` row and MailerSend activity.
- "Vagas" tab: fill in name, email, message → submit without file. Expect success. Verify Supabase `jobs` row with `cv_url = null`.
- "Vagas" tab again: submit with a PDF attached. Verify `cv_url` is set in Supabase.
- Newsletter widget (any page): enter email → submit. Verify Supabase `newsletter` row.

- [ ] **Step 5: Commit**

```bash
git add pages/contato.js
git commit -m "feat: swap Atualizações tab to NewsForm, clean up Vagas ContactForm props"
```

---

## Task 10: Final cleanup

**Files:**
- Modify: `package.json` (verify axios is still needed, remove if not)

- [ ] **Step 1: Check if `axios` is still used anywhere**

```bash
grep -r "import axios" pages/ components/ --include="*.js"
```

If no results: remove axios.

```bash
npm uninstall axios
```

If still used elsewhere: leave it.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Fix any errors reported.

- [ ] **Step 3: Run build to verify no compile errors**

```bash
npm run build
```

Expected: build completes without errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: cleanup unused deps and lint fixes post-migration"
```
