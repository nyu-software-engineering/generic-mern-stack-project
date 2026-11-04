import { useState } from 'react'

// "Siyona Goel" -> "SG"
function getInitials(name) {
  return name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

// One circle: initials underneath, photo on top. If the photo fails to load, the initials show through.
function Avatar({ member }) {
  // Remember which URL failed, so a member who later gets a new photo tries loading it again
  const [failedUrl, setFailedUrl] = useState(null)
  const showPhoto = member.photoUrl && failedUrl !== member.photoUrl

  return (
    <span
      className="relative -ml-2 inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-surface bg-border text-xs font-semibold text-ink first:ml-0"
      title={member.name}
    >
      <span aria-hidden="true">{getInitials(member.name)}</span>
      {showPhoto && (
        <img
          className="absolute inset-0 size-full object-cover"
          src={member.photoUrl}
          alt=""
          onError={() => setFailedUrl(member.photoUrl)}
        />
      )}
    </span>
  )
}

/**
 * Overlapping member photos with a "+N" bubble for anyone past `max`.
 * members: [{ id, name, photoUrl }], the same shape mockDataLayer returns for city members.
 */
export default function AvatarStack({ members = [], max = 3 }) {
  const shown = members.slice(0, max)
  const extra = members.length - shown.length
  const names = shown.map((member) => member.name).join(', ')
  const label = extra > 0 ? `${names} and ${extra} more` : names

  return (
    <span className="flex" role="img" aria-label={label}>
      {shown.map((member) => <Avatar key={member.id} member={member} />)}
      {extra > 0 && (
        <span className="-ml-2 inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-surface bg-ink text-xs font-semibold text-white">
          +{extra}
        </span>
      )}
    </span>
  )
}