<script setup lang="ts">
import { useUserStore } from '@/stores/user.stores';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getHomeByRole } from '@/utils/getHomeByRole';


    const email = ref("")
    const password = ref("")
    const errorMessage = ref("")

    const router = useRouter()
    const store = useUserStore()


    async function handleLogin() {
    errorMessage.value = ""
    try {
        await store.login(email.value, password.value)
        
        console.log("Rôle détecté :", store.user?.role)

        router.push(getHomeByRole(store.user?.role ?? -1))
    } catch (err: any) {
        errorMessage.value = err.message || "Identifiants incorrects"
    }
}

</script>

<template>
  <div class="auth-wrapper">
    <div class="login-card">
      <div class="login-header">
        <h1>Bienvenue</h1>
        <p>Connectez-vous à votre espace </p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label>Email professionnel</label>
          <input type="email" v-model="email" placeholder="nom@exemple.fr" required />
        </div>

        <div class="input-group">
          <label>Mot de passe</label>
          <input type="password" v-model="password" placeholder="••••••••" required />
        </div>

        <button type="submit" class="btn-login">
          Se connecter
          <span class="arrow">→</span>
        </button>

        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
      </form>
      
    </div>
  </div>
</template>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc; /* Gris très clair */
  background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
  background-size: 20px 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-circle {
  font-size: 2.5rem;
  margin-bottom: 16px;
  display: inline-block;
}

.login-header h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.login-header p {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 8px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

input {
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s;
  background: #fcfcfc;
}

input:focus {
  outline: none;
  border-color: #4f46e5;
  background: white;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.btn-login {
  background: #4f46e5;
  color: white;
  padding: 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
  margin-top: 10px;
}

.btn-login:hover {
  background: #4338ca;
  transform: translateY(-1px);
}

.error-msg {
  color: #dc2626;
  font-size: 0.85rem;
  background: #fef2f2;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #fee2e2;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 0.85rem;
  color: #94a3b8;
}

.login-footer a {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 600;
}
</style>