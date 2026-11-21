export default function Header({ onMenu }) {
    return (
      <header className="header">
        <h1>Sublet Search</h1>
        {onMenu && (
          <button className="menu-btn" onClick={onMenu} aria-label="Open menu">
            ≡ Menu
          </button>
        )}
      </header>
    );
  }