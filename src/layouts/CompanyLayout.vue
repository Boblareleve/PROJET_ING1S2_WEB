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
       <router-link to="/company/internships">
          Mes offres
        </router-link>
        <router-link to="/company/applicants">
          Candidats
        </router-link>
    </div>
    <div class="main">
      <div class="header">
          <header>
            <h3 >{{route.meta.title}}</h3>
            <span><h3>{{ user.asCompanie?.name ?? 'Entreprise' }}</h3>  </span>
            <button class="btn-logout"v-on:click="logout()"> logout </button>
          </header>
      </div>
      <div class="content">
          <router-view></router-view>
      </div>
    </div>
  </div>
</template>


