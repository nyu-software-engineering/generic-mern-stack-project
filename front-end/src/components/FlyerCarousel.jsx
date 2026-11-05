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
    <section className="flex justify-center items-center flex-col h-fit gap-2">
      <h1 className="heading w-full text-start">{CategoryLookup[category]}</h1>
      <div className="flex gap-4 overflow-x-auto w-full">
        {/* PLACEHOLDER: Would get replaced with flyers from backend. */}
        <Flyer category={category} mode={"carousel"}/>
        <Flyer category={category} mode={"carousel"}/>
        <Flyer category={category} mode={"carousel"}/>
      </div>
    </section>
  );
}