export default function PercentChange({ value }) {
  const color = value > 0 ? 'text-negative' : value < 0 ? 'text-positive' : 'text-muted'
  const sign = value > 0 ? '+' : ''
  return (
    <span className={`text-sm font-semibold ${color}`}>
      {sign}
      {value.toFixed(1)}%
    </span>
  )
}