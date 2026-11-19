import { useState } from "react";
import Flyer from "../components/Flyer";
import { eventDateKey, homeFlyers } from "../data/flyers";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function monthLabel(date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function dayLabel(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const today = startOfDay(new Date());

function Chevron({ direction }) {
  const path = direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6";
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2.25} className="size-7">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function calendarCells(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const leadingBlanks = new Date(year, month, 1).getDay();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: leadingBlanks }, () => null);
  for (let day = 1; day <= dayCount; day += 1) {
    cells.push(new Date(year, month, day));
  }
  return cells;
}

export default function CalendarView() {
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selected, setSelected] = useState(today);
  const selectedKey = eventDateKey(selected);
  const events = homeFlyers.filter((flyer) => eventDateKey(flyer.starts_at) === selectedKey);

  function shiftMonth(delta) {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + delta, 1);
    const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
    const day = Math.min(selected.getDate(), lastDay);
    setVisibleMonth(nextMonth);
    setSelected(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day));
  }

  return (
    <section className="flex flex-1 flex-col bg-(--parchment) text-(--soft-black)">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="px-4 pt-6 pb-5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
              className="flex size-10 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-(--nyu-indigo)"
            >
              <Chevron direction="left" />
            </button>
            <h1 className="text-center text-3xl font-bold [font-family:var(--font-petrona)]">
              {monthLabel(visibleMonth)}
            </h1>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="flex size-10 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-(--nyu-indigo)"
            >
              <Chevron direction="right" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-7 text-center" role="grid" aria-label={monthLabel(visibleMonth)}>
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} role="columnheader" className="pb-2 text-sm font-medium text-(--soft-black)/70">
                {weekday}
              </div>
            ))}
            {calendarCells(visibleMonth).map((date, index) => {
              if (!date) {
                return <div key={`blank-${index}`} role="gridcell" />;
              }
              const isSelected = eventDateKey(date) === selectedKey;
              return (
                <div key={eventDateKey(date)} role="gridcell" className="py-1">
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={dayLabel(date)}
                    onClick={() => setSelected(date)}
                    className={`mx-auto flex size-9 items-center justify-center rounded-full text-base focus-visible:outline-2 focus-visible:outline-(--nyu-indigo) ${
                      isSelected ? "font-bold ring-2 ring-(--soft-black)" : ""
                    }`}
                  >
                    {date.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-1 flex-col bg-(--nyu-indigo) text-white">
          <h2 className="subheading px-5 pt-5">{dayLabel(selected)}</h2>
          {events.length === 0 ? (
            <p className="body-copy px-5 pt-4 pb-8">No events on this day.</p>
          ) : (
            <ul className="mt-4 flex gap-3 overflow-x-auto px-5 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {events.map((flyer) => (
                <li key={flyer.id} className="shrink-0">
                  <Flyer flyer={flyer} mode="carousel" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
