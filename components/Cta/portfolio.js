import React from 'react'
import styles from './styles/portfolio.module.css'
import Section from '../Section/Section'
import Link from 'next/link'

export default function portfolio() {
    return(
        <Section className={styles.portfolio}>
            <div className={styles.textBar}>
                <div className={styles.container}>
                    <div className={styles.title}>
                        <h2>Nosso portfólio</h2>
                    </div>
                    <div className={styles.text}>
                        A partir do conhecimento técnico e da eficiência de nossa equipe, conquistamos a confiança de diversos clientes importantes e construímos um vasto portfólio especializado em centrais térmicas de ar condicionado e sistemas de refrigeração.
                    </div>
                    <div className={styles.link}>
                        <Link href="/portfolio"><a className="link">Acesse o catálogo completo <i className="fa-solid fa-caret-right"></i></a></Link>
                    </div>
                </div>
            </div>
        </Section>
    )
}