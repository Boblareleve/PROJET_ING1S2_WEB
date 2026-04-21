<script setup lang="ts">
    import { useUserStore } from '@/stores/user.stores';
    import { useRouter } from 'vue-router';

    const user = useUserStore()
    const router  = useRouter() 
    async function logout() {
        
        user.logout()
        router.push("/auth/login")
    }

</script>
<template>
    <div class="parent">
        <div class="sidebar">

        </div>
        <div class="main">
            <div class="header">

            </div>
            <div class="content">
                <router-view></router-view>
            </div>
            
        </div>
        
    </div>
</template>

<style>
.parent {
    display: flex;
    height: 100vh;
}

/* Colonne de gauche */
.sidebar {
    width: 220px;
    background-color: gray;
    display: flex;
    flex-direction: column;
}

/* Colonne de droite (header + contenu) */
.main {
    flex: 1;                 /* prend tout l’espace restant */
    display: flex;
    flex-direction: column;  /* header en haut, contenu en bas */
}

/* Barre du haut */
.header {
    height: 60px;
    background-color: white;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    padding: 0 20px;
}

/* Zone où s’affichent les pages */
.content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}


</style>