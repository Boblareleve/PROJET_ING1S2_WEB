import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user.stores'
import { ROLE } from '../../share/role'

// Layouts
import AdminLayout      from '@/layouts/AdminLayout.vue'
import CompanyLayout    from '@/layouts/CompanyLayout.vue'
import StudentLayout    from '@/layouts/StudentLayout.vue'

// Admin views
import AdminDashboard from '@/pages/admin/Dashboard.vue'
import AdminDomains   from '@/pages/admin/AdminDomains.vue'
import AdminAccounts  from '@/pages/admin/AdminAccounts.vue'


// Company views
import CompanyInternships from '@/pages/entreprise/CompanyInternships.vue'
import CompanyApplicants  from '@/pages/entreprise/CompanyApplicants.vue'

// Student views
import StudentSearch       from '@/pages/etudiant/StudentSearch.vue'
import StudentApplications from '@/pages/etudiant/StudentApplications.vue'
import StudentDocuments    from '@/pages/etudiant/StudentDocuments.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // --- Redirect par défaut ---
    { path: '/', redirect: '/auth/login' },

    // --- Auth (existant) ---
    {
      path: '/auth/login',
      component: () => import('@/pages/auth/Login.vue'), // ton composant existant
      meta: { public: true }
    },

    // --- Admin ---
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresRole: ROLE.ADMIN },
      children: [
        { path: '',          redirect: '/admin/dashboard' },
        { path: 'dashboard', component: AdminDashboard, meta: { title: 'Dashboard' } },
        { path: 'domains',   component: AdminDomains,   meta: { title: 'Domaines' } },
        { path: 'accounts',  component: AdminAccounts,  meta: { title: 'Comptes' } },
      ]
    },

    // --- Entreprise ---
    {
      path: '/company',
      component: CompanyLayout,
      meta: { requiresRole: ROLE.COMPANY },
      children: [
        { path: '',            redirect: '/company/internships' },
        { path: 'internships', component: CompanyInternships, meta: { title: 'Mes offres' } },
        { path: 'applicants',  component: CompanyApplicants,  meta: { title: 'Candidats' } },
      ]
    },

    // --- Étudiant ---
    {
      path: '/student',
      component: StudentLayout,
      meta: { requiresRole: ROLE.STUDENT },
      children: [
        { path: '',             redirect: '/student/search' },
        { path: 'search',       component: StudentSearch,       meta: { title: 'Chercher un stage' } },
        { path: 'applications', component: StudentApplications, meta: { title: 'Mes candidatures' } },
        { path: 'documents',    component: StudentDocuments,    meta: { title: 'Documents' } },
      ]
    },

  ]
})


router.beforeEach((to) => {
  // 1. Autoriser les routes publiques
  if (to.meta.public) return true

  const user = useUserStore()

  // 2. Vérifier la connexion
  if (!user.isConnected) return '/auth/login'

  // 3. Récupérer le rôle requis en remontant la chaîne des routes (parent -> enfant)
  // .findLast() permet de prendre le rôle le plus spécifique défini
  const requiredRole = to.matched.find(record => record.meta.requiresRole)?.meta.requiresRole

  // 4. Vérification du rôle
  if (requiredRole !== undefined && user.user?.role !== requiredRole) {
    const roleRedirects : Record<number, string> = {
      [ROLE.ADMIN]:      '/admin',
      [ROLE.COMPANY]:    '/company',
      [ROLE.STUDENT]:    '/student',
      [ROLE.SUPERVISOR]: '/supervisor',
    }
    
    return roleRedirects[user.user?.role ?? -1] ?? '/auth/login'
  }

  return true
})

export default router
