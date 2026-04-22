import type { Account } from '../../share/role.ts'
import { defineStore } from "pinia";

type User = Account

export const useUserStore = defineStore('auth', {
  persist: true,
  state: () => ({
    user: null as User | null,
    isLoading: false as boolean
  }),
  getters: {
    isConnected: (state) => state.user !== null,
    hasRole: (state) => (role: number) => state.user?.role === role
  },
  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      try {
        const res = await fetch('/auth/login', {   // ← /api/login, pas /api/me
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({ email, password })  // ← envoie les credentials
        })
        if (!res.ok) throw new Error(await res.text())
        this.user = await res.json()
      } catch (error: any) {
        this.user = null
        throw error   // ← re-throw pour que le composant puisse catch
      } finally {
        this.isLoading = false
      }
    },
    async logout() {
      await fetch('/auth/logout', { 
        method: 'DELETE',
        credentials: 'include'
      })
      this.user = null
      this.isLoading = false
    }
  }
})