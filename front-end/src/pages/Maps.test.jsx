import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import CityPage from './CityPage'
import MapTab from './MapTab'
import PlaceMap from '../components/PlaceMap'
import * as data from '../data/mockDataLayer'

// JSDOM does not fetch image resources: these tests exercise real Leaflet DOM
// and event handling without downloading public map tiles.
beforeEach(() => {
  // Leaflet needs a viewport size; JSDOM has no layout engine.
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(400)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(320)
})

function renderMap(path, element) {
  const router = createMemoryRouter([
    { path: '/city/:cityId', element: element ?? <CityPage /> },
    { path: '/map', element: element ?? <MapTab /> },
    { path: '/place/:placeId', element: <h1>Place detail</h1> },
    { path: '/create', element: <h1>Add a place</h1> },
    { path: '/invites', element: <h1>Invitations</h1> },
  ], { initialEntries: [path] })
  render(<StrictMode><RouterProvider router={router} /></StrictMode>)
  return router
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('City map and category integration', () => {
  it('opens a focused pin with Enter or Space', async () => {
    renderMap('/city/c_paris?view=map')
    const pin = await screen.findByRole('button', { name: 'Merci — Shopping' })
    fireEvent.keyDown(pin, { key: 'Enter' })
    expect(screen.getByRole('region', { name: 'Selected place' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Close place preview' }))
    fireEvent.keyDown(pin, { key: ' ' })
    expect(screen.getByRole('region', { name: 'Selected place' })).toBeTruthy()
  })

  it('opens a marker preview and follows its detail route under Strict Mode', async () => {
    const router = renderMap('/city/c_paris?view=map')
    const map = await screen.findByRole('region', { name: 'Paris places map' })
    expect(within(map).getAllByRole('button', { name: / — / })).toHaveLength(3)
    fireEvent.click(within(map).getByRole('button', { name: 'Merci — Shopping' }))
    const preview = screen.getByRole('region', { name: 'Selected place' })
    expect(within(preview).getByRole('heading', { name: 'Merci' })).toBeTruthy()
    expect(within(preview).getByText('1 must-go · 0 down · 0 pass')).toBeTruthy()
    fireEvent.click(within(preview).getByRole('link', { name: /View place details/ }))
    await screen.findByRole('heading', { name: 'Place detail' })
    expect(router.state.location.pathname).toBe('/place/p_8')
  })

  it('keeps one filter across map/list, browser back and direct URLs', async () => {
    const router = renderMap('/city/c_paris?view=map&source=demo')
    await screen.findByRole('region', { name: 'Paris places map' })
    fireEvent.click(screen.getByRole('button', { name: 'Food', exact: true }))
    const map = screen.getByRole('region', { name: 'Paris places map' })
    expect(within(map).getAllByRole('button', { name: / — / })).toHaveLength(1)
    expect(within(map).getByRole('button', { name: 'Du Pain et des Idées — Food' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'List', exact: true }))
    const list = screen.getByRole('list', { name: 'Places ranked by must-go votes' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(1)
    expect(router.state.location.search).toContain('category=food')
    expect(router.state.location.search).toContain('source=demo')
    await act(() => router.navigate(-1))
    await screen.findByRole('region', { name: 'Paris places map' })
    expect(screen.getByRole('button', { name: 'Food', exact: true }).getAttribute('aria-pressed')).toBe('true')
    cleanup()
    renderMap('/city/c_paris?category=shopping&view=map')
    const restored = await screen.findByRole('region', { name: 'Paris places map' })
    expect(within(restored).getAllByRole('button', { name: / — / })).toHaveLength(1)
    expect(within(restored).getByRole('button', { name: 'Merci — Shopping' })).toBeTruthy()
  })

  it('removes a filtered-out preview and distinguishes no matches from no saved places', async () => {
    renderMap('/city/c_paris?view=map')
    fireEvent.click(await screen.findByRole('button', { name: 'Merci — Shopping' }))
    fireEvent.click(screen.getByRole('button', { name: 'Activities', exact: true }))
    expect(screen.queryByRole('region', { name: 'Selected place' })).toBeNull()
    expect(screen.queryAllByRole('button', { name: / — / })).toHaveLength(0)
    expect(screen.getByText('No saved places in this category.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'List', exact: true }))
    expect(screen.queryByText('No places saved yet')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Show all categories' }))
    expect(screen.getAllByRole('link', { name: /^View / }).filter((link) => link.getAttribute('href').startsWith('/place/'))).toHaveLength(3)
  })

  it('handles missing coordinates without losing access to place details', async () => {
    const missing = { ...data.getRankedCityPlaces('c_paris')[0], coordinates: { lat: NaN, lng: 300 } }
    renderMap('/map', <PlaceMap places={[missing]} center={{ lat: 48.85, lng: 2.35 }} label="Paris" />)
    expect(screen.queryAllByRole('button', { name: / — / })).toHaveLength(0)
    expect(screen.getByText('1 place has no map location yet:')).toBeTruthy()
    expect(screen.getByRole('link', { name: missing.name }).getAttribute('href')).toBe(`/place/${missing.id}`)
  })

  it('keeps markers usable after tile failures and offers retry', async () => {
    renderMap('/city/c_paris?view=map')
    const map = await screen.findByRole('region', { name: 'Paris places map' })
    const tile = map.querySelector('img.leaflet-tile')
    expect(tile).toBeTruthy()
    fireEvent.error(tile)
    expect(screen.getByText(/map background couldn’t load/)).toBeTruthy()
    fireEvent.click(within(map).getByRole('button', { name: 'Merci — Shopping' }))
    expect(screen.getByRole('region', { name: 'Selected place' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Retry map background' }))
    expect(screen.queryByText(/map background couldn’t load/)).toBeNull()
  })
})

describe('Map tab', () => {
  it('excludes pending invitations even when the city is requested in the URL', async () => {
    renderMap('/map?city=c_nyc')
    const select = await screen.findByRole('combobox', { name: 'City' })
    expect(within(select).queryByRole('option', { name: 'New York' })).toBeNull()
    expect(within(select).getByRole('option', { name: 'Paris' })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: / — / })).toHaveLength(3)
  })

  it('switches among joined cities and all cities while preserving the category', async () => {
    vi.spyOn(data, 'loadMyCityHeaders').mockResolvedValue(data.getCityHeaders())
    const router = renderMap('/map')
    const select = await screen.findByRole('combobox', { name: 'City' })
    expect(screen.getAllByRole('button', { name: / — / })).toHaveLength(8)
    fireEvent.change(select, { target: { value: 'c_nyc' } })
    expect(screen.getAllByRole('button', { name: / — / })).toHaveLength(5)
    fireEvent.click(screen.getByRole('button', { name: 'Food', exact: true }))
    expect(screen.getAllByRole('button', { name: / — / })).toHaveLength(1)
    expect(screen.getByRole('button', { name: "Joe's Pizza — Food" })).toBeTruthy()
    fireEvent.change(select, { target: { value: 'c_paris' } })
    expect(screen.getByRole('button', { name: 'Du Pain et des Idées — Food' })).toBeTruthy()
    expect(router.state.location.search).toContain('category=food')
    fireEvent.click(screen.getByRole('link', { name: /Open Paris list/ }))
    await screen.findByRole('list', { name: 'Places ranked by must-go votes' })
    expect(router.state.location.search).toBe('?view=list&category=food')
  })

  it('provides useful links when the user has no lists', async () => {
    vi.spyOn(data, 'loadMyCityHeaders').mockResolvedValue([])
    renderMap('/map')
    await screen.findByRole('heading', { name: 'No city lists yet' })
    expect(screen.getByRole('link', { name: 'Add a place' }).getAttribute('href')).toBe('/create')
    expect(screen.getByRole('link', { name: 'View invitations' }).getAttribute('href')).toBe('/invites')
  })

  it('retries city loading without keeping an error screen', async () => {
    vi.spyOn(data, 'loadMyCityHeaders').mockRejectedValue(new Error('offline'))
    renderMap('/map')
    await screen.findByRole('heading', { name: 'We couldn’t load your cities' })
    data.loadMyCityHeaders.mockResolvedValue(data.getCityHeaders())
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await screen.findByRole('combobox', { name: 'City' })
  })
})
