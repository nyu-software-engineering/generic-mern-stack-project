import "./ReviewCard.css";
import { useState } from "react";

function ReviewCard({ review }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="review-card">
      <div className="review-header">
        <img
          alt={review.author}
          className="review-avatar"
        />
        <div className="review-author-info">
          <h3>{review.author}</h3>
          <p className="review-date">{review.date}</p>
        </div>
        <div className="review-rating">
          {"★".repeat(review.rating || 5)}
        </div>
      </div>

      <div className="review-info">
        <p className="review-text">"{review.text}"</p>
      </div>

      <div className="review-buttons">
        <button
          type="button"
          className="like-button"
          onClick={() => setLiked(!liked)}
        >
          {liked ? "Liked" : "Like"}
        </button>
      </div>
    </div>
  );
}

export default ReviewCard;