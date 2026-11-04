import { useState } from "react";
import {useNavigate, Link} from "react-router-dom";
import "./Sign.css";

function SignIn() {
    const navigate = useNavigate();
    const [email, SetEmail] = useState("");
    const [password, SetPassword] = useState("");
    const [error, SetError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            SetError("Please enter an email and password.");
            return;
        }
        SetError("");
        navigate("/"); 
    };

    return (
        <div className="sign-in">
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-email">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => SetEmail(e.target.value)}
                    />
                </div>
                <div className="form-password">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => SetPassword(e.target.value)}
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit">Sign In</button>
                <text>Don't have an account? <a href="/signup">Sign Up</a></text>
            </form>
        </div>
    );
}

export default SignIn;