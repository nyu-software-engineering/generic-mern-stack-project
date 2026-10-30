export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {icon && <div className="mb-4 text-4xl text-stone-400">{icon}</div>}
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      {description && <p className="mt-1 max-w-xs text-sm text-stone-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
