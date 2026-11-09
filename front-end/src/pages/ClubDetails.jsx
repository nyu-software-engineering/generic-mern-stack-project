import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import arrowBack from "../assets/arrow-back-40px.svg";
import FavoriteButton from "../components/FavoriteButton";
import { useFavorites } from "../context/FavoritesContext";
import { clubs } from "../data/clubs";

function ClubDetailPanel({ club }) {
  const [adminRequested, setAdminRequested] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(club.id);

  return (
    <section className="flex flex-1 flex-col bg-(--parchment) px-5 pt-8 pb-26 text-(--soft-black) rounded-4xl inset-shadow-sm">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center">
        <div className="relative flex w-full items-center justify-center">
          <img
            src={club.logo}
            alt=""
            className="size-36 border border-(--soft-black) bg-(--paper) object-cover"
          />
          <Link
            to="/organizations"
            aria-label="Back to organization list"
            className="absolute right-0 flex size-10 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-(--nyu-indigo)"
          >
            <img src={arrowBack} alt="" className="size-8 brightness-0" />
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1">
          <h1 className="heading text-center">{club.name}</h1>
          <FavoriteButton
            size="lg"
            pressed={favorite}
            label={favorite ? `Remove ${club.name} from favorites` : `Add ${club.name} to favorites`}
            onClick={() => toggleFavorite(club.id)}
          />
        </div>
        <a
          href={`mailto:${club.email}`}
          className="body-copy mt-2 underline underline-offset-4"
        >
          {club.email}
        </a>

        <div className="mt-8 flex min-h-72 w-full flex-1 flex-col bg-white px-6 py-6">
          <p className="body-copy">{club.description}</p>
          <div className="mt-auto flex flex-col items-start gap-4 pt-10">
            <button
              type="button"
              onClick={() => setAdminRequested(true)}
              disabled={adminRequested}
              className="body-copy underline underline-offset-4 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-(--nyu-indigo)"
            >
              {adminRequested ? "Admin access requested" : "Request Admin Access"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ClubDetails() {
  const { clubId } = useParams();
  const club = clubs.find((item) => item.id === clubId);

  if (!club) {
    return (
      <section className="flex flex-1 flex-col bg-(--parchment) px-5 pt-8 pb-10 text-(--soft-black)">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          <p className="body-copy">This club page is not available yet.</p>
          <Link to="/organizations" className="body-copy underline underline-offset-4">
            Back to organization list
          </Link>
        </div>
      </section>
    );
  }

  return <ClubDetailPanel key={club.id} club={club} />;
}
