<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Result {
  id: number
  title: string; abstract: string
  domain: { title: string } | null
  company: { name_company: string } | null
  min_begin: number|null; max_begin: number|null; duration: number|null
}

const domains  = ref<any[]>([])
const results  = ref<Result[]>([])
const loading  = ref(false)
const error    = ref('')
const success  = ref('')
const searched = ref(false)

const filters = ref({ domain: '', date: { min: '', max: '' }, duration: '' })

const showApplyModal = ref(false)
const applyTarget    = ref<Result | null>(null)
const applyFiles     = ref<File[]>([])
const applyLoading   = ref(false)

function fmt(unix: number|null) {
  if (!unix) return '—'
  return new Date(unix * 1000).toLocaleDateString('fr-FR')
}

async function fetchDomains() {
  const res = await fetch('/api/query/domains', { credentials: 'include' })
  if (res.ok) domains.value = await res.json()
}

async function search() {
  loading.value = true; error.value = ''; searched.value = true
  const body: any = {
    domain:   filters.value.domain   || null,
    date:     null,
    duration: filters.value.duration ? Number(filters.value.duration) : null
  }
  if (filters.value.date.min || filters.value.date.max) {
    body.date = {
      min: filters.value.date.min ? Math.floor(new Date(filters.value.date.min).getTime() / 1000) : 0,
      max: filters.value.date.max ? Math.floor(new Date(filters.value.date.max).getTime() / 1000) : 9999999999
    }
  }
  const res = await fetch('/api/query/internship', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  })
  if (!res.ok) { error.value = await res.text(); loading.value = false; return }
  results.value = await res.json()
  loading.value = false
}

function openApplyModal(r: Result) {
  applyTarget.value = r
  applyFiles.value  = []
  error.value       = ''
  success.value     = ''
  showApplyModal.value = true
}

function closeApplyModal() {
  showApplyModal.value = false
  applyTarget.value    = null
  applyFiles.value     = []
}

function onFilePick(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) applyFiles.value = Array.from(input.files)
}

function removeFile(index: number) {
  applyFiles.value = applyFiles.value.filter((_, i) => i !== index)
}

async function submitApply() {
  if (!applyTarget.value) return
  error.value = ''; applyLoading.value = true

  // 1. Envoyer la candidature
  const applyRes = await fetch('/api/student/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ internship_id: applyTarget.value.id })
  })

  if (!applyRes.ok) {
    error.value = await applyRes.text()
    applyLoading.value = false
    return
  }

  // 2. Si des fichiers sont joints, les envoyer via la route dédiée
  if (applyFiles.value.length > 0) {
    const formData = new FormData()
    formData.append('internship_id', String(applyTarget.value.id))
    for (const file of applyFiles.value)
      formData.append('files', file)

    const docRes = await fetch('/api/student/apply/documents', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })

    if (!docRes.ok) {
      // Candidature OK mais upload raté — on prévient sans bloquer
      success.value = `Candidature envoyée, mais l'envoi des fichiers a échoué : ${await docRes.text()}`
      applyLoading.value = false
      closeApplyModal()
      return
    }
  }

  success.value = applyFiles.value.length > 0
    ? `Candidature envoyée avec ${applyFiles.value.length} document(s) !`
    : `Candidature envoyée pour « ${applyTarget.value.title} » !`

  applyLoading.value = false
  closeApplyModal()
}

async function requestDomain() {
  const domain = prompt('Nom du domaine à demander :')
  if (!domain) return
  const res = await fetch('/api/student/request/domain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ domain })
  })
  success.value = res.ok ? `Demande envoyée pour "${domain}"` : await res.text()
}

onMounted(fetchDomains)
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">Trouver un stage</h1>
        <p class="subtitle">Filtrez et postulez directement</p>
      </div>
      <button class="btn-ghost" @click="requestDomain">+ Demander un domaine</button>
    </div>

    <div v-if="error"   class="alert alert-error">{{ error }}</div>
    <div v-if="success" class="alert alert-ok">{{ success }}</div>

    <!-- Filtres -->
    <div class="filters-bar">
      <div class="filter-group">
        <label>Domaine</label>
        <select v-model="filters.domain">
          <option value="">Tous</option>
          <option v-for="d in domains" :key="d.id" :value="d.title">{{ d.title }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Début (min)</label>
        <input type="date" v-model="filters.date.min" />
      </div>
      <div class="filter-group">
        <label>Début (max)</label>
        <input type="date" v-model="filters.date.max" />
      </div>
      <div class="filter-group">
        <label>Durée (sem.)</label>
        <input type="number" v-model="filters.duration" placeholder="12" min="1" />
      </div>
      <button class="btn-search" @click="search">Rechercher</button>
    </div>

    <!-- Résultats -->
    <div v-if="loading" class="loading">Recherche…</div>
    <div v-else-if="searched && results.length === 0" class="empty">Aucun stage trouvé.</div>
    <div v-else-if="results.length > 0" class="grid">
      <div v-for="r in results" :key="r.title" class="card">
        <div class="card-top">
          <span class="domain-tag">{{ r.domain?.title ?? '?' }}</span>
          <span class="company-tag">{{ r.company?.name_company ?? '?' }}</span>
        </div>
        <h3 class="card-title">{{ r.title }}</h3>
        <p class="card-abstract">{{ r.abstract || 'Aucune description.' }}</p>
        <div class="card-meta">
          <span>📅 {{ fmt(r.min_begin) }} → {{ fmt(r.max_begin) }}</span>
          <span>⏱ {{ r.duration ?? '?' }} sem.</span>
        </div>
        <button class="btn-apply" @click="openApplyModal(r)">Postuler</button>
      </div>
    </div>
    <div v-else class="placeholder">
      <div class="ph-icon">◈</div>
      <p>Lancez une recherche pour voir les offres disponibles</p>
    </div>

    <!-- Modal candidature -->
    <div v-if="showApplyModal" class="modal-overlay" @click.self="closeApplyModal">
      <div class="modal">
        <button class="modal-close" @click="closeApplyModal">✕</button>

        <div v-if="applyTarget" class="modal-stage-info">
          <div class="modal-tags">
            <span class="domain-tag">{{ applyTarget.domain?.title ?? '?' }}</span>
            <span class="company-tag">{{ applyTarget.company?.name_company ?? '?' }}</span>
          </div>
          <h2 class="modal-title">{{ applyTarget.title }}</h2>
          <div class="modal-meta">
            <span>📅 {{ fmt(applyTarget.min_begin) }} → {{ fmt(applyTarget.max_begin) }}</span>
            <span>⏱ {{ applyTarget.duration ?? '?' }} sem.</span>
          </div>
        </div>

        <div class="modal-divider"></div>

        <!-- Upload CV / LM -->
        <div class="field">
          <label>
            Documents de candidature
            <span class="label-optional">(optionnel)</span>
          </label>
          <p class="field-hint">CV, lettre de motivation, portfolio…</p>

          <div class="file-drop">
            <input
              type="file"
              multiple
              id="applyFileInput"
              class="file-input-hidden"
              @change="onFilePick"
            />
            <label for="applyFileInput" class="file-drop-label">
              <span class="file-drop-icon">📎</span>
              <span>Cliquez pour ajouter des fichiers</span>
            </label>
          </div>

          <!-- Liste des fichiers sélectionnés -->
          <ul v-if="applyFiles.length > 0" class="file-list">
            <li v-for="(f, i) in applyFiles" :key="f.name" class="file-chip">
              <span class="file-chip-name">{{ f.name }}</span>
              <button class="file-chip-remove" @click="removeFile(i)" title="Retirer">✕</button>
            </li>
          </ul>
        </div>

        <div class="modal-actions">
          <button class="btn-ghost" @click="closeApplyModal" :disabled="applyLoading">Annuler</button>
          <button class="btn-apply-modal" @click="submitApply" :disabled="applyLoading">
            {{ applyLoading ? 'Envoi…' : 'Envoyer la candidature' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { max-width: 1200px; margin: 0 auto; padding: 2rem; font-family: 'Inter', system-ui, sans-serif; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
.title { font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0; }
.subtitle { color: #64748b; margin-top: 0.25rem; }

.filters-bar { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; gap: 1.5rem; align-items: flex-end; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 2.5rem; }
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
.filter-group label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.025em; }
.filter-group select, .filter-group input { padding: 0.6rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; color: #1e293b; background: #f8fafc; transition: all 0.2s; }
.filter-group input:focus, .filter-group select:focus { outline: none; border-color: #4f46e5; background: white; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }

.btn-search { background: #4f46e5; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; }
.btn-search:hover { background: #4338ca; transform: translateY(-1px); }
.btn-ghost { background: #f1f5f9; color: #475569; padding: 0.6rem 1rem; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; }
.btn-ghost:hover { background: #e2e8f0; }
.btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
.card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; transition: all 0.3s ease; }
.card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.1); border-color: #4f46e5; }
.card-top { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.domain-tag { background: #eff6ff; color: #2563eb; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.company-tag { background: #f8fafc; color: #64748b; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; border: 1px solid #e2e8f0; }
.card-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0 0 0.75rem; line-height: 1.3; }
.card-abstract { color: #64748b; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; flex-grow: 1; }
.card-meta { display: flex; justify-content: space-between; padding-top: 1rem; margin-bottom: 1.5rem; border-top: 1px dashed #e2e8f0; font-size: 0.85rem; color: #475569; font-weight: 500; }
.btn-apply { width: 100%; background: #4f46e5; color: white; padding: 0.8rem; border-radius: 10px; font-weight: 600; border: none; cursor: pointer; transition: background 0.2s; }
.btn-apply:hover { background: #4338ca; }

.alert { padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-weight: 600; font-size: 0.9rem; }
.alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
.alert-ok    { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
.placeholder { text-align: center; padding: 5rem 0; color: #94a3b8; }
.ph-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
.loading, .empty { text-align: center; padding: 3rem; color: #64748b; font-style: italic; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
.modal { background: white; border-radius: 20px; padding: 2rem; width: 100%; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); position: relative; animation: modalIn 0.2s ease; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.modal-close { position: absolute; top: 1rem; right: 1rem; background: #f1f5f9; border: none; border-radius: 8px; width: 32px; height: 32px; cursor: pointer; font-size: 0.85rem; color: #64748b; }
.modal-close:hover { background: #e2e8f0; }
.modal-tags { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
.modal-title { font-size: 1.4rem; font-weight: 800; color: #1e293b; margin: 0 0 0.5rem; line-height: 1.3; }
.modal-meta { display: flex; gap: 1rem; font-size: 0.85rem; color: #64748b; font-weight: 500; }
.modal-divider { border: none; border-top: 1px dashed #e2e8f0; margin: 1.25rem 0; }

/* Champ upload */
.field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
.field > label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.025em; }
.label-optional { font-weight: 400; text-transform: none; color: #94a3b8; font-size: 0.75rem; letter-spacing: 0; }
.field-hint { margin: 0; font-size: 0.82rem; color: #94a3b8; }

.file-drop { position: relative; }
.file-input-hidden { display: none; }
.file-drop-label { display: flex; align-items: center; gap: 0.75rem; padding: 0.9rem 1rem; border: 2px dashed #cbd5e1; border-radius: 10px; cursor: pointer; color: #64748b; font-size: 0.9rem; transition: all 0.2s; background: #f8fafc; }
.file-drop-label:hover { border-color: #4f46e5; background: #eff6ff; color: #4f46e5; }
.file-drop-icon { font-size: 1.1rem; }

/* Liste fichiers */
.file-list { list-style: none; margin: 0.5rem 0 0; padding: 0; display: flex; flex-direction: column; gap: 0.4rem; }
.file-chip { display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 0.4rem 0.75rem; }
.file-chip-name { font-size: 0.82rem; color: #1e40af; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-chip-remove { background: none; border: none; color: #93c5fd; cursor: pointer; font-size: 0.75rem; padding: 0 0 0 0.5rem; flex-shrink: 0; }
.file-chip-remove:hover { color: #2563eb; }

.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
.btn-apply-modal { background: #4f46e5; color: white; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 600; border: none; cursor: pointer; transition: background 0.2s; }
.btn-apply-modal:hover:not(:disabled) { background: #4338ca; }
.btn-apply-modal:disabled { opacity: 0.6; cursor: not-allowed; }
</style>