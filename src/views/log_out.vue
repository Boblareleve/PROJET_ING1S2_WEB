<script setup lang="ts">
import { useRouter } from 'vue-router'



const router = useRouter()


async function handleLogOut() {

  const res = await fetch("/auth/logout", {
        method: "delete",
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

    
    console.log("deconnecter !");

}
</script>

<template>
    <div>
        <button @click="handleLogOut">Se deconnecter</button>
    </div>
</template>