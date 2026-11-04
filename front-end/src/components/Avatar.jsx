import { useState } from 'react'

// How big the circle is for each size we use around the app
const sizes = {
  sm: 'size-10 text-sm',
  md: 'size-12 text-base',
  lg: 'size-20 text-2xl',
}

// A round profile picture. If the user has no photo, or the photo fails to load,
// we show their initials instead so the circle is never empty.
export default function Avatar({ user, size = 'md' }) {
  const [imageFailed, setImageFailed] = useState(false)
  const initials = user.name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('')

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-pill bg-peach font-semibold text-ink ${sizes[size]}`}
    >
      <span aria-hidden="true">{initials}</span>
      {user.photoUrl && !imageFailed && (
        <img
          className="absolute inset-0 size-full object-cover"
          src={user.photoUrl}
          alt=""
          onError={() => setImageFailed(true)}
        />
      )}
    </span>
  )
}
