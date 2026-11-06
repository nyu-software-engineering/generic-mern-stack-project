import { Link, useNavigate } from "react-router-dom";
import arrowBack from "../assets/arrow-back-40px.svg";
import ClubCard from "../components/ClubCard";
import { useFavorites } from "../context/FavoritesContext";

export default function Favorites() {
  const navigate = useNavigate();
  const { favoriteClubs } = useFavorites();

  function goBack() {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }
    navigate("/organizations");
  }

  return (
    <section className="flex flex-1 flex-col bg-(--parchment) px-5 pt-6 pb-8 text-(--soft-black)">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex items-center justify-between gap-3">
          <h1 className="heading">Favorites</h1>
          <button
            type="button"
            onClick={goBack}
            aria-label="Back"
            className="flex size-10 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-(--nyu-indigo)"
          >
            <img src={arrowBack} alt="" className="size-8 brightness-0" />
          </button>
        </div>
        <p className="body-copy mt-2">Clubs you've starred.</p>

        {favoriteClubs.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white px-5 py-8 text-center shadow-sm ring-1 ring-black/5">
            <p className="body-copy">No favorite clubs yet.</p>
            <Link
              to="/organizations"
              className="body-copy mt-4 inline-block underline underline-offset-4"
            >
              Browse organizations
            </Link>
          </div>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {favoriteClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
