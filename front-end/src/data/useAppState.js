import { createContext, useContext } from 'react'

export const AppStateContext = createContext(null)

export function useAppState() {
  return useContext(AppStateContext)
}
