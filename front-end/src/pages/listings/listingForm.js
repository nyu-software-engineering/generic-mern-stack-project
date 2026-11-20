export function validateListingForm(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'Enter an item name.'
  if (!form.category) errors.category = 'Choose a category.'
  if (!form.description.trim()) errors.description = 'Describe your item.'
  if (!form.price.trim() || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
    errors.price = 'Enter a price of $0 or more.'
  }
  if (!form.rentalTerms.trim()) errors.rentalTerms = 'Add the rental terms.'
  return errors
}
