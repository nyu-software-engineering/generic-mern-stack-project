import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Settings() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("/api/users/me")
      .then((response) => {
        setName(response.data.username);
        setEmail(response.data.email);
      })
      .catch((err) => {
        console.error(err);
        setMessage("Could not load account.");
      });
  }, []);

  function handleSave(event) {
    event.preventDefault();
    setMessage("");

    if (name.trim() === "" || email.trim() === "") {
      return setMessage("Name and email are required");
    }

    axios
      .put("/api/users/me", { username: name, email: email })
      .then((response) => {
        localStorage.setItem("user", JSON.stringify(response.data));
        setMessage("Changes saved");
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.data && err.response.data.message) {
          setMessage(err.response.data.message);
        } else {
          setMessage("Could not reach the server.");
        }
      });
  }

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

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Account Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>

          {message !== "" ? (
            <p className="text-sm text-center">{message}</p>
          ) : null}

          <button
            type="submit"
            className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700"
          >
            Save Changes
          </button>

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
        </form>
      </div>
    </div>
  );
}

export default Settings;