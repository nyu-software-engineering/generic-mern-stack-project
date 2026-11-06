import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";
import { useFavorites } from "../context/FavoritesContext";

export default function ClubCard({ club }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(club.id);

  const detailsPath = `/organizations/${club.id}`;

  return (
    <li className="flex items-center gap-4 rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-black/5">
      <Link to={detailsPath} className="shrink-0">
        <img
          src={club.logo}
          alt=""
          className="size-14 rounded-full bg-(--paper) object-cover"
        />
      </Link>
      <div className="min-w-0">
        <div className="flex items-center gap-0.5">
          <Link to={detailsPath} className="text-lg font-bold [font-family:var(--font-petrona)]">
            {club.name}
          </Link>
          <FavoriteButton
            pressed={favorite}
            label={favorite ? `Remove ${club.name} from favorites` : `Add ${club.name} to favorites`}
            onClick={() => toggleFavorite(club.id)}
          />
        </div>
        <Link to={detailsPath} className="body-copy">
          {club.description}
        </Link>
      </div>
    </li>
  );
}
