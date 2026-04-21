import EntrepriseLayout from "@/layouts/EntrepriseLayout.vue";
import Dashboard from "@/pages/entreprise/Dashboard.vue";

export const entrepriseRouter = [
    {
        path: "/admin",
        component: EntrepriseLayout,
        meta: {role: 3},
        children:[
            {
                path: "dashboard",
                component: Dashboard,
                meta: {title: "Dashboard", role: 3}
                
            },
            {
                path: "offre",
                component: Dashboard,
                meta: {title: "Offre", role: 3}
            }
            

        ]
    }
    
]