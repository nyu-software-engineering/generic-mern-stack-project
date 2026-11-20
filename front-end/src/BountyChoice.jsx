import './BountyChoice.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Confirmation from './Confirmation'

const BountyChoice = props => {
    const [bounty, setBounty] = useState('')
    const [choices, setChoices] = useState([])
    const [personChosen, setPersonChosen] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [hasBounty, setHasBounty] = useState(false)

    // the bounty amount is taken from data of the post the user came from
    // where they clicked resolve
    useEffect(() => {
        const post = props.postsData[props.curr]
        if (!post) return

        setBounty(post.bounty)
        setHasBounty(post.includeBounty)
        // should get choices from list of people in user's messages screen
        // for now, placeholder:
        fetch('/api/mockData')
            .then(res => res.json())
            .then(data => setChoices(data.conversations))
            .catch(err => console.error(err))
    }, [])


    const chose = name => {
        if (name === personChosen) {
            setPersonChosen('')
        }
        else {
            setPersonChosen(name)
        }
    }

    // when submitting form button, save the user who was chosen to receive the bounty
    const submitForm = e => {
        e.preventDefault()

        // keep the post in the user's history before removing it from the feed
        const post = props.postsData[props.curr]
        fetch('/api/posts/resolved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: post.title,
                category: post.category,
                location: post.location,
                date: post.date,
            }),
        }).catch(err => console.error(err))

        // show confirmation notice afterwards
        setIsSubmitted(true)

        // resolving the post is equivalent to deleting the post, so same
        // code here
        fetch(`/api/posts/${post.id}`, {
            method: 'DELETE'
        })
        props.fetchPosts()
        props.setCount(prev => prev - 1)
    }

    return (
        <div className='bountyChoice'>
            {hasBounty && 
                <>
                    {!isSubmitted && <h1>Choose Bounty Receiver</h1>}
                    {!isSubmitted && <p className='text'>Among the people you have messaged, you may select who will receive 
                        the bounty you have set. Selecting them will notify them immediately. </p>}
                    {!isSubmitted && <div className='bountyDisplay'>
                        <h2>Bounty</h2>
                        <p>{bounty}</p>
                    </div>}
                        
                    {!isSubmitted && <div className='choices'>
                        {choices.map(choice => (
                            <button
                                key={choice.id}
                                className={personChosen === choice.username ? 'active' : 'choice'}
                                onClick={() => chose(choice.username)}>
                                <img className='pfp' src={choice.pfp} alt="" />
                                <p className='name'>{choice.username}</p>
                            </button>
                        ))}
                    </div>}
                </>
            }

            {!hasBounty &&
                <>
                    {!isSubmitted && <h1>No Bounty to Award</h1>}
                    {!isSubmitted && <p className='text'>Are you sure you want to resolve? </p>}
                </>
            }

            {!isSubmitted && <form onSubmit={submitForm}>
                <button 
                    type='submit' 
                    id={(!personChosen && hasBounty) ? 'disabled' : 'submit'} 
                    disabled={!personChosen && hasBounty}>
                    Confirm
                </button>
            </form>}
            {/* return to post user came from; for now, as we don't have post view screen,
            this is going to route to home */}
            {!isSubmitted && <Link className='link' id='cancel' to='/' style={{textDecoration: 'none'}}>Cancel</Link>}
            {isSubmitted && <Confirmation 
                title={`Post Resolved!`}
                message={`Your post has been marked as resolved.`}
                viewPost={false} />}
        </div>
    );
}

export default BountyChoice