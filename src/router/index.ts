import { createRouter, createWebHistory } from 'vue-router'
import { adminRouter } from "./modules/admin.router"
import { authRouter } from "./modules/auth.router"
import { authGuard } from './guards/authGuard'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/auth/login" }, // redirection correcte
    ...authRouter,
    ...adminRouter,
  ]
})

router.beforeEach(authGuard)
export default router
