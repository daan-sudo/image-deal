import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      name: 'workspace',
      component: () => import('@renderer/components/layout/AppLayout.vue')
    }
  ]
})

export default router
