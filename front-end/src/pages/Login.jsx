import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/home");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-(--soft-black)">
      {/* Top Header & Logo */}
      <div className="flex items-center justify-center gap-3 py-8">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-black/10 bg-white p-2 shadow-sm">
          <img src="/flier-logo.svg" alt="Flier logo" className="size-full object-contain" />
        </div>
        <span className="font-azabache text-3xl text-(--nyu-indigo)">Flier</span>
      </div>

      {/* Main Content Card */}
      <div className="flex flex-1 flex-col items-center rounded-t-3xl border-t border-black/5 bg-(--parchment) px-6 pt-7 pb-16">
        <div className="flex w-full max-w-sm flex-1 flex-col justify-between">
          <div>
            {/* Back Arrow */}
            <div className="mb-6 flex items-center justify-end">
              <Link to="/" className="text-(--soft-black)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </Link>
            </div>

            <h1 className="heading mb-6 text-2xl font-bold">Welcome back!</h1>

            <form id="login-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="body-copy text-sm font-medium">Username/Email</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="body-copy text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none"
                  required
                />
              </div>

              <div className="mt-1 flex items-center">
                <label className="flex cursor-pointer items-center gap-2 text-sm select-none">
                  <input
                    type="checkbox"
                    checked={staySignedIn}
                    onChange={(e) => setStaySignedIn(e.target.checked)}
                    className="size-4 rounded border-black/20 accent-(--nyu-indigo)"
                  />
                  <span>Stay signed in?</span>
                </label>
              </div>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3 pb-4">
            <button
              type="submit"
              form="login-form"
              className="body-copy flex h-12 w-full items-center justify-center rounded-xl border border-black/10 bg-white text-base font-semibold shadow-sm active:scale-[0.99]"
            >
              Login
            </button>
            <div className="text-center text-sm opacity-75">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-(--nyu-indigo) underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}