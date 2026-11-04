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
          <h1 className="mb-1 text-3xl font-bold">My Favourites</h1>
          <p className="text-gray-600">Your saved papers</p>
        </section>

        <section className="space-y-4">
          {favorites.length === 0 ? (
            <p className="rounded-lg border border-gray-200 p-6 text-gray-600">
              You haven't saved any papers yet.
            </p>
          ) : (
            favorites.map((paper) => (
              <article
                key={paper.id}
                className="rounded-lg border border-gray-200 p-6"
              >
                <div>
                  <p className="mb-2 text-sm text-gray-500">
                    {paper.category} | {paper.source} | {paper.readTime}
                  </p>
                  <h4 className="mb-2 text-lg font-bold">{paper.title}</h4>
                  <p className="mb-4 text-gray-600">{paper.excerpt}</p>
                  <div className="flex items-center gap-4">
                    <a
                      className="font-semibold text-purple-600 hover:underline"
                      href={paper.href}
                    >
                      Read Article →
                    </a>
                    <button className="text-sm font-medium text-gray-500 hover:text-gray-700">
                      Remove
                    </button>
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