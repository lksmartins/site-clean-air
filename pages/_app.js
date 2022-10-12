import '../styles/globals.css'
import Head from 'next/head'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import Script from 'next/script'
//import BootstrapLoader from '../components/BootstrapLoader'
import 'bootstrap/dist/css/bootstrap.css'

function MyApp({ Component, pageProps }) {

    return <>
        <Head>
            <link rel="shortcut icon" href="/fav.ico" />
        </Head>
        <Script src="https://kit.fontawesome.com/b73a956a41.js"/>
        <Navbar />
        <Component {...pageProps} />
        <Footer/>
    </>

}

export default MyApp
