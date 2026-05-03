<script setup lang="ts">
import { ref, onMounted } from 'vue'

const results   = ref<any[]>([])
const available = ref<any[]>([])
const domains   = ref<any[]>([])
const loading   = ref(false)
const loadingAvail = ref(false)
const searched  = ref(false)
const filters   = ref({ domain: '' })
const error     = ref('')
const success   = ref('')

function fmt(unix: number|null) {
  if (!unix) return '—'
  return new Date(unix * 1000).toLocaleDateString('fr-FR')
}

async function fetchDomains() {
  const res = await fetch('/api/query/domains', { credentials: 'include' })
  if (res.ok) domains.value = await res.json()
}

async function search() {
  loading.value = true; searched.value = true
  const body = { domain: filters.value.domain || null, date: null, duration: null }
  const res = await fetch('/api/query/internship', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  })
  if (res.ok) results.value = await res.json()
  loading.value = false
}

async function fetchAvailable() {
  loadingAvail.value = true
  const res = await fetch('/api/supervisor/available', { credentials: 'include' })
  if (res.ok) available.value = await res.json()
  loadingAvail.value = false
}

async function assign(application_id: number) {
  error.value = ''; success.value = ''
  const res = await fetch('/api/supervisor/assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ application_id })
  })
  if (!res.ok) { error.value = await res.text(); return }
  success.value = 'Vous êtes maintenant tuteur de cet étudiant !'
  fetchAvailable()
}

onMounted(async () => {
  await fetchDomains()
  await search()
  await fetchAvailable()
})
</script>

<template>
  <div class="page">
    <h1 class="title">Offres & Affectations</h1>

    <div v-if="error"   class="alert alert-error">{{ error }}</div>
    <div v-if="success" class="alert alert-ok">{{ success }}</div>

    <!-- Section : étudiants à prendre en charge -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Étudiants sans tuteur</h2>
        <span class="badge-count">{{ available.length }}</span>
      </div>
      <p class="section-sub">Ces candidatures ont été acceptées par l'entreprise mais n'ont pas encore de tuteur. Cliquez sur "Prendre en charge" pour vous affecter.</p>

      <div v-if="loadingAvail" class="loading">Chargement…</div>
      <div v-else-if="available.length === 0" class="empty-inline">Aucun étudiant en attente de tuteur.</div>
      <div v-else class="avail-list">
        <div v-for="a in available" :key="a.application_id" class="avail-card">
          <div class="avail-info">
            <div class="avail-name">{{ a.first_name || '?' }} {{ a.last_name || '' }}</div>
            <div class="avail-email">{{ a.email }}</div>
            <div class="avail-stage">
              <span class="tag-domain">{{ a.domain ?? '?' }}</span>
              <span class="tag-company">{{ a.company }}</span>
              <span class="avail-title">{{ a.internship_title }}</span>
            </div>
          </div>
          <button class="btn-assign" @click="assign(a.application_id)">
            + Prendre en charge
          </button>
        </div>
      </div>
    </section>

    <div class="divider"></div>

    <!-- Section : toutes les offres -->
    <section class="section">
      <h2 class="section-title">Toutes les offres</h2>

      <div class="filters-bar">
        <div class="filter-group">
          <label>Domaine</label>
          <select v-model="filters.domain">
            <option value="">Tous</option>
            <option v-for="d in domains" :key="d.id" :value="d.title">{{ d.title }}</option>
          </select>
        </div>
        <button class="btn-search" @click="search">Filtrer</button>
      </div>

      <div v-if="loading" class="loading">Chargement…</div>
      <div v-else-if="results.length === 0 && searched" class="empty-inline">Aucune offre.</div>
      <div v-else class="grid">
        <div v-for="r in results" :key="r.title" class="card">
          <div class="card-top">
            <span class="tag-domain">{{ r.domain?.title ?? '?' }}</span>
            <span class="tag-company">{{ r.company?.name_company ?? '?' }}</span>
          </div>
          <h3 class="card-title">{{ r.title }}</h3>
          <p class="card-abstract">{{ r.abstract || '—' }}</p>
          <div class="card-meta">
            <span>📅 {{ fmt(r.min_begin) }} → {{ fmt(r.max_begin) }}</span>
            <span>⏱ {{ r.duration ?? '?' }} sem.</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page { max-width: 1100px; margin: 0 auto; padding: 2rem; font-family: 'Inter', system-ui, sans-serif; }
.title { font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0 0 2rem; }

.alert { padding: 0.9rem 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-weight: 600; font-size: 0.9rem; }
.alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
.alert-ok    { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }

/* Sections */
.section { margin-bottom: 2rem; }
.section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.4rem; }
.section-title { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin: 0; }
.section-sub { font-size: 0.85rem; color: #64748b; margin: 0 0 1.25rem; }
.badge-count { background: #ede9fe; color: #6d28d9; padding: 2px 10px; border-radius: 999px; font-size: 0.78rem; font-weight: 700; }

.divider { border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0; }

/* Étudiants sans tuteur */
.avail-list { display: flex; flex-direction: column; gap: 0.75rem; }
.avail-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #6d28d9;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.avail-info { display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; }
.avail-name  { font-weight: 700; color: #1e293b; }
.avail-email { font-size: 0.8rem; color: #94a3b8; font-family: monospace; }
.avail-stage { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem; }
.avail-title { font-size: 0.85rem; color: #475569; }

.btn-assign {
  background: #6d28d9;
  color: white;
  border: none;
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.2s;
}
.btn-assign:hover { background: #5b21b6; }

/* Tags */
.tag-domain  { background: #eff6ff; color: #2563eb; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
.tag-company { background: #f8fafc; color: #64748b; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; border: 1px solid #e2e8f0; white-space: nowrap; }

/* Filtres */
.filters-bar { display: flex; gap: 1rem; align-items: flex-end; margin-bottom: 1.5rem; }
.filter-group { display: flex; flex-direction: column; gap: 0.4rem; }
.filter-group label { font-size: 0.78rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.025em; }
.filter-group select { padding: 0.55rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; background: #f8fafc; min-width: 180px; }

.btn-search { background: #4f46e5; color: white; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; }
.btn-search:hover { background: #4338ca; }

/* Grille offres */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
.card { background: white; border: 1px solid #e2e8f0; border-radius: 14px; padding: 1.25rem; display: flex; flex-direction: column; transition: box-shadow 0.2s; }
.card:hover { box-shadow: 0 8px 16px -6px rgba(0,0,0,0.08); }
.card-top { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
.card-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0 0 0.5rem; line-height: 1.3; }
.card-abstract { color: #64748b; font-size: 0.88rem; line-height: 1.5; flex-grow: 1; margin-bottom: 1rem; }
.card-meta { display: flex; justify-content: space-between; font-size: 0.8rem; color: #94a3b8; padding-top: 0.75rem; border-top: 1px dashed #e2e8f0; }

.loading { text-align: center; padding: 2rem; color: #64748b; font-style: italic; }
.empty-inline { color: #94a3b8; font-style: italic; font-size: 0.9rem; padding: 0.5rem 0; }
</style>