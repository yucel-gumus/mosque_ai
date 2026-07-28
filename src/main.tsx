import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setupMapsNetworkInterceptor } from './shared/utils/mapsInterceptor'
import './index.css'
import App from './App.tsx'

// Activate Network Security Interceptor
setupMapsNetworkInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
