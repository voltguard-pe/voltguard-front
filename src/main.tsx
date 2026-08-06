import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

console.log("Key cargada:", import.meta.env.VITE_RECAPTCHA_SITE_KEY);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <App />
    </GoogleReCaptchaProvider>
  </StrictMode>,
)
