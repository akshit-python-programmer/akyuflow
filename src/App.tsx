import { useEffect } from 'react'
import { Companion } from './components/Companion'
import { DaySlips } from './components/DaySlips'
import { DayStrip } from './components/DayStrip'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { NudgeSection } from './components/NudgeSection'
import { Preorder } from './components/Preorder'
import { Privacy } from './components/Privacy'
import { ScreenHelp } from './components/ScreenHelp'
import { SetupChecklist } from './components/SetupChecklist'
import { startVisit } from './lib/visit'

interface AppProps {
  /** True when the visitor has just come back from the checkout page. */
  reserved: boolean
}

export function App({ reserved }: AppProps) {
  useEffect(() => {
    startVisit()
  }, [])

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SetupChecklist />
      <Header />
      <main id="main">
        <Hero />
        <HowItWorks />
        <DayStrip />
        <ScreenHelp />
        <DaySlips />
        <NudgeSection />
        <Privacy />
        <Preorder reserved={reserved} />
        <Faq />
      </main>
      <Footer />
      <Companion />
    </>
  )
}
