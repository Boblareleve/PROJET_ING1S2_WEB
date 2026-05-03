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


<style>
/* Reset local pour s'assurer que le fond s'affiche */
:root {
  --primary: #4c51bf;
  --primary-hover: #434190;
  --bg: #f7fafc;
  --text: #2d3748;
}

/* Force l'application sur toute la page */
.page {
  display: block !important;
  background-color: var(--bg) !important;
  min-height: 100vh;
  padding: 40px 20px;
  font-family: sans-serif;
  color: var(--text);
}

/* En-tête */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #1a202c;
}

/* Boutons */
.btn-primary {
  background-color: var(--primary) !important;
  color: white !important;
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

/* Grille et Cartes */
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.card {
  background: white !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px;
  width: 300px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.domain-tag {
  background: #edf2f7;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #4a5568;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  min-width: 400px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

/* Formulaires */
.field { margin-bottom: 15px; }
.field label { display: block; font-weight: bold; margin-bottom: 5px; }
.field input, .field textarea, .field select {
  width: 100%;
  padding: 8px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
}

/* Alertes */
.alert {
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  border-left: 5px solid;
}
.alert-error { background: #fed7d7; border-color: #f56565; color: #9b2c2c; }
.alert-ok { background: #c6f6d5; border-color: #48bb78; color: #22543d; }
</style>