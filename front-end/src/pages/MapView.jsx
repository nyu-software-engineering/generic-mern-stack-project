import { useState } from "react";
import { useFlyers } from "../context/FlyersContext";

export default function MapView() {
  const { flyers } = useFlyers();
  const mappedFlyers = flyers.filter((flyer) => flyer.mapPosition);
  const [selectedId, setSelectedId] = useState(mappedFlyers[0]?.id ?? null);
  const selectedFlyer = mappedFlyers.find((flyer) => flyer.id === selectedId);

  return (
    <div className="flex flex-col bg-(--parchment) h-full w-full pb-28 rounded-t-4xl p-8 gap-4 inset-shadow-sm shadow-[0px_-3px_8px_rgba(0,0,0,0.25)] mt-3">
      {/* Map & Header */}
      <h1 className="heading text-(--soft-black)">Campus Map</h1>
      <div className="relative flex-1 inset-shadow-sm shadow-[0px_-3px_8px_rgba(0,0,0,0.25)]">
        {mappedFlyers.map((flyer, index) => {
          const active = flyer.id === selectedId;
          return (
            <button key={flyer.id} type="button" aria-label={`${flyer.mapLabel}: ${flyer.title}`} aria-pressed={active} onClick={() => setSelectedId(flyer.id)} className={`absolute z-10 flex h-12 w-12 items-center justify-center rounded-full feature-copy text-(--paper) shadow-lg ${flyer.mapPosition} ${active ? "bg-(--nyu-indigo)" : "bg-(--soft-black)"}`}>
              {index + 1}
            </button>
          );
        })}
      </div>
      
      {/* Description of currently selected */}
      {selectedFlyer ? (
        <article className="flex flex-col gap-4 bg-(--paper) p-8 text-(--soft-black) shadow-sm">
          <div>
            <h2 className="subheading text-ellipsis">{selectedFlyer.title}</h2>
            <p className="feature-copy">{selectedFlyer.location}</p>
          </div>
          <div className="flex flex-col gap-2">
            <a className="body-copy bg-(--soft-black) py-2 text-center text-(--paper)" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedFlyer.location)}`} target="_blank" rel="noreferrer">
              Google Maps
            </a>
            <a className="body-copy border border-(--soft-black) bg-(--paper) text-center py-2" href={`https://maps.apple.com/?daddr=${encodeURIComponent(selectedFlyer.location)}`} target="_blank" rel="noreferrer">
              Apple Maps
            </a>
          </div>
        </article>
      ) : (
        <p className="feature-copy rounded-4xl bg-(--paper) p-8 text-(--soft-black)">No locations were found.</p>
      )}
    </div>
  );
}
