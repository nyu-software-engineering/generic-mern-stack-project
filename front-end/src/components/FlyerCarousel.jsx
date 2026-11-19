import Flyer from "./Flyer";
import { flyersByCategory } from "../data/flyers";

/**
 * Maps a given prop passed to the component to its proper heading.
 * Format: [PropUppercase] => Usable header text
 */
const CategoryLookup = {
  today: "Today's Events",
  forYou: "For You",
  new: "Newly Added",
};

export default function FlyerCarousel({ category }) {
  /* TODO: Replace with fetched flyers from backend. */
  const flyers = flyersByCategory(category);

  return (
    <section className="flex justify-center items-center flex-col h-fit gap-2">
      <h1 className="heading w-full text-start text-(--soft-black)">{CategoryLookup[category]}</h1>
      <div className="flex gap-3 overflow-x-auto w-full">
        {flyers.map((flyer) => (
          <Flyer key={flyer.id} flyer={flyer} mode="carousel"/>
        ))}
      </div>
    </section>
  );
}