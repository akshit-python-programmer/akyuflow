/**
 * Everything the page needs from you lives in this one file.
 *
 * The site is fully static (GitHub Pages), so each integration below is a
 * hosted service you paste a link or an ID from. Nothing here needs a server.
 * While `npm run dev` is running, a checklist at the top of the page shows
 * which of these are still empty.
 */

/**
 * What Akyu can do, and when. Every demo on the page reads its tag from here:
 *   'launch' shows "At launch"
 *   'later'  shows "Coming after launch"
 * Anything shown as a launch feature is a promise to people who pay a deposit,
 * so only mark something 'launch' once you are sure it ships on day one.
 */
export type Availability = 'launch' | 'later'

export const capabilities = {
  /** The ghost timer that sits on top of the screen. */
  focusGhost: 'launch',
  /** The three-button nudge when you drift. */
  nudge: 'launch',
  /** Type your day in one line and get a timed plan. */
  planDay: 'launch',
  /** The plan shown as time blocks on a day calendar. */
  dayCalendar: 'launch',
  /** A small notes field on each task. */
  taskNotes: 'launch',
  /** One-click replan when something runs over. */
  replan: 'launch',
  /** The end-of-day recap of where the time went. */
  dayRecap: 'launch',
  /** Akyu reads the email in front and drafts a reply. */
  emailReply: 'launch',
  /** Akyu fixes typos and wording in a message you are writing. */
  fixMessage: 'launch',
  /** Akyu explains an error or dialog in plain words. */
  explainThis: 'launch',
} satisfies Record<string, Availability>

export type Capability = keyof typeof capabilities

export type AnalyticsConfig =
  | { provider: 'none' }
  /** Umami (cloud.umami.is has a free tier, no cookies). Copy both values from Settings > Websites > Tracking code. */
  | { provider: 'umami'; scriptSrc: string; websiteId: string }
  /** Plausible (no cookies). Paste the script URL from your site's installation page. `domain` is only for the older data-domain snippet. */
  | { provider: 'plausible'; scriptSrc: string; domain?: string }

export const site = {
  /**
   * When Akyu ships. 'YYYY-MM' shows as "December 2026", 'YYYY-MM-DD' as
   * "14 December 2026"; any other text is shown exactly as written.
   * This is the Windows launch.
   */
  shipDate: 'late December 2026',

  /** When the Mac version follows the Windows launch. Same format as shipDate. */
  macShipDate: 'January 2027',

  price: {
    /** One-off refundable deposit, in US dollars. */
    deposit: 5,
    /** Monthly price a deposit locks in. */
    lockedPerMonth: 5,
    /** Monthly price without a deposit. */
    normalPerMonth: 9,
  },

  /**
   * Hosted checkout link for the $5 deposit: a Stripe Payment Link, Lemon
   * Squeezy, Gumroad, Razorpay payment page, and so on.
   * In that provider, set the "after payment" redirect to this site's address
   * with ?reserved=1 on the end, for example
   *   https://<you>.github.io/<repo>/?reserved=1
   * That return visit is what gets counted as a deposit.
   * While this is empty the page says deposits are not open yet.
   */
  // Dodo Payments TEST-mode link. Swap for the live link (checkout.dodopayments.com) before launch.
  checkoutUrl: 'https://test.checkout.dodopayments.com/buy/pdt_0NrvngKOVx0Y12WUZv5Je?quantity=1',

  /** Name of the query flag the checkout redirects back with (see above). */
  depositReturnFlag: 'reserved',

  /**
   * The founding supporter deal: pay once, use Akyu for life.
   * Make a second checkout link for it and set its "after payment" redirect
   * to the site address with ?founder=1 on the end. While checkoutUrl is
   * empty the page shows the offer but says it is not open yet.
   */
  lifetime: {
    /** One-off price in US dollars. */
    price: 199,
    checkoutUrl: '',
    returnFlag: 'founder',
    /**
     * Shown under the price. Make sure it matches what your checkout and you
     * will actually honour; set it to '' to show nothing.
     */
    refundNote: 'Refundable any time before launch',
    /** Founding supporters get the beta straight away. Set to false to drop the promise. */
    betaAccess: true,
    /** Shown on the thank-you screen after paying: tell them how the beta reaches them. */
    betaDelivery: 'Your beta download link is on its way to your email.',
  },

  /** The handwritten note above the pricing. Set `show` to false to hide it. */
  founder: {
    show: true,
    name: 'Akshit Kumar Lall',
    /** How the note is signed off. */
    signature: 'Akshit Kumar Lall',
    /** The founder's own website, linked next to the name. Set to '' to show no link. */
    website: 'https://akshitkumarlall.com',
  },

  waitlist: {
    /**
     * Where the email form posts. Any endpoint that accepts a form POST and
     * answers with JSON works: Formspree, Web3Forms, Getform, Kit, Basin...
     * e.g. 'https://formspree.io/f/abcdwxyz'
     * While this is empty the waitlist form is hidden on the live site.
     */
    endpoint: 'https://formspree.io/f/myewkowz',
    /** Extra fields some services need, e.g. { access_key: '...' } for Web3Forms. */
    extraFields: {} as Record<string, string>,
  },

  /**
   * Set to true once you have checked, against the real app, every privacy
   * statement on the page: the Privacy section and the FAQ answers about what
   * Akyu can see and read. Until then the dev-mode checklist reminds you.
   */
  privacyConfirmed: false,

  /** Public contact address, used for refund requests. Leave empty to show none. */
  supportEmail: '',

  /** Counts visits, CTA clicks and deposits. See README for what each event means. */
  analytics: {
    provider: 'umami',
    scriptSrc: 'https://cloud.umami.is/script.js',
    websiteId: '9cc3f284-656d-4757-a95e-d60b64d4a95b',
  } as AnalyticsConfig,

  /**
   * The 20-second demo. Put the file in /public (e.g. public/demo.mp4) and set
   * src to './demo.mp4'. Until then the hero plays a drawn 20-second
   * illustration and says so in its caption.
   */
  demoVideo: {
    src: '',
    poster: '',
  },
}

export const waitlistOpen = site.waitlist.endpoint.trim() !== ''
export const checkoutOpen = site.checkoutUrl.trim() !== ''
export const lifetimeOpen = site.lifetime.checkoutUrl.trim() !== ''
