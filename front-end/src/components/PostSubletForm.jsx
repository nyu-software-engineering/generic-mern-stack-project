import { useState } from 'react'
import axios from 'axios'
import PostSubletPhoto from './PostSubletPhoto'
import './PostSubletForm.css'

const PostSublet = () => {
    const [location, setLocation] = useState('')
    const [price, setPrice] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [description, setDescription] = useState('')
    const [photos, setPhotos] = useState([])
    const [error, setError] = useState('')

    const handlePhotoSelect = e => {
        const chosen = Array.from(e.target.files).map(file => ({file: file, url: URL.createObjectURL(file),}))
        setPhotos([...photos, ...chosen])
        e.target.value = '' 
    }

    const movePhoto = (index, offset) => {
        const newPhotos = [...photos]
        const other = index + offset;
        [newPhotos[index], newPhotos[other]] = [newPhotos[other], newPhotos[index]]
        setPhotos(newPhotos)
    }

    const removePhoto = index => {
        setPhotos(photos.filter((photo, i) => i !== index))
    }

    const handleSubmit = e => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('location', location)
        formData.append('price', price)
        formData.append('fromDate', fromDate)
        formData.append('toDate', toDate)
        formData.append('description', description)

        for (let i = 0; i < photos.length; i++) {
            formData.append('photos', photos[i].file)
        }

        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
        }
        const apiUrl = 'https://someserversomehwere.com/puppy/save' //CHANGE
        axios
            .post(apiUrl, formData, config)
            .then(response => {
                console.log(`Received server response: ${response.data}`)
            })
            .catch(err => {
                console.log(`Received server error: ${err}`)
                setError(
                    "This form doesn't actually work, sorry.  There is no back-end for this example app in which to save the data. Pop open your web browser's Javascript Console to see the error trying to connect to a non-existent back-end.",
                )
            })
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="location">
                <label htmlFor="location">Location</label>
                <br />
                <input
                    type="text"
                    id="location"
                    placeholder="Street address, city, state"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    required
                />
                <br />
            </div>

            <div className="price">
                <label htmlFor="price">Monthly Cost</label>
                <br />
                <input
                    type="number"
                    id="price"
                    placeholder="Enter monthly rent"
                    value={price}
                    min="0"
                    step="0.01"
                    onChange={e => setPrice(e.target.value)}
                    required
                />
                <br />
            </div>

            <div className="fromDate">
                <label htmlFor="fromDate">Available From</label>
                <br />
                <input
                    type="date"
                    id="fromDate"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    required
                />
                <br />
            </div>

            <div className="toDate">
                <label htmlFor="toDate">Available Until</label>
                <br />
                <input
                    type="date"
                    id="toDate"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    required
                />
                <br />
            </div>

            <div className="description">
                <label htmlFor="description">Description</label>
                <br />
                <textarea
                    id="description"
                    rows={5}
                    cols={40}
                    placeholder="Describe the apartment, amenities, and roommate situation..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                />
                <br />
            </div>

            <div className="photos">
                <label htmlFor="photos">Photos</label>
                <br />
                <input
                    type="file"
                    accept="image/*"
                    id="photos"
                    onChange={handlePhotoSelect}
                    multiple
                    required
                />
                <br />

                <ul className="PostSubletPhoto-list">
                    {photos.map((photo, index) => (
                        <PostSubletPhoto
                            key={photo.url}
                            url={photo.url}
                            position={index + 1}
                            isFirst={index === 0}
                            isLast={index === photos.length - 1}
                            handleMoveEarlier={() => movePhoto(index, -1)}
                            handleMoveLater={() => movePhoto(index, 1)}
                            handleRemove={() => removePhoto(index)}
                        />
                    ))}
                </ul>
            </div>
            {error && (
                <div>
                    <p className="PostSublet-Feedback">{error}</p>
                </div>
            )}
            <input type="submit" value="Post Listing" />
        </form>
    )
}

export default PostSublet