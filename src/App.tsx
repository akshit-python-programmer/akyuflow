import { useEffect } from 'react'
import { Companion } from './components/Companion'
import { DaySlips } from './components/DaySlips'
// import { DayStrip } from './components/DayStrip'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { FounderNote } from './components/FounderNote'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { NudgeSection } from './components/NudgeSection'
import { Preorder } from './components/Preorder'
import { Privacy } from './components/Privacy'
import { ScreenHelp } from './components/ScreenHelp'
import { SetupChecklist } from './components/SetupChecklist'
import type { Purchase } from './lib/deposit'
import { startVisit } from './lib/visit'

interface AppProps {
  /** What the visitor has just paid for, when this is the return trip from checkout. */
  purchase: Purchase
}

export function App({ purchase }: AppProps) {
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
        {/* <DayStrip /> */}
        <ScreenHelp />
        <DaySlips />
        <NudgeSection />
        <Privacy />
        <FounderNote />
        <Preorder purchase={purchase} />
        <Faq />
      </main>
      <Footer />
      <Companion />
    </>
  )
}
