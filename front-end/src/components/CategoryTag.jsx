import Badge from './Badge.jsx'
// Small colored pill that shows a place's category, e.g. "Food" (#14).
// Tailwind only keeps classes it can see written out in full, so each color is spelled out here.
const CATEGORY_COLORS = {
  food: 'bg-peach',
  nightlife: 'bg-peach',
  shopping: 'bg-powder',
  artsculture: 'bg-powder',
  viewpoint: 'bg-sage',
  activities: 'bg-sage',
}

export default function CategoryTag({ categoryId, label }) {
  // Categories without a color of their own (like "other") get a plain outlined pill
  const color = CATEGORY_COLORS[categoryId] ?? 'border border-border bg-surface'

  return (
    <Badge className={`px-2.5 py-0.5 font-medium ${color}`}>
      {label}
    </Badge>
  )
}