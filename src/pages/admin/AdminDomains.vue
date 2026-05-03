<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Domain { id: number; title: string; abstract: string }

const domains = ref<Domain[]>([])
const loading = ref(false)
const error   = ref('')
const success  = ref('')

const showForm  = ref(false)
const editTarget = ref<Domain | null>(null)

const form = ref({ title: '', abstract: '' })

async function fetchDomains() {
  loading.value = true
  const res = await fetch('/api/query/domains', { credentials: 'include' })
  if (res.ok) domains.value = await res.json()
  loading.value = false
}

function openCreate() {
  editTarget.value = null
  form.value = { title: '', abstract: '' }
  showForm.value = true
}

function openEdit(d: Domain) {
  editTarget.value = d
  form.value = { title: d.title, abstract: d.abstract }
  showForm.value = true
}

async function submit() {
  error.value = ''
  success.value = ''
  if (editTarget.value) {
    const res = await fetch('/api/admin/domain', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title: editTarget.value.title, new: form.value })
    })
    if (!res.ok) { error.value = await res.text(); return }
    success.value = 'Domaine modifié'
  } else {
    const res = await fetch('/api/admin/domain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form.value)
    })
    if (!res.ok) { error.value = await res.text(); return }
    success.value = 'Domaine créé'
  }
  showForm.value = false
  fetchDomains()
}

async function deleteDomain(title: string) {
  if (!confirm(`Supprimer "${title}" ?`)) return
  error.value = ''
  const res = await fetch('/api/admin/domain', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ title })
  })
  if (!res.ok) { error.value = await res.text(); return }
  success.value = 'Domaine supprimé'
  fetchDomains()
}

onMounted(fetchDomains)
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">Domaines</h1>
        <p class="subtitle">{{ domains.length }} domaine{{ domains.length !== 1 ? 's' : '' }} enregistré{{ domains.length !== 1 ? 's' : '' }}</p>
      </div>
      <button class="btn-primary" @click="openCreate">+ Nouveau domaine</button>
    </div>

    <div v-if="error"   class="alert alert-error">{{ error }}</div>
    <div v-if="success" class="alert alert-ok">{{ success }}</div>

    
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <h2 class="modal-title">{{ editTarget ? 'Modifier' : 'Créer' }} un domaine</h2>
        <div class="field">
          <label>Titre</label>
          <input v-model="form.title" placeholder="ex: Informatique" />
        </div>
        <div class="field">
          <label>Description</label>
          <textarea v-model="form.abstract" rows="3" placeholder="Courte description..."></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" @click="showForm = false">Annuler</button>
          <button class="btn-primary" @click="submit">{{ editTarget ? 'Modifier' : 'Créer' }}</button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card" v-if="!loading">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in domains" :key="d.id">
            <td class="mono">#{{ d.id }}</td>
            <td class="bold">{{ d.title }}</td>
            <td class="muted">{{ d.abstract || '—' }}</td>
            <td>
              <div class="actions">
                <button class="btn-sm btn-edit" @click="openEdit(d)">Modifier</button>
                <button class="btn-sm btn-del"  @click="deleteDomain(d.title)">Supprimer</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="domains.length === 0" class="empty">Aucun domaine. Créez-en un.</p>
    </div>
    <div v-else class="loading">Chargement…</div>
  </div>
</template>

<style scoped>

.page {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
}


.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center; 
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0;
}


.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%; 
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background-color: #f8fafc;
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}


.alert {
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
}
.alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
.alert-ok { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }


.btn-primary {
  background-color: #4f46e5;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-edit { background-color: #eff6ff; color: #2563eb; }
.btn-del { background-color: #fef2f2; color: #dc2626; }


.modal-overlay {
  position: fixed;
  inset: 0; 
  background-color: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal {
  background: white;
  width: 90%;
  max-width: 450px;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
}
</style>