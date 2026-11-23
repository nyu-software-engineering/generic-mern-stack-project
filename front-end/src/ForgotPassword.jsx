import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './ForgotPassword.css'

const ForgotPassword = props => {
    const navigate = useNavigate()
    const [errorText, setErrorText] = useState("")
    const [showQuestion, setShowQuestion] = useState(false)
    const [question, setQuestion] = useState("")
    const getQuestion = e => {
        e.preventDefault()
        fetch('/api/profile/security/' + e.target.elements.email.value)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch profile')
            return res.json()
        })
        .then(e => {console.log(e);setQuestion(e)})
        .then(setShowQuestion(true))
        .catch(err => console.error(err))
    }
    const reset = e => {
        e.preventDefault()

        fetch('/api/account/recovery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: e.target.elements.email.value,
                answer: e.target.elements.question.value,
                password: e.target.elements.password.value,
            }),
        }).then(response => {
            if(response.ok){
                navigate('/')
            }
            else{
                if(response.status === 400){
                    throw new Error("Account with email address does not exist")
                }
                throw new Error("Security question incorrect")
            }
    }).catch(err => {
        console.error(err)
        setErrorText(err.toString())})
    }

    return (
        <div className='login'>
            <h1 className='logo'>Bounty</h1>

            <form className='loginForm' onSubmit={(e) => {
                if(!showQuestion){ getQuestion(e)} else{ reset(e)}
            }}>

                <div className='field'>
                    <label htmlFor="email">Email</label>
                    <input id='email' type="email" required />
                </div>
                {showQuestion &&
<><div className='field'>
                    <label htmlFor="question">{question}</label>
                    <input id='question' type="question" required />
                </div>

                <div className='field'>
                    <label htmlFor="password">Enter New Password</label>
                    <input id='password' type="password" required />
                </div>

                <p className="error">{errorText}</p></>}
                {!showQuestion && <>
                <Link to='/login'>Login</Link>
                <button className='submit' type='submit'>Select Email</button></>}
                {showQuestion && <>
                <button className='submit' type='submit'>Change Password</button></>}
            </form>
        </div>
    )
}

export default ForgotPassword