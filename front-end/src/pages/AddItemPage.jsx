import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, PageHeader, Toggle } from '../components'
import { addWearEstimate, createItem, getCategories } from '../services/closetService'
 
const AddItemPage = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [imageUrl, setImageUrl] = useState(null)
  const [alreadyOwned, setAlreadyOwned] = useState(false)
  const [pastWears, setPastWears] = useState('')
 
  useEffect(() => {
    getCategories().then(list => setCategories(list))
  }, [])
 
  const choosePhoto = event => {
    const file = event.target.files[0]
    if (file) {
      setImageUrl(URL.createObjectURL(file))
    }
  }
 
  const saveItem = async () => {
    const item = await createItem({
      name,
      category,
      price,
      purchaseDate: purchaseDate || null,
      imageUrl,
    })
    if (alreadyOwned && pastWears > 0) {
      await addWearEstimate(item.id, { period: 'all-time', count: pastWears })
    }
    navigate('/closet')
  }
 
  return (
    <div className="pb-8">
      <div className="flex items-center justify-between pr-4">
        <PageHeader title="Add Item" backTo="/closet" />
        <Link to="/closet" className="text-sm text-stone-700">Cancel</Link>
      </div>
 
      <div className="flex flex-col gap-4 px-4">
        <label className="flex h-44 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-stone-200 text-sm text-stone-700">
          {imageUrl ? (
            <img src={imageUrl} alt="Item preview" className="h-full w-full object-cover" />
          ) : (
            'Tap to take or upload a photo'
          )}
          <input type="file" accept="image/*" className="hidden" onChange={choosePhoto} />
        </label>
 
        <Input
          label="Item name"
          placeholder="Item name"
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
          label="Purchase date (optional)"
          type="date"
          value={purchaseDate}
          onChange={event => setPurchaseDate(event.target.value)}
        />
 
        <div className="flex flex-col gap-3 rounded-2xl bg-stone-100 p-4">
          <Toggle
            label="Already own this item?"
            description="Estimate how often you've worn it so cost-per-wear is accurate from day one."
            checked={alreadyOwned}
            onChange={setAlreadyOwned}
          />
          {alreadyOwned && (
            <Input
              label="Estimated past wears"
              type="number"
              min="0"
              placeholder="# times"
              value={pastWears}
              onChange={event => setPastWears(event.target.value)}
            />
          )}
        </div>
 
        <Button fullWidth disabled={name === '' || price === '' || category === ''} onClick={saveItem}>
          Save item
        </Button>
      </div>
    </div>
  )
}
 
export default AddItemPage