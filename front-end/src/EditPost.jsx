import './EditPost.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import PostForm from './PostForm'
import Confirmation from './Confirmation'

const EditPost = props => {
    const [formData, setFormData] = useState({
        id: -1,
        category: 'lost',
        title: '',
        desc: '',
        date: '',
        time: '',
        location: '', 
        includeBounty: false,
        bounty: '',
        submitLabel: ''
    })
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isDeleted, setIsDeleted] = useState(false)

    useEffect(() => {
        setFormData(props.postsData[props.curr])
        console.log(props.curr)
    }, [props.curr])

    // remove post data; later shows confirmation screen
    const deletePost = async () => {
        
        // delete specific post
        const post = props.postsData[props.curr]
        const res = await fetch(`/api/posts/${post.id}`, {
            method: 'DELETE'
        })
        if (!res.ok) throw new Error('Failed to delete post')
        await props.fetchPosts()
        // show confirmation notice afterwards
        setIsDeleted(true)
    }

    return (
        <div className='editPost'>
            {(!isSubmitted && !isDeleted) && <h1>Edit Post</h1>}
            {!isDeleted && <PostForm 
                postsData={props.postsData}
                setPostsData={props.setPostsData}
                key={formData.id}
                {...formData}
                origin='edit'
                submitLabel='Save Changes' 
                isSubmitted={isSubmitted} 
                setIsSubmitted={setIsSubmitted} 
                curr={props.curr} 
                fetchPosts={props.fetchPosts} 
                setCount={props.setCount}
            />}
            {(!isSubmitted && !isDeleted) && <Link className='link' id='cancel' to='/'>Cancel</Link>}
            {(!isSubmitted && !isDeleted) && <button className='link' id='delete' onClick={deletePost}>Delete</button>}
            {(!isSubmitted && isDeleted) && <Confirmation 
                title={`Post Deleted!`}
                message={`Your ${formData.category} item post is no longer visible to NYU students.`}
                viewPost={false} />}
        </div>
    );
}

export default EditPost