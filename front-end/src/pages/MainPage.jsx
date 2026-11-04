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
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-bold text-purple-600">Jargonot</h2>
        <a
          className="font-semibold text-purple-600 hover:underline"
          href="/dashboard"
        >
          My Dashboard
        </a>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <section className="mb-8">
          <h1 className="mb-1 text-3xl font-bold">Hi {userName}!</h1>
          <p className="text-gray-600">What do you want to learn today?</p>
        </section>

        <section className="mb-8">
          <label className="mb-2 block text-sm font-medium" htmlFor="search-input">
            Search a topic or article&nbsp;
          </label>
          <input
            id="search-input"
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
            type="text"
            placeholder="Search for..."
          />
        </section>

        <section className="mb-10">
          <h3 className="mb-4 text-xl font-bold">Your Topics</h3>
          <div className="flex flex-wrap gap-3">
            {topics.map((topic) => (
              <button
                key={topic}
                className="rounded-lg border border-purple-200 px-4 py-2 font-medium text-purple-700 hover:bg-purple-50"
              >
                {topic}
              </button>
            ))}
            <button
              aria-label="Add topic"
              className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700"
            >
              +
            </button>
          </div>
        </section>

        <section className="mb-8">
          <h3 className="mb-4 text-xl font-bold">Today's Pick</h3>
          <article className="overflow-hidden rounded-lg border border-gray-200 md:flex">
            <div className="flex min-h-48 items-center justify-center bg-purple-50 p-6 text-sm text-gray-500 md:w-1/3">
              {todaysPick.image ? (
                <img
                  className="h-full w-full object-cover"
                  src={todaysPick.image}
                  alt={todaysPick.title}
                />
              ) : (
                <span>Placeholder Image</span>
              )}
            </div>
            <div className="p-6 md:flex-1">
              <p className="mb-2 text-sm text-gray-500">
                {todaysPick.category} | {todaysPick.source} | {todaysPick.readTime}
              </p>
              <h4 className="mb-2 text-lg font-bold">{todaysPick.title}</h4>
              <p className="mb-4 text-gray-600">{todaysPick.excerpt}</p>
              <a
                className="font-semibold text-purple-600 hover:underline"
                href="./article"
              >
                Read Article
              </a>
            </div>
          </article>
        </section>

        <button className="rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700">
          Browse All Articles
        </button>
      </main>
    </div>
  );
}