import { describe, expect, it, vi } from 'vitest'
import { lists, places, savedPlaces, votes } from './demoData.js'
import { getRankedCityPlaces } from './mockDataLayer.js'

vi.mock('./demoData.js', async (importOriginal) => {
  const data = await importOriginal()
  return {
    ...data,
    lists: [...data.lists, { id: 'empty-list', cityId: 'empty-city', memberIds: [] }],
    // Reverse storage order so sorting cannot pass by preserving fixture order.
    savedPlaces: [
      ...data.savedPlaces.toReversed(),
      { id: 'missing-place', listId: 'l_1', placeId: 'missing' },
      { id: 'wrong-city', listId: 'l_1', placeId: 'p_6' },
    ],
    votes: [
      ...data.votes,
      { id: 'outsider', savedPlaceId: 'sp_1', userId: 'u_1', value: 'must-go' },
      { id: 'unknown-value', savedPlaceId: 'sp_1', userId: 'u_2', value: 'unknown' },
    ],
  }
})

describe('getRankedCityPlaces', () => {
  it('ranks saved places by must-go votes and breaks ties alphabetically', () => {
    const ranked = getRankedCityPlaces('c_nyc')
    expect(ranked.map(({ name }) => name)).toEqual([
      'Top of the Rock',
      "Joe's Pizza",
      'Artists & Fleas',
      'Comedy Cellar',
      'The Metropolitan Museum of Art',
    ])
    expect(ranked.map(({ tally }) => tally['must-go'])).toEqual([4, 3, 0, 0, 0])
  })

  it('tallies each valid vote option from members and keeps places with no votes', () => {
    const ranked = getRankedCityPlaces('c_nyc')
    expect(ranked.find(({ id }) => id === 'p_1')).toMatchObject({
      savedPlaceId: 'sp_1', categoryLabel: 'Viewpoint', tally: { 'must-go': 4, down: 0, pass: 0 },
    })
    expect(ranked.find(({ id }) => id === 'p_2').tally).toEqual({ 'must-go': 3, down: 0, pass: 1 })
    expect(ranked.find(({ id }) => id === 'p_3').tally).toEqual({ 'must-go': 0, down: 2, pass: 0 })
    expect(ranked.find(({ id }) => id === 'p_5').tally).toEqual({ 'must-go': 0, down: 0, pass: 0 })
  })

  it('returns only the selected city list, excluding unsaved and invalid place references', () => {
    expect(getRankedCityPlaces('c_paris').map(({ savedPlaceId }) => savedPlaceId))
      .toEqual(['sp_6', 'sp_8', 'sp_7'])
    expect(getRankedCityPlaces('c_nyc').map(({ savedPlaceId }) => savedPlaceId))
      .toEqual(['sp_1', 'sp_2', 'sp_3', 'sp_4', 'sp_5'])
  })

  it('returns an empty array for a missing list or a list with no saved places', () => {
    expect(getRankedCityPlaces('missing-city')).toEqual([])
    expect(getRankedCityPlaces('empty-city')).toEqual([])
  })

  it('leaves the shared records and their storage order unchanged', () => {
    const before = structuredClone({ lists, places, savedPlaces, votes })
    getRankedCityPlaces('c_nyc')
    getRankedCityPlaces('c_paris')
    expect({ lists, places, savedPlaces, votes }).toEqual(before)
  })
})
