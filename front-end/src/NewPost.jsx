import './NewPost.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import PostForm from './PostForm'

const NewPost = props => {
    const [isSubmitted, setIsSubmitted] = useState(false)

    return (
        <div className='newPost'>
            {!isSubmitted && <h1>Create Post</h1>}
            <PostForm 
                email={props.currentUser.email}
                username={props.currentUser.name}
                pfp={props.currentUser.picture}
                origin='publish' // publish or edit (delete & resolve pass their own message)
                submitLabel='Publish Post' 
                isSubmitted={isSubmitted} 
                setIsSubmitted={setIsSubmitted} 
                postsData={props.postsData}
                setPostsData={props.setPostsData}
                />
            {!isSubmitted && <Link className='link' to='/'>Cancel</Link>}
        </div>
    );
}

export default NewPost