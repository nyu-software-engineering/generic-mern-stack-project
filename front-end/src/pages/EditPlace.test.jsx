import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import EditPlace from './EditPlace'
import { getConfig } from '../api/config'

// mock the api file so nothing actually hits the network
// for your own page, mock your area's api file the same way
vi.mock('../api/config', () => ({ getConfig: vi.fn() }))

const serverConfig = {
  categories: [
    { id: 'viewpoint', label: 'Viewpoint' },
    { id: 'food', label: 'Food' },
    { id: 'from_server', label: 'Server-only category' },
  ],
}

function renderEditPlace(path = '/place/p_1/edit') {
  const router = createMemoryRouter(
    [
      { path: '/place/:placeId/edit', element: <EditPlace /> },
      { path: '/place/:placeId', element: <h1>Place detail</h1> },
    ],
    { initialEntries: [path] },
  )
  render(<RouterProvider router={router} />)
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('EditPlace loading categories from the server', () => {
  it('shows a loading state, then the categories from /api/config', async () => {
    getConfig.mockResolvedValue(serverConfig)
    renderEditPlace()

    expect(screen.getByText('Loading categories…')).toBeTruthy()
    // this category only exists in the fake server data, so seeing it means it came from the api
    expect(await screen.findByRole('option', { name: 'Server-only category' })).toBeTruthy()
  })

  it('shows an error with Try again, and retrying loads the form', async () => {
    // fail the first time, work the second time
    getConfig
      .mockRejectedValueOnce(new Error("Can't reach the server. Is the back-end running?"))
      .mockResolvedValueOnce(serverConfig)
    renderEditPlace()

    expect(await screen.findByText("Can't reach the server. Is the back-end running?")).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('option', { name: 'Server-only category' })).toBeTruthy()
    expect(getConfig).toHaveBeenCalledTimes(2)
  })
})