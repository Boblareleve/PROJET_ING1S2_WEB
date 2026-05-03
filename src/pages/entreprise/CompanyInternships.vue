<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Internship {
  id: number; title: string; abstract: string
  domain_title: string; min_begin: number|null; max_begin: number|null; duration: number|null
}

const internships = ref<Internship[]>([])
const domains     = ref<any[]>([])
const loading     = ref(false)
const error       = ref('')
const success     = ref('')

const showCreate = ref(false)
const showDates  = ref(false)
const selectedTitle = ref('')

const createForm = ref({ title: '', abstract: '', domain: '' })
const datesForm  = ref({ title: '', min_begin: '', max_begin: '', duration: '' })


function fmt(unix: number|null) {
  if (!unix) return '—'
  return new Date(unix * 1000).toLocaleDateString('fr-FR')
}

async function fetchAll() {
  loading.value = true
  const [intRes, domRes] = await Promise.all([
    fetch('/api/company/internship', { credentials: 'include' }),
    fetch('/api/query/domains',      { credentials: 'include' })
  ])
  if (intRes.ok) internships.value = await intRes.json()
  if (domRes.ok) domains.value    = await domRes.json()
  loading.value = false
}

async function createInternship() {
  error.value = ''; success.value = ''
  const res = await fetch('/api/company/internship', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(createForm.value)
  })
  if (!res.ok) { error.value = await res.text(); return }
  const data = await res.json()
  success.value = `Offre "${data.title}" créée`
  showCreate.value = false
  fetchAll()
}

async function deleteInternship(title: string) {
  if (!confirm(`Supprimer "${title}" ?`)) return
  error.value = ''; success.value = ''
  const res = await fetch('/api/company/internship', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ title })
  })
  if (!res.ok) { error.value = await res.text(); return }
  success.value = 'Offre supprimée'
  fetchAll()
}

function openDates(i: Internship) {
  datesForm.value = {
    title: i.title,
    min_begin: i.min_begin !== null ? new Date(i.min_begin * 1000).toISOString().slice(0, 10) : '',
    max_begin: i.max_begin !== null ? new Date(i.max_begin * 1000).toISOString().slice(0, 10) : '',
    duration: i.duration?.toString() ?? ''
  }
  showDates.value = true
}

async function saveDates() {
  error.value = ''; success.value = ''
  const body = {
    title: datesForm.value.title,
    min_begin: datesForm.value.min_begin ? Math.floor(new Date(datesForm.value.min_begin).getTime() / 1000) : null,
    max_begin: datesForm.value.max_begin ? Math.floor(new Date(datesForm.value.max_begin).getTime() / 1000) : null,
    duration: datesForm.value.duration ? Number(datesForm.value.duration) : null
  }
  const res = await fetch('/api/company/internship/dates', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  })
  if (!res.ok) { error.value = await res.text(); return }
  success.value = 'Dates mises à jour'
  showDates.value = false
  fetchAll()
}

onMounted(fetchAll)
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">Mes offres de stage</h1>
        <p class="subtitle">{{ internships.length }} offre{{ internships.length !== 1 ? 's' : '' }}</p>
      </div>
      <button class="btn-primary" @click="showCreate = true">+ Nouvelle offre</button>
    </div>

    <div v-if="error"   class="alert alert-error">{{ error }}</div>
    <div v-if="success" class="alert alert-ok">{{ success }}</div>

    <!-- Modal création -->
    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal">
        <h2 class="modal-title">Créer une offre de stage</h2>
        <div class="field">
          <label>Titre</label>
          <input v-model="createForm.title" placeholder="Développeur fullstack..." />
        </div>
        <div class="field">
          <label>Domaine</label>
          <select v-model="createForm.domain">
            <option value="">-- Choisir --</option>
            <option v-for="d in domains" :key="d.id" :value="d.title">{{ d.title }}</option>
          </select>
        </div>
        <div class="field">
          <label>Description</label>
          <textarea v-model="createForm.abstract" rows="4" placeholder="Missions proposées..."></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" @click="showCreate = false">Annuler</button>
          <button class="btn-primary" @click="createInternship">Créer</button>
        </div>
      </div>
    </div>

    <!-- Modal dates -->
    <div v-if="showDates" class="modal-overlay" @click.self="showDates = false">
      <div class="modal">
        <h2 class="modal-title">Modifier les dates</h2>
        <p class="modal-sub">{{ datesForm.title }}</p>
        <div class="field">
          <label>Date de début min</label>
          <input type="date" v-model="datesForm.min_begin" />
        </div>
        <div class="field">
          <label>Date de début max</label>
          <input type="date" v-model="datesForm.max_begin" />
        </div>
        <div class="field">
          <label>Durée (semaines)</label>
          <input type="number" v-model="datesForm.duration" placeholder="12" min="1" />
        </div>
        <div class="modal-actions">
          <button class="btn-ghost" @click="showDates = false">Annuler</button>
          <button class="btn-primary" @click="saveDates">Enregistrer</button>
        </div>
      </div>
    </div>

    <!-- Cartes offres -->
    <div v-if="!loading" class="grid">
      <div v-for="i in internships" :key="i.id" class="card">
        <div class="card-top">
          <span class="domain-tag">{{ i.domain_title || '?' }}</span>
          <div class="card-actions">
            <button class="btn-sm btn-edit" @click="openDates(i)">Dates</button>
            <button class="btn-sm btn-del"  @click="deleteInternship(i.title)">Supprimer</button>
          </div>
        </div>
        <h3 class="card-title">{{ i.title }}</h3>
        <p class="card-abstract">{{ i.abstract || 'Aucune description.' }}</p>
        <div class="card-meta">
          <span> {{ fmt(i.min_begin) }} → {{ fmt(i.max_begin) }}</span>
          <span> {{ i.duration ?? '?' }} sem.</span>
        </div>
      </div>
      <p v-if="internships.length === 0" class="empty">Aucune offre. Créez-en une.</p>
    </div>
    <p v-else class="loading">Chargement…</p>
  </div>
</template>


<style scoped>

.page {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --bg-page: #f8fafc;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --danger: #ef4444;

  width: 100%;
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--text-main);
}


.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.title { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; margin: 0; }
.subtitle { color: var(--text-muted); font-size: 0.95rem; margin-top: 0.3rem; }


.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.domain-tag {
  background: #f5f3ff;
  color: #4f46e5;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
}

.card-abstract {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}


.btn-primary {
  background: var(--primary);
  color: white;
  padding: 0.7rem 1.4rem;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }

.card-actions { display: flex; gap: 0.5rem; }

.btn-sm {
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-edit { background: #f1f5f9; color: #475569; }
.btn-del { background: #fef2f2; color: #ef4444; }


.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  animation: modalIn 0.3s ease-out;
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-title { font-size: 1.4rem; font-weight: 800; margin-bottom: 1.5rem; }
.modal-sub { color: var(--text-muted); margin: -1rem 0 1.5rem 0; font-size: 0.9rem; }


.field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.2rem; }
.field label { font-size: 0.85rem; font-weight: 600; color: #475569; }
.field input, .field textarea, .field select {
  padding: 0.75rem;
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.field input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}


.alert {
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}
.alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
.alert-ok { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }

.empty, .loading { padding: 4rem; text-align: center; color: var(--text-muted); font-style: italic; width: 100%; }
</style>