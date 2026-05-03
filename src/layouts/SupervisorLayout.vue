<script setup lang="ts">
import { useUserStore } from '@/stores/user.stores'
import { useRouter, useRoute } from 'vue-router'

const user   = useUserStore()
const router = useRouter()
const route  = useRoute()

async function logout() { 
  await user.logout()
  router.push('/auth/login') 
}
</script>

<template>
  <div class="parent">
    <!-- Sidebar Unifiée -->
    <aside class="sidebar">
    
      
      <nav>
        <router-link to="/supervisor/students">
           Mes étudiants
        </router-link>
        <router-link to="/supervisor/offers">
          Offres disponibles
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <span class="user-name-sidebar">
          {{ user.asPerson?.first_name ?? 'Tuteur' }}
        </span>
      </div>
    </aside>

    <!-- Zone Principale Unifiée -->
    <div class="main">
      <div class="header">
        <header>
          <div class="header">
            <h3>{{ route.meta.title }}</h3>
          </div>
          <div class="header-right">
            <!-- Bouton Logout Standard -->
           <button class="btn-logout"v-on:click="logout()"> logout </button>
          </div>
        </header>
      </div>

      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>
