import './PostSubletPhoto.css'

const PostSubletPhoto = props => {
  return (
    <li className="PostSubletPhoto">
      <img
        className="PostSubletPhoto-img"
        src={props.url}
        alt={`Listing photo ${props.position}`}
      />
      <div className="PostSubletPhoto-controls">
        <button type="button" disabled={props.isFirst} onClick={props.handleMoveEarlier}>
          ←
        </button>
        <button type="button" disabled={props.isLast} onClick={props.handleMoveLater}>
          →
        </button>
        <button type="button" onClick={props.handleRemove}>
          ✕
        </button>
      </div>
    </li>
  )
}

export default PostSubletPhoto