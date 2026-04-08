import type { Account } from '../../share/role.ts'
import {defineStore} from 'pinia'

type User = Account

export const useAuthStore = defineStore('auth', {

    //def structure d un user 
    state:()=>({
        user : null as User | null,
        isLoading:false as boolean
    }),

    //retourn un boolean en fonction du role
    getters: {
       isConnected: (state) => state.user !== null,
       hasRole: (state) => (role:number) => state.user?.role === role
    },

    actions: {
        async fetchCurrentUser(){
            this.isLoading = true
            try {
                const res = await fetch('/api/me', {
                    method: "POST",
                    headers: { "Content-Type": "application/json; charset=UTF-8" },
                    credentials: 'include'
                })
                console.log(res)
                if (!res.ok) throw new Error('Failed to fetch user')
                this.user = await res.json()
            } catch (error) {
                console.error('Error fetching current user:', error)
                this.user = null
            } finally {
                this.isLoading = false
            }
        }
    }
})