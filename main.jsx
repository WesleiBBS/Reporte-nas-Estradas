import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function AppWithLoading() {
  useEffect(() => {
    // Remover tela de loading quando o React carregar
    const timer = setTimeout(() => {
      document.body.classList.add('app-loaded')
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])
  
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWithLoading />
  </StrictMode>,
)

