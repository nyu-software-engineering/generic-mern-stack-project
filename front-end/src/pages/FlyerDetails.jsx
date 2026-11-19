import { useParams } from "react-router-dom";
import Flyer from "../components/Flyer";
import { flyerById } from "../data/flyers";

export default function FlyerDetails() {
  /* Grab the id from the URL params */
  const { flyerId } = useParams();
  /* TODO: Replace with proper backend logic. */
  const flyer = flyerById(flyerId);

  return (
    <Flyer key={flyerId} flyer={flyer} mode="full"/>
  );
}