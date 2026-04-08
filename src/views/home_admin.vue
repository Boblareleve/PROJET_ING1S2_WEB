<script setup lang="ts">
// toute ta logique ici
// imports, variables, fonctions, appels au store...
import { useAuthStore } from '@/auth/auth'

const auth = useAuthStore()
</script>

<template>
 
  <div>
    <p v-if="auth.user?.email">
      Bonjour {{ auth.user.email}}
    </p>
    <p v-else>Chargement...</p>
  </div>

  <div>
    
  </div>
</template>

<style scoped>

div {
  color: red;
}
</style>