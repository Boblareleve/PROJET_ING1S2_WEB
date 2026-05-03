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
    <div class="layout-parent">
        <!-- Sidebar stylisée -->
        <aside class="sidebar">
            <div class="sidebar-brand">
                <span class="brand-icon">⚡</span>
                <span class="brand-name">StageFlow</span>
            </div>
            
            <nav class="sidebar-nav">
                <div class="nav-item active">Tableau de bord</div>
                <div class="nav-item">Offres de stage</div>
                <div class="nav-item">Mes documents</div>
            </nav>

            <div class="sidebar-footer">
                <button @click="logout" class="btn-logout">
                   <span>🚪</span> Déconnexion
                </button>
            </div>
        </aside>

        <main class="main-container">
            <header class="top-header">
                <div class="header-content">
                    <div class="breadcrumb">Accueil / Dashboard</div>
                    <div class="user-profile">
                        <span class="user-name">Mon Profil</span>
                        <div class="avatar">JS</div>
                    </div>
                </div>
            </header>

            <section class="content-area">
                <router-view></router-view>
            </section>
        </main>
    </div>
</template>

<style scoped>
.layout-parent {
    display: flex;
    height: 100vh;
    background-color: #f1f5f9;
}


.sidebar {
    width: 260px;
    background-color: #1e293b; 
    color: white;
    display: flex;
    flex-direction: column;
    padding: 24px;
}

.sidebar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 40px;
}

.brand-icon {
    font-size: 1.5rem;
    background: #4f46e5;
    padding: 8px;
    border-radius: 10px;
}

.brand-name {
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.5px;
}

.sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.nav-item {
    padding: 12px 16px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 500;
    color: #94a3b8;
    transition: all 0.2s;
}

.nav-item:hover, .nav-item.active {
    background: #334155;
    color: white;
}

.sidebar-footer {
    margin-top: auto;
    padding-top: 20px;
    border-top: 1px solid #334155;
}

.btn-logout {
    width: 100%;
    background: transparent;
    border: none;
    color: #f87171;
    text-align: left;
    padding: 10px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
}

.main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.top-header {
    height: 70px;
    background: white;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    display: flex;
    align-items: center;
    padding: 0 32px;
    z-index: 10;
}

.header-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.breadcrumb {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 500;
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
}

.avatar {
    width: 35px;
    height: 35px;
    background: #4f46e5;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
}

.content-area {
    flex: 1;
    overflow-y: auto;
    padding: 32px;
}
</style>