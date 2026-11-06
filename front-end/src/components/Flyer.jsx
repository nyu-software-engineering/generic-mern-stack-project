/**
 * Takes in two props: flyer and mode.
 * 
 * The flyer prop provides the specific flyer from the backend from which the following can be read:
 * - id, title, starts_at, location, image, and owner.
 * 
 * The mode prop provides the type of view the flyer should be rendered in.
 * - "carousel" means that only image should be rendered since it is appearing in a carousel (home/calendar).
 * - "full" means that we're looking at the flyer's full details. Provide every relevant piece of info.
 */
export default function Flyer({ flyer, mode }) {
  /* Full Details Mode */

  /* Carousel Mode */
  return (
    <img src={flyer.image} alt={`A flyer uploaded by ${flyer.owner}`}/>
  )
};