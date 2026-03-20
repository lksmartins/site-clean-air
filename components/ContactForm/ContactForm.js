import React, { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import PropTypes from 'prop-types'
import styles from './styles/ContactForm.module.css'
export default function Form(props) {

    const { fields, errorMessage='Houve um erro inesperado. Recarregue a página e tente novamente.', successMessage, onSuccess, footerLeftEl, buttonText } = props
    const [state, setState] = useState(fields)

    const [sentMessage, setSentMessage] = useState('')
    const [error, setError] = useState(false)
    
    const defaultSendIcon = 'fas fa-arrow-circle-right'
    const [buttonContent, setButtonContent] = useState(buttonText)

    const [buttonDisabled, setButtonDisabled] = useState(false)

    const [ recaptchaHelp, setRecaptchaHelp ] = useState(false)
    const recaptchaRef = useRef()

    function handleInputChange(e) {

        const target = e.target
        const name = target.name

        let value = ''

        if( target.type == 'file' ){
            value = target.files[0]
        }
        else{
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

        if (window.location.hostname !== 'localhost') {
            const recaptchaValue = recaptchaRef.current.getValue()
            if (recaptchaValue === '') {
                setRecaptchaHelp(true)
                return false
            }
        }

        let filledFields = 0
        let requiredFields = 0

        state.map(item => {
            if (item.type === 'text' || item.type === 'email') {
                requiredFields++
                if (item.value !== '') filledFields++
            }
        })

        if (filledFields !== requiredFields) {
            setError(true)
            setSentMessage('Algum campo ficou vazio.')
            return false
        }

        setButtonContent(<i className="fa-solid fa-spin fa-spinner"></i>)
        setButtonDisabled(true)

        const name = state[0].value
        const email = state[1].value
        const message = state[2].value
        const cv = state[3]?.value || null

        const formData = new FormData()
        formData.append('name', name)
        formData.append('email', email)
        formData.append('message', message)
        if (cv) formData.append('cv', cv)

        try {
            const res = await fetch('/api/uploadFile', {
                method: 'POST',
                body: formData,
            })

            if (res.ok) {
                setButtonDisabled(false)
                setButtonContent(buttonText)
                setError(false)
                setSentMessage(successMessage)
                onSuccess(await res.json())
            } else {
                throw new Error('Server error')
            }
        } catch {
            setButtonDisabled(false)
            setButtonContent(buttonText)
            setError(true)
            setSentMessage(errorMessage)
        }
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
                    <div className={!error?'bg-success text-light':'bg-danger text-light'}>{sentMessage}</div>
                </div>

                <div className={styles.buttonGroup}>
                    {footerLeftEl && <div>{footerLeftEl}</div>}
                    <button disabled={buttonDisabled} type="submit">{buttonContent}</button>
                </div>

            </div>

        </form>
    )

}

Form.propTypes = {
    fields: PropTypes.array,
    matchPasswords: PropTypes.func,
    errorMessage: PropTypes.string,
    successMessage: PropTypes.string,
    onSuccess: PropTypes.func,
    footerLeftEl: PropTypes.element || null,
    buttonText: PropTypes.string,
}