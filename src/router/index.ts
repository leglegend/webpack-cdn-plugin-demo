import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

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
  }

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})


export default router
