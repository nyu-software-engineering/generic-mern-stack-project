import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import CityPage from './CityPage'
import CityHeader from '../components/CityHeader'
import * as mockDataLayer from '../data/mockDataLayer'

function renderCity(path = '/city/c_nyc') {
  const router = createMemoryRouter([
    { path: '/city/:cityId', element: <CityPage /> },
    { path: '/city/:cityId/members', element: <h1>Members screen</h1> },
    { path: '/', element: <h1>Your lists</h1> },
  ], { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

beforeEach(() => {
  vi.spyOn(mockDataLayer, 'loadCityHeaders')
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
