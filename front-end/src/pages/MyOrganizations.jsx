import { Link } from "react-router-dom";
import arrowBack from "../assets/arrow-back-40px.svg";
import ClubCard from "../components/ClubCard";
import { clubs } from "../data/clubs";

export default function MyOrganizations() {
  const adminClubs = clubs.filter((club) => club.isAdmin);

  return (
    <section className="flex flex-1 flex-col bg-(--parchment) p-8 pb-28 text-(--soft-black) rounded-t-4xl inset-shadow-sm shadow-[0px_-3px_8px_rgba(0,0,0,0.25)] mt-3">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex items-center gap-2 justify-between">
          <h1 className="heading">My Organizations</h1>
          <Link to="/profile" aria-label="Back to profile" className="flex size-10 shrink-0 items-center justify-center focus-visible:outline-2 focus-visible:outline-(--nyu-indigo)">
            <img src={arrowBack} alt="" className="size-8 brightness-0" />
          </Link>
        </div>

        {adminClubs.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-3">
            {adminClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </ul>
        ) : (
          <div className="mt-4 flex flex-col gap-4 rounded-2xl p-8 shadow-sm">
            <p className="body-copy">You are not listed as an admin for any organizations yet.</p>
            <Link to="/organizations" className="body-copy underline">
              Browse Organizations
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
