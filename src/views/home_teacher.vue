<script setup lang="ts">
// toute ta logique ici
// imports, variables, fonctions, appels au store...
import { useAuthStore } from '@/auth/auth'

const auth = useAuthStore()
</script>

<template>
  <div>
    <p v-if="auth.user?.info && 'first_name' in auth.user.info">
      Bonjour {{ auth.user.info.first_name }} {{ auth.user.info.last_name }}
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