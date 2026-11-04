import { Link } from "react-router-dom";
import { useState } from "react";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(event) {
    event.preventDefault();

    setError("");

    if (email.trim() === "" || password.trim() === "") {
      return setError("Email and password are required");
    }
  }

  //later have to verify using credentials using mock authentication
  console.log("Login form validation passed");

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center">Welcome Back!</h1>

        <p className="text-gray-500 text-center mt-2">
          Log in to your Jargonot account
        </p>

        <form
          onSubmit={handleLogin}
          noValidate
          className="mt-8 flex flex-col gap-4"
        >
          <div>
            <label htmlFor="email" className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 font-medium ">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>

          {error !== "" ? (
            <p className="text-red-600 text-sm text-center"> {error}</p>
          ) : null}
          <button
            type="submit"
            className="w-full mt-4 bg-purple-600 text-white py-3 rounded-lg font-semibold p-3 hover:bg-purple-700"
          >
            Log In
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?
          <Link
            to="/register"
            className="text-purple-600 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
