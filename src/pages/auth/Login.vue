<script setup lang="ts">
import { useUserStore } from '@/stores/user.stores';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ROLE } from '../../../share/role';


    const email = ref("")
    const password = ref("")
    const errorMessage = ref("")

    const router = useRouter()
    const store = useUserStore()


    async function handleLogin() {
        errorMessage.value = ""
        try {
          
            await store.login(email.value, password.value)
              console.log("après login, user:", store.user)  // ← ici
              console.log("role:", store.user?.role)          // ← et ici
            // Redirection selon le rôle
            switch (store.user?.role) {
              case ROLE.ADMIN:
                  console.log("redirect admin");
                  router.push("/admin/dashboard"); 
                  break
              case ROLE.STUDENT:    router.push("/etudiant"); break
              case ROLE.COMPANY:    router.push("/entreprise"); break
              case ROLE.SUPERVISOR: router.push("/jury"); break
              default:              router.push("/")
            }      

        } catch (err: any) {
          
            errorMessage.value = err.message || "Identifiants incorrects"
        }
    }

</script>

<template>
  <div class="login-container">
    <h1>Connexion</h1>

    <form @submit.prevent="handleLogin">
      <input
        type="email"
        v-model="email"
        placeholder="Email"
        required
      />

      <input
        type="password"
        v-model="password"
        placeholder="Mot de passe"
        required
      />

      <button type="submit">Se connecter</button>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 350px;
  margin: 80px auto;
  padding: 20px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 0 10px #0002;
}

input {
  width: 100%;
  padding: 10px;
  margin: 8px 0;
}

button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>

