import FlyerCarousel from "../components/FlyerCarousel";

export default function Home() {
  return (
    <div className="flex flex-col bg-(--parchment) h-full w-full pb-28 rounded-4xl p-8 gap-6 inset-shadow-sm shadow-[0px_-3px_8px_rgba(0,0,0,0.25)] mt-3">
      <FlyerCarousel category="today"/>
      <FlyerCarousel category="forYou"/>
      <FlyerCarousel category="new"/>
    </div>
  );
}