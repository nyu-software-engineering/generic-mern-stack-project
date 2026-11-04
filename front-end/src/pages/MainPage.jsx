export default function MainPage() {
  const userName = "Jon";
  const topics = ["topic1", "topic2"];

  const todaysPick = {
    image: null,
    category: "topic1",
    source: "A source",
    readTime: "10 min read",
    title: "Sample Topic",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  };

  return (
    <div className="main-page">
      <header className="header">
        <h2 className="header-logo">Jargonot</h2>
        <a className="header-link" href="/dashboard">My Dashboard</a>
      </header>

      <main className="main-content">
        <section className="greeting">
          <h1 className="greeting-title">Hi {userName}!</h1>
          <p className="greeting-subtitle">What do you want to learn today?</p>
        </section>

        <section className="search">
          <label className="search-label" htmlFor="search-input">
            Search a topic or article&nbsp;
          </label>
          <input
            id="search-input"
            className="search-input"
            type="text"
            placeholder="Search for..."
          />
        </section>

        <section className="topics">
          <h3 className="section-title">Your Topics</h3>
          <div className="topics-list">
            {topics.map((topic) => (
              <button key={topic} className="topic-button">
                {topic}
              </button>
            ))}
            <button className="topic-button topic-add">+</button>
          </div>
        </section>

        <section className="todays-pick">
          <h3 className="section-title">Today's Pick</h3>
          <article className="article-card">
            <div className="article-image">
              {todaysPick.image ? (
                <img src={todaysPick.image} alt={todaysPick.title} />
              ) : (
                <span>Placeholder Image</span>
              )}
            </div>
            <div className="article-body">
              <p className="article-meta">
                {todaysPick.category} | {todaysPick.source} | {todaysPick.readTime}
              </p>
              <h4 className="article-title">{todaysPick.title}</h4>
              <p className="article-excerpt">{todaysPick.excerpt}</p>
              <a className="article-link" href="./article">Read Article</a>
            </div>
          </article>
        </section>

        <button className="browse-button">Browse All Articles</button>
      </main>
    </div>
  );
}