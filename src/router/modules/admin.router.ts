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
        meta: {role:"admin"},
        children:[
            {
                path: "dashboard",
                component: Dashboard,
                meta: {title: "Dashboard", role: "admin"}
                
            },
            {
                path: "entreprise",
                component: Entreprise,
                meta: {title: "Entreprise", role: "admin"}
                
            },
            {
                path: "formation",
                component: Formations,
                meta: {title: "Formations", role: "admin"}
            },
            {
                path: "offre",
                component: Offre,
                meta: {title: "Offre", role: "admin"}
            },
            {
                path: "user",
                component: Users,
                meta: {title: "Users", role: "admin"}
            },
            {
                path: "etudiants",
                component: Etudiants,
                meta: {title: "Etudiants", role:"admin"}
            },
            {
                path: "professeurs",
                component: Professeurs,
                meta: {title: "Professeurs", role:"admin"}
            }
        

        ]
    }
    
]