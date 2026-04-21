import Dashboard from "@/pages/admin/Dashboard.vue";
import Entreprise from "@/pages/admin/Entreprise.vue";
import Formations from "@/pages/admin/Formations.vue";
import Offre from "@/pages/admin/Offre.vue";
import Users from "@/pages/admin/Users.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import Etudiants from "@/pages/admin/Etudiants.vue";
import Professeurs from "@/pages/admin/Professeurs.vue";

export const adminRouter = [
    {
        path: "/admin",
        component: AdminLayout,
        meta: {role: 0},
        children:[
            {
                path: "dashboard",
                component: Dashboard,
                meta: {title: "Dashboard", role: 0}
                
            },
            {
                path: "entreprise",
                component: Entreprise,
                meta: {title: "Entreprise", role: 0}
                
            },
            {
                path: "formation",
                component: Formations,
                meta: {title: "Formations", role: 0}
            },
            {
                path: "offre",
                component: Offre,
                meta: {title: "Offre", role: 0}
            },
            {
                path: "user",
                component: Users,
                meta: {title: "Users", role: 0}
            },
            {
                path: "etudiants",
                component: Etudiants,
                meta: {title: "Etudiants", role: 0}
            },
            {
                path: "professeurs",
                component: Professeurs,
                meta: {title: "Professeurs", role: 0}
            }
        

        ]
    }
    
]