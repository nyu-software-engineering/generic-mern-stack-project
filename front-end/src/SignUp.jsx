import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './SignUp.css'

const SignUp = props => {
    const navigate = useNavigate()
    const [errorText, setErrorText] = useState("")

    const signUp = e => {
        e.preventDefault()

        fetch('/api/account/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: e.target.elements.name.value,
                email: e.target.elements.email.value,
                password: e.target.elements.password.value,
                securityQuestion: e.target.elements.securityQuestion.value,
                securityAnswer: e.target.elements.securityAnswer.value
            }),
        }).then(response => {
            if(response.ok){
                navigate('/')
                props.setIsLoggedIn(true)
            }
            else{
                throw new Error('User with email already exists')
            }
    }).catch(err => {console.log(err)
        setErrorText(err.toString())
    })
    }

    return (
        <div className='signUp'>
            <h1 className='logo'>Bounty</h1>

            <form className='signUpForm' onSubmit={signUp}>
                <div className='field'>
                    <label htmlFor="name">Full Name</label>
                    <input id='name' type="text" required />
                </div>

                <div className='field'>
                    <label htmlFor="email">Email</label>
                    <input id='email' type="email" required />
                </div>

                <div className='field'>
                    <label htmlFor="password">Password</label>
                    <input id='password' type="password" autoComplete='on' required />
                </div>

                <div className='field'>
                    <label htmlFor="security">Security Question</label>
                    <select name="securityQuestion" id="securityQuestion" type="securityQuestion">
                        <option value="What was your first pet's name?">What was your first pet's name?</option>
                        <option value="test1">test1</option>
                        <option value="test2">test2</option>
                    </select>
                    <input id='securityAnswer' type="securityAnswer" autoComplete='on' required />
                </div>

                <p className="error" >{errorText}</p>
                <Link to='/login'>Log In</Link>
                
                <button className='submit' type='submit'>Sign Up</button>
            </form>
        </div>
    )
}

export default SignUp