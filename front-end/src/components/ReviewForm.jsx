
import { useState } from "react";
import "./ReviewForm.css";

function ReviewForm({ userName }) {
    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);
    }

    return <div className="review-form">
        <h2>Leave a Review</h2>
        <p>How was your experience with {userName}?</p>

        <form onSubmit={handleSubmit}>
            <label htmlFor="rating">Rating</label>
            <select
                id="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
            >
                <option value="">Select a rating</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
            </select>

            <label htmlFor="comment">Your Review</label>
            <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write about your experience..."
                rows="5"
                required
            />

            <button type="submit">Add Review</button>
        </form>

        {submitted && (
            <div className="review-result">
                 <p>Review submitted!</p>
                <p>Rating: {rating}/5 stars</p>
                <p>{comment}</p>
            </div>
        )}
    </div>
}

export default ReviewForm;