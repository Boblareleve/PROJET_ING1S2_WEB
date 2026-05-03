<script setup lang="ts">
import { ref, onMounted } from 'vue'

const acceptedApps = ref<any[]>([])
const loading  = ref(false)
const error    = ref('')
const success  = ref('')
const showForm = ref(false)
const files    = ref<File[]>([])
const form     = ref({ internship_title: '', type_id: '1' })

const DOC_TYPES = [
  { id: '1', label: 'Rapport' },
  { id: '2', label: 'Résumé' },
  { id: '3', label: 'Évaluation' },
  { id: '4', label: 'Convention' },
  { id: '5', label: 'Autre' }
]

async function fetchAccepted() {
  loading.value = true
  const res = await fetch('/api/student/applications', { credentials: 'include' })
  if (res.ok) {
    const all = await res.json()
    acceptedApps.value = all.filter((a: any) => a.status === 'accepted')
  }
  loading.value = false
}

async function submitDoc() {
  error.value = ''; success.value = ''
  if (!form.value.internship_title || files.value.length === 0) {
    error.value = 'Choisissez un stage et au moins un fichier'
    return
  }
  const formData = new FormData()
  formData.append('internship_title', form.value.internship_title)
  formData.append('type_id', form.value.type_id)
  for (const file of files.value)
    formData.append('files', file)

  const res = await fetch('/api/student/document', {
    method: 'POST',
    credentials: 'include',
    body: formData
  })
  if (!res.ok) { error.value = await res.text(); return }
  success.value = 'Documents enregistrés'
  showForm.value = false
  files.value = []
  form.value = { internship_title: '', type_id: '1' }
}

onMounted(fetchAccepted)
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">Documents</h1>
        <p class="subtitle">Déposez vos livrables de stage</p>
      </div>
      <button
        class="btn-primary"
        @click="showForm = true"
        :disabled="acceptedApps.length === 0 || loading"
      >
        + Déposer un document
      </button>
    </div>

    <div v-if="error"   class="alert alert-error">{{ error }}</div>
    <div v-if="success" class="alert alert-ok">{{ success }}</div>

    <div v-if="loading" class="loading">Chargement…</div>

    <div v-else-if="acceptedApps.length === 0" class="empty-state">
      <div class="empty-icon">📂</div>
      <p class="empty-title">Aucun stage accepté pour le moment</p>
      <p class="empty-sub">Vous pourrez déposer des documents dès qu'une de vos candidatures sera acceptée.</p>
    </div>

    <!-- Modal dépôt de document -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <button class="modal-close" @click="showForm = false">✕</button>
        <h2 class="modal-title">Déposer un document</h2>

        <div class="field">
          <label>Stage concerné</label>
          <select v-model="form.internship_title">
            <option value="">-- Choisir un stage --</option>
            <option v-for="a in acceptedApps" :key="a.internship_title" :value="a.internship_title">
              {{ a.internship_title }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Type de document</label>
          <select v-model="form.type_id">
            <option v-for="t in DOC_TYPES" :key="t.id" :value="t.id">{{ t.label }}</option>
          </select>
        </div>

        <div class="field">
          <label>Fichiers</label>
          <div class="file-drop">
            <input
              type="file"
              multiple
              id="docFileInput"
              class="file-input-hidden"
              @change="(e: any) => files = Array.from(e.target.files)"
            />
            <label for="docFileInput" class="file-drop-label">
              <span class="file-drop-icon">📎</span>
              <span v-if="files.length === 0">
                Cliquez pour ajouter des fichiers
              </span>
              <span v-else class="file-list">
                <span v-for="f in files" :key="f.name" class="file-chip">{{ f.name }}</span>
              </span>
            </label>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-ghost" @click="showForm = false">Annuler</button>
          <button class="btn-primary" @click="submitDoc">Enregistrer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', system-ui, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.title { font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0; }
.subtitle { color: #64748b; margin-top: 0.25rem; }

/* Alertes */
.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}
.alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
.alert-ok    { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }

/* État vide */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  color: #94a3b8;
}
.empty-icon  { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
.empty-title { font-size: 1.1rem; font-weight: 700; color: #64748b; margin: 0 0 0.5rem; }
.empty-sub   { font-size: 0.9rem; color: #94a3b8; margin: 0; }

.loading { text-align: center; padding: 3rem; color: #64748b; font-style: italic; }

/* Boutons */
.btn-primary {
  background: #4f46e5;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #4338ca; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-ghost {
  background: #f1f5f9;
  color: #475569;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
.btn-ghost:hover { background: #e2e8f0; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  position: relative;
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-close {
  position: absolute;
  top: 1rem; right: 1rem;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  width: 32px; height: 32px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #64748b;
}
.modal-close:hover { background: #e2e8f0; }

.modal-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 1.5rem;
}

.field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
.field label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.field select {
  padding: 0.6rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1e293b;
  background: #f8fafc;
  transition: all 0.2s;
}
.field select:focus {
  outline: none;
  border-color: #4f46e5;
  background: white;
  box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
}

/* Zone fichiers */
.file-drop { position: relative; }
.file-input-hidden { display: none; }

.file-drop-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
  transition: all 0.2s;
  background: #f8fafc;
}
.file-drop-label:hover {
  border-color: #4f46e5;
  background: #eff6ff;
  color: #4f46e5;
}
.file-drop-icon { font-size: 1.5rem; }

.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
}
.file-chip {
  background: #eff6ff;
  color: #2563eb;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>