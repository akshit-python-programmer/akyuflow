import { useEffect } from 'react'
import { Companion } from './components/Companion'
import { DaySlips } from './components/DaySlips'
// import { DayStrip } from './components/DayStrip'
import { Faq } from './components/Faq'
import { Familiar } from './components/Familiar'
import { Footer } from './components/Footer'
import { FounderNote } from './components/FounderNote'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { NudgeSection } from './components/NudgeSection'
import { Preorder } from './components/Preorder'
import { Privacy } from './components/Privacy'
import { PurchaseThanks } from './components/PurchaseThanks'
import { ScreenHelp } from './components/ScreenHelp'
import { SetupChecklist } from './components/SetupChecklist'
import type { Purchase } from './lib/deposit'
import { preparePageNavigation } from './lib/hold'
import { startVisit } from './lib/visit'

interface AppProps {
  /** What the visitor has just paid for, when this is the return trip from checkout. */
  purchase: Purchase
}

export function App({ purchase }: AppProps) {
  useEffect(() => {
    startVisit()
    const onPageLinkClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest<HTMLAnchorElement>('a[href^="#"]')
      if (!link) return
      const id = link.getAttribute('href')?.slice(1)
      const destination = id ? document.getElementById(id) : null
      if (destination) preparePageNavigation(destination)
    }
    document.addEventListener('click', onPageLinkClick, true)
    return () => document.removeEventListener('click', onPageLinkClick, true)
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
        <Familiar />
        <HowItWorks />
        {/* <DayStrip /> */}
        <DaySlips />
        <NudgeSection />
        <ScreenHelp />
        <Privacy />
        <FounderNote />
        <Preorder purchase={purchase} />
        <Faq />
      </main>
      <Footer />
      <Companion />
      <PurchaseThanks purchase={purchase} />
    </>
  )
}
