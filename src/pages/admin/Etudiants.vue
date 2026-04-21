<script setup>
import { ref, onMounted } from "vue"

const etudiants = ref([])
const dialog = ref(null)
const form = ref({
  nom: "",
  prenom: "",
  email: ""
})

onMounted(async () => {
  const res = await fetch("http://localhost:3000/etudiants")
  etudiants.value = await res.json()

  dialog.value.addEventListener("close", async () => {
  if (dialog.value.returnValue === "submit") {
    // Trouver l'index de l'étudiant à modifier
    const index = etudiants.value.findIndex(e => e.id === form.value.id)
    if (index !== -1) {
      // Mettre à jour l'étudiant dans la liste
      etudiants.value[index] = { ...form.value }
      // Envoyer la mise à jour au serveur (ex: via une API)
      await fetch(`http://localhost:3000/etudiants/${form.value.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form.value)
      })
    }
  }
})
})

const modifierEtudiant = (etudiant) => {
  // Pré-remplir le formulaire
  form.value = { ...etudiant }

  // Ouvrir le dialog
  dialog.value.showModal()
}

</script>


<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Prénom</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="etudiant in etudiants" :key="etudiant.id">
          <td>{{ etudiant.nom }}</td>
          <td>{{ etudiant.prenom }}</td>
          <td>{{ etudiant.email }}</td>
          <td>
            <button @click="modifierEtudiant(etudiant)">Modifier</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- POPUP MODAL -->
    <dialog ref="dialog">
      <form method="dialog">
        <label>Nom :</label>
        <input type="text" v-model="form.nom">

        <label>Prénom :</label>
        <input type="text" v-model="form.prenom">

        <label>Email :</label>
        <input type="email" v-model="form.email">

        <button type="submit" value="submit">Enregistrer</button>
      </form>
    </dialog>
  </div>
</template>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
  }
  button {
    padding: 5px 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
  }
  button:hover {
    background-color: #45a049;
  }
  dialog {
    border: none;
    border-radius: 5px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  dialog form {
    display: flex;
    flex-direction: column;
  }
  dialog label {
    margin-top: 10px;
  }
  dialog input {
    padding: 5px;
    margin-top: 5px;
  }
</style>