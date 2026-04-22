import EntrepriseLayout from "@/layouts/EntrepriseLayout.vue";
import AjoutOffre from "@/pages/entreprise/AjoutOffre.vue";
import Dashboard from "@/pages/entreprise/Dashboard.vue";

export const entrepriseRouter = [
    {
        path: "/entreprise",
        component: EntrepriseLayout,
        meta: {role: 3},
        children:[
            {
                path: "dashboard",
                component: Dashboard,
                meta: {title: "Dashboard", role: 3}
                
            },
            {
                path: "ajouter-offre",
                component: AjoutOffre,
                meta: {title: "Offre", role: 3}
            }
            

        ]
    }
    
]
