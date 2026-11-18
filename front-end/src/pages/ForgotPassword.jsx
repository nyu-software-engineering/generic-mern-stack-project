import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

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
              <h1 className="heading text-xl font-bold">Reset Password</h1>
              <Link to="/login" className="text-(--soft-black)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </Link>
            </div>

            {sent ? (
              <p className="body-copy text-sm">
                We sent a password reset link to <span className="font-semibold">{email}</span>.
              </p>
            ) : (
              <form id="forgot-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                <p className="body-copy text-sm opacity-75">
                  Enter your email and we'll send you a link to reset your password.
                </p>

                <div>
                  <label className="body-copy text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none"
                    required
                  />
                </div>
              </form>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 pb-4">
            {sent ? (
              <Link
                to="/login"
                className="body-copy flex h-12 w-full items-center justify-center rounded-xl border border-black/10 bg-white text-base font-semibold shadow-sm active:scale-[0.99]"
              >
                Back to Login
              </Link>
            ) : (
              <button
                type="submit"
                form="forgot-form"
                className="body-copy flex h-12 w-full items-center justify-center rounded-xl border border-black/10 bg-white text-base font-semibold shadow-sm active:scale-[0.99]"
              >
                Send Reset Link
              </button>
            )}

            <div className="text-center text-sm opacity-75">
              Remember your password?{" "}
              <Link to="/login" className="font-semibold text-(--nyu-indigo) underline">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}