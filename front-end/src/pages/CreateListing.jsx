import { useEffect, useState } from 'react'
import axios from 'axios'
import Header from './Header'
import './EditProfile.css'
import { useNavigate } from 'react-router'

export default function CreateListing({userId, addService}) {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])

    useEffect(() => {
        async function getCategories() {
            const response = await axios.get("/api/categories")
            setCategories(response.data)
        }
        getCategories()
    }, [])

    async function handleSubmit(event) {
        event.preventDefault()

        const form = event.currentTarget
        const data = new FormData(form)

        data.set("title", form.elements.title.value.trim())
        data.set("description", form.elements.description.value.trim())
        data.set("userId", userId)

        await addService(data)
        navigate("/profile/services")
    }

    return (
        <>
            <Header></Header>
            <form className="edit-profile" onSubmit={handleSubmit}>
                <h1>
                    Create Listing
                </h1>

                <label className='edit-profile-field'>
                    <span>
                        Service Title
                    </span>
                    <input name = "title" type="text" required />
                </label>

                <label className="edit-profile-field">
                    <span>Description</span>
                    <textarea name="description" rows="3" />
                </label>

                <label className="edit-profile-field">
                    <span>Category</span>
                    <select name="category" defaultValue="" required>
                        <option value="" disabled>Choose a category</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </label>

                <label className='edit-profile-field'>
                    <span>
                        Price ($)
                    </span>
                    <input name='price' type="number" min="0" step="0.01" required />
                </label>

                <label className="edit-profile-field">
                    <span>Pricing unit</span>
                    <select name="priceUnit" defaultValue="" required>
                        <option value="" disabled>Choose a pricing unit</option>
                        <option value="hour">Per hour</option>
                        <option value="session">Per session</option>
                        <option value="item">Per item</option>
                    </select>
                </label>

                <label className="edit-profile-field">
                    <span>Service photo (optional)</span>
                    <input type="file" name="photos" accept="image/*" />
                </label>
                <button className="profile-button" type="submit">Create listing</button>
            </form>
        </>
    )
}