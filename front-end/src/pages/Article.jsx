import { useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import BackButton from "./Back_Button";


export default function Article() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const article = state.article;
    const [activeWord, setActiveWord] = useState(null);
    const body = typeof article?.body === "string" ? article.body : "";
    const wordMatches = useMemo(
        () => [...body.matchAll(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)],
        [body]
    );
    const clickableWordIndexes = useMemo(() => {
        const indexes = Array.from({ length: wordMatches.length }, (_, index) => index);
        for (let index = indexes.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [indexes[index], indexes[randomIndex]] = [indexes[randomIndex], indexes[index]];
        }
        return new Set(indexes.slice(0, 10));
    }, [wordMatches]);

    if (!article) {
        return <p>Loading Article...</p>;
    }

    let bodyPosition = 0;
    const articleBody = wordMatches.map((match, index) => {
        const wordStart = match.index;
        const word = match[0];
        const precedingText = body.slice(bodyPosition, wordStart);
        bodyPosition = wordStart + word.length;
        const isPopupOpen = activeWord?.body === body && activeWord.index === index;

        return (
            <span key={index}>
                {precedingText}
                {clickableWordIndexes.has(index) ? (
                    <span className="relative inline-block">
                        <button
                            type="button"
                            aria-expanded={isPopupOpen}
                            aria-controls={isPopupOpen ? `lorem-popup-${index}` : undefined}
                            className="cursor-pointer rounded-sm bg-purple-100 px-0.5 text-purple-800 underline decoration-dotted underline-offset-2 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            onClick={() => setActiveWord(isPopupOpen ? null : { body, index })}
                        >
                            {word}
                        </button>
                        {isPopupOpen && (
                            <span
                                id={`lorem-popup-${index}`}
                                role="dialog"
                                aria-label="Lorem ipsum"
                                className="absolute left-0 top-full z-10 mt-2 w-64 rounded-lg border border-purple-200 bg-white p-3 text-sm font-normal text-gray-800 shadow-lg"
                            >
                                <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
                                <button
                                    type="button"
                                    aria-label="Close popup"
                                    className="ml-2 font-semibold text-purple-700 hover:underline"
                                    onClick={() => setActiveWord(null)}
                                >
                                    Close
                                </button>
                            </span>
                        )}
                    </span>
                ) : word}
            </span>
        );
    });

    articleBody.push(body.slice(bodyPosition));

    // format the list of authors to be readable
    let authorList = "";
    if (article.authors.length === 1) {
        authorList = article.authors[0];
    }
    else if (article.authors.length === 2) {
        authorList = `${article.authors[0]} and ${article.authors[1]}`;
    }
    else{
        authorList = article.authors.slice(0, -1).join(', ').concat(', and ', article.authors.slice(-1));
    }

    return(
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
                <div className="mb-2 grid grid-cols-2">
                    <button onClick = {() => navigate(`/articles/${article.id}`,
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
                <div className="mb-2"><p className = "text-base text-left">{ articleBody }</p></div>
            </main>
        </div>
    )
} 