/**
 * Maps a given prop passed to the component to its proper heading.
 * Format: [PropUppercase] => Usable Header
 */
const CategoryLookup = {
  Today: "Today's Events",
  ForYou: "For You",
  New: "Newly Added",
}

export default function FlyerCarousel({ category }) {
  return (
    <>
      <h1>{CategoryLookup[category]}</h1>
      
    </>
  );
}