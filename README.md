# Teranga GP

Marketplace collaborative de transport de colis entre particuliers, en cours d’internationalisation pour les liaisons entre l’Afrique et l’Europe, dans les deux sens.

> **État du livrable :** socle MVP de développement. L'interface publique, le schéma PostgreSQL, les API de lecture/création, la validation et la configuration CI/Render sont fournis. Ce dépôt n'est **pas prêt à accepter des transactions réelles** : authentification, autorisation, vérification d'identité, paiement, assurance, modération et parcours de livraison doivent être intégrés et audités avant toute mise en production.

## Stack

- Next.js 15 App Router / React 19 / TypeScript
- PostgreSQL / Prisma 6
- Zod pour la validation des entrées
- Vitest pour les tests unitaires
- GitHub Actions pour les contrôles CI
- Render Blueprint pour le déploiement

## Prérequis

- Node.js 20.11+
- npm 10+
- Docker Desktop (ou PostgreSQL 16 local)
- Un compte GitHub et un compte Render pour le déploiement

## Démarrage local

```bash
cp .env.example .env
docker compose up -d db
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Ouvrir http://localhost:3000.

Le endpoint `/api/health` vérifie la connexion PostgreSQL.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm test
npm run db:studio
```

## API disponibles

### `GET /api/trips`

Filtres optionnels : `origin`, `destination`. Renvoie les trajets ouverts et futurs.

### `POST /api/trips`

Répond `503` tant que la création authentifiée de trajets n'est pas activée.

### `GET /api/shipments`

Renvoie les demandes au statut `SEARCHING`.

### `POST /api/shipments`

Répond `503` tant que la création authentifiée de colis n'est pas activée.

Les endpoints de lecture ne renvoient que les champs nécessaires aux annonces publiques, sans identifiant ni profil d'utilisateur. Les endpoints POST répondent `503 Service Unavailable` tant que l'authentification, les contrôles d'accès, la limitation de débit et la protection anti-abus ne sont pas en place. Les formulaires de publication restent également désactivés.

### Assistant, suggestions et suivi

- `/assistant` fournit un assistant d'information via l'API OpenAI côté serveur. Configurez `OPENAI_API_KEY` dans les variables secrètes Render; `AI_ASSISTANT_ENABLED` reste désactivé par défaut. Les messages sont transmis à OpenAI, donc l'interface demande de ne saisir aucune donnée personnelle ou de colis. Avant activation publique, remplacer la limite mémoire indicative par minute par une limitation distribuée et ajouter les contrôles anti-abus adaptés.
- `/trajets` propose des correspondances calculées à partir des annonces réelles `OPEN` et de la capacité; les annonces de démonstration sont exclues. Une correspondance n'est ni une réservation ni une garantie.
- `/suivi` lit les événements d'un colis avec un code de suivi opaque. La migration ajoute le code et l'historique des étapes. L'écriture d'événements n'est pas exposée tant que l'authentification et l'autorisation des rôles opérateur ne sont pas en place; aucun GPS temps réel n'est collecté.

Ces fonctionnalités ne rendent pas le service prêt aux transactions. N'activez pas l'assistant dans un déploiement public avant d'avoir mis en place une limitation de débit distribuée.

## Structure

```text
src/
  app/
    api/health/
    api/trips/
    api/shipments/
    publier/
    trajets/
  components/
  lib/
prisma/
.github/workflows/
render.yaml
```

## Déploiement Render

1. Pousser ce dépôt sur GitHub.
2. Dans Render, choisir **New → Blueprint** et sélectionner le dépôt.
3. Vérifier les ressources proposées par `render.yaml` et les coûts du plan avant validation.
4. Renseigner `NEXT_PUBLIC_APP_URL` avec le domaine public HTTPS.
5. Laisser Render fournir `DATABASE_URL` depuis la base PostgreSQL liée.
6. Lancer le déploiement et vérifier `/api/health`. Une base vide est initialisée automatiquement au démarrage avec `prisma migrate deploy`.

Le site public et les annonces de démonstration sont disponibles après déploiement. La publication réelle, les comptes et les transactions restent désactivés; ne pas collecter de données personnelles ou de paiement avant l'intégration et l'audit des contrôles listés ci-dessous.

Les migrations sont exécutées au démarrage via `prisma migrate deploy`. Pour une équipe ou une production critique, préférer une étape de release/migration contrôlée et un plan de rollback.

## Variables d'environnement

Voir `.env.example`. Ne jamais committer `.env`, clés API, secrets, credentials ou données personnelles.

## Sécurité et limites connues

Avant d'ouvrir le service au public, implémenter au minimum :

- Authentification robuste (OTP via fournisseur SMS, sessions sécurisées, récupération de compte).
- Contrôles d'accès serveur sur chaque objet et opération.
- Rate limiting distribué et protection contre le spam.
- Vérification d'identité via prestataire approprié, avec consentement et minimisation des données.
- Upload sécurisé et stockage privé des pièces justificatives et photos.
- Paiements via un prestataire autorisé au Sénégal, webhooks signés et idempotence.
- Workflow de litiges, preuves de remise, codes OTP/QR et journal d'audit.
- Politique des marchandises interdites et contrôle opérationnel.
- Conditions générales, politique de confidentialité et analyse juridique locale.
- Sauvegardes, alertes, monitoring, tests de charge et audit de sécurité.

Aucun portefeuille client, séquestre ou paiement n'est implémenté dans cette version.

## Portée internationale et limites actuelles

Les champs `origin` et `destination` acceptent déjà du texte libre (ville et pays) et la recherche API compare ces champs sans imposer de liste de villes. L’interface publique a été adaptée pour saisir n’importe quelle ville/pays et présente des exemples Afrique ↔ Europe dans les deux sens.

**La prise en charge commerciale internationale n’est pas encore complète :** le modèle et les validations de prix restent actuellement libellés et structurés en XOF (`pricePerKgXof`, `budgetXof`, `declaredValueXof`). Il faut ajouter une devise ISO 4217 cohérente aux trajets, colis, réservations et paiements, convertir/afficher les montants sans ambiguïté, puis déployer une migration Prisma avant d’accepter des prix dans d’autres devises. Les formulaires de publication restent désactivés jusqu’à l’authentification et à cette intégration. Vérifier aussi les règles douanières, les marchandises autorisées et les obligations de transport propres à chaque pays.

## Données de démonstration

Les trajets affichés dans `/trajets` sont des exemples statiques clairement identifiés comme démonstration. Ils ne sont pas réservables et ne représentent pas des utilisateurs réels.

## Qualité

La CI exécute génération Prisma, vérification TypeScript, ESLint et tests Vitest. Elle ne remplace pas un test d'intégration avec une base PostgreSQL, un audit de sécurité ou un test de bout en bout en environnement de staging.
