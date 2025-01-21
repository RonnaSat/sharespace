import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/test',
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/TestView.vue'),
    },
    {
      path: '/test2',
      name: 'test2',
      component: () => import('../views/TestView2.vue'),
    },
    {
      path: '/test3',
      name: 'test3',
      component: () => import('../views/TestView3.vue'),
    },
    {
      path: '/test4',
      name: 'test4',
      component: () => import('../views/TestView4.vue'),
    },
    {
      path: '/test5',
      name: 'test5',
      component: () => import('../views/TestView5.vue'),
    },

  ],
})

export default router
