import React, { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import PropTypes from 'prop-types'
import styles from './styles/ContactForm.module.css'
import axios from 'axios'

export default function Form(props) {

    const { fields, apiBody, errorMessage='Houve um erro inesperado. Recarregue a página e tente novamente.', successMessage, onSuccess, footerLeftEl, buttonText } = props
    const [state, setState] = useState(fields)

    const [sentMessage, setSentMessage] = useState('')
    const [error, setError] = useState(false)
    
    const defaultSendIcon = 'fas fa-arrow-circle-right'
    const [sendIcon, setSendIcon] = useState(defaultSendIcon)

    const [buttonDisabled, setButtonDisabled] = useState(false)

    const [ recaptchaHelp, setRecaptchaHelp ] = useState(false)
    const recaptchaRef = useRef()

    function handleInputChange(e) {

        const target = e.target
        const name = target.name

        let value = ""
        if(name == "curriculum"){
            value = target.files[0]
        }else{
            value = target.type === 'checkbox' ? target.checked : target.value
        }

        let newState = [...state]

        newState.map((item, index)=>{
            if( item.id == name ){
                newState[index].value = value
            }
        })

        setState(newState)
    }

    async function handleSubmit(e) {

        e.preventDefault()

        setRecaptchaHelp(false)
        setSentMessage('')
        setError(false)

        if( window.hostname != 'localhost'){
            const recaptchaValue = recaptchaRef.current.getValue()

            if( recaptchaValue=='' ){
                setRecaptchaHelp(true)
                return false
            }
        }

        let filledFields = 0
        let requiredFields = 0

        state.map(item=>{
            if( item.type == 'text' || item.type == 'email' ){

                requiredFields++

                if( item.value != '' ){
                    filledFields++
                }
            }
        })

        if( filledFields != requiredFields ){
            setError(true)
            setSentMessage('Algum campo ficou vazio.')
            return false
        }

        // match passwords
        if( props.matchPasswords ){
            const passwords = props.matchPasswords(state)

            if( passwords[0] != passwords[1] ){
                setError(true)
                setSentMessage('As senhas devem ser iguais')
                return false
            }
        }

        // load button
        setSendIcon('fas fa-spin fa-spinner')
        setButtonDisabled(true)
        
        console.log(state[0])
        console.log({...state})
        const name = state[0].value
        const email = state[1].value
        const message = state[2].value

        let curriculum = new FormData()
        curriculum.append("files", state[3].value)
        console.log(state[3].value)

        const formData = new FormData()
        formData.append("name", name)
        formData.append("email", email)
        formData.append("message", message)

        // fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/api/applicants`, {
        //     method: 'POST',
        //     body: formData,
        //     headers: {
        //         'Content-Type': `multipart/form-data;boundary=${formData._boundary}`
        //     }
        // })
        // const uploadFile = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/api/upload`, {
        //     method: 'POST',
        //     data: curriculum,
        //     headers: {
        //         'Content-Type': `multipart/form-data;`
        //     }
        // })
        
        axios.post(`${process.env.NEXT_PUBLIC_BACK_URL}/api/upload`, curriculum)
        .then(response=>{
            const fileId = response.data[0].id
            console.log(fileId)
            axios({
                method: "post",
                url: `${process.env.NEXT_PUBLIC_BACK_URL}/api/applicants?populate=*`,
                data: {
                    name: name,
                    email: email,
                    message: message,
                    cv: fileId
                }
            })
            .then(res=>{
                console.log(res)
            })
        })
        
        // .then(res=>{
        //     if( res.status == 200 ){
        //         res.json().then(response=>{
        //             setButtonDisabled(false)
        //             setSendIcon(defaultSendIcon)
        
        //             setError(false)
        //             setSentMessage(successMessage)
    
        //             onSuccess(response)
        //         })
        //         .catch(error=>{
        //             console.error('error on .json()')
        //             console.error(error)
        //             console.log(apiBody)
                    
        //             setButtonDisabled(false)
        //             setSendIcon(defaultSendIcon)
        //             setError(true)
        //             setSentMessage(errorMessage)
        //         })
        //     }
        //     else{
        //         setError(true)
        //         setSentMessage('Houve um erro inesperado. Tente novamente.')
        //     }    
        // })
        // .catch(error=>{
        //     console.error('error on fetch()')
        //     console.error(error)
        //     console.log(apiBody)

        //     setButtonDisabled(false)
        //     setSendIcon(defaultSendIcon)
        //     setError(true)
        //     setSentMessage(errorMessage)
        // })
        
    }

    return(
        <form className={styles.form} onSubmit={handleSubmit} encType="multipart/form-data" >

            <div className={styles.container}>

                {state.map(item=>{
                    return (
                        <div key={item.id} className={`${styles.inputGroup} ${item.type == 'checkbox' ? styles.inline : null}`}>
                            <label>{item.name}</label>
                            <input 
                                id={`formId_${item.id}`} 
                                name={item.id} 
                                disabled={item.disabled && item.disabled} 
                                type={item.type}  
                                onChange={handleInputChange}  
                                accept={item.type=="file"?"image/*, .pdf, .doc, .docx":"*" }
                            />
                        </div>
                    )
                })}

                <div className={`${styles.inputGroup} ${styles.recaptcha}`}>
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_KEY}
                    />
                    <span className={recaptchaHelp ? styles.show : styles.hidden}>Não esqueça de fazer o reCAPTCHA</span>
                </div>

                <div className={`${styles.messageGroup} ${sentMessage==''?styles.hidden:styles.show}`}>
                    <div className={!error?styles.success:styles.error}>{sentMessage}</div>
                </div>

                <div className={styles.buttonGroup}>
                    {footerLeftEl && <div>{footerLeftEl}</div>}
                    <button disabled={buttonDisabled} type="submit">{buttonText}</button>
                </div>

            </div>

        </form>
    )

}

Form.propTypes = {
    fields: PropTypes.array,
    apiBody: PropTypes.func, 
    matchPasswords: PropTypes.func,
    errorMessage: PropTypes.string, 
    successMessage: PropTypes.string, 
    onSuccess: PropTypes.func,
    footerLeftEl: PropTypes.element || null,
    buttonText: PropTypes.string,
}