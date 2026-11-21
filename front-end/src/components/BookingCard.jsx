function BookingCard(props) {
  return (
    <article className="card">
      <div className="image-and-edit">
        <div className="card-image">
          <img src={props.imageSrc || "https://picsum.photos/400/225"} alt="" />
        </div>
        <button className="Saved-EditBtn" onClick={props.Edit}>
          Edit
        </button>
      </div>

      <div className="card-info">
        <h3 className="card-name">{props.name}</h3>
        <div className="card-meta">
          {props.location && <span>{props.location}</span>}
        </div>
        <div>Check in: {props.checkIn}</div>
        <div> Check out: {props.checkOut}</div>
        Notes
        <div>
          <p className="card-description">{props.description}</p>
        </div>
      </div>
    </article>
  );
}

export default BookingCard;
