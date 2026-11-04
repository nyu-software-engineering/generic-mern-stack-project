/**
 * Takes two props: category and mode.
 * Category is a filter such as "Today's Events" or "For You"
 * Mode is what the flyer should function as: a small carousel item (default), or the full flyer details.
 */
export default function Flyer({ category, mode="carousel" }) {
  if (mode="full") {
    return (
      <article>

      </article>
    )
  }
    
  return (
    <img src="https://picsum.photos/140/70" alt="Flyer placeholder"/>
  )
};