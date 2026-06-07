/**
 * router/index.ts
 *
 * Manual routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: 'map',
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('@/pages/MapPage.vue'),
    },
    {
      path: '/info',
      name: 'info',
      component: () => import('@/pages/InfoPage.vue'),
    },
  ],
})

export default router
