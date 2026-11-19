import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";
import { useFavorites } from "../context/FavoritesContext";
import arrowBack from "../assets/arrow-back-40px.svg";

/**
 * Takes in two props: flyer and mode.
 * 
 * The flyer prop provides the specific flyer from the backend which exposes the following to be read:
 * - id, title, starts_at, location, image, owner, and description.
 * 
 * The mode prop provides the type of view the flyer should be rendered in.
 * - "carousel" means that only image should be rendered since it is appearing in a carousel (home/calendar).
 * - "full" means that we're looking at the flyer's full details. Provide every relevant piece of info.
 */
export default function Flyer({ flyer, mode }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(flyer.id);

  /* Format the date and time to be easily human readable */
  const formattedStart = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(flyer.starts_at));

  /* Full Details Mode */
  if (mode === "full") {
    return (
      <article className="bg-(--paper) mt-3 pb-18">
        {/* Flyer Image & Overlay Elements */}
        <div className="w-full h-[calc(100vh-16rem)] aspect-8.5/11 relative">
          <img src={flyer.image} alt={`A flyer uploaded by ${flyer.owner}`} className="w-full h-full object-cover rounded-t-4xl shadow-[0px_-3px_8px_rgba(0,0,0,0.25)]"/>
          {/* Back Arrow */}
          <Link to="/home" aria-label="Back" className="absolute left-6 top-6 z-20">
            <img src={arrowBack} alt="Back arrow to home" className="w-8 p-1 bg-(--soft-black) rounded-full"/>
          </Link>

          {/* Gradient overlay to enhance readability & contrast */}
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent"/>
          
          {/* Title & Club */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-8 text-(--paper)">
            <h1 className="heading py-2 max-w-full wrap-break-word">{flyer.title}</h1>
            <div className="flex items-center gap-2 bg-(--nyu-indigo) w-fit h-full px-4 py-2 justify-center">
              <p className="feature-copy">{flyer.owner}</p>
              <FavoriteButton light size="md" pressed={favorite} label={favorite ? "Remove flyer from favorites" : "Add flyer to favorites"} onClick={() => toggleFavorite(flyer.id)}/>
            </div>
          </div>
        </div>

        {/* Edit Flyer Button -- TODO: Make this admin view only. */}
        <div className="flex flex-col gap-4 justify-center items-center text-(--soft-black) w-full px-8 pt-8 bg-(--parchment)">
          <button type="button" onClick={() => navigate(`/flyers/${flyer.id}/edit`)} className="feature-copy w-full px-6 py-2 bg-(--paper) border">
            Edit Flyer
          </button>
        </div>

        {/* Expanded Details */}
        <dl className="bg-(--parchment) w-full p-8 text-(--soft-black) wrap-break-word flex flex-col gap-2">
          <div>
            <dt className="heading">Description</dt>
            <dd className="feature-copy">{flyer.description}</dd>
          </div>
          <div>
            <dt className="heading">Location</dt>
            <dd className="feature-copy">{flyer.location}</dd>
          </div>
          <div>
            <dt className="heading">Date & Time</dt>
            <dd className="feature-copy">{formattedStart}</dd>
          </div>
        </dl>
      </article>
    );
  }

  /* Carousel Mode */
  if (mode === "carousel") {
    return (
      /* A click sends users to the full flyer details. Fixed aspect ratio of 8.5x11. */
      <Link to={`/flyer/${flyer.id}`} className="block w-52 aspect-8.5/11 shrink-0 overflow-hidden">
        <img src={flyer.image} alt={`A flyer uploaded by ${flyer.owner}`} className="h-full w-full object-cover transition-transform duration-200 hover:scale-[1.03]"/>
      </Link>
    );
  }
};
