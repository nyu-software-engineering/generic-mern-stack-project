import axios from 'axios'
const url = 'https://api.mockaroo.com/api/befa3120?count=20&key=f61ca6a0'

/* the hook for front-end paper data fetching.

Mockaroo schema:
id
title               article name
topic               one of: AI/ML, Cybersecurity, Algorithms, Computer Vision
publication         the journal or site it was published in
thumbnailUrl        a placeholder image from Picsum, e.g. https://picsum.photos/seed/7/300/200 # potentially can remove if no thumbnail is generally applicable
keywords            a list of words or phrases
authors             a list of names
publishedDate       e.g. 2026-03-14
readingTimeMinutes  e.g. 12
abstract            abstract, preview paragraph
body                the full original text
jargon              a list of {term, explanation} objects
dejargoned          {beginner, intermediate}, each with whatHappened, whyItMatters and goDeeper

caller uses .then() to wait for the request to finish, and the list of articles is then in response.data
each page that needs articles calls this once, inside a useEffect (see Catalog.jsx)
*/

const fetchArticles = () => {
  return axios.get(url) // returns a promise, use .data
}

const findArticleById = (articles, id) => {
  return articles.find(article => String(article.id) === String(id))
}

// search if title, keywords or jargon terms contain searchTerm. topic is selected using buttons
const searchArticles = (articles, searchTerm, topic) => {
  const term = (searchTerm || '').trim().toLowerCase()

  return articles.filter(article => {
    if (topic && topic !== 'All' && article.topic !== topic) {
      return false
    }

    // empty search: keep every article
    if (term === '') {
      return true
    }

    const matches = text => text.toLowerCase().includes(term) // case insensitive matching

    const titleMatches = matches(article.title)
    const keywordMatches = article.keywords.some(keyword => matches(keyword))
    const jargonMatches = article.jargon.some(item => matches(item.term))

    return titleMatches || keywordMatches || jargonMatches
  })
}

export {fetchArticles, findArticleById, searchArticles}