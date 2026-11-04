import "./FilterBar.css";

// FilterBar (#34): a row of buttons for picking one filter.
// The page passes the list of options, which one is selected,
// and a function to run when a button is clicked (onSelect).
export default function FilterBar({ options, selected, onSelect }) {
  return (
    <div className="filter-bar">
      {options.map((option) => (
        <button
          key={option}
          className={
            option === selected
              ? "filter-bar-button filter-bar-button-on"
              : "filter-bar-button"
          }
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
