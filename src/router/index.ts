import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user.stores'
import { ROLE } from '../../share/role'

// Layouts
import AdminLayout      from '@/layouts/AdminLayout.vue'
import CompanyLayout    from '@/layouts/CompanyLayout.vue'
import StudentLayout    from '@/layouts/StudentLayout.vue'
import SupervisorLayout from '@/layouts/SupervisorLayout.vue'

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

// Supervisor views
import SupervisorStudents from '@/pages/supervisor/SupervisorStudents.vue'
import SupervisorOffers   from '@/pages/supervisor/SupervisorOffers.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/auth/login' },

    {
      path: '/auth/login',
      component: () => import('@/pages/auth/Login.vue'),
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

    // --- Superviseur ---
    {
      path: '/supervisor',
      component: SupervisorLayout,
      meta: { requiresRole: ROLE.SUPERVISOR },
      children: [
        { path: '',        redirect: '/supervisor/students' },
        { path: 'students', component: SupervisorStudents, meta: { title: 'Mes étudiants' } },
        { path: 'offers',   component: SupervisorOffers,   meta: { title: 'Offres disponibles' } },
      ]
    },

    { path: '/:pathMatch(.*)*', redirect: '/auth/login' }
  ]
})

router.beforeEach((to) => {
  if (to.meta.public) return true

  const user = useUserStore()

  if (!user.isConnected) return '/auth/login'

  const requiredRole = to.matched.find(record => record.meta.requiresRole)?.meta.requiresRole

  if (requiredRole !== undefined && user.user?.role !== requiredRole) {
    const roleRedirects: Record<number, string> = {
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