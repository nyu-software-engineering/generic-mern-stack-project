export const STYLES = [
  { id: 'atlas', name: 'Atlas blue', water: '#ecf2ff', land: '#cbd7f0', highlight: '#5367df', border: '#aebfdd', grid: '#c4d1e9' },
  { id: 'blush', name: 'Soft pastel', water: '#fff3f7', land: '#efd8e6', highlight: '#bf7fa9', border: '#dfbfd3', grid: '#f0dbe7' },
  { id: 'forest', name: 'Forest', water: '#edf8f4', land: '#cce4d8', highlight: '#348d72', border: '#abcfc0', grid: '#d5e9df' },
  { id: 'slate', name: 'Modern slate', water: '#f0f3f7', land: '#cfd8e3', highlight: '#596a81', border: '#b7c5d4', grid: '#d9e2eb' },
]

export const DEFAULT_MAP = {
  id: 'demo-world',
  title: 'World at a glance',
  subtitle: 'An editable map to tell your story',
  styleId: 'atlas',
  selectedCountries: [],
  legendLabels: ['Highlighted regions', 'Other regions'],
}

const STORAGE_KEY = 'mapmaker.frontend.editor.v1'

export function getInitialMap() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!saved || typeof saved !== 'object') return { ...DEFAULT_MAP }
    return {
      ...DEFAULT_MAP,
      id: typeof saved.id === 'string' ? saved.id : DEFAULT_MAP.id,
      title: typeof saved.title === 'string' ? saved.title : DEFAULT_MAP.title,
      subtitle: typeof saved.subtitle === 'string' ? saved.subtitle : DEFAULT_MAP.subtitle,
      styleId: STYLES.some(({ id }) => id === saved.styleId) ? saved.styleId : 'atlas',
      selectedCountries: Array.isArray(saved.selectedCountries)
        ? [...new Set(saved.selectedCountries.filter((id) => typeof id === 'string' && /^[A-Z]{3}$/.test(id)))]
        : [],
      legendLabels: Array.isArray(saved.legendLabels) && saved.legendLabels.length === 2 && saved.legendLabels.every((label) => typeof label === 'string')
        ? saved.legendLabels
        : [...DEFAULT_MAP.legendLabels],
    }
  } catch {
    return { ...DEFAULT_MAP }
  }
}

export function saveMap(map) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)) } catch { /* Storage can be unavailable. */ }
}
