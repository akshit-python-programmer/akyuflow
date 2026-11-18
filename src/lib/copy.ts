import { audience, type Audience } from './audience'

/**
 * The page's words, in two voices.
 *
 * `adhd` is how the page has always spoken and stays the default. `productivity`
 * is the same page for people who came for an AI productivity assistant: same
 * product, same sections, the ADHD-specific lines gently reworded so it does not
 * read as someone else's page. Neither voice promises more than the other.
 */
export interface Copy {
  hero: {
    kicker: string
    headline: { lead: string; mark: string; tail: string }
    /** The opening sentences. The "Ask, and it fixes your writing" line is added by the hero. */
    sub: string
  }
  familiar: {
    title: string
    soft: string
    lede: string
    fine: string
    /** What the footer's recap calls this section. */
    recap: string
  }
  how: { stepThree: string }
  plan: { title: string; lede: string }
  nudge: { title: string; lede: string }
  privacy: { always: string }
  faq: { otherQuestion: string; otherAnswer: string }
  pages: {
    aboutHeadline: { lead: string; mark: string }
    aboutAside: string
    termsMedical: string
    privacyAlways: string
  }
}

const COPY: Record<Audience, Copy> = {
  adhd: {
    hero: {
      kicker: 'A personal assistant, built for ADHD brains',
      headline: { lead: 'Built for ', mark: 'ADHD brains', tail: ' that lose track of time.' },
      sub: "Akyu is a tiny ghost that lives on your screen. Tell it your day in plain words and it plans it, then replans it when things change. It stays beside you, keeping time in view so the plan actually happens.",
    },
    familiar: {
      title: 'Sound familiar?',
      soft: 'Akyu was made for exactly this.',
      lede: "Plans that fall apart, tasks that won't start, messages that take forever. Akyu is a personal assistant that takes the managing off your plate and works with an ADHD brain instead of against it.",
      fine: 'Akyu is a productivity tool, not a treatment for ADHD. Plenty of people without a diagnosis lose time too.',
      recap: 'Sound familiar?',
    },
    how: {
      stepThree: 'It stays on your screen showing your time, and asks if you are still on task when you drift.',
    },
    plan: {
      title: 'Say it in plain words. Akyu plans your day, and replans it when it slips.',
      lede: 'Akyu turns what you tell it into a timed plan. Something ran long, or something came up? One click, and it replans the rest of your day.',
    },
    nudge: {
      title: 'And while you work, Akyu keeps you company.',
      lede: 'If you drift, Akyu just asks. Three buttons, all the same size. None of them is the wrong answer. No guilt, no streaks.',
    },
    privacy: {
      always:
        'To notice drift, Akyu reads the name of the app you have in front and the title of its window. It keeps them in an activity log that is stored only on your PC.',
    },
    faq: {
      otherQuestion: 'Is Akyu a treatment for ADHD?',
      otherAnswer:
        'No. Akyu is a personal assistant that helps you plan, follow through and stay aware of time, built for ADHD brains. It is not a medical device, and it does not diagnose or treat anything.',
    },
    pages: {
      aboutHeadline: { lead: 'A personal assistant for time and focus, ', mark: 'built for ADHD brains' },
      aboutAside:
        'Akyu is a productivity tool. It is not a medical device, and it does not diagnose or treat anything.',
      termsMedical:
        'Akyu is built for ADHD brains and time blindness, but it is a productivity tool. It is not a medical device, and it does not diagnose, treat or cure anything. Nothing on this site is medical advice.',
      privacyAlways:
        'To notice drift, Akyu reads the name of the app you have in front and the title of its window. In a browser, that title usually includes the name of the page you are on. These go into an activity log that is stored only on your PC.',
    },
  },
  productivity: {
    hero: {
      kicker: 'An AI assistant for the workday you actually have',
      headline: { lead: "You don't need another productivity system. You need ", mark: 'an assistant', tail: '.' },
      sub: 'Akyu is a tiny ghost that lives on your screen. Tell it your day in plain words and it builds the plan, then rebuilds it when things change. It stays beside you, keeping time visible so the plan actually gets done.',
    },
    familiar: {
      title: 'Sound like your week?',
      soft: 'Akyu is built for exactly this.',
      lede: 'Plans that fall apart, tasks that stall, messages that take forever. Akyu is an AI assistant that takes the managing off your plate and keeps your day moving instead of fighting it.',
      fine: 'Akyu is a productivity tool, not another system to maintain. If it does not save you time, it is not doing its job.',
      recap: 'Sound like your week?',
    },
    how: {
      stepThree: 'It stays on your screen showing your time, and checks in when you lose the thread.',
    },
    plan: {
      title: 'Say it in plain words. Akyu plans your day, and replans it when it changes.',
      lede: 'Akyu turns what you tell it into a timed plan. Something ran long, or something came up? One click, and it replans the rest of your day.',
    },
    nudge: {
      title: 'And while you work, Akyu keeps you on track.',
      lede: 'If you lose the thread, Akyu just asks. Three buttons, all the same size. None of them is the wrong answer. No nagging, no streaks.',
    },
    privacy: {
      always:
        'To notice when you switch tasks, Akyu reads the name of the app you have in front and the title of its window. It keeps them in an activity log that is stored only on your PC.',
    },
    faq: {
      otherQuestion: 'Is Akyu just another productivity app?',
      otherAnswer:
        'No. There is nothing to set up and nothing to maintain. Akyu builds your plan from a sentence you say, then stays beside you while you do the work.',
    },
    pages: {
      aboutHeadline: { lead: 'A personal assistant for time and focus, ', mark: 'built to keep your day moving' },
      aboutAside:
        'Akyu is a productivity tool. It is not a medical device, and it does not diagnose or treat anything.',
      termsMedical:
        'Akyu is a focus and time-management tool. It is not a medical device, and it does not diagnose, treat or cure anything. Nothing on this site is medical advice.',
      privacyAlways:
        'To notice when you switch tasks, Akyu reads the name of the app you have in front and the title of its window. In a browser, that title usually includes the name of the page you are on. These go into an activity log that is stored only on your PC.',
    },
  },
}

/** The words for this page view. */
export function copy(): Copy {
  return COPY[audience()]
}
