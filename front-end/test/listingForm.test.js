import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateListingForm } from '../src/pages/listings/listingForm.js'

const valid = {
  title: 'Desk lamp', category: 'Study supplies', description: 'Adjustable lamp.',
  price: '5.50', rentalTerms: 'Return clean.',
}

test('identifies each blank or spaces-only listing field', () => {
  for (const field of Object.keys(valid)) {
    for (const value of ['', '   ']) {
      // Category selection is an existing truthiness check, unlike trimmed text.
      if (field === 'category' && value === '   ') continue
      const errors = validateListingForm({ ...valid, [field]: value })
      assert.deepEqual(Object.keys(errors), [field])
      assert.equal(typeof errors[field], 'string')
      assert.ok(errors[field].length > 0)
    }
  }
})

test('rejects negative, nonnumeric, and nonfinite listing prices', () => {
  for (const price of ['-1', 'NaN', 'Infinity', '1e309', 'not a price']) {
    assert.deepEqual(Object.keys(validateListingForm({ ...valid, price })), ['price'])
  }
})

test('keeps free and decimal listings valid without changing form values', () => {
  for (const price of ['0', '0.00', '5.50']) {
    const form = { ...valid, title: ' Desk lamp ', price }
    const before = structuredClone(form)
    assert.deepEqual(validateListingForm(form), {})
    assert.deepEqual(form, before)
  }
})
