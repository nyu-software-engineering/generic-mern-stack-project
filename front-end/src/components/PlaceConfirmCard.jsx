/**
 * Place preview card used on Place Found and Did you mean rows.
 */
export default function PlaceConfirmCard({
  thumbnailUrl,
  name,
  subtitle,
  categoryLabel,
  sourceTag,
  bestMatch = false,
  isSelected = false,
  onSelect,
  selectable = false,
}) {
  const TagRow = (
    <div className="flow-tags">
      {categoryLabel && <span className="flow-tag">{categoryLabel}</span>}
      {sourceTag && <span className="flow-tag">{sourceTag}</span>}
    </div>
  )

  // List row on Did you mean (tap to choose)
  if (selectable && onSelect) {
    return (
      <button
        type="button"
        className={`flow-place-row${isSelected ? ' flow-place-row--best' : ''}`}
        onClick={onSelect}
        aria-pressed={isSelected}
      >
        <span className="flow-thumb flow-thumb--small">
          <img src={thumbnailUrl} alt="" />
        </span>
        <span className="flow-place-row-text">
          <span className="flow-place-name">{name}</span>
          <span className="flow-place-subtitle">{subtitle}</span>
        </span>
        {bestMatch && <span className="flow-best-label">Best Match</span>}
      </button>
    )
  }

  // Big card on Place Found
  return (
    <article className="flow-place-card">
      <div className="flow-thumb flow-thumb--large">
        <img src={thumbnailUrl} alt="" />
      </div>
      <div className="flow-place-card-body">
        <h2 className="flow-place-name">{name}</h2>
        <p className="flow-place-subtitle">{subtitle}</p>
        {TagRow}
      </div>
    </article>
  )
}
