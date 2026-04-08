<script setup lang="ts">
import { useAuthStore } from '@/auth/auth'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { ROLE } from '../../share/role'

const router = useRouter()
const auth = useAuthStore()
const showPassword = ref(false)

const email = ref('')
const password = ref('')

function togglePassword(){
  showPassword.value = !showPassword.value
}

async function handleLogin() {

  const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
            email: email.value,
            password: password.value
        }),
        credentials: "include"
    });

    if (!res.ok)
    {
        const text = await res.text();
        console.error(`HTTP ${res.status}: ${text}`);
        return ;
    }


    if(res.ok){
      const user = await res.json()
      auth.user = user

      // Redirect based on role
      if (user.role === ROLE.ADMIN) {
        router.push('/admin')
      } else if (user.role === ROLE.SUPERVISOR) {
        router.push('/supervisor')
      } else {
        // For other roles, redirect to a default or handle accordingly
        router.push('/')
      }
    }

    
    console.log("connected !");

}
</script>

<template>
  <div>
    
    <input v-model="email" type="email" placeholder="Email" />
    <div id="passwordDiv">
       <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Mot de passe" />
       <button @click="togglePassword">{{ showPassword ? 'N' : 'O' }}</button>
    </div>
   
    
    <button @click="handleLogin">Se connecter</button>
  </div>
</template>