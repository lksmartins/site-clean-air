import { Client, Databases, ID } from 'node-appwrite'

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { email } = body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_NEWSLETTER_COLLECTION_ID,
      ID.unique(),
      { email }
    )
  } catch (error) {
    console.error(error)
    return res.status(400).json({ message: error.message })
  }

  return res.status(200).json({ status: 200 })
}
