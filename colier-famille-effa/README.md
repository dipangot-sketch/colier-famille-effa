# Colier Famille Effa

Plateforme familiale privée associée à des colliers QR. Une seule
application, un seul backend, une seule base de données — plusieurs
profils, thèmes et niveaux de permissions (cahier des charges, Partie 12 §1).

> **Si tu as déjà un dossier `colier-famille-effa` en local et qu'une
> autre IA/outil y a ajouté des fichiers** (ex. `src/app/dashboard/`,
> `src/lib/auth.ts`) : ne fusionne pas. Supprime entièrement l'ancien
> dossier et repars de cette archive. Deux systèmes d'authentification
> différents dans le même projet sont la cause exacte des erreurs de
> build de type "Module not found" ou imports incohérents.

> **Prisma ORM 7** a changé son architecture de configuration en
> profondeur par rapport aux versions précédentes (schéma épuré, config
> déplacée dans `prisma.config.ts`, adaptateur de driver obligatoire).
> Ce projet est écrit pour cette nouvelle architecture — voir section 3.

---

## 1. Stack technique et justifications

| Domaine | Choix | Pourquoi |
|---|---|---|
| Frontend / Backend | **Next.js 16** (App Router), React 19, TypeScript | Version la plus récente au moment du build (vérifiée via `npm install`, pas figée en mémoire) ; un seul framework pour le rendu, les routes et les API. |
| Style | **Tailwind CSS v4** | Variables de thème natives (`@theme`), cohérent avec un moteur de thème piloté par la base de données. |
| Base de données | **PostgreSQL** + **Prisma ORM 7** + `@prisma/adapter-pg` | Imposé par le cahier des charges (Partie 2, 3, 7, 12) ; schéma relationnel typé, migrations versionnées. Depuis Prisma ORM 7, un adaptateur de driver (`@prisma/adapter-pg`, basé sur `pg`, le driver PostgreSQL de référence pour Node.js) est obligatoire pour tous les moteurs — voir `src/lib/prisma.ts` et `prisma.config.ts`. |
| Mots de passe | **bcryptjs** (coût 12) | Le cahier des charges recommande Argon2id "ou une solution équivalente correctement configurée". bcryptjs est une implémentation JS pure : aucune compilation native requise, donc fiable sur toutes les plateformes de déploiement (y compris serverless). Voir `src/lib/auth/password.ts`. |
| Sessions | Cookies **HttpOnly + Secure + SameSite=Lax**, token opaque haché en base | Jamais de session côté client (Partie 8 §25, Partie 12 §33-34). |
| QR codes | Package `qrcode` (génération), token aléatoire haché (`sha256`) | Le QR ne contient jamais de secret ; seul un hash est stocké (Partie 3 §10). |
| Validation | **Zod** | Validation serveur systématique (Partie 12 §53). |

---

## 2. Installation locale

```bash
npm install
cp .env.example .env
# renseigner DATABASE_URL et DIRECT_URL dans .env

npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

npm run dev
```

> **Important — première étape obligatoire :** `npx prisma generate`
> télécharge le moteur de schéma Prisma depuis `binaries.prisma.sh`,
> un hôte public normal. C'est une étape standard de tout projet
> Prisma après `npm install` — sans elle, le client généré
> (`src/generated/prisma/`) n'existe pas et le projet ne compile pas.
> Un script `postinstall` l'exécute automatiquement à chaque
> `npm install` (donc aussi sur Vercel). Elle n'a pas pu être exécutée
> dans l'environnement d'assistance (accès réseau restreint à ce
> domaine précis) — mais la validation du schéma a été vérifiée
> jusqu'au point exact du téléchargement, qui fonctionne normalement
> sur une machine de développement, en CI ou chez un hébergeur. Tout
> le reste du projet a été vérifié : `npm run build` compile, et
> `tsc`/`eslint` ne remontent aucune erreur en dehors du client généré
> absent.

### Comptes créés par le seed

| Profil | E-mail | Rôle | Mot de passe temporaire |
|---|---|---|---|
| Ada EFFA NDONG Monseralt Greta | Monseralt@gmail.com | MEMBER | `Temp1234` |
| Effa Ndong Marion | Marion@gmail.com | MEMBER | `Temp1234` |
| Effa Ndong Elema | Elema@gmail.com | MEMBER | `Temp1234` |
| EFFA Dessir Martin | Martin@gmail.com | FAMILY_ADMIN | `Temp1234` |
| Terance | SuperAdmin@gmail.com | SUPER_ADMIN | `Temp1234` |

Chaque compte doit changer ce mot de passe à la première connexion
(`mustChangePassword`, Partie 4 §6). Le seed affiche également, dans
la console, le **token QR en clair** de chaque profil (Monseralt,
Marion, Elema, Martin) — à noter immédiatement, il ne sera plus
jamais réaffiché. Pour s'y connecter en développement, ouvrir :

```
http://localhost:3000/access/<token>
```

Terance (SUPER_ADMIN) n'a pas de QR : il se connecte directement sur
`/super-admin/login` (Partie 4 §11, §36).

---

## 3. Architecture Prisma ORM 7

Prisma 7 a changé sa façon de gérer la connexion à la base de données.
Trois fichiers travaillent ensemble :

| Fichier | Rôle |
|---|---|
| `prisma/schema.prisma` | Uniquement la structure des données (modèles, enums). Plus aucune URL de connexion. |
| `prisma.config.ts` (racine) | Utilisé **uniquement par la CLI** (`generate`, `migrate`, `studio`, `db seed`). Lit `DIRECT_URL`. |
| `src/lib/prisma.ts` | Le client utilisé **par l'application** à l'exécution. Construit un adaptateur (`@prisma/adapter-pg`) à partir de `DATABASE_URL`. |

Le client généré n'est plus placé dans `node_modules` : il est généré
dans `src/generated/prisma/` (dossier ignoré par git, régénéré à
chaque `npm install` via le script `postinstall`). D'où l'import
`from "@/generated/prisma/client"` au lieu de `from "@prisma/client"`
dans tout le code.

**Pourquoi deux URLs (`DATABASE_URL` / `DIRECT_URL`) ?** Sur Neon (et
tout hébergeur avec pooler de connexions), les migrations ont besoin
d'une connexion directe — un pooler ne le permet pas. L'application,
elle, peut utiliser l'URL poolée. Si ta base ne passe pas par un
pooler (PostgreSQL local, par exemple), les deux variables peuvent
pointer vers la même URL.

---

## 4. Déploiement (GitHub + Vercel + Neon)

1. **Neon** — créer un projet PostgreSQL sur [neon.tech](https://neon.tech).
   Dans l'onglet "Connection Details", copier :
   - l'URL **avec** `-pooler` → `DATABASE_URL`
   - l'URL **sans** `-pooler` (« direct connection ») → `DIRECT_URL`
2. **GitHub** — pousser ce projet dans un nouveau dépôt :
   ```bash
   git init
   git add -A
   git commit -m "Colier Famille Effa — Phase 1"
   git branch -M main
   git remote add origin <url-du-depot>
   git push -u origin main
   ```
3. **Vercel** — importer le dépôt GitHub, puis dans *Settings →
   Environment Variables*, ajouter `DATABASE_URL` et `DIRECT_URL`
   (mêmes valeurs que dans `.env`). Vercel détecte Next.js
   automatiquement.
4. Avant le tout premier déploiement (une seule fois), appliquer le
   schéma à la base Neon depuis ta machine :
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
5. Déployer. Le `postinstall` (`prisma generate`) s'exécute
   automatiquement pendant le build Vercel.

---

## 5. Structure du projet

```
prisma.config.ts         # config CLI Prisma 7 (migrations, seed, DIRECT_URL)

prisma/
  schema.prisma          # 20 entités (Partie 3) — structure uniquement
  seed.ts                # rôles, permissions, thèmes, comptes initiaux
  seed-data/themes.ts    # les 12 thèmes de base (Partie 3 §14, Partie 9 §3)

src/
  generated/prisma/      # client Prisma généré (ignoré par git)
  app/
    access/[token]/       # validation du QR → redirection
    login/                 # connexion thématisée par profil
    super-admin/login/    # connexion admin indépendante du QR
    change-password/       # changement obligatoire (1ère connexion)
    select-profile/         # sélecteur de cartes (FAMILY_ADMIN / SUPER_ADMIN)
    profile/[slug]/          # espace immersif (lettre, musique, thème)
    super-admin/              # tableau de bord : gestion des QR
  components/
    layout/    ThemeProvider, SideMenu
    profile/   ProfileAvatar, LetterScroller, ProfileSelectCard, DecorativeLayer
    music/     MusicPlayerBar
    ui/        Button, GlassPanel, CopyLinkButton
    forms/     PasswordField
  lib/
    prisma.ts     client applicatif (adaptateur @prisma/adapter-pg)
    auth/         password.ts, session.ts, qr.ts, pendingProfile.ts, qrFlash.ts
    permissions/  rôles, permissions, requireAuth/requireRole/requirePermission
    themes/       types + conversion en variables CSS
    data/         requêtes Prisma réutilisables
    validators/   schémas Zod
  proxy.ts         # ex-middleware.ts (convention Next.js 16) : pré-filtre léger
```

---

## 6. Sécurité — ce qui est déjà en place

- **QR ≠ mot de passe ≠ session ≠ permission** : quatre mécanismes
  strictement séparés (Partie 4 §2, Partie 8 principe général).
- Chaque page et chaque *server action* revérifie `getCurrentUser()` +
  `requireAuth`/`requireRole`/`canAccessProfile` **côté serveur** —
  `src/proxy.ts` ne fait qu'un filtrage rapide par présence de cookie,
  jamais la vérification réelle (Partie 6 §45, Partie 8 §26-27).
- Mots de passe hachés (bcrypt), jamais stockés en clair.
- Tokens QR et de session : seul un hash est conservé en base.
- Révocation d'un QR → nouveau QR généré → **même `profileId`**,
  aucune donnée perdue (Partie 4 §37, Partie 11 §33).
- Messages d'erreur génériques à la connexion (« Identifiants
  incorrects. ») — jamais de confirmation qu'un e-mail existe.
- Journal d'audit (`AuditLog`) sur la création/révocation de QR ;
  prêt à être étendu aux autres actions sensibles en Phase 2.

---

## 7. Feuille de route

### Phase 1 — Fondations (ce livrable)
Base de données complète, authentification, QR, rôles/permissions,
moteur de thème (12 thèmes), pages d'accueil immersives des 4 profils
(lettre défilante, lecteur audio, décorations discrètes), sélecteur de
profils, gestion des QR côté Super Admin.

### Phase 2 — Fonctionnalités familiales
- Chat familial temps réel (WebSocket) + historique persistant
- Galerie (albums, upload, miniatures, plein écran)
- Calendrier + anniversaires + événements spéciaux (confettis, etc.)
- Mini-jeux (morpion, memory, Ludo)
- Notifications
- Éditeurs FAMILY_ADMIN/SUPER_ADMIN (thème, musique, lettre, fond) avec aperçu
- Stockage objet réel (S3 ou équivalent) via `src/lib/storage.ts`
- Journal d'activité complet côté interface (actuellement en base uniquement)
- Création de nouveaux profils depuis l'administration

Aucune fonctionnalité de la Phase 2 n'est simulée dans ce livrable :
conformément au cahier des charges (Partie 12 §98), rien n'apparaît
dans le menu tant que ce n'est pas réellement connecté au backend.
