import { useId } from 'react'

export default function Input({ label, hint, error, prefix, id, className = '', ...props }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`
  const message = error || hint

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <div
        className={`flex h-11 items-center rounded-xl bg-white px-3 ring-1 ring-inset focus-within:ring-2 ${
          error ? 'ring-red-500 focus-within:ring-red-500' : 'ring-stone-300 focus-within:ring-stone-900'
        }`}
      >
        {prefix && <span className="mr-1 text-stone-500">{prefix}</span>}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className="h-full w-full bg-transparent text-base text-stone-900 outline-none placeholder:text-stone-400"
          {...props}
        />
      </div>
      {message && (
        <p id={messageId} className={`text-sm ${error ? 'text-red-600' : 'text-stone-500'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
