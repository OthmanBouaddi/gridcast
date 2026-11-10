# GridCast - Plateforme de Gestion de Grille de Programmes TV

GridCast est une application web conçue pour une chaîne de télévision marocaine multi-langues (Arabe, Darija, Français) permettant la planification de grille de diffusion, la soumission et validation des programmes, la régie publicitaire, et le suivi d'audience.

---

## Stack Technique

- **Backend** : Laravel 12 (PHP 8.2+)
- **Frontend** : Inertia.js v2 + React 19 + TypeScript
- **Styling** : Tailwind CSS v4
- **Composants / UI** : `@dnd-kit/core` (Drag & Drop calendrier), `recharts` (Analytique), `lucide-react` (Icones)
- **Base de données** : SQLite / MySQL
- **Tests** : Pest PHP

---

## ?? Démarrage Rapide

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

## ?? Utilisateurs de Démonstration (Comptes de Test)

Tous les comptes ont le mot de passe par défaut : **`password`**

| Rôle | Email | Périmètre & Accès |
|---|---|---|
| **Administrateur** | `admin@gridcast.ma` | Accès complet, gestion globale & statistiques |
| **Responsable Programmation** | `prog@gridcast.ma` | Grille des programmes, validation des soumissions |
| **Producteur** | `producteur@gridcast.ma` | Création de programmes, soumission, suivi d'épisodes |
| **Régie Publicitaire** | `regie@gridcast.ma` | Annonceurs, créneaux publicitaires, chiffre d'affaires |

---

## ?? Tests & Qualité de Code

```bash
# Exécuter les tests Pest
php artisan test

# Linting PHP (Laravel Pint - PSR-12)
composer run lint

# Linting Frontend (ESLint + TypeScript)
npm run lint
```
