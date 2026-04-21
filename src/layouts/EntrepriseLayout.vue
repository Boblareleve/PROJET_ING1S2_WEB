<script setup lang="ts">
    import { useUserStore } from '@/stores/user.stores';
    import { useRouter , useRoute} from 'vue-router';

    const user = useUserStore()
    const router  = useRouter() 
    const route = useRoute()
    function logout() {
        
        user.logout()
        router.push("/auth/login")
    }



</script>
<template>
    <div class="parent">
        <div class="sidebar">
           <router-link to="/admin/dashboard"> Dashboard</router-link>
        <router-link to="/admin/entreprise"> Entreprise</router-link>
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

<style>
/* ====== STRUCTURE GLOBALE ====== */
.parent {
    display: flex;
    height: 100vh;
    background: #f5f6fa;
    font-family: sans-serif;
}

/* ====== SIDEBAR ====== */
.sidebar {
    width: 230px;
    background-color: #1f2937; /* gris foncé moderne */
    color: white;
    display: flex;
    flex-direction: column;
    padding: 20px 0;
    gap: 10px;
}

/* Liens de la sidebar */
.sidebar a {
    color: #d1d5db;
    text-decoration: none;
    padding: 12px 20px;
    display: block;
    border-left: 4px solid transparent;
    transition: 0.2s;
    font-size: 15px;
}

/* Hover */
.sidebar a:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

/* Active (page actuelle) */
.router-link-active {
    background: rgba(255, 255, 255, 0.15);
    color: white !important;
    border-left: 4px solid #3b82f6; /* bleu moderne */
}

/* ====== MAIN (header + contenu) ====== */
.main {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* ====== HEADER ====== */
.header {
    height: 60px;
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    padding: 0 20px;
}

.header header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Bouton logout */
.header button {
    background: #ef4444;
    color: white;
    border: none;
    padding: 8px 14px;
    border-radius: 4px;
    cursor: pointer;
    transition: 0.2s;
}

.header button:hover {
    background: #dc2626;
}

/* ====== CONTENU ====== */
.content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}


</style>