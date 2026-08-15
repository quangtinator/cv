import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './base.css'
import App from './App.jsx'
import { ThemeProvider } from './Context/theme.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
