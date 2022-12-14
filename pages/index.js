import React, {useState, useEffect} from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Section from '../components/Section/Section'
import sectionStyles from '../components/Section/styles/Section.module.css'
import BannerSection from '../components/Section/BannerSection'
import Bubble from '../components/Bubble/Bubble'
import BubbleContent from '../lib/bubbles.json'
import svgProjetos from '../public/bubbles/projetos.svg'
import svgManutencao from '../public/bubbles/manutencao.svg'
import svgInstalacao from '../public/bubbles/instalacao.svg'
import svgVendas from '../public/bubbles/vendas.svg'
import PortfolioSection from '../components/Cta/portfolio'
import Form from '../components/NewsForm'
import {findValueById} from '../lib/helper'

export default function Home() {

    const bubbleIcons = {
        'projetos': svgProjetos,
        'manutencao': svgManutencao,
        'instalacao': svgInstalacao,
        'vendas': svgVendas
    }

    const fields = [
        {id:'email', name:'E-mail', type:'email', value:''},
    ]

    const defaultBgPos = 'center -3rem'
    const [backgroundPosition, setBackgroundPosition] = useState(defaultBgPos)
    const adjustBgPos = ()=>{

        const proportion = window.innerWidth/window.innerHeight
        let isMobile = window.innerHeight > window.innerWidth
        let newBgPos = defaultBgPos

        if( isMobile || proportion < 1.48 ){
            newBgPos = 'center top'
        }

        setBackgroundPosition(newBgPos)
    }

    useEffect(() => {

        if( window != undefined ){
            adjustBgPos()
            window.addEventListener('resize',adjustBgPos)
        }

        return () => window.removeEventListener("resize", adjustBgPos);

    },[])

    return (
        <>
            <Head>
                <title>Clean Air</title>
                <meta name="description" content="Qualificação e comprometimento" />
            </Head>

            <main>

                <div id="banner"
                    className="container-fluid d-flex flex-column justify-content-center align-items-center mb-5"
                    style={{
                        marginTop:          '-85px',
                        overflow:           'hidden', 
                        padding:            '10vw 0', 
                        minHeight:          '20vw', 
                        maxHeight:          '500px', 
                        position:           'relative', 
                        backgroundImage:    'url(/fachada.jpg)', 
                        backgroundPosition: backgroundPosition,
                        backgroundSize:     'cover'
                    }}
                    >

                    <div className="container">

                        <div className="d-flex">
                            <div 
                                className="text-light fw-bold fs-2"
                                style={{
                                    marginTop: '3rem',
                                }}>
                                <div>
                                    <div className="mb-2" style={{
                                        marginRight: '3rem',
                                        marginLeft: '-50vw',
                                        padding: '.5rem 3rem .5rem 50vw',
                                        boxShadow:'10px 10px 5px -6px rgba(0,0,0,0.75)', 
                                        backgroundColor:'rgba(0,30,96,0.85)',
                                        fontWeight: '900',
                                        lineHeight: '2.5rem'
                                    }}>
                                        Qualificação e<br/>
                                        comprometimento
                                    </div>
                                    
                                    <div className="fs-5 py-3 px-4" style={{
                                        boxShadow:'10px 10px 5px -6px rgba(0,0,0,0.75)', 
                                        width:'clamp(320px, 25vw, 960px)', 
                                        backgroundColor:'rgba(0,163,224,0.75)',
                                        fontWeight: '200',
                                        lineHeight: '1.7rem',
                                    }}>
                                        Atuando desde 2010 na área de 
                                        refrigeração, a <b style={{fontWeight: 'bold'}}>Clean Air</b> busca
                                        garantir a perfeita operação dos
                                        sistemas de ar condicionado
                                        visando a satisfação do cliente.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                
                </div>

                <Section id="bubbles" className={`${sectionStyles.grid} ${sectionStyles.col4} ${sectionStyles.gap4}`}>
                    {BubbleContent.map(item=>{
                        const img = <Image src={bubbleIcons[item.icon]} layout="fill" objectFit="contain" alt={item.title} />
                        return <Bubble key={item.icon} title={item.title} icon={img}>{item.text}</Bubble>
                    })}
                </Section>

                <PortfolioSection/>

                <div id="newsletter" className="container py-5 my-4">
                    <div className="row">
                        <div className="col-lg-6 col-sm-12">
                            <div className="w-100 h-100">
                                <img className="img-fluid mb-5 mb-lg-0" src="/newsletter.png" alt="ar condicionado central midea"/>
                            </div>
                        </div>
                        <div className="col-lg-6 col-sm-12 text-center">
                            <h3 className="fw-black">Não perca nossas atualizações</h3>
                            <div className="mb-3">Preencha o campo abaixo e receba novidades por e-mail.</div>
                            <Form
                                fields={fields}
                                apiBody={(state)=>{
                                        return {  
                                            email: findValueById(state, 'email')
                                        }
                                    }
                                }
                                errorMessage="Houve um erro na tentativa de enviar seu email. Recarregue a página e tente novamente."
                                successMessage="Email enviado com sucesso!"
                                onSuccess={(response)=>{
                                    console.log("sucesso", response)
                                }}
    
                                footerLeftEl={null}
                                buttonText="Enviar"
                            />
                        </div>
                    </div>
                </div>

            </main>            
            
        </>
    )
}
