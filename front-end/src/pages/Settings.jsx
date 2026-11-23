import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: "", email: "" });

  useEffect(() => {
    axios
      .get("/api/users/me")
      .then((response) => {
        setUser(response.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  function handleLogout() {
    axios.post("/api/logout").catch((err) => {
      console.error(err);
    });
    localStorage.removeItem("user");
    navigate("/login");
  }
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-1 max-w-md text-center">
          Settings
        </h1>
        <p className="mb-10 text-center">Your account information</p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={user.username}
              readOnly
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Account Email
            </label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full border border-gray-300 rounde-lg p-3"
            />
          </div>

          <p className="text-center mt-6">
            <Link
              to="/dashboard"
              className="text-purple-600 font-semibold hover:underline"
            >
              Back to Dashboard
            </Link>
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full mt-6 bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700"
          >
            {" "}
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
