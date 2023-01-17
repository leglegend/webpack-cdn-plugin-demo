import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

export const routes: Array<RouteRecordRaw> = [
  {
     path: '/',
     redirect: '/login'
  },
  {
    path: '/login',
    meta: {
      hide: true
    },
    component: () =>
      import(
        /* webpackChunkName: "login" */
        '@/views/login/index.vue'
      )
  },
  {
    path: '/member',
    component: () => import(
      /* webpackChunkName: "member" */
      /* webpackPrefetch: true */
      '@/views/member/index.vue'
    ),
  },
]

const router = createRouter({
  history: createWebHistory('/data/'),
  routes
})


export default router
