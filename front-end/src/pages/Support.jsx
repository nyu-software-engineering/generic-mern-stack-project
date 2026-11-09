import { Link } from "react-router-dom";
import arrowBack from "../assets/arrow-back-40px.svg";

export default function Support() {
  return (
    <section className="flex flex-1 flex-col bg-(--parchment) px-5 pt-8 pb-26 text-(--soft-black) rounded-4xl inset-shadow-sm">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex items-center justify-between">
          <h1 className="heading">Support</h1>
          <Link
            to="/profile"
            aria-label="Back"
            className="flex size-10 items-center justify-center rounded-full"
          >
            <img src={arrowBack} alt="" className="size-8 brightness-0" />
          </Link>
        </div>

        <p className="body-copy mt-2">Need help? Let us know.</p>

        <div className="mt-8 flex flex-col gap-4 bg-white p-6">
          <div>
            <p className="body-copy">Email us</p>
            <a
              href="mailto:help@nyu.edu"
              className="body-copy underline underline-offset-4"
            >
              help@nyu.edu
            </a>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <p className="body-copy">Send a message</p>
            <textarea
              rows={4}
              placeholder="What's going on?"
              className="body-copy border border-(--soft-black) p-2 outline-none"
            />
            <button
              type="button"
              className="body-copy self-start underline underline-offset-4"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}