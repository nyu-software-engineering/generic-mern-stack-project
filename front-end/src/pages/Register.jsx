import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  function handleRegister(event) {
    event.preventDefault();
    setError("");

    //checking for empty fields
    if (
      name.trim() === "" ||
      email.trim() === "" ||
      password.trim() === "" ||
      confirmPassword.trim() === ""
    ) {
      return setError("All fields are required");
    }
    if (password.length < 8) {
      return setError("Password must have at least 8 characters");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    //all checks passed
    navigate("/login");
  }
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center">Create an Account</h1>
        <p className="text-gray-500 text-center mt-2">
          Join Jargnot to simplify your research experience
        </p>
        <form onSubmit={handleRegister} className="mt-8 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block mb-2 font-medium">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              className="w-full border border-gray-300 rounded-lg p-3"
            />
            <p className="text-sm text-gray-500">Current name: {name}</p>
          </div>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-2 font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>
          {/* Password */}

          <div>
            <label htmlFor="password" className="block mb-2 font-medium ">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              id="password"
              placeholder="Create a password"
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>
          {/* Confirm Password */}

          <div>
            <label htmlFor="confirmPassword" className="block mb-2 font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              required
              id="confirmPassword"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your password"
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>
          {error !== "" ? (
            <p className="text-red-600 text-sm text-center">{error}</p>
          ) : null}
          {/* Register Buttin */}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700"
          >
            Create Account
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-600 font-semibold hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
