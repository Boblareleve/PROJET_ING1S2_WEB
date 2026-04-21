import { useUserStore } from '@/stores/user.stores'
import { getHomeByRole } from '@/utils/getHomeByRole'
import type { RouteLocationNormalized } from 'vue-router'

export function authGuard(to: RouteLocationNormalized) {
  const store = useUserStore()
  

  if (to.path === "/auth/login") {
  if (store.isConnected) return getHomeByRole(store.user!.role)
  return true
}
  if (!store.isConnected) return "/auth/login"
  if (to.meta.role !== undefined && !store.hasRole(to.meta.role as number)) return "/auth/login"

  return true
}