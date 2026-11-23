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
    }, [props.curr])

    // remove post data; later shows confirmation screen
    const deletePost = async () => {
        // show confirmation notice afterwards
        const res = await fetch(`/api/posts/${post.id}`, {
            method: 'DELETE'
        })
        if (!res.ok) throw new Error('Failed to delete post')
        await props.fetchPosts()
        setIsDeleted(true)

        // delete specific post
        // props.setPostsData(prev => {
        //     return prev
        //         .filter(post => post.id !== (props.count - props.curr - 1))
        //         .map(post => {
        //             if (post.id > (props.count - props.curr - 1)) {
        //                 return {
        //                     ...post, 
        //                     id: post.id - 1
        //                 }
        //             }
        //             return post;
        //         })
        // })
        // props.setCount(prev => prev - 1)
        // const res = await fetch(`/api/posts/${post.id}`, {
        //     method: 'DELETE'
        // })
        // if (!res.ok) throw new Error('Failed to delete post')
        // await props.fetchPosts()
    }

    return (
        <div className='editPost'>
            {(!isSubmitted && !isDeleted) && <h1>Edit Post</h1>}
            {!isDeleted && <PostForm 
                postsData={props.postsData}
                setPostsData={props.setPostsData}
                key={formData.title}
                {...formData}
                origin='edit'
                submitLabel='Save Changes' 
                isSubmitted={isSubmitted} 
                setIsSubmitted={setIsSubmitted} 
                curr={props.curr} 
                fetchPosts={props.fetchPosts} 
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