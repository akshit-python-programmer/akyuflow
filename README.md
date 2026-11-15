# Akyu landing page

A single static page for Akyu, the desktop ghost (Windows first, Mac to follow). It is built with Vite, React and
react-three-fiber, and it deploys to GitHub Pages. There is no server to rent or run.

## Run it

```bash
npm install
```

```bash
npm run dev
```

While `npm run dev` is running, a dark bar at the top of the page lists what is still empty in the
config file. That bar never appears on the published site.

## Fill in before you publish

Everything lives in [`src/site.config.ts`](src/site.config.ts).

| Setting | What to paste | Until you do |
| --- | --- | --- |
| `checkoutUrl` | Hosted checkout link for the $5 deposit (Stripe Payment Link, Lemon Squeezy, Gumroad, Razorpay page...) | The page says "Deposits are not open yet" |
| `lifetime.checkoutUrl` | Checkout link for the $199 founding supporter deal. Set its after-payment redirect to the site with `?founder=1` | The page shows the offer but says founding spots are not open yet |
| `waitlist.endpoint` | A form endpoint that accepts a POST and answers JSON (Formspree, Web3Forms, Getform, Kit...) | The waitlist form and its links are hidden |
| `analytics` | Umami or Plausible script details | Nothing is counted |
| `supportEmail` | Public address for refund requests | No address is shown |
| `demoVideo.src` | Your 20-second recording, e.g. `./demo.mp4` placed in `public/` | The hero plays a drawn illustration and says so |
| `shipDate` | Currently `2026-12` | |
| `privacyConfirmed` | `true`, once you have checked every privacy statement against the real app | The dev-mode bar keeps reminding you |

### What is promised at launch

At the top of [`src/site.config.ts`](src/site.config.ts), `capabilities` lists each thing Akyu does
as `'launch'` or `'later'`. Every demo, the day strip, the ghost's menu, the hero's "also helps"
line and the email FAQ answer read from it, and show "At launch" or "Coming after launch". Anything
marked `'launch'` is a promise to people who pay a deposit. Email replies and "Explain this" start
as `'later'`.

In your checkout provider, set the "after payment" redirect to the site address with `?reserved=1`
on the end, for example `https://<you>.github.io/<repo>/?reserved=1`. That return trip shows the
thank-you message and is what gets counted as a deposit.

## What is tracked

Visits are counted by the analytics script itself. The page sends these events on top of that:

| Event | When | Properties |
| --- | --- | --- |
| `cta_click` | Any "Reserve for $5" or "Join the waitlist" control is pressed | `cta` (`reserve` or `waitlist`), `placement` (`header`, `hero`, `preorder`) |
| `checkout_start` | The Reserve button in the pre-order box sends someone to checkout | `placement` |
| `deposit` | Someone comes back from checkout with `?reserved=1` (once per browser tab) | `revenue`, `currency` |
| `lifetime` | Someone comes back from the lifetime checkout with `?founder=1` (once per browser tab) | `revenue`, `currency` |
| `waitlist_signup` | The email form is accepted | `placement` |
| `ghost_choice` | A choice in the corner ghost's speech bubble | `choice` (`plan`, `reply`, `fix`, `lost`) |
| `demo_start` | A demo is started | `demo` (`plan`, `replan`, `reply`, `fix`, `explain`, `nudge`), `via` (`page` or `ghost`) |
| `demo_complete` | A demo reaches its end | `demo` |
| `demo_action` | Something done inside a demo (tick, notes, shorter, formal, insert, send, use, not_understood) | `demo`, `action` |
| `day_strip_click` | A moment in "A day with Akyu" is pressed | `moment` (`9:00`, `10:40`...) |

`demo_start` by `demo` is the quickest read on which capability visitors care about.

Email addresses are never sent to analytics. The `deposit` count is what the browser saw, so treat
your payment provider's dashboard as the source of truth for money. In Plausible, add each event
name as a goal or it will not show up.

## Publish on GitHub Pages

1. Create a repository on GitHub and push this folder to its `main` branch.
2. In the repository, open **Settings > Pages** and set **Source** to **GitHub Actions**.
3. That is all. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and publishes
   on every push to `main`. The address appears in the workflow run and under Settings > Pages.

Asset paths are relative, so the same build works at `https://<you>.github.io/<repo>/`, at a
`<you>.github.io` root site, or on a custom domain.

## Changing the words

Each section is one file in [`src/components`](src/components). The Privacy section and the FAQ
answers about what Akyu can see state only this: all the time, it reads the active app's name and
window title, and that log is stored only on the PC; only when asked, it reads the window in front
and sends its text to a cloud AI service to write the answer; plan text goes to a cloud AI service;
account and licence checks contact a server. Confirm these against the app before publishing. If
the app changes, change those places together, and do not add claims that are only probably true.

## The other pages

About, Contact, Privacy and Terms are separate pages at `about/`, `contact/`, `privacy/` and
`terms/`. Each folder holds a small `index.html`; the words are in [`src/pages`](src/pages), and
the footer links to all four. The facts they state (payment provider, form provider, "last
updated", governing law) are under `legal` in [`src/site.config.ts`](src/site.config.ts). The
Contact form posts to `contact.endpoint`, or to `waitlist.endpoint` while that is empty.

The Privacy and Terms pages were written to be clear, not by a lawyer. Read them against what you
actually do, and have them checked before you rely on them.

## The demos

Every demo is scripted in the browser: fixed text and simple rules, with no AI service and no
network call. Each one says "Scripted demo. Akyu is not released yet." The plan demo understands
comma- or "then"-separated tasks with optional "at 6" / "by 4" ([`src/lib/plan.ts`](src/lib/plan.ts));
anything else gets a polite "I only understand simple lists". The email, chat and error in the
screen demo are made up.

## The ghost

The ghost is one hand-drawn 17 x 15 bitmap in [`src/ghost/sprite.ts`](src/ghost/sprite.ts). The
SVG sprite, the 3D ghost in the hero, the favicon and the link-preview image are all drawn from it.
After editing the bitmap, regenerate the icon files:

```bash
npm run icons
```

The ghost on the page is a working demo: it gives the page two minutes, asks its three-button
question if you leave the tab and come back, offers a one-click replan when time is up, and shows
a recap in the footer. That logic is in [`src/lib/visit.ts`](src/lib/visit.ts) and stays in the
visitor's browser.
