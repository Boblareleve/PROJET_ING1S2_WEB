<script setup lang="ts">
import { useAuthStore } from '@/auth/auth'
import { ref } from 'vue'

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
    
    const auth = useAuthStore()

    if(res.ok){
      const user = await res.json()
      auth.user = user
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