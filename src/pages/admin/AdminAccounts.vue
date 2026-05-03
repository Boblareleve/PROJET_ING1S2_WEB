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
      <div class="modal-header">
        <h3>{{ isEditing ? "Modifier le compte" : "Nouveau compte" }}</h3>
        <button class="close-icon" @click="closeDialog">✕</button>
      </div>

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

.page { max-width: 1100px; margin: 0 auto; padding: 2rem; font-family: 'Inter', system-ui, sans-serif; }

.page-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-end; 
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}


.title { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin: 0; }
.subtitle { color: #64748b; margin-top: 0.25rem; }


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
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active { background: white; color: #4f46e5; shadow: 0 2px 4px rgba(0,0,0,0.05); }


.card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.table { width: 100%; border-collapse: collapse; text-align: left; }
.table th { background: #f8fafc; padding: 1rem; font-size: 0.75rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
.table td { padding: 1rem; border-top: 1px solid #f1f5f9; font-size: 0.9rem; vertical-align: middle; }

.mono { font-family: monospace; color: #94a3b8; }
.bold { font-weight: 600; color: #1e293b; }
.muted { color: #64748b; }
.actions { display: flex; gap: 0.5rem; justify-content: flex-end; }


.btn { padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
.btn-primary { background: #4f46e5; color: white; }
.btn-primary:hover { background: #4338ca; transform: translateY(-1px); }

.btn-sm { padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; border: none; cursor: pointer; }
.btn-edit { background: #eff6ff; color: #2563eb; }
.btn-del { background: #fef2f2; color: #dc2626; }
.btn-edit:hover { background: #dbeafe; }
.btn-del:hover { background: #fee2e2; }


.badge { padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.badge-student { background: #dbeafe; color: #1e40af; }
.badge-supervisor { background: #d1fae5; color: #065f46; }
.badge-company { background: #fef9c3; color: #854d0e; }
.badge-admin { background: #f3e8ff; color: #6b21a8; }


.modal { border: none; border-radius: 16px; padding: 0; width: 100%; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.modal::backdrop { background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-form { padding: 1.5rem; }

.field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
.field label { font-size: 0.85rem; font-weight: 600; color: #475569; }
.field input, .field select { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem; }
.divider { border: 0; border-top: 1px solid #f1f5f9; margin: 1.5rem 0; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
.btn-cancel { background: #f1f5f9; color: #475569; }

.empty, .loading { padding: 3rem; text-align: center; color: #94a3b8; }
</style>