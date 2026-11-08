import { useState, useEffect } from "react"
import { Link } from 'react-router-dom'
import { fetchArticles, searchArticles } from './mock_data'
import ArticleCard from './ArticleCard'

const topics = ['All', 'AI/ML', 'Cybersecurity', 'Algorithms', 'Computer Vision']
const numArticles = 10

const Catalog = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [topic, setTopic] = useState('All')
  const [page, setPage] = useState(1)

  // on initial load
  useEffect(() => {
    fetchArticles()
      .then(response => {
        setArticles(response.data)
        setLoading(false)
      })
  }, [])

  const handleSearchChange = e => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleTopicClick = newTopic => {
    setTopic(newTopic)
    setPage(1)
  }

  const handlePageClick = newPage => {
    setPage(newPage)
    window.scrollTo(0, 0)
  }

  const results = searchArticles(articles, searchTerm, topic)

  const pageCount = Math.ceil(results.length / numArticles)
  const firstIndex = (page - 1) * numArticles
  const articlesOnPage = results.slice(firstIndex, firstIndex + numArticles)

  let message = ''
  if (loading) {
    message = 'Loading articles...'
  } else if (results.length == 0) {
    message = 'No articles found.'
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-bold text-purple-600"><Link to="/mainpage">Jargonot</Link></h2>
        <Link to="/dashboard" className="font-semibold text-purple-600 hover:underline">My Dashboard</Link>
      </header>
    <div className="w-full p-8">
      <h1 className="text-3xl font-bold text-center">Article Catalog</h1>

      <section className="mt-8">
        <label htmlFor="search-box" className="block mb-2 font-medium">
          Search articles
        </label>
        <input
          type="text"
          id="search-box"
          className="w-full border border-gray-300 rounded-lg p-3"
          placeholder="Title, keyword, or jargon term"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </section>

      <section className="mt-4 flex flex-wrap gap-2">
        {topics.map(item => (
          <button key={item} type="button" className={item === topic ? 'border border-purple-600 rounded-lg p-3 bg-purple-600 text-white font-semibold' : 'border border-gray-300 rounded-lg p-3'} onClick={() => handleTopicClick(item)}>{item}</button>
        ))}
      </section>

      {message !== '' && <p className="mt-6 text-gray-500 text-center">{message}</p>}

      <section className="mt-6">
        {articlesOnPage.map(article => (
          <ArticleCard key={article.id} details={article} />
        ))}
      </section>

      <section className="mt-6 flex items-center justify-between">
          <button
            type="button"
            className="border border-gray-300 rounded-lg p-3 disabled:text-gray-300"
            onClick = {() => handlePageClick(page - 1)}
            disabled = {page <= 1}
          >
            Previous
          </button>
          <p className="text-gray-500">
            Page {page} of {pageCount}
          </p>
          <button
            type="button"
            className="border border-gray-300 rounded-lg p-3 disabled:text-gray-300"
            onClick = {() => handlePageClick(page + 1)}
            disabled = {page >= pageCount}
          >
            Next
          </button>
        </section>
    </div>
    </div>
  )
}

export default Catalog