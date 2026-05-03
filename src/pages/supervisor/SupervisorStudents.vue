<script setup lang="ts">
import { ref, onMounted } from 'vue'

const students = ref<any[]>([])
const loading  = ref(false)
const error    = ref('')
const success  = ref('')

const STATUS_LABEL: Record<string, string> = {
  pending:   'En attente',
  accepted:  'Acceptée',
  rejected:  'Refusée',
  validated: 'Validée'
}
const STATUS_CLASS: Record<string, string> = {
  pending:   'badge-pending',
  accepted:  'badge-accepted',
  rejected:  'badge-rejected',
  validated: 'badge-validated'
}

async function fetchStudents() {
  loading.value = true
  const res = await fetch('/api/supervisor/students', { credentials: 'include' })
  if (res.ok) students.value = await res.json()
  loading.value = false
}

async function updateStatus(application_id: number, status: string) {
  error.value = ''; success.value = ''
  const res = await fetch('/api/supervisor/application/status', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ application_id, status })
  })
  if (!res.ok) { error.value = await res.text(); return }
  success.value = 'Statut mis à jour'
  fetchStudents()
}

onMounted(fetchStudents)
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">Mes étudiants</h1>
        <p class="subtitle">{{ students.length }} étudiant{{ students.length !== 1 ? 's' : '' }} suivi{{ students.length !== 1 ? 's' : '' }}</p>
      </div>
    </div>

    <div v-if="error"   class="alert alert-error">{{ error }}</div>
    <div v-if="success" class="alert alert-ok">{{ success }}</div>

    <div v-if="loading" class="loading">Chargement…</div>

    <div v-else-if="students.length > 0" class="list">
      <div v-for="s in students" :key="s.application_id" class="card">
        <div class="card-left">
          <div class="student-name">{{ s.first_name || '?' }} {{ s.last_name || '' }}</div>
          <div class="student-email">{{ s.email }}</div>
          <div class="student-stage">
            <span class="stage-co">{{ s.company }}</span>
            <span class="stage-sep">·</span>
            <span>{{ s.internship_title }}</span>
          </div>
        </div>
        <div class="card-right">
          <span class="status-badge" :class="STATUS_CLASS[s.status] ?? 'badge-pending'">
            {{ STATUS_LABEL[s.status] ?? s.status }}
          </span>
          <div class="action-row">
            <button
              class="btn-action btn-validated"
              :disabled="s.status === 'validated'"
              @click="updateStatus(s.application_id, 'validated')"
            >Valider</button>
            <button
              class="btn-action btn-rejected"
              :disabled="s.status === 'rejected'"
              @click="updateStatus(s.application_id, 'rejected')"
            >Refuser</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">◉</div>
      <p class="empty-title">Aucun étudiant assigné</p>
      <p class="empty-sub">Rendez-vous sur la page <strong>Offres disponibles</strong> pour vous affecter des étudiants.</p>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: 900px; margin: 0 auto; padding: 2rem; font-family: 'Inter', system-ui, sans-serif; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
.title { font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0; }
.subtitle { color: #64748b; margin-top: 0.25rem; }

.alert { padding: 0.9rem 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-weight: 600; font-size: 0.9rem; }
.alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
.alert-ok    { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }

.list { display: flex; flex-direction: column; gap: 1rem; }

.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  transition: box-shadow 0.2s;
}
.card:hover { box-shadow: 0 4px 12px -4px rgba(0,0,0,0.08); }

.card-left { display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; }
.student-name  { font-weight: 700; font-size: 1rem; color: #1e293b; }
.student-email { font-size: 0.82rem; color: #94a3b8; font-family: monospace; }
.student-stage { font-size: 0.85rem; color: #475569; display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; }
.stage-co   { font-weight: 600; color: #4f46e5; }
.stage-sep  { color: #cbd5e1; }

.card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem; flex-shrink: 0; }

.status-badge { padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.badge-pending   { background: #fef9c3; color: #854d0e; }
.badge-accepted  { background: #dcfce7; color: #16a34a; }
.badge-rejected  { background: #fee2e2; color: #dc2626; }
.badge-validated { background: #ede9fe; color: #6d28d9; }

.action-row { display: flex; gap: 0.5rem; }
.btn-action { padding: 0.4rem 0.9rem; border-radius: 6px; font-size: 0.82rem; font-weight: 600; border: none; cursor: pointer; transition: opacity 0.15s; }
.btn-action:disabled { opacity: 0.35; cursor: not-allowed; }
.btn-validated { background: #ede9fe; color: #6d28d9; }
.btn-validated:hover:not(:disabled) { background: #ddd6fe; }
.btn-rejected  { background: #fee2e2; color: #dc2626; }
.btn-rejected:hover:not(:disabled)  { background: #fecaca; }

.empty-state { text-align: center; padding: 5rem 2rem; color: #94a3b8; }
.empty-icon  { font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.4; }
.empty-title { font-size: 1.1rem; font-weight: 700; color: #64748b; margin: 0 0 0.5rem; }
.empty-sub   { font-size: 0.9rem; margin: 0; }
.empty-sub strong { color: #4f46e5; }

.loading { text-align: center; padding: 3rem; color: #64748b; font-style: italic; }
</style>