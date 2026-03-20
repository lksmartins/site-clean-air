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
        headers: { 'Content-Type': 'application/json' },
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