import { Link, useNavigate, useLocation } from "react-router-dom";


// 
export default function Article() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const article = state.article;
    const authorList = article.authors.toString()

    if (!article) {
        return <p>Loading Article...</p>;
    }

    return(
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
                <div className="mb-2 grid grid-cols-2">
                    <button onClick = {() => navigate(`/articles/${article.id}/dejargoned/b`,
                        {state: { article }}
                    )}
                        className="bg-gray-600 text-white py-3 font-semibold">
                        Original
                    </button>
                    <button onClick = {() => navigate(`/articles/${article.id}/dejargoned/b`,
                        {state: { article }}
                    )}
                        className="bg-purple-600 text-white py-3 font-semibold hover:bg-purple-700">
                        De-Jargoned
                    </button>
                </div>
                
                <div className="m-4">
                    <p className = "text-lg text-zinc-600 text-left font-semibold uppercase">
                        { article.topic} | { article.publication }
                    </p>
                </div>
                
                <div className="mb-2">
                    <p className = "mb-2 text-3xl text-left font-bold">
                        { article.title }
                    </p>
                </div>
                <div className="mb-4">
                    <p className = "text-base text-left">
                        Authored by { authorList }
                    </p>
                </div>
                <img
                    className="mb-2 object-cover object-center w-full h-96"
                    src={ article.thumbnailUrl }
                    alt={ article.title }
                />
                <div className="m-2"><p className = "mb-2 text-sm text-zinc-500 text-left font-semibold">{ article.publishedDate } | Estimated Reading Time: { article.readingTimeMinutes } mins</p></div>
                <div className="mb-2"><p className = "text-base text-left">{ article.body }</p></div>
            </main>
        </div>
    )
} 