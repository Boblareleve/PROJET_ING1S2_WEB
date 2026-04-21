<script setup>
  import { useRouter } from "vue-router";
  const stats = {
    etudiants: 124,
    entreprises: 32,
    offres: 18,
    stagesEnCours: 12,
    archives: 56
  }

  const stages = {
    enCours: 12,
    valides: 8,
    retard: 3,
    attente: 5
  }

  const latestOffers = ["Développeur Web", "Assistant RH", "Technicien Réseau"]
  const latestStudents = ["Martin Dupont", "Sarah Leroy", "Yanis Benali"]
  const latestArchives = ["Dossier #124", "Dossier #122", "Dossier #119"]

  const router = useRouter()
</script>

<template>
  <div class="dashboard">

    <!-- 1. Statistiques globales -->
    <section class="stats">
      <div class="card stat-card">Étudiants:<br>{{stats.etudiants}}</div>
      <div class="card stat-card">Entreprises:<br>{{stats.entreprises}}</div>
      <div class="card stat-card">Offres:<br>{{stats.offres}}</div>
      <div class="card stat-card">Stages en cours:<br>{{stats.stagesEnCours}}</div>
      <div class="card stat-card">Dossiers archivés:<br>{{stats.archives}}</div>
    </section>

    <!-- 2. Suivi des stages -->
    <section class="stages-tracking">
      <div class="card stage-card">En cours:<br>{{stages.enCours}}</div>
      <div class="card stage-card">Validés:<br>{{stages.valides}}</div>
      <div class="card stage-card">En retard:<br>{{stages.retard}}</div>
      <div class="card stage-card">En attente de signature:<br>{{stages.attente}}</div>
    </section>

    <!-- 3. Activités récentes -->
    <section class="activities">
      <div class="card activity-card latest-offers">
        <h3>Dernières offres publiées</h3>
        <ul>
          <li>Offre 1</li>
          <li>Offre 2</li>
          <li>Offre 3</li>
        </ul>
      </div>

      <div class="card activity-card latest-students">
        <h3>Derniers étudiants inscrits</h3>
        <ul>
          <li>Étudiant 1</li>
          <li>Étudiant 2</li>
          <li>Étudiant 3</li>
        </ul>
      </div>

      <div class="card activity-card latest-archives">
        <h3>Derniers dossiers archivés</h3>
        <ul>
          <li>Dossier 1</li>
          <li>Dossier 2</li>
          <li>Dossier 3</li>
        </ul>
      </div>
    </section>

    <!-- 4. Actions rapides -->
    <section class="shortcuts">
      <router-link to="/admin/etudiants">
        <button>Gérer les étudiants</button>
      </router-link>

      
       <router-link to="/admin/professeurs">
        <button>Gérer les professeurs</button>
      </router-link>
      <button>Gérer les jurys</button>
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
  .stats {
    grid-template-columns: repeat(3, 1fr);
  }
  .stages-tracking {
    grid-template-columns: repeat(2, 1fr);
  }
  .activities {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .stages-tracking {
    grid-template-columns: repeat(2, 1fr);
  }
  .activities {
    grid-template-columns: 1fr;
  }
  .shortcuts {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .stats {
    grid-template-columns: 1fr;
  }
  .stages-tracking {
    grid-template-columns: 1fr;
  }
}

</style>