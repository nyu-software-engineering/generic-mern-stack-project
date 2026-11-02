import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faStarHalfStroke } from '@fortawesome/free-solid-svg-icons'
import { faStar as faEmptyStar } from '@fortawesome/free-regular-svg-icons'

function RatingSlider({ setUserRating }) {

    const [s0i, setS0i] = useState(faEmptyStar);
    const [s1i, setS1i] = useState(faEmptyStar);
    const [s2i, setS2i] = useState(faEmptyStar);
    const [s3i, setS3i] = useState(faEmptyStar);
    const [s4i, setS4i] = useState(faEmptyStar);

    function touchXToRating(x) {
        let containerBounds = document.querySelector('.slider-container').getBoundingClientRect();
        let containerWidth = containerBounds.width;
        let containerLeft = containerBounds.left;
        let percent = (x - containerLeft) / containerWidth;
        setStarIcons(percent * 10);
    }
    function click(event) {
        touchXToRating(event.clientX);
    }
    function touchStart(event) {
        touchXToRating(event.touches[0].clientX);
    }
    function touchMove(event) {
        touchXToRating(event.touches[0].clientX);
    }

    function setStarIcons(rating) {
        // converts 0-10 rating to stars and half-stars, sets icons
        if (rating < 0.5) {
            rating = 0;
        } else if (rating > 9.5) {
            rating = 10;
        }
        rating = Math.round(rating); // round to nearest 0.5
        setS0i(rating <= 0 ? faEmptyStar : rating <= 1 ? faStarHalfStroke : faStar);
        setS1i(rating <= 2 ? faEmptyStar : rating <= 3 ? faStarHalfStroke : faStar);
        setS2i(rating <= 4 ? faEmptyStar : rating <= 5 ? faStarHalfStroke : faStar);
        setS3i(rating <= 6 ? faEmptyStar : rating <= 7 ? faStarHalfStroke : faStar);
        setS4i(rating <= 8 ? faEmptyStar : rating <= 9 ? faStarHalfStroke : faStar);
        setUserRating(rating);
    }

    const starStyle = {
        'fontSize': '2.5rem',
    }

    return (
        <div className='slider-container' onClick={click} onTouchStart={touchStart} onTouchMove={touchMove}>
            <span className='stars'>
                <FontAwesomeIcon icon={s0i} id='s0' style={starStyle} />
                <FontAwesomeIcon icon={s1i} id='s1' style={starStyle} />
                <FontAwesomeIcon icon={s2i} id='s2' style={starStyle} />
                <FontAwesomeIcon icon={s3i} id='s3' style={starStyle} />
                <FontAwesomeIcon icon={s4i} id='s4' style={starStyle} />
            </span>
        </div>
    )
}



export default RatingSlider;