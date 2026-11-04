import { useState, useEffect } from "react"
import { fetchArticles, searchArticles } from './mock_data'
import ArticleCard from './ArticleCard'
import './styles/Catalog.css'

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
    <div className="Catalog">
      <h1 className="page-title">Article Catalog</h1>

      <section className="search">
        <label htmlFor="search-box" className="search-label">
          Search articles
        </label>
        <input
          type="text"
          id="search-box"
          className="search-box"
          placeholder="Title, keyword, or jargon term"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </section>

      <section className="topics">
        {topics.map(item => (
          <button key={item} type="button" className={item === topic ? 'topic selected' : 'topic'} onClick={() => handleTopicClick(item)}>{item}</button>
        ))}
      </section>

      {message !== '' && <p className="message">{message}</p>}

      <section className="articles">
        {articlesOnPage.map(article => (
          <ArticleCard key={article.id} details={article} />
        ))}
      </section>

      <section className="pages">
          <button
            type="button"
            className="page-button"
            onClick = {() => handlePageClick(page - 1)}
            disabled = {page <= 1}
          >
            Previous
          </button>
          <p className="page-number">
            Page {page} of {pageCount}
          </p>
          <button
            type="button"
            className="page-button"
            onClick = {() => handlePageClick(page + 1)}
            disabled = {page >= pageCount}
          >
            Next
          </button>
        </section>
    </div>
  )
}

export default Catalog