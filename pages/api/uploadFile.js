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

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 })
  let fields, files
  try {
    const parsed = await form.parse(req)
    ;[fields, files] = parsed
  } catch (err) {
    console.error('Form parse error:', err.message, err.stack)
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
    const fileBuffer = await fs.promises.readFile(cvFile.filepath)
    const storagePath = `${randomUUID()}-${cvFile.originalFilename}`

    const { error: storageError } = await supabase.storage
      .from('cvs')
      .upload(storagePath, fileBuffer, { contentType: cvFile.mimetype })

    if (storageError) {
      // Clean up formidable's temp file
      await fs.promises.unlink(cvFile.filepath).catch(() => {})
      // Rollback: delete the job row so the form can be retried cleanly
      await supabase.from('jobs').delete().eq('id', jobId)
      console.error(storageError)
      return res.status(400).json({ message: 'File upload failed. Please try again.' })
    }

    // Clean up formidable's temp file
    await fs.promises.unlink(cvFile.filepath).catch(() => {})

    const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(storagePath)

    const { error: updateError } = await supabase
      .from('jobs')
      .update({ cv_url: urlData.publicUrl })
      .eq('id', jobId)

    if (updateError) {
      console.error('cv_url update error:', updateError)
    }
  }

  return res.status(200).json({ jobId })
}
