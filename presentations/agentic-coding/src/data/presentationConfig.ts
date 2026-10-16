import type { DeckLanguage } from './deck'

export type DeckTheme = 'dark' | 'light'
export type SlideTransition = 'fade' | 'slide' | 'lift' | 'zoom' | 'wipe'

export interface PresentationConfig {
  meta: {
    title: string
    subtitle: string
    speaker: string
    date: string
    contact: string
    repositoryUrl: string
  }
  deployment: {
    basePath: string
  }
  defaults: {
    language: DeckLanguage
    theme: DeckTheme
    transition: SlideTransition
  }
  features: {
    languageSwitch: boolean
    themeSwitch: boolean
    transitionSwitch: boolean
    fullscreen: boolean
    progress: boolean
    controls: boolean
    overview: boolean
    speakerNotes: boolean
  }
  availableTransitions: SlideTransition[]
}

export const presentationConfig: PresentationConfig = {
  meta: {
    title: 'Jag ville bara spela Warcraft II igen…',
    subtitle: 'Agentic Coding och Warbound',
    speaker: 'Tobias Bertilsson',
    date: '2026',
    contact: 'https://tobisen.github.io/warbound/',
    repositoryUrl: 'https://github.com/tobisen/warbound',
  },
  deployment: {
    basePath: import.meta.env.BASE_URL,
  },
  defaults: {
    language: 'sv',
    theme: 'dark',
    transition: 'slide',
  },
  features: {
    languageSwitch: false,
    themeSwitch: false,
    transitionSwitch: false,
    fullscreen: true,
    progress: true,
    controls: true,
    overview: true,
    speakerNotes: true,
  },
  availableTransitions: ['fade', 'slide', 'lift', 'zoom', 'wipe'],
}
