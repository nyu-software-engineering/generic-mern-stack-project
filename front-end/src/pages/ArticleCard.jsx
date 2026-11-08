import { Link } from 'react-router-dom'

const ArticleCard = props => {

  const imgSrc = props.details.thumbnailUrl

  return (
    <article className="mb-4 border border-gray-300 rounded-lg p-3 text-left">
      <Link 
        to={`/articles/${props.details.id}`} 
        state={{ article: props.details }}
        className="flex gap-4 items-center">
        <img className="w-24 h-24 shrink-0 rounded-lg object-cover" alt="" src={imgSrc} />

        <div className="details">
          <p className="text-sm text-gray-500">
            {props.details.topic} | {props.details.publication}
          </p>
          <h2 className="font-bold">{props.details.title}</h2>

          <ul className="mt-2 list-disc pl-5 text-sm">
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