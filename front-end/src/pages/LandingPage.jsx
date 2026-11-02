import { useState } from "react";
import { Link } from "react-router";
import "./LandingPage.css";

function LandingPage() {
  const [message, setMessage] = useState("");

  function handleGoogleSignIn() {
    setMessage("Haven't set up google sign in for now");
  }

  return (
    <main className="landing-page">
      <div className="landing-top">
        <h1 className="landing-title">SwipeShare</h1>
        <p className="landing-tagline">Buy and sell meal swipes with other students.</p>
      </div>

      <div className="landing-buttons">
        <button
          type="button"
          className="landing-button google-button"
          onClick={handleGoogleSignIn}
        >
          <span className="google-letter">G</span>
          Sign in with Google
        </button>

        <Link to="/how-it-works" className="landing-button how-button">
          See how it works
        </Link>

        {message && <p className="landing-message">{message}</p>}
      </div>
    </main>
  );
}

export default LandingPage;
