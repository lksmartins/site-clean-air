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

  const { name, email, message } = req.body

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
