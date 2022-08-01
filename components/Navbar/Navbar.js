import React, {useEffect, useState} from 'react'
import styles from './styles/navbar.module.css'
import menuItems from '../../lib/menuItems.json'
import SearchBar from './SearchBar'
import Image from 'next/image'
import logo from '../../public/logo-azul.png'
import logoBranco from '../../public/logo-branco.png'
import logoMidea from '../../public/midea.png'
import logoCarrier from '../../public/carrier.png'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Navbar() {

    const router = useRouter()
    const [showMobileMenu, setShowMobileMenu] = useState(false)

    useEffect(()=>{
        setShowMobileMenu(false)
    },[router])

    return (
    <>
        <nav className={`${styles.mobileMenu} ${!showMobileMenu && styles.hidden}`}>
            <div className={styles.filler} onClick={()=>setShowMobileMenu(false)}></div>
            <div className={styles.menu}>
                <div className={styles.menuItem}><Link href="/">
                    <Image
                        src={logoBranco}
                        layout="fill"
                        objectFit="contain"
                        alt="Clean Air logo branco" /></Link></div>
                {
                    menuItems.map(item => {
                        return <div className={styles.menuItem} key={item.id}><Link href={item.url}>{item.text}</Link></div>
                    })
                }
                <div className={styles.menuItem}><a onClick={()=>setShowMobileMenu(false)}><i className="fa-solid fa-circle-chevron-left"></i> Voltar</a></div>
            </div>
        </nav>
        
        <nav className={styles.navbar}>

            <div className={styles.topBar}>
                <div className={styles.container}>
                    <div className={styles.logo}>
                        <Image
                            priority
                            src={logo}
                            layout="fill"
                            objectFit="contain"
                            alt="Clean Air logo" />
                    </div>
                    <div className={styles.partners}>
                        <div className={styles.item}>
                            <Image
                                src={logoMidea}
                                alt="Clean Air logo" />
                        </div>
                        <div className={styles.item}>
                            <Image
                                src={logoCarrier}                                
                                alt="Clean Air logo" />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.bottomBar}>
                <div className={styles.container}>
                    <div className={styles.menu}>
                        {
                            menuItems.map(item => {
                                return <div className={styles.menuItem} key={item.id}>{item.text}</div>
                            })
                        }
                        <SearchBar />
                    </div>
                </div>
            </div>

            <div className={styles.bottomBarMobile}>
                <SearchBar />
                <a onClick={()=>setShowMobileMenu(!showMobileMenu)}><i className="fa-solid fa-bars"></i></a>
            </div>

        </nav>
    </>
    )
}