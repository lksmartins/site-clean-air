import { Client, Databases, ID } from 'node-appwrite'
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)
const mailerSend = new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY })

const escapeHtml = (str) =>
  String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { name, email, message } = body

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'name, email, and message are required' })
  }

  try {
    await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_UPDATES_COLLECTION_ID,
      ID.unique(),
      { name, email }
    )
  } catch (error) {
    console.error(error)
    return res.status(400).json({ message: error.message })
  }

  const sentFrom = new Sender(process.env.MAILERSEND_FROM_EMAIL, 'Clean Air Site')
  const recipients = [new Recipient(process.env.MAILERSEND_TO_EMAIL, 'Comercial')]

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(`Nova mensagem de ${name}`)
    .setHtml(
      `<p><strong>Nome:</strong> ${escapeHtml(name)}</p>
       <p><strong>Email:</strong> ${escapeHtml(email)}</p>
       <p><strong>Mensagem:</strong> ${escapeHtml(message)}</p>`
    )
    .setText(`Nome: ${name}\nEmail: ${email}\nMensagem: ${message}`)

  try {
    await mailerSend.email.send(emailParams)
  } catch (emailError) {
    console.error('MailerSend error:', emailError)
  }

  return res.status(200).json({ status: 200 })
}
