<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from "vue-router"

const router = useRouter()

const accounts    = ref([])
const domains     = ref([])
const internships = ref([])

const latestOffers   = ref([])
const latestStudents = ref([])

onMounted(async () => {
  const [accRes, domRes] = await Promise.all([
    fetch('/api/admin/accounts', { credentials: 'include' }),
    fetch('/api/query/domains',  { credentials: 'include' }),
  ])

  if (accRes.ok) {
    accounts.value = await accRes.json()
    latestStudents.value = accounts.value
      .filter(a => a.role === 2)
      .slice(-3)
      .reverse()
      .map(a => a.email)
  }

  if (domRes.ok) {
    domains.value = await domRes.json()
  }

  const intRes = await fetch('/api/query/internship', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ domain: null, date: null, duration: null })
  })
  if (intRes.ok) {
    internships.value = await intRes.json()
    latestOffers.value = internships.value.slice(-3).reverse().map(i => i.title)
  }
})
</script>

<template>
  <div class="dashboard">

    <!-- 1. Statistiques globales -->
    <section class="stats">
      <div class="card stat-card">Étudiants:<br>{{ accounts.filter(a => a.role === 2).length }}</div>
      <div class="card stat-card">Entreprises:<br>{{ accounts.filter(a => a.role === 3).length }}</div>
      <div class="card stat-card">Offres:<br>{{ internships.length }}</div>
      <div class="card stat-card">Domaines:<br>{{ domains.length }}</div>
      <div class="card stat-card">Comptes total:<br>{{ accounts.length }}</div>
    </section>

    <!-- 2. Répartition des comptes -->
    <section class="stages-tracking">
      <div class="card stage-card">Admins:<br>{{ accounts.filter(a => a.role === 0).length }}</div>
      <div class="card stage-card">Tuteurs:<br>{{ accounts.filter(a => a.role === 1).length }}</div>
      <div class="card stage-card">Étudiants:<br>{{ accounts.filter(a => a.role === 2).length }}</div>
      <div class="card stage-card">Entreprises:<br>{{ accounts.filter(a => a.role === 3).length }}</div>
    </section>

    <!-- 3. Activités récentes -->
    <section class="activities">
      <div class="card activity-card latest-offers">
        <h3>Dernières offres publiées</h3>
        <ul>
          <li v-if="latestOffers.length === 0">Aucune offre</li>
          <li v-for="o in latestOffers" :key="o">{{ o }}</li>
        </ul>
      </div>

      <div class="card activity-card latest-students">
        <h3>Derniers étudiants inscrits</h3>
        <ul>
          <li v-if="latestStudents.length === 0">Aucun étudiant</li>
          <li v-for="s in latestStudents" :key="s">{{ s }}</li>
        </ul>
      </div>

      <div class="card activity-card latest-archives">
        <h3>Domaines disponibles</h3>
        <ul>
          <li v-if="domains.length === 0">Aucun domaine</li>
          <li v-for="d in domains.slice(0, 3)" :key="d.id">{{ d.title }}</li>
        </ul>
      </div>
    </section>

    <!-- 4. Actions rapides -->
    <section class="shortcuts">
      <router-link to="/admin/domains">
        <button>Gérer les domaines</button>
      </router-link>
      <router-link to="/admin/accounts">
        <button>Gérer les comptes</button>
      </router-link>
    </section>

  </div>
</template>

<style>
  .dashboard {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px;
}

/* --- STATISTIQUES --- */
.stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-weight: 600;
}

/* --- SUIVI DES STAGES --- */
.stages-tracking {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stage-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-weight: 600;
}

/* --- ACTIVITÉS RÉCENTES --- */
.activities {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.activity-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.activity-card h3 {
  margin-bottom: 10px;
  font-size: 18px;
}

/* --- RACCOURCIS --- */
.shortcuts {
  display: flex;
  gap: 15px;
}

.shortcuts button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

.shortcuts button:hover {
  background: #2563eb;
}

@media (max-width: 1200px) {
  .stats { grid-template-columns: repeat(3, 1fr); }
  .stages-tracking { grid-template-columns: repeat(2, 1fr); }
  .activities { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
  .stages-tracking { grid-template-columns: repeat(2, 1fr); }
  .activities { grid-template-columns: 1fr; }
  .shortcuts { flex-direction: column; }
}

@media (max-width: 480px) {
  .stats { grid-template-columns: 1fr; }
  .stages-tracking { grid-template-columns: 1fr; }
}
</style>