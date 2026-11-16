import { api } from './client.js'

// returns { categories, voteOptions, sourcePlatforms }
export function getConfig(options) {
  return api.get('/api/config', options)
}