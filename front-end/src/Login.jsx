import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'

const Login = props => {
    const navigate = useNavigate()
    const [errorText, setErrorText] = useState("")

    const login = e => {
        e.preventDefault()

        fetch('/api/account/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: e.target.elements.email.value,
                password: e.target.elements.password.value,
            }),
        }).then(response => {
            if(response.ok){
                navigate('/')
                props.setIsLoggedIn(true)
            }
            else{
                if(response.status === 400){
                    throw new Error("Account with emaill address does not exist")
                }
                throw new Error("Password incorrect")
            }
    }).catch(err => {
        console.error(err)
        setErrorText(err.toString())})
    }

    return (
        <div className='login'>
            <h1 className='logo'>Bounty</h1>

            <form className='loginForm' onSubmit={login}>
                <div className='field'>
                    <label htmlFor="email">Email</label>
                    <input id='email' type="email" required />
                </div>

                <div className='field'>
                    <label htmlFor="password">Password</label>
                    <input id='password' type="password" autoComplete='on' required />
                </div>

                <p className="error">{errorText}</p>
                <Link to='/signup'>Sign Up</Link>
                
                <button className='submit' type='submit'>Log In</button>
            </form>
        </div>
    )
}

export default Login