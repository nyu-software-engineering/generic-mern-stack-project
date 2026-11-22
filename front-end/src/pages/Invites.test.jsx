import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Invites from './Invites'
import { loadInvitations, respondToInvitation } from '../api/invites.js'

vi.mock('../api/invites.js', () => ({
  loadInvitations: vi.fn(),
  respondToInvitation: vi.fn(),
}))

const invite = {
  id: 'invite-1', cityId: 'c_nyc', cityName: 'New York',
  sender: null, memberCount: 4, placeCount: 5,
}

function openInbox() {
  loadInvitations.mockResolvedValue([invite])
  render(<MemoryRouter><Invites /></MemoryRouter>)
}

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

it.each(['accept', 'decline'])('removes the card after the server confirms %s', async (response) => {
  respondToInvitation.mockResolvedValue({ ok: true, cityId: 'c_nyc' })
  openInbox()
  const label = response === 'accept' ? 'Accept' : 'Decline'
  fireEvent.click(await screen.findByRole('button', { name: `${label} invite to New York` }))

  expect(await screen.findByText('No invitations right now.')).toBeTruthy()
  expect(respondToInvitation).toHaveBeenCalledWith('invite-1', response)
  expect(screen.queryByRole('heading', { name: 'New York' })).toBeNull()
  if (response === 'accept') {
    expect(screen.getByRole('link', { name: 'Open the list' }).getAttribute('href')).toBe('/city/c_nyc')
  }
})

it('keeps the invitation available when saving fails', async () => {
  respondToInvitation.mockRejectedValue(new Error('Could not reach the server'))
  openInbox()
  fireEvent.click(await screen.findByRole('button', { name: 'Accept invite to New York' }))

  expect((await screen.findByRole('alert')).textContent).toContain('Could not reach the server')
  expect(screen.getByRole('button', { name: 'Accept invite to New York' }).disabled).toBe(false)
})
