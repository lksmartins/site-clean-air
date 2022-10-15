import React, {useState, useEffect} from 'react'

export default function PageBanner({title, subtitle, heightProps={p:'8rem 0', minH:'20vw', maxH:'600px'}}) {

    const [backgroundPosition, setBackgroundPosition] = useState('center -3rem')
    const adjustBgPos = ()=>{

        const proportion = window.innerWidth/window.innerHeight
        let isMobile = window.innerHeight > window.innerWidth
        let newBgPos = 'center -3rem'

        if( isMobile || proportion < 1.48 ){
            newBgPos = 'center center'
        }

        if( newBgPos != backgroundPosition ) setBackgroundPosition(newBgPos)
    }

    useEffect(() => {

        if( window != undefined ){
            adjustBgPos()
            window.addEventListener('resize',adjustBgPos)
        }

        return () => window.removeEventListener("resize", adjustBgPos);

    },[])

    return(
        
        <div
            className="container-fluid d-flex flex-column justify-content-center align-items-center"
            style={{
                overflow:           'hidden', 
                marginTop:          '-85px',
                padding:            heightProps.p, 
                minHeight:          heightProps.minH, 
                maxHeight:          heightProps.maxH, 
                position:           'relative', 
                backgroundImage:    'url(/sobre-nos/banner.png)', 
                backgroundPosition: backgroundPosition,
                backgroundSize:     'cover'
            }}
            >

                <div className="container">

                    <div className="d-flex">
                        <div 
                            className="text-light fw-bold fs-2"
                            style={{
                                marginTop: '1rem',
                                marginLeft: '-50vw',
                                padding: '.5rem 3rem .5rem 50vw',
                                boxShadow:'10px 10px 5px -6px rgba(0,0,0,0.75)', 
                                backgroundColor:'rgba(0,30,96,0.85)'
                        }}>
                            <div>
                                <div className="fw-black pt-2" style={{lineHeight:'1.8rem'}}>{title}</div>
                                <div className="fw-light fs-4">
                                    {subtitle}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
        </div>

    )
}