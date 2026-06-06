import { defineStore } from 'pinia'
import {
  type Language,
  LANGUAGE_OPTIONS,
  type PreferencesStoreState,
  type Theme,
  THEME_OPTIONS,
} from '@/entities/preferences/model/store'

const PREFERENCES_STORAGE_KEY = 'aquid.preferences'

const DEFAULT_PREFERENCES: PreferencesStoreState = {
  language: 'en',
  theme: 'light',
}

function isLanguage (value: unknown): value is Language {
  return typeof value === 'string' && LANGUAGE_OPTIONS.includes(value as Language)
}

function isTheme (value: unknown): value is Theme {
  return typeof value === 'string' && THEME_OPTIONS.includes(value as Theme)
}

function getStoredPreferences (): PreferencesStoreState | null {
  const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY)

  if (!raw) {
    return null
  }

  const parsed = JSON.parse(raw) as Partial<PreferencesStoreState>

  if (!isLanguage(parsed.language) || !isTheme(parsed.theme)) {
    return null
  }

  return {
    language: parsed.language,
    theme: parsed.theme,
  }
}

function savePreferences (preferences: PreferencesStoreState) {
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
}

export const usePreferencesStore = defineStore('preferences', {
  state: (): PreferencesStoreState => getStoredPreferences() ?? DEFAULT_PREFERENCES,
  actions: {
    setLanguage (language: Language) {
      this.language = language
      savePreferences({
        language: this.language,
        theme: this.theme,
      })
    },
    setTheme (theme: Theme) {
      this.theme = theme
      savePreferences({
        language: this.language,
        theme: this.theme,
      })
    },
  },
})
