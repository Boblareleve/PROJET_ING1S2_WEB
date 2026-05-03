=====================================================
            PROJET WEB CY TECH - ING1 S2
=====================================================

1. INSTALLATION ET CONFIGURATION
--------------------------------

L'initialisation du projet nécessite l'exécution de scripts Bash
pour configurer l'environnement de base de données.

A. Configuration de la base de données :
   Exécutez le script suivant pour créer la structure des tables :
   
   $ bash scripts/sql.sh setup

B. Insertion des données de test :
   Pour peupler la base avec des exemples de comptes (Admin, 
   Étudiants, Entreprises), lancez la commande suivante :
   
   $ bash scripts/sql.sh test_accounts


2. LANCEMENT DE L'APPLICATION
-----------------------------

Une fois la base de données prête, vous pouvez démarrer le 
serveur de développement via le script situé à la racine :

$ bash restart

Le serveur sera alors accessible sur votre navigateur à 
l'adresse : http://localhost:5173


3. STRUCTURE DU DEPOT
---------------------

- scripts/ : Utilitaires pour la base de données SQL.
- api/     : Backend (requêtes et accès aux données).
- src/     : Code source du frontend (Vue.js).


4. MAINTENANCE
--------------

En cas de problème de droits d'exécution sur les scripts, 
utilisez la commande suivante :

$ chmod +x scripts/*.sh restart
=====================================================