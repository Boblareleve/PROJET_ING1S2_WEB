  <script setup>
  import { ref, onMounted, computed } from "vue"

  const accounts = ref([])
  const dialog = ref(null)
  const isEditing = ref(false)
  const form = ref({
    email: "",
    password: "",
    role: "student",
    first_name: "",
    last_name: "",
    name_company: "",
    url_site: ""
  })

  const ROLES = [
    { value: 0, label: "Admin" },
    { value: 1, label: "Professeur" },
    { value: 2, label: "Étudiant" },
    { value: 3, label: "Entreprise" }
  ]
  const API = "/api"

  const isCompany = computed(() => form.value.role === 3)

  async function fetchAccounts() {
    const res = await fetch(`${API}/admin/accounts`, { credentials: "include" })
    accounts.value = await res.json()
  }

  onMounted(fetchAccounts)

  function openCreate() {
    isEditing.value = false
    form.value = { email: "", password: "", role: 0, first_name: "", last_name: "", name_company: "", url_site: "" }
    dialog.value.showModal()
  }

  function openEdit(account) {
    isEditing.value = true
    form.value = { ...account, password: "" }
    dialog.value.showModal()
  }

  async function onSubmit() {
    if (isEditing.value) {
      const body = { email: form.value.email }
      if (form.value.role === "company") {
        body.name_company = form.value.name_company
        body.url_site     = form.value.url_site
      } else {
        body.first_name = form.value.first_name
        body.last_name  = form.value.last_name
      }
      await fetch(`${API}/admin/account/${form.value.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
    } else {
      await fetch(`${API}/admin/accounts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form.value)
      })
    }
    dialog.value.close()
    await fetchAccounts()
  }

  async function deleteAccount(id) {
    if (!confirm("Supprimer ce compte ?")) return
    await fetch(`${API}/admin/account/${id}`, {
      method: "DELETE",
      credentials: "include"
    })
    await fetchAccounts()
  }

  function roleLabel(role) {
    return { 0: "Admin", 1: "Professeur", 2: "Étudiant", 3: "Entreprise" }[role] ?? role
  }

  function roleBadgeClass(role) {
    return {
      0: "badge badge-admin",
      1: "badge badge-supervisor",
      2: "badge badge-student",
      3: "badge badge-company"
    }[role] ?? "badge"
  }
  </script>

  <template>
    <div class="container">
      <div class="header">
        <h2>Gestion des comptes</h2>
        <button class="btn btn-primary" @click="openCreate">+ Ajouter un compte</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Nom / Société</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="account in accounts" :key="account.id">
            <td class="id-cell">{{ account.id }}</td>
            <td>{{ account.email }}</td>
            <td><span :class="roleBadgeClass(account.role)">{{ roleLabel(account.role) }}</span></td>
            <td>
              <span v-if="account.role === 'company'">{{ account.name_company }}</span>
              <span v-else>{{ account.first_name }} {{ account.last_name }}</span>
            </td>
            <td class="actions">
              <button class="btn btn-edit" @click="openEdit(account)">✏️ Modifier</button>
              <button class="btn btn-delete" @click="deleteAccount(account.id)">🗑️ Supprimer</button>
            </td>
          </tr>
          <tr v-if="accounts.length === 0">
            <td colspan="5" class="empty">Aucun compte trouvé</td>
          </tr>
        </tbody>
      </table>

      <dialog ref="dialog">
        <div class="dialog-header">
          <h3>{{ isEditing ? "Modifier le compte" : "Créer un compte" }}</h3>
          <button class="btn-close" @click="dialog.close()">✕</button>
        </div>

        <form @submit.prevent="onSubmit">
          <div class="field">
            <label>Email</label>
            <input type="email" v-model="form.email" required />
          </div>

          <template v-if="!isEditing">
            <div class="field">
              <label>Mot de passe</label>
              <input type="password" v-model="form.password" required />
            </div>
            <div class="field">
              <label>Rôle</label>
              <select v-model="form.role">
                <option v-for="r in ROLES" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </div>
          </template>

          <!-- Champs entreprise -->
          <template v-if="isCompany">
            <div class="field">
              <label>Nom de l'entreprise</label>
              <input type="text" v-model="form.name_company" :required="!isEditing" />
            </div>
            <div class="field">
              <label>Site web</label>
              <input type="url" v-model="form.url_site" placeholder="https://..." />
            </div>
          </template>

          <!-- Champs personne -->
          <template v-else>
            <div class="field">
              <label>Prénom</label>
              <input type="text" v-model="form.first_name" />
            </div>
            <div class="field">
              <label>Nom</label>
              <input type="text" v-model="form.last_name" />
            </div>
          </template>

          <div class="dialog-actions">
            <button type="button" class="btn btn-secondary" @click="dialog.close()">Annuler</button>
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? "Enregistrer" : "Créer" }}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  </template>

  <style scoped>
  .container { padding: 24px; font-family: sans-serif; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .header h2 { margin: 0; }

  table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
  th { background: #f5f5f5; padding: 12px 16px; text-align: left; font-size: 13px; color: #555; }
  td { padding: 12px 16px; border-top: 1px solid #eee; font-size: 14px; }
  .id-cell { color: #aaa; font-size: 12px; }
  .empty { text-align: center; color: #aaa; padding: 32px; }

  .actions { display: flex; gap: 8px; }

  .btn { padding: 6px 14px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; }
  .btn-primary   { background: #4f46e5; color: white; }
  .btn-primary:hover { background: #4338ca; }
  .btn-secondary { background: #e5e7eb; color: #333; }
  .btn-secondary:hover { background: #d1d5db; }
  .btn-edit   { background: #fef3c7; color: #92400e; }
  .btn-edit:hover { background: #fde68a; }
  .btn-delete { background: #fee2e2; color: #991b1b; }
  .btn-delete:hover { background: #fecaca; }

  .badge { padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .badge-student    { background: #dbeafe; color: #1e40af; }
  .badge-supervisor { background: #d1fae5; color: #065f46; }
  .badge-company    { background: #fef9c3; color: #854d0e; }
  .badge-admin      { background: #f3e8ff; color: #6b21a8; }

  dialog { border: none; border-radius: 12px; padding: 24px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); min-width: 360px; }
  dialog::backdrop { background: rgba(0,0,0,0.4); }
  .dialog-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .dialog-header h3 { margin: 0; }
  .btn-close { background: none; border: none; font-size: 18px; cursor: pointer; color: #888; padding: 0; }

  .field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
  .field label { font-size: 13px; font-weight: 500; color: #444; }
  .field input, .field select { padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
  .field input:focus, .field select:focus { outline: 2px solid #4f46e5; border-color: transparent; }

  .dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
  </style>