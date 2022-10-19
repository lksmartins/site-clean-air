import Head from 'next/head'
import ContactForm from '../components/ContactForm/ContactForm'
import { findValueById, findFilenameById } from '../lib/helper'
import socialLinks from '../lib/social.json'
import Link from 'next/link'
import Banner from '../components/PageBanner'

export default function Contato() {

    const fields = [
        {id:'name', name:'Nome', type:'text', value:''},
        {id:'email', name:'E-mail', type:'email', value:''},
        {id:'message', name:'Mensagem', type:'text', value:''},
        {id:'cv', name:'Currículo', type:'file', value:''}
    ]

    const socials = [
        {title:'LinkedIn', text:'cleanair.ac', icon:'icon1', url:socialLinks.linkedin.url},
        {title:'Comercial', text:socialLinks.whatsappComercial.number, icon:'icon2', url:socialLinks.whatsappComercial.url},
        {title:'Técnico', text:socialLinks.whatsappTecnico.number, icon:'icon2', url:socialLinks.whatsappTecnico.url},
        {title:'Instagram', text:'@cleanair.ac', icon:'icon3', url:socialLinks.instagram.url},
    ]

    return (
        <>
            <Head>
                <title>Contato - Clean Air</title>
                <meta name="description" content="Fale conosco" />
            </Head>

            <main>

                <Banner title="Contato" subtitle="Fale conosco"/>

                <div id="contato" className="container py-5">
                    <div className="row">

                        <div className="col-lg-5 col-sm-12 d-flex flex-column justify-content-center">
                            <div 
                            className="w-100 d-flex flex-column justify-content-center text-center gap-4 p-5 text-light" 
                            style={{backgroundColor:'#00A3E0', boxShadow:'0.35rem 0.35rem 10px 0px rgb(0 0 0 / 60%)'}}>
                                <div>
                                    <h4 className="mb-0 text-light">Atendimento</h4>
                                    <div>
                                        De segunda à sexta<br/>
                                        Das 08h às 17h50
                                    </div>
                                </div>
                                <div>
                                    <h4 className="mb-0 text-light">Telefone</h4>
                                    <div>
                                        (51) 3554.0017
                                    </div>
                                </div>
                                <div>
                                    <h4 className="mb-0 text-light">Endereço</h4>
                                    <div>
                                        Rua Ida Schuch, 46<br/>
                                        Bairro Vicentina<br/>
                                        São Leopoldo/RS<br/>
                                        CEP 93025-420
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-7 col-sm-12 d-flex flex-column justify-content-center align-items-center">
                            
                            <div style={{maxWidth:'362px'}}>
                                <div className="mb-3 mt-5 mt-lg-0" style={{padding:'0 1.8rem'}}>
                                    <h3 className="fw-black">Trabalhe conosco</h3>
                                    <div>Queremos conhecer o seu talento, venha fazer parte da nossa equipe.</div>
                                </div>
                                
                                <ContactForm
                                    fields={fields}
                                    apiBody={(state)=>{
                                            return {  
                                                recipient: 'martins@chavemestra.net',
                                                name: findValueById(state, 'name'), 
                                                email: findValueById(state, 'email'), 
                                                message: findValueById(state, 'message'),
                                                cv: findFilenameById(state, 'cv')
                                            }
                                        }
                                    }
                                    errorMessage="Houve um erro na tentativa de enviar seu email. Recarregue a página e tente novamente."
                                    successMessage="Email enviado com sucesso!"
                                    onSuccess={(response)=>{
                                        
                                    }}

                                    footerLeftEl={null}
                                    buttonText="Enviar"
                                />
                            </div>
                            
                            
                        </div>

                    </div>
                </div>

                <div id="redes" className="container-fluid py-5 text-light text-center" style={{backgroundColor:'#001E60'}}>
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <h3 className="border">Nossas redes sociais</h3>
                                <div>Acompanhe nossas redes sociais: siga, curta e compartilhe.</div>
                            </div>
                        </div>
                        <div className="row">
                            {
                                socials.map(item=>{
                                    return (
                                        <div key={item.title} className="col-lg-3 col-sm-12">
                                            <div className="d-flex justify-content-center mt-5 mb-3" style={{maxHeight:'6rem', position: 'relative'}}>
                                                <Link href={item.url}><a target="_blank"><img className="img-fluid" src={`/contato/${item.icon}.png`}/></a></Link>
                                            </div>
                                            <Link href={item.url}><a target="_blank">
                                                <h4 className="mb-0 text-light">{item.title}</h4>
                                                <div>{item.text}</div>
                                            </a></Link>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>

                <div id="emails" className="container py-5">
                    <div className="row">
                        <div className="col-lg-7 col-sm-12">
                            <div className="d-flex flex-column justify-content-center align-items-start w-100 h-100" style={{
                                overflow: 'hidden',
                                fontSize: '0.9rem'
                            }}>
                                <h3 className="mb-5 fw-black">E-mails</h3>

                                <h5 className="mb-0 fw-black">Setor administrativo</h5>
                                <div className="mb-3">administracao@cleanairarcondicionado.com.br</div>

                                <h5 className="mb-0 fw-black">Setor comercial</h5>
                                <div className="mb-3">comercial@cleanairarcondicionado.com.br</div>

                                <h5 className="mb-0 fw-black">Departamento técnico</h5>
                                <div className="mb-3">deptecnico@cleanairarcondicionado.com.br</div>
                            </div>
                        </div>
                    
                        <div className="col-lg-5 p-5 p-lg-2">
                            <img className="img-fluid" src="/contato/emails.png"/>
                        </div>
                    </div>
                </div>

            </main>            
            
        </>
    )
}
