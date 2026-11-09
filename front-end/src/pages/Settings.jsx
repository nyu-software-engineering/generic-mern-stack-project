import { Link } from "react-router-dom";
import arrowBack from "../assets/arrow-back-40px.svg";

export default function Settings() {
  return (
    <section className="flex flex-1 flex-col bg-(--parchment) px-5 pt-8 pb-26 text-(--soft-black) rounded-4xl inset-shadow-sm">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex items-center justify-between">
          <h1 className="heading">Settings</h1>
          <Link
            to="/profile"
            aria-label="Back"
            className="flex size-10 items-center justify-center rounded-full"
          >
            <img src={arrowBack} alt="" className="size-8 brightness-0" />
          </Link>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <div className="flex items-center justify-between bg-white p-4">
            <span className="body-copy">Notifications</span>
            <input type="checkbox" defaultChecked />
          </div>

          <div className="flex items-center justify-between bg-white p-4">
            <span className="body-copy">Dark Mode</span>
            <input type="checkbox" />
          </div>

          <div className="bg-white p-4">
            <button
              type="button"
              className="body-copy underline underline-offset-4 text-red-600"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}