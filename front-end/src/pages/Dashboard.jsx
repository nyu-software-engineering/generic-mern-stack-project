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
      href: "/articles",
    },
    {
      title: "Settings",
      description: "Manage your account preferences",
      linkText: "View preferences",
      href: "/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-bold text-purple-600">Jargonot</h2>
        <a className="font-semibold text-purple-600 hover:underline"
          href="/login"
        >
          Log Out
        </a>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <section className="mb-8">
          <h1 className="mb-1 text-3xl font-bold">My Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userName}!</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className="rounded-lg border border-gray-200 p-6"
            >
              <h3 className="mb-2 text-lg font-bold">{card.title}</h3>
              <p className="mb-4 text-gray-600">{card.description}</p>
              <a
                className="font-semibold text-purple-600 hover:underline"
                href={card.href}
              >
                {card.linkText}
              </a>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}