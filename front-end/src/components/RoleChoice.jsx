const roles = [
  { value: "renter", label: "I'm a renter" },
  { value: "landlord", label: "I'm a landlord" },
];

export default function RoleChoice({ role, onChange }) {
  return (
    <div
      className="mb-6 grid grid-cols-2 border border-ink"
      role="radiogroup"
      aria-label="Account type"
    >
      {roles.map((option) => {
        const selected = role === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`py-3 text-sm font-semibold transition ${selected ? "bg-ink text-white" : "bg-surface text-ink hover:bg-canvas"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
