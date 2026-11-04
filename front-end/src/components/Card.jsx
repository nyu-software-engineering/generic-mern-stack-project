import "./Card.css";
function Card(props) {
  return (
    <article className="card">
      <div className="image_and_edit">
        {props.imageSrc ? (
          <div className="card-image">
              <img src={props.imageSrc} alt="" />
          </div>
        ) : (
          <div className="card-image">
              <img src="https://picsum.photos/200/300" alt="Random placeholder from Picsum"/>
          </div>
        )}
        <button className='Saved-EditBtn' onClick={props.Edit}>editButton</button>
      </div>
      <div className="card-info">{props.description}</div>
    </article>
  );
}

export default Card;