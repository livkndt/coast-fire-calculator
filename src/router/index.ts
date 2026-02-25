import { createRouter, createWebHistory } from 'vue-router'
import CalculatorView from '@/views/CalculatorView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'calculator',
      component: CalculatorView,
    },
    {
      path: '/explainer',
      name: 'explainer',
      component: () => import('@/views/ExplainerView.vue'),
    },
  ],
})

export default router
