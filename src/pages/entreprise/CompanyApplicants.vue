<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Applicant {
  id: number
  student_id: number
  email: string
  first_name: string
  last_name: string
  status: string | null
}

const internships = ref<any[]>([])
const selected    = ref('')
const applicants  = ref<Applicant[]>([])
const loading     = ref(false)
const loadingApps = ref(false)
const feedback    = ref('')

const docs        = ref<any[]>([])
const selectedApp = ref<number | null>(null)
const loadingDocs = ref(false)
const showDocsFor = ref<number | null>(null)

async function fetchDocs(applicant: Applicant) {
 
  if (showDocsFor.value === applicant.id) {
    showDocsFor.value = null
    docs.value = []
    return
  }

  showDocsFor.value = applicant.id
  selectedApp.value = applicant.id
  docs.value = []
  loadingDocs.value = true

  try {
    
    const res = await fetch(`/api/company/documents/${applicant.id}`, { credentials: 'include' })
    if (res.ok) {
      docs.value = await res.json()
    }
  } finally {
    loadingDocs.value = false
  }
}

async function fetchInternships() {
  loading.value = true
  try {
    const res = await fetch('/api/company/internship', { credentials: 'include' })
    if (res.ok) internships.value = await res.json()
  } finally { loading.value = false }
}

async function fetchApplicants() {
  if (!selected.value) { applicants.value = []; return }
  loadingApps.value = true
  showDocsFor.value = null
  docs.value = []
  try {
    const res = await fetch('/api/company/applicants/' + encodeURIComponent(selected.value), {
      credentials: 'include'
    })
    if (res.ok) applicants.value = await res.json()
  } finally { loadingApps.value = false }
}

async function setStatus(id: number, status: 'accepted' | 'rejected') {
  feedback.value = ''
  const res = await fetch('/api/company/application/status', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ internship_file_id: id, status })
  })
  if (res.ok) {
    feedback.value = status === 'accepted' ? 'Candidature acceptée ✓' : 'Candidature refusée ✗'
    await fetchApplicants()
  } else {
    feedback.value = await res.text()
  }
}

async function downloadDoc(id: number, filename: string) {
  const res = await fetch(`/api/download/${id}`, { credentials: 'include' })
  if (!res.ok) return
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(fetchInternships)
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="title">Candidats</h1>
      <p class="subtitle">Consultez et gérez les candidatures reçues</p>
    </header>

    <div v-if="feedback" class="alert">{{ feedback }}</div>

    <div class="selector-container">
      <label for="offer-select">Filtrer par offre :</label>
      <select id="offer-select" v-model="selected" class="select-input" @change="fetchApplicants">
        <option value="">-- Sélectionner une offre --</option>
        <option v-for="i in internships" :key="i.id" :value="i.title">{{ i.title }}</option>
      </select>
    </div>

    <main class="content-area">
      <div v-if="loadingApps" class="status-msg">
        <div class="spinner"></div>
        <p>Chargement des candidats...</p>
      </div>

      <div v-else-if="selected" class="results-card">
        <div class="card-top">
          <h2 class="current-selection">{{ selected }}</h2>
          <span class="badge">{{ applicants.length }} candidat{{ applicants.length > 1 ? 's' : '' }}</span>
        </div>

        <div v-if="applicants.length > 0" class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Identité</th>
                <th>Contact</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="a in applicants" :key="a.id">
                <!-- Ligne candidat -->
                <tr :class="{ 'row-active': showDocsFor === a.id }">
                  <td class="user-name">{{ a.first_name }} {{ a.last_name }}</td>
                  <td class="user-email">{{ a.email }}</td>
                  <td>
                    <span :class="['status-badge', a.status ?? 'pending']">
                      {{ a.status === 'accepted' ? '✓ Accepté' : a.status === 'rejected' ? '✗ Refusé' : '⏳ En attente' }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <button class="btn-accept" @click="setStatus(a.id, 'accepted')" :disabled="a.status === 'accepted'">Accepter</button>
                    <button class="btn-reject" @click="setStatus(a.id, 'rejected')" :disabled="a.status === 'rejected'">Refuser</button>
                    <button
                      class="btn-docs"
                      :class="{ 'btn-docs-active': showDocsFor === a.id }"
                      @click="fetchDocs(a)"
                    >
                      {{ showDocsFor === a.id ? '▲ Fermer' : '📄 Docs' }}
                    </button>
                  </td>
                </tr>

                <!-- Ligne documents (inline sous le candidat) -->
                <tr v-if="showDocsFor === a.id" class="docs-row">
                  <td colspan="4">
                    <div class="docs-panel">
                      <div v-if="loadingDocs" class="docs-loading">
                        <div class="spinner-sm"></div> Chargement des documents…
                      </div>
                      <div v-else-if="docs.length === 0" class="docs-empty">
                        Aucun document soumis pour cette candidature.
                      </div>
                      <ul v-else class="docs-list">
                        <li v-for="d in docs" :key="d.id" class="doc-item">
                          <div class="doc-info">
                            <span class="doc-name">{{ d.file_path?.split('/').pop() ?? `Fichier #${d.id}` }}</span>
                          </div>
                          <button
                            class="btn-download"
                            @click="downloadDoc(d.id, d.file_path?.split('/').pop() ?? `document-${d.id}`)"
                          >
                            📥 Télécharger
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state">
          <p>Aucune candidature pour cette offre.</p>
        </div>
      </div>

      <div v-else class="placeholder-box">
        <div class="icon">📁</div>
        <h3>Prêt à consulter vos candidatures</h3>
        <p>Choisissez une offre pour afficher les profils.</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page { font-family: 'Inter', sans-serif; background: #f8fafc; min-height: 100vh; padding: 40px 5%; }
.page-header { margin-bottom: 40px; }
.title { font-size: 2.2rem; font-weight: 800; margin: 0; }
.subtitle { color: #64748b; margin-top: 8px; }

.alert { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-weight: 600; }

.selector-container { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px; display: flex; align-items: center; gap: 15px; }
.selector-container label { font-weight: 600; }
.select-input { flex: 1; max-width: 400px; padding: 10px 15px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 1rem; }

.results-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }
.card-top { padding: 25px; background: #fcfcfd; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.current-selection { font-size: 1.3rem; margin: 0; color: #4c51bf; }
.badge { background: #ebf4ff; color: #4c51bf; padding: 6px 14px; border-radius: 99px; font-size: 0.85rem; font-weight: 700; }

.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 15px 25px; background: #f8fafc; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
.data-table td { padding: 18px 25px; border-top: 1px solid #e2e8f0; vertical-align: middle; }

.row-active td { background: #f5f3ff; }
.user-name { font-weight: 600; }
.user-email { color: #64748b; font-family: monospace; }

.status-badge { padding: 4px 12px; border-radius: 99px; font-size: 0.8rem; font-weight: 700; }
.status-badge.accepted { background: #dcfce7; color: #16a34a; }
.status-badge.rejected { background: #fee2e2; color: #dc2626; }
.status-badge.pending  { background: #fef9c3; color: #854d0e; }

.actions-cell { display: flex; gap: 8px; align-items: center; }
.btn-accept { background: #dcfce7; color: #16a34a; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-accept:hover:not(:disabled) { background: #bbf7d0; }
.btn-reject { background: #fee2e2; color: #dc2626; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-reject:hover:not(:disabled) { background: #fecaca; }
button:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-docs {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-docs:hover { background: #e2e8f0; }
.btn-docs-active { background: #ede9fe; color: #6d28d9; }
.btn-docs-active:hover { background: #ddd6fe; }

/* Ligne docs inline */
.docs-row td { padding: 0 !important; border-top: none; }

.docs-panel {
  background: #fafaf9;
  border-top: 2px solid #ede9fe;
  padding: 1.25rem 1.75rem;
}

.docs-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #64748b;
  font-size: 0.9rem;
}

.docs-empty {
  color: #94a3b8;
  font-style: italic;
  font-size: 0.9rem;
  padding: 0.5rem 0;
}

.docs-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6rem; }

.doc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.75rem 1rem;
}

.doc-info { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }

.doc-name {
  font-size: 0.9rem;
  color: #334155;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-download {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}
.btn-download:hover { background: #4338ca; }

/* Spinner */
.spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #4c51bf; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px; }
.spinner-sm { width: 18px; height: 18px; border: 3px solid #e2e8f0; border-top-color: #6d28d9; border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }

.placeholder-box, .empty-state { text-align: center; padding: 80px 20px; color: #64748b; }
.placeholder-box .icon { font-size: 4rem; margin-bottom: 20px; }
.placeholder-box h3 { color: #1e293b; margin-bottom: 10px; }
.status-msg { display: flex; flex-direction: column; align-items: center; padding: 50px; }
</style>