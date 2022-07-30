import React from 'react'
import styles from './styles/newsletter.module.css'
import Section from '../Section/Section'
import Image from 'next/image'

export default function newsletter() {
    return(
        <Section className={styles.newsletter}>
            
            <div className={styles.container}>
                <div className={styles.image}>
                    <Image 
                        src="/newsletter.png"
                        layout="fill"
                        objectFit="contain"
                        alt="ar condicionado central midea"
                    />
                </div>
                <div className={styles.content}>
                    <div className={styles.title}>Não perca nossas atualizações</div>
                    <div className={styles.text}>Preencha o campo abaixo e receba novidades por e-mail.</div>
                    <div className={styles.field}>
                        <input type="email" placeholder="E-mail"/>
                        <button>Enviar</button>
                    </div>
                </div>
            </div>
            
        </Section>
    )
}