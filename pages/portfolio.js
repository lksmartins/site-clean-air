import Head from 'next/head'
import Image from 'next/image'
import Section from '../components/Section/Section'
import sectionStyles from '../components/Section/styles/Section.module.css'
import svg1 from '../public/portfolio/icon1.svg'
import svg2 from '../public/portfolio/icon2.svg'
import svg3 from '../public/portfolio/icon3.svg'
import Link from 'next/link'

const backendDomain = 'https://clean-air-backend-production.up.railway.app'

export async function getServerSideProps() {

    const res = await fetch(`${process.env.BACK_DOMAIN}/api/portfolio?populate=*`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.BACK_TOKEN}`,
        }
    })

    const data = await res.json()

    return {
      props: {
        portfolioUrl: data.data.attributes.file.data.attributes.url
      },
    }
  }

const PortfolioLink = (props)=>{

    return <Link href={backendDomain+props.url} download="clean_air_portfolio.pdf" rel="noreferrer">
        <a target="_blank" className="link">{props.children}</a>
    </Link>

}

export default function Portfolio({portfolioUrl}) {

    const bubbleContent = [
        {"icon":svg1, "title":"Conhecimento e experiência"},
        {"icon":svg2, "title":"Excelente custo-benefício"},
        {"icon":svg3, "title":"Compromisso e agilidade"},
    ]

    return (
        <>
            <Head>
                <title>Portfólio - Clean Air</title>
            </Head>

            <main>

                <div id="banner" 
                    className="container-fluid d-flex flex-column justify-content-center align-items-center"
                    style={{
                        overflow: 'hidden', 
                        padding:'7rem 0', 
                        marginTop: '-85px',
                        minHeight:'20vw', 
                        maxHeight:'600px', 
                        position: 'relative', 
                        backgroundImage:'url(/sobre-nos/banner.png)', 
                        backgroundPosition:'center center', 
                        backgroundSize:'cover'
                    }}
                    >
                        
                    <div 
                    className="text-light fw-bold fs-2"
                    style={{
                        padding: '.5rem 10vw',
                        boxShadow:'10px 10px 5px -6px rgba(0,0,0,0.75)', 
                        alignSelf:'flex-start', 
                        backgroundColor:'rgba(0,30,96,0.85)'
                    }}>
                        Portfólio
                        <div className="fw-normal fs-5">
                            Confira nosso catálogo
                        </div>
                    </div>
                    
                </div>

                <div id="portfolio" className="container p-5">
                    <div className="row">
                        <div className="col-lg-7 col-sm-12 pe-lg-5">
                            <div className="d-flex flex-column justify-content-center w-100 h-100">
                                <h3 className="mb-3">Nosso portfólio</h3>
                                <p>
                                    A partir do conhecimento técnico e da eficiência 
                                    de nossa equipe, conquistamos a confiança de
                                    diversos clientes importantes e construímos um 
                                    vasto portfólio especializado em centrais térmicas
                                    de ar condicionado e sistemas de refrigeração.
                                </p>
                                <p>
                                    Para fazer o download do portfólio <PortfolioLink url={portfolioUrl}>clique aqui</PortfolioLink>
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-5 col-sm-12">
                            <img className="img-fluid" src="portfolio/portfolio.png"/>
                        </div>
                    </div>
                </div>

                <div id="chiller" 
                    className="container-fluid d-flex flex-column justify-content-center align-items-center"
                    style={{
                        overflow: 'hidden', 
                        padding:'5rem 0', 
                        minHeight:'20vw', 
                        position: 'relative', 
                        backgroundImage:'url(/servicos/vendasBg.png)', 
                        backgroundPosition:'center center', 
                        backgroundSize:'cover'
                    }}
                    >
                        
                    <div 
                    className="text-light fw-bold fs-2 d-flex flex-column justify-content-center align-items-center"
                    style={{
                        padding: '4rem',
                        boxShadow:'-10px 10px 5px -6px rgba(0,0,0,0.75)', 
                        backgroundColor:'rgba(0,30,96,0.85)',
                        width: '110%'
                    }}>
                        <h3 className="border mb-3 text-center">Especialistas em Chiller</h3>
                        <div className="fs-5 fw-normal w-100 w-lg-75 text-center" style={{maxWidth:'960px'}}>
                            Com mais de dez anos de expriência, a Clean Air Ar Condicionado vem atuando na área de 
                            refrigeração e realizando serviços em diversos equipamentos. Dentre os trabalhos executados, 
                            a especialidade da empresa concentra-se na manutenção e na instalação de chillers. Confira
                            alguns dos serviços feitos pela empresa em nosso <PortfolioLink url={portfolioUrl}>catálogo</PortfolioLink> e solicite seu orçamento.
                        </div>
                    </div>
                    
                </div>
                
                <div id="bubbles" className="container py-5">
                    <h2 className="fw-bold text-center text-lg-start mb-3">Vantagens</h2>
                    <div className="mb-4 text-center text-lg-start">Alguns dos benefícios adquiridos ao contratar a empresa.</div>
                    <Section id="bubbles" className={`${sectionStyles.grid} ${sectionStyles.col3} ${sectionStyles.gap4}`}>
                        {bubbleContent.map(item=>{
                            const img = <Image src={item.icon} layout="fill" objectFit="contain" alt={item.title} />
                            return <div key={item.title} className="d-flex flex-column justify-content-center align-items-center w-100 gap-1">
                                        <div className="w-100" style={{height: '8rem', position: 'relative'}}>{img}</div>
                                        <div className="fw-bold fs-5 p-2 px-5 text-center">{item.title}</div>
                                    </div>
                        })}
                    </Section>
                </div>

            </main>            
            
        </>
    )
}
