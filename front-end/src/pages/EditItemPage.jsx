import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Input, PageHeader, Sheet } from '../components'
import { deleteItem, getCategories, getItem, updateItem } from '../services/closetService'



const EditItemPage = () => {

  const navigate = useNavigate()

  const { itemId } = useParams()

  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')

  const [price, setPrice] = useState('')

  const [category, setCategory] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')

  const [imageUrl, setImageUrl] = useState(null)

  const [showDeleteSheet, setShowDeleteSheet] = useState(false)

  useEffect(() => {

    getCategories().then(list => setCategories(list))

    getItem(itemId).then(item => {

      setName(item.name)
      setPrice(item.price)

      setCategory(item.category)

      setPurchaseDate(item.purchaseDate || '')
      setImageUrl(item.imageUrl)

    })

  }, [itemId])

  const choosePhoto = event => {

    const file = event.target.files[0]
    if (file) {
      setImageUrl(URL.createObjectURL(file))

    }
  }

  const saveItem = async () => {

    await updateItem(itemId, { name, category, price, purchaseDate, imageUrl })
    navigate(`/closet/${itemId}`)

  }

  const removeItem = async () => {

    await deleteItem(itemId)
    navigate('/closet')

  }

  return (

    <div className="pb-8">

      <div className="flex items-center justify-between pr-4">
        <PageHeader title="Edit item" backTo={`/closet/${itemId}`} />

        <Link to={`/closet/${itemId}`} className="text-sm text-stone-700">Cancel</Link>

      </div>

      <div className="flex flex-col gap-4 px-4">

        <label className="flex h-44 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-stone-200 text-sm text-stone-700">
          {imageUrl ? (

            <img src={imageUrl} alt="Item preview" className="h-full w-full object-cover" />

          ) : (

            'Tap to change photo'
          )}

          <input type="file" accept="image/*" className="hidden" onChange={choosePhoto} />

        </label>


        <Input

          label="Item name"

          value={name}
          onChange={event => setName(event.target.value)}

        />


        <Input

          label="Price"
          type="number"
          min="0"
          prefix="$"
          value={price}
          onChange={event => setPrice(event.target.value)}

        />

        <div>
          <p className="mb-1.5 text-sm font-medium text-stone-700">Category</p>
          <div className="flex flex-wrap gap-2">

            {categories.map(categoryName => (

              <Button
                key={categoryName}
                size="sm"

                variant={category === categoryName ? 'primary' : 'secondary'}
                onClick={() => setCategory(categoryName)}

              >
                {categoryName}

              </Button>

            ))}

          </div>

        </div>

        <Input
          label="Purchase date"
          type="date"
          value={purchaseDate}
          onChange={event => setPurchaseDate(event.target.value)}
        />

        <Button fullWidth disabled={name === '' || price === ''} onClick={saveItem}>

          Save changes

        </Button>
        <Button variant="secondary" fullWidth onClick={() => setShowDeleteSheet(true)}>

          Delete item
        </Button>

      </div>

      <Sheet open={showDeleteSheet} onClose={() => setShowDeleteSheet(false)} title="Delete this item?">

        <p className="mb-6 text-sm text-stone-600">This can&apos;t be undone.</p>
        <div className="flex flex-col gap-3">

          <Button variant="danger" fullWidth onClick={removeItem}>Delete</Button>

          <Button variant="secondary" fullWidth onClick={() => setShowDeleteSheet(false)}>Cancel</Button>

        </div>

      </Sheet>
      
    </div>
  )
}

export default EditItemPage