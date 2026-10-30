// Mock closet items used until the back-end exists. Photos come from Picsum.
export const CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Outerwear']

export function picsumUrl(seed, width = 600, height = 750) {
  return `https://picsum.photos/seed/worn-${seed}/${width}/${height}`
}

export const mockItems = [
  { id: 'item-1', name: 'White oxford shirt', category: 'Tops', price: 68, purchaseDate: '2025-03-14' },
  { id: 'item-2', name: 'Grey crewneck sweater', category: 'Tops', price: 95, purchaseDate: '2024-11-02' },
  { id: 'item-3', name: 'Black graphic tee', category: 'Tops', price: 28, purchaseDate: '2026-06-20' },
  { id: 'item-4', name: 'Linen button-down', category: 'Tops', price: 54, purchaseDate: '2026-05-08' },
  { id: 'item-5', name: 'Raw denim jeans', category: 'Bottoms', price: 140, purchaseDate: '2024-09-18' },
  { id: 'item-6', name: 'Khaki chinos', category: 'Bottoms', price: 72, purchaseDate: '2025-08-30' },
  { id: 'item-7', name: 'Black wool trousers', category: 'Bottoms', price: 160, purchaseDate: '2026-02-11' },
  { id: 'item-8', name: 'White leather sneakers', category: 'Shoes', price: 120, purchaseDate: '2025-04-05' },
  { id: 'item-9', name: 'Chelsea boots', category: 'Shoes', price: 210, purchaseDate: '2025-10-22' },
  { id: 'item-10', name: 'Running shoes', category: 'Shoes', price: 135, purchaseDate: '2026-01-15' },
  { id: 'item-11', name: 'Navy wool coat', category: 'Outerwear', price: 320, purchaseDate: '2024-12-01' },
  { id: 'item-12', name: 'Denim jacket', category: 'Outerwear', price: 98, purchaseDate: '2025-06-12' },
  { id: 'item-13', name: 'Rain shell', category: 'Outerwear', price: 150, purchaseDate: '2026-09-28' },
].map((item) => ({ ...item, imageUrl: picsumUrl(item.id) }))
