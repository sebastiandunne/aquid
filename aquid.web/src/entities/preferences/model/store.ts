export const LANGUAGE_OPTIONS = ['nl', 'en'] as const
export type Language = (typeof LANGUAGE_OPTIONS)[number]

export const THEME_OPTIONS = ['light', 'dark'] as const
export type Theme = (typeof THEME_OPTIONS)[number]

export type PreferencesStoreState = {
  language: Language
  theme: Theme
}
