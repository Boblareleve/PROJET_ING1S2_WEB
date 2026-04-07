import type {User} from '@/types/user'
import {defineStore} from 'pinia'

export const useAuthStore = defineStore('auth', {

    //def structure d un user 
    state:()=>({
        user : null as User | null,
        isLoading:false as boolean
    }),

    //retourn un boolean en fonction du role
    getters: {
       isConnected: (state) => state.user !== null,
       hasRole: (state) => (role:string) => state.user?.role === role
    },

    actions: {
        async fetchCurrentUser(){
            this.isLoading = true
            try {
                const res = await fetch('/api/auth/me')
                if (!res.ok) throw new Error('Failed to fetch user')
                this.user = await res.json()
            } catch (error) {
                console.error('Error fetching current user:', error)
                this.user = null
            } finally {
                this.isLoading = false
            }
        },
        fakeLogin(role: 'admin' | 'teacher' | 'student') {
            if (role === 'teacher') this.user = { nom: 'Test', role: 'teacher'}
            if (role === 'student') this.user = { nom: 'Test', role: 'student', id:2}
            if (role === 'admin')   this.user = { nom: 'Test', role: 'admin'}
        } 
    }
})