import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import BackButton from '../Back_Button';

export default function Beginner() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        setArticle(null);

        axios
            .get(`/api/articles/${encodeURIComponent(id)}`)
            .then((response) => {
                if (!cancelled) {
                    setArticle(response.data);
                }
            })
            .catch((requestError) => {
                if (!cancelled) {
                    setError(
                        requestError.response?.status === 404
                            ? "Article not found."
                            : "Unable to load article."
                    );
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
    }, [id]);

    if (loading) {
        return <p>Loading Article...</p>;
    }
    if (error || !article) {
        return <p>{error ?? "Unable to load article."}</p>;
    }

    const dj = article.dejargoned?.beginner;
    const jargon = article.jargon;

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
                <div className="flex-1 mb-4 grid grid-cols-2">
                    <button onClick = {() => navigate(`/articles/${article.id}/`,
                        { state: { article } }
                    )}
                        className="bg-purple-600 text-white py-3 font-semibold hover:bg-purple-700">
                        Original
                    </button>
                    <div className="bg-gray-600 text-white py-3 font-semibold">
                        De-Jargoned
                    </div>
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

                <div className="m-4 flex items-center gap-4">
                    <p className="text-md font-medium whitespace-nowrap">
                        Explanation Level
                    </p>

                    <div className="grid flex-1 grid-cols-3">
                        <div className="bg-white px-5"></div>
                        <div className="bg-gray-600 text-white px-5 font-semibold">
                            Beginner
                        </div>
                        <button onClick = {() => navigate(`/articles/${article.id}/dejargoned/i`,
                            { state: { article } }
                        )}
                            className="bg-purple-600 text-white px-5 font-semibold hover:bg-purple-700">
                            Intermediate
                        </button>
                    </div>
                </div>

                <section className = "gap-4 m-4 text-black">
                    <div className = "text-left p-2 border border-gray-300 ">
                        <p className = "text-2xl font-bold m-6">
                            1. What happened?
                        </p>
                        <p className = "text-base font-normal m-2">
                            { dj.whatHappened }
                        </p>
                    </div>
                    <div className = "text-left p-2 border border-gray-300">
                        <p className = "text-2xl font-bold m-6">
                            2. Why does it matter?
                        </p>
                        <p className = "text-base font-normal m-2">
                            { dj.whyItMatters }
                        </p>
                    </div>
                    <div className = "text-left p-2 border border-gray-300">
                        <p className = "text-2xl font-bold m-6">
                            3. What terms should I know? 
                        </p>
                        <p className = "text-base font-normal m-2">
                            <div className="space-y-3">
                                {jargon.map(({ term, explanation }) => (
                                    <div key={term} className="border border-black p-3">
                                        <h3 className="text-sm font-bold">{term}</h3>
                                        <p className="mt-1 text-sm">{explanation}</p>
                                    </div>
                                ))}
                            </div>
                        </p>
                    </div>
                    <div className = "text-left p-2 border border-gray-300">
                        <p className = "text-2xl font-bold m-6">
                            4. Go Deeper
                        </p>
                        <p className = "text-base font-normal m-2">
                            { dj.goDeeper }
                        </p>
                    </div>
                </section>
            </main>
        </div>
    )
} 