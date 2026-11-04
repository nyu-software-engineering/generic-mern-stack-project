import Flyer from "./Flyer";

/**
 * Maps a given prop passed to the component to its proper heading.
 * Format: [PropUppercase] => Usable Header
 */
const CategoryLookup = {
  today: "Today's Events",
  forYou: "For You",
  new: "Newly Added",
}

export default function FlyerCarousel({ category }) {
  /* TODO: Fetch flyers from backend. */
  const flyers = [];

  return (
    <section>
      <h1>{CategoryLookup[category]}</h1>
      <div className="flex gap-4 overflow-x-auto">
        {flyers.map((flyer => (
          <Flyer category={category} mode="carousel"/>
        )))}
      </div>
    </section>
  );
}