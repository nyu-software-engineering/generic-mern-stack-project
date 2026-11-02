import './RatingPage.css';
import RatingSlider from '../components/ui/ratingSlider.jsx';
import { useState } from 'react';


function RatingPage() {

  const [userRating, setUserRating] = useState(-1);

  return (
    <div className="rating-container">
      <p className="rate-name-header">Rate your experience with</p>
      <p className="rate-name">First L.</p>
      <RatingSlider setUserRating={setUserRating} />
      <p className="comment-box-header">Comment</p>
      <textarea className="comment-box" type="text" placeholder="Write a comment..." />
      <button className="submit-button">Submit Rating</button>
    </div>
  );
}

export default RatingPage;
