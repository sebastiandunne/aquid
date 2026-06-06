// Types
import type { App } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import router from '../router'
/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */
import i18n from './i18n'
import { initSentry } from './sentry'
// Plugins
import vuetify from './vuetify'

export function registerPlugins (app: App) {
  initSentry(app, import.meta.env.VITE_SENTRY_DSN)
  app.use(vuetify)
  app.use(createPinia())
  app.use(i18n)
  app.use(router)
  app.use(VueQueryPlugin)
}
