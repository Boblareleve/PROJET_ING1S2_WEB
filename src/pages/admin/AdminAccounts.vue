<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface Account {
  id: number;
  email: string;
  role: number;
  first_name?: string;
  last_name?: string;
  name_company?: string;
  url_site?: string;
}

const ROLES = [
  { value: 0, label: "Admin", class: "badge-admin" },
  {value : 1, label: "Professeur", class:"badge-supervisor"},
  { value: 2, label: "Étudiant", class: "badge-student" },
  { value: 3, label: "Entreprise", class: "badge-company" }
]


const accounts = ref<Account[]>([])
const loading = ref(false)
const filter = ref(-1)
const dialog = ref<HTMLDialogElement | null>(null)
const isEditing = ref(false)

const form = ref({
  id: null as number | null,
  email: "",
  password: "",
  role: 2,
  first_name: "",
  last_name: "",
  name_company: "",
  url_site: ""
})


const filteredAccounts = computed(() => 
  filter.value === -1 ? accounts.value : accounts.value.filter(a => a.role === filter.value)
)

const isCompanyForm = computed(() => form.value.role === 3)

async function fetchAccounts() {
  loading.value = true
  try {
    const res = await fetch('/api/admin/accounts', { credentials: "include" })
    if (res.ok) accounts.value = await res.json()
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  const url = isEditing.value ? `/api/admin/account/${form.value.id}` : '/api/admin/accounts'
  const method = isEditing.value ? 'PUT' : 'POST'
  
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(form.value)
  })

  if (res.ok) {
    closeDialog()
    fetchAccounts()
  }
}

async function deleteAccount(id: number) {
  if (!confirm("Supprimer ce compte définitivement ?")) return
  const res = await fetch(`/api/admin/account/${id}`, { 
    method: "DELETE", 
    credentials: "include" 
  })
  if (res.ok) fetchAccounts()
}


function openCreate() {
  isEditing.value = false
  form.value = { id: null, email: "", password: "", role: 2, first_name: "", last_name: "", name_company: "", url_site: "" }
  dialog.value?.showModal()
}

function openEdit(account: Account) {
  isEditing.value = true
 
  form.value = {
    id: account.id,
    email: account.email,
    role: account.role,
    password: "", 
    first_name: account.first_name ?? "",
    last_name: account.last_name ?? "",
    name_company: account.name_company ?? "",
    url_site: account.url_site ?? ""
  }
  dialog.value?.showModal()
}
function closeDialog() {
  dialog.value?.close()
}

onMounted(fetchAccounts)
</script>

<template>
  <div class="page">
   
    <div class="page-header">
      <div class="title-section">
        <h1 class="title">Gestion des Comptes</h1>
        <p class="subtitle">{{ filteredAccounts.length }} utilisateur{{ filteredAccounts.length > 1 ? 's' : '' }} affiché{{ filteredAccounts.length > 1 ? 's' : '' }}</p>
      </div>
      
      <div class="header-actions">
        <div class="filter-group">
          <button class="filter-btn" :class="{ active: filter === -1 }" @click="filter = -1">Tous</button>
          <button 
            v-for="r in ROLES" :key="r.value"
            class="filter-btn" 
            :class="{ active: filter === r.value }"
            @click="filter = r.value"
          >{{ r.label }}</button>
        </div>
        <button class="btn btn-primary" @click="openCreate">+ Ajouter</button>
      </div>
    </div>

    <!-- Tableau des comptes -->
    <div class="card" v-if="!loading">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Nom / Société</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in filteredAccounts" :key="a.id">
            <td class="mono">#{{ a.id }}</td>
            <td class="bold">{{ a.email }}</td>
            <td>
              <span class="badge" :class="ROLES.find(r => r.value === a.role)?.class">
                {{ ROLES.find(r => r.value === a.role)?.label }}
              </span>
            </td>
            <td class="muted">
              <span v-if="a.role === 3">{{ a.name_company || '—' }}</span>
              <span v-else>{{ a.first_name }} {{ a.last_name }}</span>
            </td>
            <td>
              <div class="actions">
                <button class="btn-sm btn-edit" @click="openEdit(a)">Modifier</button>
                <button class="btn-sm btn-del" @click="deleteAccount(a.id)">Supprimer</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredAccounts.length === 0" class="empty">
        Aucun compte trouvé pour cette catégorie.
      </div>
    </div>
    <div v-else class="loading">Chargement des données...</div>

    <!-- Modal de Création/Edition -->
    <dialog ref="dialog" class="modal">
      <form @submit.prevent="onSubmit" class="modal-form">
        <div class="field">
          <label>Email professionnel</label>
          <input type="email" v-model="form.email" required placeholder="email@exemple.fr" />
        </div>

        <div class="field" v-if="!isEditing">
          <label>Mot de passe</label>
          <input type="password" v-model="form.password" required />
        </div>

        <div class="field">
          <label>Rôle utilisateur</label>
          <select v-model="form.role">
            <option v-for="r in ROLES" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </div>

        <hr class="divider" />

      
        <div v-if="isCompanyForm" class="form-grid">
          <div class="field">
            <label>Nom de l'entreprise</label>
            <input type="text" v-model="form.name_company" required />
          </div>
          <div class="field">
            <label>Site web</label>
            <input type="url" v-model="form.url_site" placeholder="https://..." />
          </div>
        </div>

        <div v-else class="form-grid">
          <div class="field">
            <label>Prénom</label>
            <input type="text" v-model="form.first_name" />
          </div>
          <div class="field">
            <label>Nom</label>
            <input type="text" v-model="form.last_name" />
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-cancel" @click="closeDialog">Annuler</button>
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? "Enregistrer les modifications" : "Créer le compte" }}
          </button>
        </div>
      </form>
    </dialog>
  </div>
</template>

<style scoped>
/* 1. On enlève le max-width et le margin auto pour que ça remplisse tout l'espace du layout */
.page {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  
  width: 100%;
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--text-main);
}

/* 2. On s'assure que le header de la page utilise bien tout l'espace */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1.5rem;
}

/* 3. On force la carte et le tableau à prendre 100% de la largeur du contenu */
.card {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
  width: 100%; 
}

.table {
  width: 100%;
  border-collapse: collapse;
}

/* Le reste de tes styles (badges, boutons, modal) est correct, 
   garde-les mais assure-toi d'être en <style scoped> */

.title { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; margin: 0; }
.subtitle { color: var(--text-muted); font-size: 0.9rem; }

.header-actions { display: flex; gap: 1rem; align-items: center; }

.filter-group {
  display: flex;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 10px;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
}

.filter-btn.active {
  background: white;
  color: var(--primary);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.table th {
  background: #f8fafc;
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
}

.table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.badge-student { background: #eff6ff; color: #1d4ed8; }
.badge-supervisor { background: #ecfdf5; color: #047857; }
.badge-company { background: #fffbeb; color: #b45309; }
.badge-admin { background: #faf5ff; color: #7e22ce; }

.btn { padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; }
.btn-primary { background: var(--primary); color: white; }


.modal {
 
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  
  
  border: none;
  border-radius: 16px; 
  width: 90%;
  max-width: 500px;
  padding: 0; 
  background: white;
  

  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  animation: modalScale 0.3s ease-out;
  margin: 0;
}

@keyframes modalScale {
  from { opacity: 0; transform: translate(-50%, -45%) scale(0.95); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}


.modal::backdrop {
  background: rgba(15, 23, 42, 0.7); 
  backdrop-filter: blur(5px); 
}


.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}


.modal-form {
  padding: 2rem;
}


.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.field label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.field input, .field select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.field input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}


.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
</style>