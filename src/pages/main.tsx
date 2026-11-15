import { StrictMode, type JSX } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/atkinson-hyperlegible-next/wght.css'
import '@fontsource/jersey-15/400.css'
import '../styles/base.css'
import type { PageSlug } from '../components/SiteLinks'
import { initAnalytics } from '../lib/track'
import { visitorSource } from '../lib/utm'
import { AboutPage } from './AboutPage'
import { ContactPage } from './ContactPage'
import { PageShell } from './PageShell'
import { PrivacyPage } from './PrivacyPage'
import { TermsPage } from './TermsPage'

/*
  One entry for the four plain pages. Each has its own index.html (privacy/,
  terms/, about/, contact/) that names itself in data-page, so every page is a
  real file GitHub Pages can serve and a search engine can read the title of.
*/

const PAGE = {
  privacy: PrivacyPage,
  terms: TermsPage,
  about: AboutPage,
  contact: ContactPage,
} satisfies Record<PageSlug, () => JSX.Element>

visitorSource()
initAnalytics()

const root = document.getElementById('root')!
const slug = (root.dataset.page ?? 'about') as PageSlug
const Page = PAGE[slug] ?? AboutPage

createRoot(root).render(
  <StrictMode>
    <PageShell current={slug}>
      <Page />
    </PageShell>
  </StrictMode>,
)
