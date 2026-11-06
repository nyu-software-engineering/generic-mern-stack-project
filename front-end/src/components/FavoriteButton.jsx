function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-full" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.7}>
      <path strokeLinejoin="round" d="M12 2.6l2.05 6.32h6.64l-5.37 3.9 2.05 6.32L12 15.24l-5.37 3.9 2.05-6.32-5.37-3.9h6.64L12 2.6z" />
    </svg>
  );
}

export default function FavoriteButton({ pressed, label, onClick, size = "md" }) {
  const box = size === "lg" ? "size-8" : "size-7";
  const icon = size === "lg" ? "size-7" : "size-5";

  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      className={`flex ${box} shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-(--nyu-indigo) ${
        pressed ? "text-(--nyu-indigo)" : "text-(--soft-black)/55"
      }`}
    >
      <span className={icon}>
        <StarIcon filled={pressed} />
      </span>
    </button>
  );
}
