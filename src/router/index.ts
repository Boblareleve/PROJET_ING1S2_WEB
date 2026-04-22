import { createRouter, createWebHistory } from 'vue-router'
import { adminRouter } from "./modules/admin.router"
import { authRouter } from "./modules/auth.router"
import { authGuard } from './guards/authGuard'
import { getHomeByRole } from '@/utils/getHomeByRole'
import { useUserStore } from '@/stores/user.stores'
import { entrepriseRouter } from './modules/entreprise.router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: () => {
    const store = useUserStore()
    return store.isConnected ? getHomeByRole(store.user!.role) : "/auth/login"
  }
  }, // redirection correcte
    ...authRouter,
    ...adminRouter,
    ...entrepriseRouter,
  ]
})

router.beforeEach(authGuard)
export default router
