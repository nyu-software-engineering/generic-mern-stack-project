import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("student");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-white text-(--soft-black)">
      <div className="flex items-center justify-center gap-3 py-8">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-black/10 bg-white p-2 shadow-sm">
          <img src="/flier-logo.svg" alt="Flier logo" className="size-full object-contain" />
        </div>
        <span className="font-azabache text-3xl text-(--nyu-indigo)">Flier</span>
      </div>

      <div className="flex flex-1 flex-col items-center rounded-t-3xl border-t border-black/5 bg-(--parchment) px-6 pt-7 pb-16">
        <div className="flex w-full max-w-sm flex-1 flex-col justify-between">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="heading text-xl font-bold">Create an Account</h1>
              <Link to="/" className="text-(--soft-black)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </Link>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); navigate("/home"); }} className="flex flex-col gap-4">
              <div>
                <label className="body-copy text-sm font-medium">I am a...</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm">
                    <input
                      type="radio"
                      name="accountType"
                      checked={accountType === "student"}
                      onChange={() => setAccountType("student")}
                      className="accent-(--nyu-indigo)"
                    />
                    Student
                  </label>

                  <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm">
                    <input
                      type="radio"
                      name="accountType"
                      checked={accountType === "club"}
                      onChange={() => setAccountType("club")}
                      className="accent-(--nyu-indigo)"
                    />
                    Club/Organization
                  </label>
                </div>
              </div>

              <div>
                <label className="body-copy text-sm font-medium">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none"
                />
              </div>

              <div>
                <label className="body-copy text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none"
                />
              </div>

              <div>
                <label className="body-copy text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none"
                />
              </div>

              <div>
                <label className="body-copy text-sm font-medium">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none"
                />
              </div>
            </form>
          </div>

          <div className="mt-8 flex flex-col gap-3 pb-4">
            <button
              type="submit"
              onClick={() => navigate("/home")}
              className="body-copy flex h-12 w-full items-center justify-center rounded-xl border border-black/10 bg-white text-base font-semibold shadow-sm active:scale-[0.99]"
            >
              Register
            </button>
            <div className="text-center text-sm opacity-75">
              Already have an account? <Link to="/login" className="font-semibold text-(--nyu-indigo) underline">Log in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
