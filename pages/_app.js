import '../styles/globals.css'
import Navbar from '../components/Navbar/Navbar'
import Script from 'next/script'

function MyApp({ Component, pageProps }) {

    return <>
        <Script src="https://kit.fontawesome.com/b73a956a41.js"/>
        <Navbar />
        <Component {...pageProps} />
    </>

}

export default MyApp
