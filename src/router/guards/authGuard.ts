import { useUserStore } from '@/stores/user.stores'
import type { RouteLocationNormalized } from 'vue-router'

export function authGuard(to: RouteLocationNormalized) {
  const user = useUserStore()

  // Si pas connecté → redirection
  if (!user.isLoggedIn && to.path !== "/auth/login") {
    return "/auth/login"
  }

  // Si connecté mais pas admin → redirection
  if (to.meta.role === "admin" && user.role !== "admin") {
    return "/auth/login"
  }

  // Sinon → OK
  return true
}
