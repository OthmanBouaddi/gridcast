# Instructions pour la compilation du Rapport de Stage en LaTeX

Ce dossier contient votre rapport de stage complet de 2 mois auprès de **LionGeek (filiale / hub d'innovation de 2M)** au format **LaTeX**, rédigé intégralement en **anglais**, avec la page de garde inspirée du modèle officiel EHTP, la modélisation UML complète (TikZ), l'intégration du Chatbot IA, et la partie DevOps.

---

## 📄 Fichiers générés

1. **`report_gridcast_liongeek.tex`** (dans le dossier racine `stageSI/` et dans `stageSI/rapport_latex/`) :
   - Fichier **monolithique autonome 100% prêt à l'emploi**.
   - Contient tous les packages, diagrammes TikZ vectoriels, listings de code et bibliographie.
   - **Aucune dépendance externe ni image manquante** : les diagrammes UML sont tracés directement en code LaTeX vectoriel TikZ pour garantir une compilation immédiate sans erreur.

---

## 🚀 Comment l'utiliser sur Overleaf (1 minute)

1. Ouvrez [Overleaf](https://www.overleaf.com/) et connectez-vous.
2. Cliquez sur **New Project** $\rightarrow$ **Blank Project** et nommez-le par exemple `Rapport_Stage_LionGeek_GridCast`.
3. Ouvrez le fichier `main.tex` créé par défaut dans Overleaf, sélectionnez tout son contenu (`Ctrl + A`) et supprimez-le.
4. Ouvrez le fichier local **`report_gridcast_liongeek.tex`**, copiez tout son texte (`Ctrl + A`, `Ctrl + C`), et collez-le dans Overleaf (`Ctrl + V`).
5. Cliquez sur **Recompile** (ou `Ctrl + S`).
6. Le PDF complet de 35+ pages avec entêtes, sommaire, remerciements, diagrammes UML et DevOps est généré instantanément !

---

## 📋 Structure et Contenu du Rapport

1. **Cover Page & Entêtes institutionnelles** :
   - Royaume du Maroc, Ministère de l'Équipement et des Transports.
   - **École Hassania des Travaux Publics (EHTP)**, Département Informatique & Télécommunications.
   - Organisme d'accueil : **LionGeek** (Hub d'Innovation & Filiale de **SOREAD 2M**).
   - Titre officiel : *Design and Implementation of GridCast: An Audiovisual TV Broadcast Grid Management Platform with an Intelligent AI Assistant and a DevOps Deployment Architecture*.
   - Année universitaire : 2025/2026.

2. **Remerciements (Acknowledgments)** :
   - Remerciements aux tuteurs et équipes de LionGeek et SOREAD 2M.
   - Remerciements aux professeurs et au corps professoral de l'EHTP.

3. **Tables et Listes** :
   - Abstract (English) & Résumé (Français).
   - List of Abbreviations (EHTP, SOREAD 2M, SPA, SSR, ORM, RAG, LLM, CI/CD, etc.).
   - Table of Contents, List of Figures, List of Tables.

4. **Chapter 1: General Context and Host Organization** :
   - Présentation de la chaîne nationale **SOREAD 2M** (contexte multi-langues : arabe, darija, français).
   - Présentation de **LionGeek** (mission, incubation, technologies digitales).
   - **Cadre du stage (2 mois)** :
     - *Semaines 1 et 2 en présentiel à LionGeek* : étude intensive de la documentation officielle de Laravel 12, Inertia.js v2, React 19, TypeScript, Tailwind CSS v4, Pest et Pint.
     - *Origine des compétences IA* : mention explicite que les bases de l'IA et du NLP ont été acquises à l'école (EHTP).
     - *Projet secondaire confidentiel* : mention d'un projet interne sous clause de confidentialité (NDA) relatif à la télémétrie de streaming.
     - Problématique de la programmation TV manuelle et des conflits de diffusion.

5. **Chapter 2: Project Specifications and Requirements Analysis** :
   - Rôles des acteurs (Responsable Programmation, Producteur, Régie Pub, Administrateur).
   - Spécifications fonctionnelles (RF1 à RF6 : grille drag-and-drop, anti-chevauchement des créneaux, workflow des statuts, gestion des pubs, dashboard Recharts, Chatbot IA).
   - Spécifications non fonctionnelles (sécurité, temps de réponse, standards PSR-12).

6. **Chapter 3: System Conception and UML Modeling** :
   - Diagramme de contexte global (TikZ).
   - Diagramme des cas d'utilisation global (TikZ).
   - **Diagrammes de séquence détaillés (TikZ)** :
     - Validation d'un programme et changement de statut.
     - Planification d'un créneau et algorithme d'interdiction de chevauchement horaire : $(S_1 < E_2) \land (E_1 > S_2)$.
     - Exécution d'une requête au Chatbot IA avec injection dynamique du contexte en temps réel (RAG).
   - Diagramme de classes du domaine (User, Program, Episode, BroadcastSlot, Advertiser, AdvertisingSlot, AudienceReport).

7. **Chapter 4: Implementation and Technical Realization** :
   - Architecture monolithique moderne avec **Inertia.js v2** (élimination de l'overhead d'une API REST classique).
   - Implémentation Laravel 12 : modèles, validation custom `NoBroadcastOverlap`, machine à états des programmes.
   - Frontend React 19 + TypeScript : calendrier hebdomadaire interactif avec `@dnd-kit/core`, graphiques analytiques Recharts.
   - **Assistant IA GridCast AI** : intégration de Google Gemini 2.5 Flash avec RAG contextuel en temps réel sur la base de données (programmes, créneaux, CA publicitaire) et widget React flottant.
   - Assurance qualité : tests automatisés avec **Pest PHP**, linting PSR-12 avec Laravel Pint, ESLint.

8. **Chapter 5: DevOps Pipeline and Deployment Architecture** :
   - Conteneurisation Docker multi-stage (PHP 8.2-FPM + Node.js build + Nginx).
   - Orchestration avec Docker Compose (App, MySQL 8.0, Redis, Queue Workers).
   - Pipeline d'intégration et déploiement continus (CI/CD) sous **GitHub Actions** (Linting Pint/ESLint, Tests Pest, Build Docker, Déploiement SSH).
   - Sécurisation en production : Reverse Proxy Nginx, certificats SSL/TLS Let's Encrypt, supervision des workers avec Supervisor, sauvegardes automatisées S3.

9. **Conclusion and Future Perspectives** :
   - Bilan personnel et technique des 2 mois.
   - Perspectives futures : intégration du flux vidéo en direct (HLS), prédiction d'audience par Machine Learning, marqueurs publicitaires SCTE-35.

10. **References and Webography** :
    - Documentation officielle Laravel 12, Inertia.js, React 19, Google Gemini, Pest PHP, Tailwind CSS, Docker, Martin Fowler.
