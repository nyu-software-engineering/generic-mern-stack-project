import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { lookupLinkByUrl } from '../data/mockDataLayer'
import './Create.css'

export default function Create() {
  const navigate = useNavigate()

  // What the user typed in the link box
  const [link, setLink] = useState('')

  // Shown when the link is not in our mock data (or not_found in demoData)
  const [error, setError] = useState('')

  function clearLink() {
    setLink('')
    setError('')
  }

  function handleSubmit(event) {
    // Keep the page from reloading (default form behavior)
    event.preventDefault()
    setError('')

    const result = lookupLinkByUrl(link)

    if (result.status === 'empty') {
      setError('Paste a link first.')
      return
    }

    if (result.status === 'not_found') {
      setError('We could not find a place for that link. Try a demo URL from the comments in this file.')
      return
    }

    const { lookup } = result

    // Next screens in the flow (will be built later)
    if (lookup.status === 'found') {
      navigate('/create/identifying', { state: { lookup } })
      return
    }

    if (lookup.status === 'ambiguous') {
      navigate('/create/matches', { state: { lookup } })
      return
    }

    // linkLookups entry with status "not_found" (e.g. lk_4)
    setError('We could not find a place for that link.')
  }

  return (
    <section className="add-place">
      {/* Back: goes to Home */}
      <Link className="add-place-back" to="/" aria-label="Back to home">
        ←
      </Link>

      <h1 className="add-place-title">
        Saw a place?
        <br />
        Drop the link.
      </h1>

      <p className="add-place-hint">
        Paste a link from TikTok or Instagram
      </p>

      <form className="add-place-form" onSubmit={handleSubmit}>
        <div className="add-place-input-wrap">
          <input
            className="add-place-input"
            type="url"
            name="link"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="link…."
            autoComplete="off"
          />
          {/* Only show clear when there is text in the box */}
          {link.length > 0 && (
            <button
              type="button"
              className="add-place-clear"
              aria-label="Clear link"
              onClick={clearLink}
            >
              ×
            </button>
          )}
        </div>

        {error && (
          <p className="add-place-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="add-place-submit">
          Find place
        </button>
      </form>
    </section>
  )
}

/*
  Demo URLs (can copy-paste for test):

  Found (NYC):
  https://www.tiktok.com/@nyceats/video/7301

  Found (Paris):
  https://www.instagram.com/p/septime-paris

  Ambiguous - /create/matches:
  https://www.instagram.com/reel/paris-croissant

  Not found (error on this page):
  https://www.tiktok.com/@random/video/0000
*/
