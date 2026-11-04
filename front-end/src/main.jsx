import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppState from './data/AppState.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppState>
      <App />
    </AppState>
  </StrictMode>,
)
