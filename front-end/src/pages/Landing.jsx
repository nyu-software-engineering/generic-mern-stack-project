import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <main className="min-h-screen w-full bg-(--paper) flex flex-col justify-center p-6 pb-14 text-(--soft-black)">

      <div className="w-full flex flex-col">

        {/* Brand Group */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 border border-(--soft-black)/20 rounded-xl bg-white flex items-center justify-center p-2 shadow-sm">
            <img
              src="/flier-logo.svg"
              alt="Flier logo"
              className="w-full h-full object-contain"
            />
          </div>

          <span className="text-3xl font-azabache text-(--nyu-indigo) tracking-wide">
            Flier
          </span>
        </div>

        {/* Headline */}
        <h1 className="heading mb-12 max-w-[300px]">
          Ready to fly through the clutter?
        </h1>

        {/* Action Buttons */}
        <div className="flex flex-col gap-5 w-full">

          <Link
            to="/register"
            className="w-full py-4 px-4 bg-white hover:bg-(--parchment) text-(--soft-black) font-semibold text-base rounded-xl border border-(--soft-black)/20 shadow-sm text-center transition-colors active:scale-[0.99]"
          >
            Get Started
          </Link>

          <Link
            to="/login"
            className="w-full py-4 px-4 bg-white hover:bg-(--parchment) text-(--soft-black) font-semibold text-base rounded-xl border border-(--soft-black)/20 shadow-sm text-center transition-colors active:scale-[0.99]"
          >
            Login
          </Link>

        </div>
      </div>
    </main>
  );
}