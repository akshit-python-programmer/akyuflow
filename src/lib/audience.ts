/**
 * Who the page is talking to.
 *
 * The page as written speaks to ADHD brains, and that is what everyone gets by
 * default. `?for=productivity` says "show me the AI productivity assistant
 * instead": the same product and the same sections, in a general voice. Nothing
 * else in the URL is needed, and the choice lives in the address so a link can
 * be shared.
 */
export type Audience = 'adhd' | 'productivity'

const META: Record<Audience, { title: string; description: string }> = {
  adhd: {
    title: 'Akyu: ADHD Focus & Time Management App for Windows',
    description:
      'Akyu helps people with ADHD plan their day, manage time and stay focused with a gentle Windows desktop assistant and smart task planning.',
  },
  productivity: {
    title: 'Akyu: AI Productivity Assistant for Windows',
    description:
      'Akyu is an AI assistant for Windows that plans your day, keeps time in view and helps you follow through. Simple task planning without another system to maintain.',
  },
}

let current: Audience | null = null

function readFromUrl(): Audience {
  try {
    const want = new URLSearchParams(window.location.search).get('for')?.toLowerCase()
    if (want === 'productivity' || want === 'general') return 'productivity'
    if (want === 'adhd') return 'adhd'
  } catch {
    /* no URL access: the default stands */
  }
  return 'adhd'
}

/** The audience for this page view, read from the URL once. */
export function audience(): Audience {
  if (!current) current = readFromUrl()
  return current
}

/** Writes the title and description that match the audience into the page. */
export function applyAudience() {
  const found = audience()
  document.documentElement.dataset.audience = found
  const meta = META[found]
  document.title = meta.title
  setMeta('name', 'description', meta.description)
  setMeta('name', 'twitter:title', meta.title)
  setMeta('name', 'twitter:description', meta.description)
  setMeta('property', 'og:title', meta.title)
  setMeta('property', 'og:description', meta.description)
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  const tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (tag) tag.content = content
}

/**
 * Keeps the audience on a link to another page, so clicking About or Terms does
 * not quietly drop the visitor back into the ADHD copy.
 */
export function audienceHref(href: string): string {
  if (audience() !== 'productivity') return href
  const hashAt = href.indexOf('#')
  const path = hashAt === -1 ? href : href.slice(0, hashAt)
  const hash = hashAt === -1 ? '' : href.slice(hashAt)
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}for=productivity${hash}`
}
