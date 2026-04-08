<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/auth/auth';



const router = useRouter()


async function handleLogOut() {

  const res = await fetch("/auth/logout", {
        method: "DELETE",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        credentials: "include"
    });

    if (!res.ok)
    {
        const text = await res.text();
        console.error(`HTTP ${res.status}: ${text}`);
        return ;
    }


    if(res.ok){
      
    }
    const store = useAuthStore()
    store.$reset()
    console.log("deconnecter !");

}
</script>

<template>
    <div>
        <button @click="handleLogOut">Se deconnecter</button>
    </div>
</template>