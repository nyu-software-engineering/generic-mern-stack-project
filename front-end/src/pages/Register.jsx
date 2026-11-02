import { Link, useNavigate } from "react-router-dom";
function Register() {
  const navigate = useNavigate();

  function handleRegister(event) {
    event.preventDefault();

    //need to validate inout and simulate account creation
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
              required
              placeholder="Enter your full name"
              className="w-full border border-gray-300 rounded-lg p-3"
            />
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
              placeholder="Confirm your password"
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>
          {/* Register Buttin */}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold"
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
