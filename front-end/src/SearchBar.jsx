import "./SearchBar.css";

// SearchBar (#33): a search input that the page controls.
// The page passes the label to show, the current text (value),
// and a function to update the text (onChange).
export default function SearchBar({ label, value, onChange }) {
  return (
    <div className="search-bar">
      <label className="search-bar-label" htmlFor="search_input">
        {label}
      </label>
      <input
        id="search_input"
        className="doin-input search-bar-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type to search..."
      />
    </div>
  );
}
