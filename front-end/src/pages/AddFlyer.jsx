import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddFlyerForm from "../components/AddFlyerForm";
import { useFlyers } from "../context/FlyersContext";

const primaryButton =
  "body-copy flex h-12 w-full items-center justify-center rounded-xl border border-black/10 bg-white text-base font-semibold shadow-sm active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-(--nyu-indigo)";

function NotAnAdmin() {
  return (
    <div className="mt-10 flex flex-col">
      <h1 className="heading">Oops!</h1>
      <p className="body-copy mt-2">
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
    <div className="flex flex-1 flex-col bg-(--parchment)">
      <div className="mx-auto flex w-full max-w-md justify-end px-5 pt-4">
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
        <section className="flex flex-1 flex-col px-5 pb-8 text-(--soft-black)">
          <div className="mx-auto w-full max-w-md">
            <NotAnAdmin />
          </div>
        </section>
      )}
    </div>
  );
}
