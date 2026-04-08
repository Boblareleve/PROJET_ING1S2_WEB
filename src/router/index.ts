import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/login_page.vue'
import homeTeacher from '@/views/home_teacher.vue'
import log_out from '@/views/log_out.vue'
import homeAdmin from '@/views/home_admin.vue'
import { useAuthStore } from '@/auth/auth'
import { ROLE } from '../../share/role'


declare module 'vue-router'{
  interface RouteMeta{
    requiresAuth:boolean
    role?: number
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
      path: '/supervisor',
      name: 'supervisor',
      component: homeTeacher,
      meta:{requiresAuth: true, role: ROLE.SUPERVISOR}
    },
    {
      path: '/admin',
      name: 'admin',
      component: homeAdmin,
      meta:{requiresAuth: true, role: ROLE.ADMIN}
    },
    {
      path: '/logout',
      name: 'logout',
      component: log_out,
      meta: {requiresAuth: false}
    }
  ],
})


router.beforeEach((to) => {
  const auth = useAuthStore()

  if (!to.meta.requiresAuth) return true
  if (!auth.user) return '/login'
  if (to.meta.role !== undefined && auth.user.role !== to.meta.role) {
    // Redirect to appropriate home based on role
    if (auth.user.role === ROLE.ADMIN) return '/admin'
    if (auth.user.role === ROLE.SUPERVISOR) return '/supervisor'
    // For other roles, maybe redirect to login or a default page
    return '/login'
  }

  return true
})


export default router
