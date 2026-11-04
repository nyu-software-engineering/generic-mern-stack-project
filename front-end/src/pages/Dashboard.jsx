export default function Dashboard() {
  const userName = "Jon";

  const cards = [
    {
      title: "My Favorites",
      description: "View your saved papers",
      linkText: "View Favorites",
      href: "/favorites",
    },
    {
      title: "Browse Papers",
      description: "Explore papers in the catalog",
      linkText: "View papers",
      href: "/papers",
    },
    {
      title: "Settings",
      description: "Manage your account preferences",
      linkText: "View preferences",
      href: "/settings",
    },
  ];

  return (
    <div className="dashboard-page">
      <header className="header">
        <h2 className="header-logo">Jargonot</h2>
        <button className="header-button">Log Out</button>
      </header>

      <main className="main-content">
        <section className="dashboard-intro">
          <h1 className="dashboard-title">My Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {userName}!</p>
        </section>

        <section className="dashboard-cards">
          {cards.map((card) => (
            <article key={card.title} className="dashboard-card">
              <h3 className="card-title">{card.title}</h3>
              <p className="card-description">{card.description}</p>
              <a className="card-link" href={card.href}>
                {card.linkText}
              </a>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}