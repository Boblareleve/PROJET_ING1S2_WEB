import { useUserStore } from '@/stores/user.stores'
import { getHomeByRole } from '@/utils/getHomeByRole'
import type { RouteLocationNormalized } from 'vue-router'

export function authGuard(to: RouteLocationNormalized) {
  const store = useUserStore()

  // Si on essaie d'accéder à /auth/login
  if (to.path === "/auth/login") {
    // Si connecté, rediriger vers la page d'accueil appropriée
    if (store.isConnected) {
      return getHomeByRole(store.user!.role)
    }
    // Sinon laisser accéder à la page de login
    return true
  }

  // Pour toutes les autres routes
  if (!store.isConnected) {
    // Pas connecté → rediriger vers login
    return "/auth/login"
  }

  // Vérifier les permissions de rôle si défini dans la meta
  if (to.meta.role !== undefined && !store.hasRole(to.meta.role as number)) {
    return "/auth/login"
  }

  // Tout est ok
  return true
}
