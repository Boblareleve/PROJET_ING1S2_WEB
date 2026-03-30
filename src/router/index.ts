import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'
import homeTeacher from '@/views/homeTeacher.vue'
import { useAuthStore } from '@/auth/auth'


declare module 'vue-router'{
  interface RouteMeta{
    requiresAuth:boolean
    role?: 'admin'|'teacher'|'student'
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
	{
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: {requiresAuth: false}
    },
    {
      path: '/teacher',
      name: 'teacher',
      component: homeTeacher,
      meta:{requiresAuth: true, role:'teacher'}
    }
  ],
})


router.beforeEach((to) => {
  const auth = useAuthStore()

  if (!to.meta.requiresAuth) return true
  if (!auth.user) return '/login'
  if (to.meta.role && auth.user.role !== to.meta.role) {
    return `/${auth.user.role}`
  }

  return true
})


export default router
