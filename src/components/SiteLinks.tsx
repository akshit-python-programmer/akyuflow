import './SiteLinks.css'

/** The site's other pages. Each is its own folder with an index.html, so plain relative links work anywhere it is hosted. */
export const PAGES = [
  ['about', 'About'],
  ['contact', 'Contact'],
  ['privacy', 'Privacy'],
  ['terms', 'Terms'],
] as const

export type PageSlug = (typeof PAGES)[number][0]

interface SiteLinksProps {
  /** Path from the current page to the site root: './' on the home page, '../' on the others. */
  root: string
  /** The page being shown, if it is one of these. */
  current?: PageSlug
}

export function SiteLinks({ root, current }: SiteLinksProps) {
  return (
    <nav className="sitelinks" aria-label="More about Akyu">
      <ul>
        {PAGES.map(([slug, label]) => (
          <li key={slug}>
            <a className="link" href={`${root}${slug}/`} aria-current={slug === current ? 'page' : undefined}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
