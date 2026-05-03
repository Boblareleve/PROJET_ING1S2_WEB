<script setup lang="ts">
import { ref, onMounted } from 'vue'

const applications = ref<any[]>([])
const loading      = ref(false)

const STATUS_LABEL: Record<string, string> = {
  pending:   'En attente',
  accepted:  'Acceptée',
  rejected:  'Refusée',
  validated: 'Validée'
}
const STATUS_CLASS: Record<string, string> = {
  pending:   'status-pending',
  accepted:  'status-ok',
  rejected:  'status-bad',
  validated: 'status-done'
}

function fmt(unix: number) {
  return new Date(unix * 1000).toLocaleDateString('fr-FR')
}

async function fetchApplications() {
  loading.value = true
  const res = await fetch('/api/student/applications', { credentials: 'include' })
  if (res.ok) applications.value = await res.json()
  loading.value = false
}

onMounted(fetchApplications)
</script>

<template>
  <div class="page">
    <h1 class="title">Mes candidatures</h1>
    <p class="subtitle">Suivi en temps réel de vos dossiers</p>

    <div v-if="!loading && applications.length > 0" class="list">
      <div v-for="app in applications" :key="app.internship_title + app.applied_at" class="item">
        <div class="item-left">
          <div class="item-tags">
            <span class="tag-domain">{{ app.domain }}</span>
            <span class="tag-company">{{ app.company_name }}</span>
          </div>
          <h3 class="item-title">{{ app.internship_title }}</h3>
          <p class="item-date">Candidature envoyée le {{ fmt(app.applied_at) }}</p>
        </div>
        <div class="item-right">
          <span class="status-badge" :class="STATUS_CLASS[app.status] ?? ''">
            {{ STATUS_LABEL[app.status] ?? app.status }}
          </span>
        </div>
      </div>
    </div>
    <p v-else-if="loading" class="loading">Chargement…</p>
    <div v-else class="empty-state">
      <div class="empty-icon">◇</div>
      <p>Vous n'avez encore postulé à aucune offre.</p>
      <router-link to="/student/search" class="btn-cta">Chercher un stage →</router-link>
    </div>
  </div>
</template>


<style>
/* ====== STRUCTURE DE LA PAGE ====== */
.page {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ====== EN-TÊTE ====== */
.title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.subtitle {
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 32px;
}

/* ====== LISTE DES CANDIDATURES ====== */
.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

/* Partie gauche de la ligne */
.item-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-tags {
  display: flex;
  gap: 10px;
  align-items: center;
}

.tag-domain {
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.02em;
}

.tag-company {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.item-title {
  margin: 0;
  font-size: 1.2rem;
  color: #1e293b;
  font-weight: 700;
}

.item-date {
  margin: 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

/* ====== BADGES DE STATUT ====== */
.status-badge {
  padding: 8px 16px;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
  min-width: 110px;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-ok {
  background: #dcfce7;
  color: #166534;
}

.status-bad {
  background: #fee2e2;
  color: #991b1b;
}

.status-done {
  background: #e0e7ff;
  color: #3730a3;
}

/* ====== ÉTATS VIDES & CHARGEMENT ====== */
.loading {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: white;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
}

.empty-icon {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-state p {
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 24px;
}

.btn-cta {
  display: inline-block;
  background: #4f46e5;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-cta:hover {
  background: #4338ca;
}
</style>