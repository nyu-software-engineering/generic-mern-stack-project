export default function Favorite() {
  const favorites = [
    {
      id: 1,
      category: "category1",
      source: "Title 1",
      readTime: "5 min read",
      title: "Sample title 1",
      excerpt:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      href: "#",
    },
    {
      id: 2,
      category: "category2",
      source: "Title 1",
      readTime: "10 min read",
      title: "Sample title 2",
      excerpt:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      href: "#",
    },
  ];

  return (
    <div className="favorite-page">
      <header className="header">
        <h2 className="header-logo">Jargonot</h2>
        <a className="header-link" href="/dashboard">My Dashboard</a>
      </header>

      <main className="main-content">
        <section className="favorite-intro">
          <h1 className="favorite-title">My Favourites</h1>
          <p className="favorite-subtitle">Your saved papers</p>
        </section>

        <section className="favorite-list">
          {favorites.length === 0 ? (
            <p className="favorite-empty">You haven't saved any papers yet.</p>
          ) : (
            favorites.map((paper) => (
              <article key={paper.id} className="article-card">
                <div className="article-body">
                  <p className="article-meta">
                    {paper.category} | {paper.source} | {paper.readTime}
                  </p>
                  <h4 className="article-title">{paper.title}</h4>
                  <p className="article-excerpt">{paper.excerpt}</p>
                  <div className="article-actions">
                    <a className="article-link" href={paper.href}>
                      Read Article →
                    </a>
                    <button className="article-remove">Remove</button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}