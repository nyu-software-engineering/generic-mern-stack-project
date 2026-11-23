import './PostForm.css'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Confirmation from './Confirmation'

const PostForm = props => {
    const [formData, setFormData] = useState({
        id: props.id, 
        username: props.username ?? '', 
        pfp: props.pfp ?? 'https://picsum.photos/200?random=2',
        category: props.category ?? 'lost',
        title: props.title ?? '',
        desc: props.desc ?? '',
        date: props.date ?? '',
        time: props.time ?? '',
        location: props.location ?? '', 
        image: props.image ?? '',
        includeBounty: props.includeBounty ?? false,
        bounty: props.bounty ?? ''
    })
    const [isValid, setIsValid] = useState(false)
    const [isEdited, setIsEdited] = useState(false)

    useEffect(() => {
        if (formData.includeBounty) {
            setIsValid(formData.title && formData.desc && formData.bounty)
        }
        else {
            setIsValid(formData.title && formData.desc)
        }
    }, [formData.includeBounty, formData.title, formData.desc, formData.bounty])

    useEffect(() => {
        setIsEdited(
            formData.category !== props.category ||
            formData.title !== props.title ||
            formData.desc !== props.desc ||
            formData.date !== props.date ||
            formData.time !== props.time ||
            formData.location !== props.location ||
            formData.image !== props.image ||
            formData.includeBounty !== props.includeBounty ||
            formData.bounty !== props.bounty
        )
    }, [formData])

    const submitForm = e => {
        e.preventDefault() // prevent normal browser submit behavior

        if (props.origin === 'publish') {
            const post = new FormData(e.currentTarget)
            post.append("id", formData.id)
            post.append('username', formData.username)
            post.append('pfp', formData.pfp)

            fetch('/api/posts', {
                method: 'POST',
                body: post
            })
            .then(res => res.json())
            .then(saved => {
                props.setPostsData(prev => [saved, ...prev])
                props.setCount(prev => prev + 1)
            })
            .catch(err => console.error(err))
        }
        else if (props.origin === 'edit') {
            props.setPostsData(prev => prev.map((post, index) => index === props.curr ? formData : post))
        }

        props.setIsSubmitted(true)
    }

    return (
        <>
            {!props.isSubmitted && <form className='postForm' action='/api/posts' 
                method='POST' encType='multipart/form-data' onSubmit={submitForm}>
                <div className='types'>
                    <input 
                        type='button' 
                        className={formData.category === 'lost' ? 'active' : 'inactive'} 
                        onClick={() => setFormData({
                            ...formData,
                            category: 'lost'
                        })}
                        value='Lost'
                    />
                    <input 
                        type='button' 
                        className={formData.category === 'found' ? 'active' : 'inactive'} 
                        onClick={() => setFormData({
                            ...formData,
                            includeBounty: false,
                            bounty: '',
                            category: 'found'
                        })}
                        value='Found'
                    />
                    <input 
                        type='button' 
                        className={formData.category === 'request' ? 'active' : 'inactive'} 
                        onClick={() => setFormData({
                            ...formData,
                            category: 'request'
                        })}
                        value='Request'
                    />
                    <input 
                        type="hidden" 
                        id='category'
                        name='category'
                        value={formData.category}
                    />
                </div>
                <div className='field'>
                    <label htmlFor='title' className='label'>Title*</label>
                    <input
                        type='text'
                        id='title'
                        name='title'
                        value={formData.title}
                        required
                        onChange={e => setFormData({
                            ...formData, 
                            title: e.target.value
                        })}
                    />
                </div>
                <div className='field' id='descField'>
                    <label htmlFor='desc' className='label'>Description*</label>
                    <textarea
                        id='desc'
                        name='desc'
                        value={formData.desc}
                        required
                        onChange={e => setFormData({
                            ...formData, 
                            desc: e.target.value
                        })}
                    />
                </div>
                <div className='dateTimeField'>
                    <div className='field'>
                        <label htmlFor='date' className='label'>Date</label>
                        <input
                            type='date'
                            id='date'
                            name='date'
                            value={formData.date}
                            onChange={e => setFormData({
                                ...formData, 
                                date: e.target.value
                            })}
                        />
                    </div>
                    <div className='field'>
                        <label htmlFor='time' className='label'>Time</label>
                        <input 
                            type='time'
                            id='time'
                            name='time'
                            value={formData.time}
                            onChange={e => setFormData({
                                ...formData, 
                                time: e.target.value
                            })}
                        />
                    </div>
                </div>
                <div className='field'>
                    <label htmlFor='location' className='label'>Location</label>
                    <input
                        type='text'
                        id='location'
                        name='location'
                        value={formData.location}
                        onChange={e => setFormData({
                            ...formData, 
                            location: e.target.value
                        })}
                    />
                </div>
                <div className='field'>
                    <label htmlFor='image' className='label'>Image</label>
                    <input
                        type='file'
                        id='image'
                        name='image'
                        accept='image/*'
                        onChange={e => {
                            setFormData({
                                ...formData,
                                image: e.target.files[0]
                            })
                        }}
                    />
                </div>
                {formData.category !== 'found' && <div id='includeBountyField'>
                    <label htmlFor='includeBounty' className='label'>Include Bounty?</label>
                    <input
                        type='checkbox'
                        id='includeBounty'
                        name='includeBounty'
                        checked={formData.includeBounty}
                        onChange={() => {
                            setFormData({
                                ...formData, 
                                includeBounty: !formData.includeBounty, 
                                bounty: ''
                            })
                        }}
                    />
                </div>}
                {formData.includeBounty && formData.category !== 'found' && <div className='field'>
                    <label htmlFor='bounty' className='label'>Bounty*</label>
                    <input
                        type='text'
                        id='bounty'
                        name='bounty'
                        value={formData.bounty}
                        required
                        onChange={e => setFormData({
                            ...formData, 
                            bounty: e.target.value
                        })}
                    />
                </div>}
                <button 
                    type='submit' 
                    className={isValid && isEdited ? 'submit' : 'disabled'} 
                    disabled={!isValid || !isEdited}
                >{props.submitLabel}</button>
            </form>}
            {props.isSubmitted && <div className='confirm'>
                <Confirmation 
                    title={`Post ${props.origin === 'publish' ? 'Published!' : 'Edited!'}`}
                    message={`Your ${formData.category} item post is now visible to NYU students.`}
                    info={`${formData.category.charAt(0).toUpperCase() + formData.category.slice(1)} Item
                        ${formData.date ? ` • ${formData.date}` : ''}
                        ${formData.time ? ` • ${formData.time}` : ''}
                        ${formData.location ? ` • ${formData.location}` : ''}`}
                    viewPost={true} />
            </div>}
        </>
    )
}

export default PostForm