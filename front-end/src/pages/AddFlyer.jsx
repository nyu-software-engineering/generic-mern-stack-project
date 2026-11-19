import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddFlyerForm from "../components/AddFlyerForm";
import { useFlyers } from "../context/FlyersContext";

const primaryButton = "feature-copy flex h-fit w-full p-6 items-center justify-center rounded-xl border border-black/10 bg-white text-base font-semibold shadow-sm active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-(--nyu-indigo)";

function NotAnAdmin() {
  return (
    <div className="flex flex-col">
      <h1 className="heading">Oops!</h1>
      <p className="feature-copy mt-2">
        Looks like you aren&apos;t registered as an admin of an organization yet...
      </p>
      <div className="mt-8 flex flex-col gap-4">
        <Link to="/organizations" className={primaryButton}>
          Find an Organization
        </Link>
        <Link to="/home" className={primaryButton}>
          Back to Main Feed
        </Link>
      </div>
    </div>
  );
}

export default function AddFlyer() {
  const navigate = useNavigate();
  const { addFlyer } = useFlyers();
  // Mock of the user's admin role until accounts come from the back end.
  const [isAdmin, setIsAdmin] = useState(false);

  function handlePost(values) {
    const id = addFlyer(values);
    navigate(`/flyers/${id}/edit`, { state: { notice: "Flyer posted!" } });
  }

  return (
    <div className="flex flex-1 flex-col bg-(--parchment) rounded-t-4xl inset-shadow-sm shadow-[0px_-3px_8px_rgba(0,0,0,0.25)] mt-3 relative">
      {/* TODO: Remove this once proper backend & role-based access control is working. */}
      <div className="mx-auto flex w-full max-w-md justify-end absolute top-2 right-8">
        <button
          type="button"
          onClick={() => setIsAdmin((current) => !current)}
          className="body-copy text-sm text-(--soft-black)/70 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-(--nyu-indigo)"
        >
          {isAdmin ? "Switch to Student View" : "Switch to Organization Admin View"}
        </button>
      </div>

      {isAdmin ? (
        <AddFlyerForm heading="Add a Flyer" submitLabel="Post!" onSubmit={handlePost} />
      ) : (
        <section className="flex flex-1 flex-col p-8 text-(--soft-black) justify-center">
          <div className="mx-auto w-full max-w-md">
            <NotAnAdmin />
          </div>
        </section>
      )}
    </div>
  );
}
