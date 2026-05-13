import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/mortgage'
  },
  {
    path: '/mortgage',
    name: 'Mortgage',
    component: () => import('@/views/Mortgage/index.vue')
  },
  {
    path: '/mortgage/detail',
    name: 'MortgageDetail',
    component: () => import('@/views/Mortgage/Detail.vue')
  },
  {
    path: '/early-repayment',
    name: 'EarlyRepayment',
    component: () => import('@/views/EarlyRepayment/index.vue')
  },
  {
    path: '/house-tax',
    name: 'HouseTax',
    component: () => import('@/views/HouseTax/Index.vue')
  },
  {
    path: '/policy',
    name: 'Policy',
    component: () => import('@/views/Policy/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
