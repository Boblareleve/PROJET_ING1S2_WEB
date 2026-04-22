<template>
    <div class="ajout-offre">
        <h1>Ajouter une Offre de Stage</h1>
        <form @submit.prevent="submitForm">
            <div>
                <label for="titre">Titre de l'offre :</label>
                <input id="titre" v-model="offre.titre" type="text" required>
            </div>
            <div>
                <label for="description">Description :</label>
                <textarea id="description" v-model="offre.description" required></textarea>
            </div>
            <div>
                <label for="duree">Durée (en mois) :</label>
                <input id="duree" v-model.number="offre.duree" type="number" min="1" required>
            </div>
            <div>
                <label for="lieu">Lieu :</label>
                <input id="lieu" v-model="offre.lieu" type="text" required>
            </div>
            <button type="submit">Ajouter l'Offre</button>
        </form>
    </div>
</template>

<script>
import { useUserStore } from '@/stores/user.stores';

export default {
  name: 'AjoutOffre',
  setup() {
    const store = useUserStore();
    return { store };  // expose au template et à this
  },
  data() {
    return {
      offre: {
        titre: '',
        description: '',
        duree: null,
        lieu: ''
      }
    }
  },
  methods: {
    async submitForm() {
      const payload = {
        title: this.offre.titre,
        abstract: this.offre.description
      };

      const res = await fetch('/api/company/internship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        alert(`Erreur: ${await res.text()}`);
        return;
      }

      this.offre = { titre: '', description: '', duree: null, lieu: '' };
      alert('Offre ajoutée avec succès!');
    }
  }
}
</script>

<style scoped>
.ajout-offre {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
}
form div {
    margin-bottom: 15px;
}
label {
    display: block;
    margin-bottom: 5px;
}
input, textarea {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
}
button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
}
button:hover {
    background-color: #0056b3;
}
</style>