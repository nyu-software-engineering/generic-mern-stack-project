import "./Card.css";
function Card(props) {
  return (
    <article className="card">
      <div className="image_and_edit">
        {props.imageSrc ? (
          <img className="card-image" src={props.imageSrc} alt="" />
        ) : (
          <div className="card-image"> Place Holder Image</div>
        )}
        <button className='Saved-EditBtn' onClick={props.Edit}>editButton</button>
      </div>
      <div className="card-info">{props.description}</div>
    </article>
  );
}

export default Card;