<script setup lang="ts">
import { useUserStore } from '@/stores/user.stores';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
    const email = ref("")
    const password = ref("")
    const errorMessage = ref("")

    const router = useRouter()
    const store = useUserStore()


    async function handleLogin() {
        errorMessage.value = ""
        try {
            await store.login(email.value, password.value)

            // Redirection selon le rôle
            switch (store.role) {
            case "admin":
                router.push("/admin/dashboard")
                break
            case "etudiant":
                router.push("/etudiant")
                break
            case "entreprise":
                router.push("/entreprise")
                break
            case "jury":
                router.push("/jury")
                break
            case "tuteur":
                router.push("/tuteur")
                break
            default:
                router.push("/")
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

