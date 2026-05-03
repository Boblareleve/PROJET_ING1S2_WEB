<script setup lang="ts">
    import { useUserStore } from '@/stores/user.stores';
    import { useRouter , useRoute} from 'vue-router';

    const user = useUserStore()
    const router  = useRouter() 
    const route = useRoute()
    async function logout() {
        
        await user.logout()
        router.push("/auth/login")
    }



</script>
<template>
    <div class="parent">
        <div class="sidebar">
            <router-link to="/admin/dashboard"> Dashboard</router-link>
            <router-link to="/admin/domains"> Domaine</router-link>
            <router-link to="/admin/accounts">Gestion des comptes</router-link>
        </div>
        <div class="main">
            <div class="header">
                <header>
                    <h3 >{{route.meta.title}}</h3>
                    <button v-on:click="logout()"> logout </button>
                </header>
            </div>
            <div class="content">
                <router-view></router-view>
            </div>
            
        </div>
        
    </div>
</template>

