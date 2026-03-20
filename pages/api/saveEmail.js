import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { email } = body

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
