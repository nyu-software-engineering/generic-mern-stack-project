import { Link } from 'react-router-dom'

const ArticleCard = props => {

  const imgSrc = props.details.thumbnailUrl

  return (
    <article className="ArticleCard">
      <Link to={`/articles/${props.details.id}`} className="card-link"> {/* todo, link to article page */}
        <img className="thumbnail" alt="" src={imgSrc} />

        <div className="details">
          <p className="meta">
            {props.details.topic} | {props.details.publication}
          </p>
          <h2 className="title">{props.details.title}</h2>

          <ul className="keywords">
            {props.details.keywords.map((keyword, index) => (
              <li key={index}>{keyword}</li>
            ))}
          </ul>
        </div>
      </Link>
    </article>
  )
}

export default ArticleCard