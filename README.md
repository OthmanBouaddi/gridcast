# GridCast - Plateforme de Gestion de Grille de Programmes TV

GridCast est une application web conçue pour une chaîne de télévision marocaine multi-langues (Arabe, Darija, Français) permettant la planification de grille de diffusion, la soumission et validation des programmes, la régie publicitaire, et le suivi d'audience.

Projet réalisé dans le cadre du stage d'ingénieur à **LionGeek** (Hub d'Innovation & Filiale de **SOREAD 2M**).

---

## 🛠️ Stack Technique

- **Backend** : Laravel 12 (PHP 8.2+)
- **Frontend** : Inertia.js v2 + React 19 + TypeScript
- **Styling** : Tailwind CSS v4
- **Composants / UI** : `@dnd-kit/core` (Drag & Drop calendrier), `recharts` (Analytique), `lucide-react` (Icônes)
- **Base de données** : MySQL 8.0 / SQLite
- **Cache & Queues** : Redis 7.2
- **Conteneurisation & DevOps** : Docker (Multi-stage build), Docker Compose, Nginx, Supervisor, GitHub Actions CI/CD
- **Tests & Qualité** : Pest PHP, Laravel Pint (PSR-12), ESLint

---

## 🐳 Déploiement avec Docker (Production & Staging)

L'architecture est entièrement conteneurisée avec **Docker Compose**, orchestrant 4 services :
- **`app`** : Application GridCast (Nginx + PHP 8.2-FPM avec extensions MySQL, GD, Zip, OPcache)
- **`db`** : Base de données relationnelle **MySQL 8.0** avec volume persistant
- **`redis`** : Cache et gestionnaire de files d'attente asynchrones **Redis 7.2**
- **`queue`** : Worker d'arrière-plan géré par **Supervisor** pour les notifications et calculs d'audience

### Lancement en 1 commande :

```bash
# Construire et démarrer tous les conteneurs en arrière-plan
docker compose up -d --build
```

Ou sous Windows, double-cliquez simplement sur **`deploy-docker.bat`**.

L'application sera accessible sur : **`http://localhost:8000`**

### Commandes utiles Docker :

```bash
# Vérifier l'état des conteneurs
docker compose ps

# Voir les logs en direct
docker compose logs -f app

# Exécuter les migrations manuellement (si besoin)
docker compose exec app php artisan migrate --force

# Arrêter les conteneurs
docker compose down
```

---

## ⚡ Démarrage Rapide en Local (Sans Docker)

### Option 1 : Via le script `startup.bat` (Recommandé sur Windows)

Double-cliquez simplement sur **`startup.bat`** à la racine du projet ou dans `gridcast/`.

Le script se charge automatiquement de :
1. Vérifier les prérequis (PHP, Node.js, NPM).
2. Initialiser `.env` et la base de données SQLite si nécessaire.
3. Lancer le serveur backend Laravel (`http://127.0.0.1:8000`).
4. Lancer le serveur frontend Vite.
5. Ouvrir automatiquement votre navigateur.

---

### Option 2 : En ligne de commande

```bash
cd gridcast

# 1. Installer les dépendances
composer install
npm install

# 2. Configurer l'environnement
cp .env.example .env
php artisan key:generate

# 3. Migrer et injecter les données de démonstration
php artisan migrate:fresh --seed

# 4. Lancer les serveurs
# Terminal 1 : Backend
php artisan serve

# Terminal 2 : Frontend
npm run dev
```

Rendez-vous ensuite sur [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## 👥 Utilisateurs de Démonstration (Comptes de Test)

Tous les comptes ont le mot de passe par défaut : **`password`**

| Rôle | Email | Périmètre & Accès |
|---|---|---|
| **Administrateur** | `admin@gridcast.ma` | Accès complet, gestion globale & statistiques |
| **Responsable Programmation** | `prog@gridcast.ma` | Grille des programmes, validation des soumissions |
| **Producteur** | `producteur@gridcast.ma` | Création de programmes, soumission, suivi d'épisodes |
| **Régie Publicitaire** | `regie@gridcast.ma` | Annonceurs, créneaux publicitaires, chiffre d'affaires |

---

## 🧪 Tests & Qualité de Code

```bash
# Exécuter les tests Pest
php artisan test

# Linting PHP (Laravel Pint - PSR-12)
composer run lint

# Linting Frontend (ESLint + TypeScript)
npm run lint
```
