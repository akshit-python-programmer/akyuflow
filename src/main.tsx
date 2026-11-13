import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/atkinson-hyperlegible-next/wght.css'
import '@fontsource/jersey-15/400.css'
import '@fontsource-variable/caveat/wght.css'
import './styles/base.css'
import { App } from './App'
import { consumeDepositReturn } from './lib/deposit'
import { initAnalytics } from './lib/track'

initAnalytics()
// Counts the purchase if this visit is the return trip from checkout (?reserved=1 or ?founder=1).
const purchase = consumeDepositReturn()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App purchase={purchase} />
  </StrictMode>,
)
