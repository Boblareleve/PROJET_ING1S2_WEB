<script setup>
    import { useRouter } from "vue-router";
  const router = useRouter()
</script>

<template>
  <div class="dashboard">

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