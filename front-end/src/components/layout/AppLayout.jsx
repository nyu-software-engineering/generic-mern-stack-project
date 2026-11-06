import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router";

const menuItems = {
  renter: [
    { label: "Home", to: "/" },
    { label: "Check an apartment", to: "/check" },
    { label: "Reliability Report", to: "/report" },
    { label: "Followed areas", to: "/followed-areas" },
    { label: "Negotiate", to: "/negotiate" },
    { label: "Notifications", to: "/notifications" },
    { label: "Profile", to: "/profile" },
    { label: "Active share links", to: "/share-links" },
    { label: "Explore areas", to: "/explore" },
  ],
  landlord: [
    { label: "Home", to: "/landlord" },
    { label: "Received reports", to: "/landlord/reports" },
  ],
};

const homePaths = { renter: "/", landlord: "/landlord" };

function BarRow({ homePath, buttonLabel, onButtonClick, dark }) {
  return (
    <div className="flex h-14 items-center justify-between px-5">
      <Link
        to={homePath}
        className={`text-lg font-bold tracking-tight ${dark ? "text-white" : "text-ink"}`}
      >
        Leverage
      </Link>
      <button
        type="button"
        onClick={onButtonClick}
        className={`border px-3 py-1.5 text-sm font-semibold ${dark ? "border-white text-white" : "border-ink text-ink"}`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

export default function AppLayout({ role }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

    // Let Escape close the menu while it is open.
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, closeMenu]);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line bg-surface">
        <BarRow
          homePath={homePaths[role]}
          buttonLabel="Menu"
          onButtonClick={() => setMenuOpen(true)}
        />
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-50 mx-auto flex max-w-md flex-col bg-ink"
          role="dialog"
          aria-label="Menu"
        >
          <BarRow
            homePath={homePaths[role]}
            buttonLabel="Close"
            onButtonClick={closeMenu}
            dark
          />
          <nav className="flex-1 overflow-y-auto px-5 pb-8">
            <ul className="divide-y divide-white/15 border-y border-white/15">
              {menuItems[role].map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `block py-4 text-lg ${isActive ? "font-semibold text-white" : "text-white/75 hover:text-white"}`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block py-4 text-lg text-white/75 hover:text-white"
                >
                  Log out
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <main className="px-5 py-6">
        <Outlet />
      </main>
    </>
  );
}
