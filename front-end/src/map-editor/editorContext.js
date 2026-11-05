import { createContext, useContext } from 'react'

export const EditorContext = createContext(null)

export function useEditor() {
  const editor = useContext(EditorContext)
  if (!editor) throw new Error('Map editor must be used inside EditorProvider')
  return editor
}
