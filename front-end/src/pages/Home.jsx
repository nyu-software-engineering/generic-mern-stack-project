import FlyerCarousel from "../components/FlyerCarousel";

export default function Home() {
  return (
    <>
      <div className="flex flex-col bg-(--parchment) h-full w-full gap-20">
        <FlyerCarousel category="Today"/>
        <FlyerCarousel category="ForYou"/>
        <FlyerCarousel category="New"/>
      </div>
    </>
  );
}