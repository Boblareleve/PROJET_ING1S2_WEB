<script setup lang="ts">
import { useUserStore } from '@/stores/user.stores'
import { useRouter, useRoute } from 'vue-router'
const user   = useUserStore()
const router = useRouter()
const route  = useRoute()
async function logout() { await user.logout(); router.push('/auth/login') }
</script>

<template>
  <div class="parent">
    <aside class="sidebar">
      
      
      <nav>
        <router-link to="/student/search">Chercher un stage</router-link>
        <router-link to="/student/applications">Mes candidatures</router-link>
        <router-link to="/student/documents">Mes documents</router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <span class="user-name">{{ user.asPerson?.first_name ?? 'Étudiant' }}</span>
        </div>
      </div>
    </aside>

    <div class="main">
      <div class="header">
        <header>
          <h3>{{ route.meta.title }}</h3>
          <button class="btn-logout"v-on:click="logout()"> logout </button>
        </header>
      </div>
      <div class="content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

