import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import CityPage from './CityPage'
import CityHeader from '../components/CityHeader'
import * as mockDataLayer from '../data/mockDataLayer'

function renderCity(path = '/city/c_nyc') {
  const router = createMemoryRouter([
    { path: '/city/:cityId', element: <CityPage /> },
    { path: '/city/:cityId/members', element: <h1>Members screen</h1> },
    { path: '/place/:placeId', element: <h1>Place detail</h1> },
    { path: '/create', element: <h1>Add a place</h1> },
    { path: '/', element: <h1>Your lists</h1> },
  ], { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

beforeEach(() => {
  vi.spyOn(mockDataLayer, 'loadCityHeaders')
})

describe('Ranked city list', () => {
  it('shows saved places in vote order with the group tally and an unvoted state', async () => {
    renderCity()
    const list = await screen.findByRole('list', { name: 'Places ranked by must-go votes' })
    const cards = within(list).getAllByRole('listitem')
    expect(cards.map((card) => within(card).getByRole('heading').textContent)).toEqual([
      'Top of the Rock', "Joe's Pizza", 'Artists & Fleas', 'Comedy Cellar', 'The Metropolitan Museum of Art',
    ])
    const pizza = within(cards[1])
    expect(pizza.getByText('Food')).toBeTruthy()
    expect(pizza.getByText('Greenwich Village')).toBeTruthy()
    for (const [label, count] of [['Must-go', '3'], ['Down for it', '0'], ['Pass', '1']]) {
      expect(pizza.getByText(label).nextElementSibling.textContent).toBe(count)
    }
    expect(within(cards[4]).getByText('No votes yet')).toBeTruthy()
  })

  it('links a place card to its detail route even when its photo fails', async () => {
    const router = renderCity()
    const card = await screen.findByRole('link', { name: "View Joe's Pizza" })
    fireEvent.error(card.querySelector('img'))
    expect(card.querySelector('img')).toBeNull()
    fireEvent.click(card)
    await screen.findByRole('heading', { name: 'Place detail' })
    expect(router.state.location.pathname).toBe('/place/p_2')
  })

  it('changes city data and restores the ranked list after switching back from map', async () => {
    const router = renderCity()
    await screen.findByRole('link', { name: "View Joe's Pizza" })
    await act(() => router.navigate('/city/c_paris'))
    await screen.findByRole('heading', { name: 'Paris' })
    const list = screen.getByRole('list', { name: 'Places ranked by must-go votes' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    expect(screen.queryByRole('link', { name: "View Joe's Pizza" })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Map' }))
    await screen.findByRole('region', { name: 'Map view' })
    expect(screen.queryByRole('list', { name: 'Places ranked by must-go votes' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'List' }))
    expect(within(await screen.findByRole('list', { name: 'Places ranked by must-go votes' })).getAllByRole('listitem')).toHaveLength(3)
  })

  it('offers the add-place flow when the city has no saved places', async () => {
    vi.spyOn(mockDataLayer, 'getRankedCityPlaces').mockReturnValue([])
    const router = renderCity()
    await screen.findByRole('heading', { name: 'No places saved yet' })
    expect(screen.queryByRole('list', { name: 'Places ranked by must-go votes' })).toBeNull()
    fireEvent.click(screen.getByRole('link', { name: 'Add a place' }))
    await screen.findByRole('heading', { name: 'Add a place' })
    expect(router.state.location.pathname).toBe('/create')
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('City page header', () => {
  it('loads the requested city, shows member overflow, and links to that city’s members', async () => {
    const router = renderCity()
    await screen.findByRole('heading', { name: 'New York' })
    expect(screen.getByText('5 places saved by the group')).toBeTruthy()
    expect(screen.getByText('+1')).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'View 4 members of New York' }))
    await screen.findByRole('heading', { name: 'Members screen' })
    expect(router.state.location.pathname).toBe('/city/c_nyc/members')
  })

  it('switches view without losing city or other query parameters, and restores the choice on remount', async () => {
    const router = renderCity('/city/c_paris?category=food')
    await screen.findByRole('heading', { name: 'Paris' })
    expect(screen.getByRole('button', { name: 'List' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Map' }))
    await screen.findByRole('region', { name: 'Map view' })
    expect(router.state.location.pathname).toBe('/city/c_paris')
    expect(router.state.location.search).toBe('?category=food&view=map')
    cleanup()
    renderCity('/city/c_paris?category=food&view=map')
    await screen.findByRole('heading', { name: 'Paris' })
    expect(screen.getByRole('button', { name: 'Map' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'List' }))
    await screen.findByRole('region', { name: 'List view' })
    expect(screen.getByRole('button', { name: 'Map' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('uses list view for an unrecognized view parameter and supports returning home', async () => {
    const router = renderCity('/city/c_nyc?view=unknown')
    await screen.findByRole('region', { name: 'List view' })
    fireEvent.click(screen.getByRole('link', { name: /Your lists/ }))
    await screen.findByRole('heading', { name: 'Your lists' })
    expect(router.state.location.pathname).toBe('/')
  })

  it('does not show another city’s data for a missing city', async () => {
    renderCity('/city/missing')
    await screen.findByRole('heading', { name: 'City not found' })
    expect(screen.queryByRole('group', { name: 'City view' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Back to your lists' }).getAttribute('href')).toBe('/')
  })

  it('allows retrying a failed load', async () => {
    mockDataLayer.loadCityHeaders.mockRejectedValueOnce(new Error('offline'))
    renderCity()
    await screen.findByRole('heading', { name: 'We couldn’t load this city' })
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await screen.findByRole('heading', { name: 'New York' })
  })

  it('ignores late results from a city the user has already left', async () => {
    let resolveFirst
    mockDataLayer.loadCityHeaders.mockImplementationOnce(({ signal } = {}) => new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException('The operation was aborted.', 'AbortError'))
        return
      }
      const onAbort = () => reject(new DOMException('The operation was aborted.', 'AbortError'))
      signal?.addEventListener('abort', onAbort, { once: true })
      resolveFirst = () => {
        signal?.removeEventListener('abort', onAbort)
        if (signal?.aborted) return
        resolve(mockDataLayer.getCityHeaders())
      }
    }))
    const router = renderCity()
    await waitFor(() => expect(mockDataLayer.loadCityHeaders).toHaveBeenCalledTimes(1))
    await act(() => router.navigate('/city/c_paris'))
    await screen.findByRole('heading', { name: 'Paris' })
    await act(async () => {
      resolveFirst()
    })
    expect(screen.queryByRole('heading', { name: 'New York' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Paris' })).toBeTruthy()
  })

  it('keeps the members link usable when there are no members', () => {
    const router = createMemoryRouter([{
      path: '/',
      element: <CityHeader city={{ id: 'empty', name: 'Empty city', placeCount: 1, members: [] }} view="list" onViewChange={() => {}} />,
    }])
    render(<RouterProvider router={router} />)
    expect(screen.getByText('1 place saved by the group')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'View 0 members of Empty city' }).getAttribute('href')).toBe('/city/empty/members')
  })
})
