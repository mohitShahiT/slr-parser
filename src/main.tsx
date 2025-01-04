import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GrammarProvider } from './contexts/GrammarContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GrammarProvider>
    <App />
    </GrammarProvider>
  </StrictMode>,
)
