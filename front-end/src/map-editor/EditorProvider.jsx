import { useCallback, useEffect, useMemo, useState } from 'react'
import { EditorContext } from './editorContext'
import { DEFAULT_MAP, getInitialMap, saveMap } from './editorData'

export default function EditorProvider({ children }) {
  const [map, setMap] = useState(getInitialMap)

  useEffect(() => {
    saveMap(map)
  }, [map])

  const updateMap = useCallback((changes) => {
    setMap((current) => ({ ...current, ...changes }))
  }, [])

  const openMap = useCallback((selectedMap) => {
    if (!selectedMap) return

    const id = String(selectedMap.id ?? selectedMap.number ?? selectedMap.name ?? 'demo-world')
    setMap((current) => {
      if (current.id === id) return current
      return {
        ...DEFAULT_MAP,
        id,
        title: selectedMap.name?.trim() || DEFAULT_MAP.title,
        selectedCountries: [],
        legendLabels: [...DEFAULT_MAP.legendLabels],
      }
    })
  }, [])

  const editor = useMemo(() => ({ map, updateMap, openMap }), [map, updateMap, openMap])

  return <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>
}
