import { defineStore } from "pinia";

export const useUserStore = defineStore('user',{
    persist: true, 

    state:()=>({
        isLoggedIn: false,
        role: null as string | null,
        user: null as { id: number; name: string } | null,
    }),

    actions:{
        async login(email: string, password: string){
            const result = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password })
            }).then(res => res.json());

            if(result){
                this.isLoggedIn = true,
                this.role = result.role,
                this.user = result.user
            }
        },

        logout(){
            this.isLoggedIn = false,
            this.role = null,
            this.user = null
        }
    }

})