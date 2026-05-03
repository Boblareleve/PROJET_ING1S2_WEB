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

<style>

.page {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}


.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end; 
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0;
}

.subtitle {
  color: #718096;
  font-size: 1rem;
  margin: 0;
}


.btn-primary {
  background-color: #4f46e5;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}

.btn-primary:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
}

.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100% ; 
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
  letter-spacing: 0.05em;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
}


.empty {
  text-align: center;
  padding: 5rem ;
  color: #94a3b8;
  font-style: italic;
  background: #fff;
}

.actions-cell {
  text-align: right;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px); 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  width: 100%;
  max-width: 450px;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalIn 0.3s ease-out;
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-title {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 24px;
}


.field {
  margin-bottom: 20px;
}

.field label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.field input, 
.field textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  color: #1e293b;
  transition: all 0.2s;
  background: #f8fafc;
}

.field input:focus, 
.field textarea:focus {
  outline: none;
  border-color: #4f46e5;
  background: white;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.field textarea {
  min-height: 100px;
  resize: vertical;
}


.modal-actions {
  display: flex;
  justify-content: flex-end; 
  gap: 12px;
  margin-top: 32px;
}


.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}



.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover {
  background: #e2e8f0;
  color: #475569;
}


.btn-confirm {
  background: #4f46e5;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}

.btn-confirm:hover {
  background: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
}


.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}


.btn-sm {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}


.btn-edit {
  background-color: #eff6ff;
  color: #2563eb;
}

.btn-edit:hover {
  background-color: #dbeafe;
  color: #1d4ed8;
}


.btn-del {
  background-color: #fef2f2;
  color: #dc2626;
}

.btn-del:hover {
  background-color: #fee2e2;
  color: #b91c1c;
}
</style>