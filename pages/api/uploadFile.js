import { Client, Databases, Storage, ID } from 'node-appwrite'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: { bodyParser: false },
}

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)
const storage = new Storage(client)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 })
  let fields, files
  try {
    ;[fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve([fields, files])
      })
    })
  } catch (err) {
    console.error('Form parse error:', err.message, err.stack)
    return res.status(400).json({ message: err.message })
  }

  const name = fields.name
  const email = fields.email
  const message = fields.message

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'name, email, and message are required' })
  }

  let job
  try {
    job = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_JOBS_COLLECTION_ID,
      ID.unique(),
      { name, email, message }
    )
  } catch (dbError) {
    console.error(dbError)
    return res.status(400).json({ message: dbError.message })
  }

  const jobId = job.$id
  const cvFile = files.cv

  if (cvFile) {
    let uploadedFile
    try {
      const fileBuffer = await fs.promises.readFile(cvFile.filepath)
      const rawName = cvFile.originalFilename || cvFile.newFilename || 'cv'
      const safeName = rawName
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
        .replace(/[^a-zA-Z0-9.\-_]/g, '_')               // replace unsafe chars

      uploadedFile = await storage.createFile(
        process.env.APPWRITE_BUCKET_ID,
        ID.unique(),
        new File([fileBuffer], safeName, { type: cvFile.mimetype })
      )
    } catch (storageError) {
      await fs.promises.unlink(cvFile.filepath).catch(() => {})
      await databases.deleteDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_JOBS_COLLECTION_ID,
        jobId
      ).catch(() => {})
      console.error(storageError)
      return res.status(400).json({ message: 'File upload failed. Please try again.' })
    }

    await fs.promises.unlink(cvFile.filepath).catch(() => {})

    const cvUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${uploadedFile.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`

    try {
      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_JOBS_COLLECTION_ID,
        jobId,
        { cv_url: cvUrl }
      )
    } catch (updateError) {
      console.error('cv_url update error:', updateError)
    }
  }

  return res.status(200).json({ jobId })
}
