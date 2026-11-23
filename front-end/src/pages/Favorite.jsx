import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BackButton from './Back_Button';
import { fetchArticles } from "./mock_data";
export default function Favorite() {
  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;

    fetchArticles()
      .then((response) => {
        if (!cancelled) {
          setFavorites(response.data.slice(0, 2));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to fetch articles:", error);
        }
      })

      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRemove = (id) => {
    setFavorites((previousFavorites) => {
      return previousFavorites.filter((paper) => paper.id !== id);
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-bold text-purple-600">
          <Link to="/mainpage">Jargonot</Link>
        </h2>
        <a
          className="font-semibold text-purple-600 hover:underline"
          href="/dashboard"
        >
          My Dashboard
        </a>
      </header>
      <section className="mt-2 mx-4 flex justify-start">
        <BackButton />
      </section>

      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <section className="mb-8">
          <h1 className="mb-1 text-3xl font-bold">My Favourites</h1>
          <p className="text-gray-600">Your saved papers</p>
        </section>

        <section className="space-y-4">
          {loading ? (
            <p>Loading favourites...</p>
          ) : favorites.length === 0 ? (
            <p>You haven't saved any papers yet</p>
          ) : (
            favorites.map((paper) => (
              <article
                key={paper.id}
                className="rounded-lg border border-gray-200 p-6"
              >
                <div>
                  <p className="mb-2 text-sm text-gray-500">
                    {paper.topic} | {paper.publication} |{" "}
                    {paper.readingTimeMinutes} min read
                  </p>
                  <h4 className="mb-2 text-lg font-bold">{paper.title}</h4>
                  <p className="mb-4 text-gray-600">{paper.abstract}</p>
                  <div className="flex items-center gap-4">
                    <Link
                      className="font-semibold text-purple-600 hover:underline"
                      to={`/articles/${paper.id}`}
                      state={{ article: paper }}
                    >
                      Read Article →
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(paper.id)}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
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
