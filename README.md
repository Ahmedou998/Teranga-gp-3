# Teranga GP

Marketplace collaborative de transport de colis entre particuliers, en cours d’internationalisation pour les liaisons entre l’Afrique et l’Europe, dans les deux sens.

> **État du livrable :** pilote d’annonces réelles Sénégal ↔ France. Les membres créent un compte avec email vérifié, puis publient et consultent des trajets ou demandes enregistrés en PostgreSQL. L’identité et le contenu ne sont pas vérifiés. Il n’y a ni prise de contact intégrée, réservation, paiement, assurance ni gestion de livraison : ne remettez pas de colis et ne transférez pas d’argent sur la base d’une annonce.

## Stack

- Next.js 15 App Router / React 19 / TypeScript
- PostgreSQL / Prisma 6
- Better Auth : comptes email/mot de passe, vérification email, sessions et limitation de débit en base
- Nodemailer : envoi des emails via un serveur SMTP configuré
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
npm ci --legacy-peer-deps
npx prisma generate
npm run db:deploy
npm run dev
```

Ouvrir http://localhost:3000.

Pour créer des comptes, configurez les variables SMTP dans `.env`. Sans SMTP, les inscriptions et demandes de réinitialisation sont explicitement refusées. En production, configurez aussi un `BETTER_AUTH_SECRET` aléatoire et privé. Le endpoint `/api/health` vérifie la connexion PostgreSQL.

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

Crée un trajet réel pour l’utilisateur connecté. Nécessite une session et une adresse email vérifiée.

### `GET /api/shipments`

Renvoie les demandes au statut `SEARCHING`.

### `POST /api/shipments`

Crée une demande réelle pour l’utilisateur connecté. Nécessite une session et une adresse email vérifiée.

Les annonces sont publiques et ne contiennent pas les adresses email des auteurs. Les créations sont validées côté serveur. La confirmation d’email ne vérifie ni identité, ni itinéraire, ni contenu du colis. Il n’y a pas de réservation, de contact intégré ou de transaction.

### Assistant, suggestions et suivi

- `/assistant` fournit un assistant d'information métier via l'API OpenAI côté serveur. Le formulaire de demande de colis propose aussi une reformulation facultative de la description, sans inventer de détails ni certifier qu'un article peut être transporté. Configurez `OPENAI_API_KEY` dans les variables secrètes; `AI_ASSISTANT_ENABLED` reste désactivé par défaut. Les messages de discussion et la description soumise à reformulation sont transmis à OpenAI; l'interface avertit de ne pas saisir de données personnelles. Avant activation publique, remplacer la limite mémoire indicative par minute par une limitation distribuée et ajouter les contrôles anti-abus adaptés.
- `/trajets` affiche les trajets publiés ouverts et futurs et propose des correspondances selon l’itinéraire et la capacité. Une correspondance n'est ni une réservation ni une garantie.
- `/colis` affiche les demandes publiées `SEARCHING` sans description ni donnée de contact. Une demande n’est pas une réservation.
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
3. Vérifier que les deux ressources proposées par `render.yaml` utilisent le plan **Free** avant validation.
4. Laisser Render fournir `DATABASE_URL` depuis la base PostgreSQL liée.
5. Dans les variables d’environnement Render, définir les champs SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`) d’un fournisseur d’email, et définir `BETTER_AUTH_SECRET` avec une valeur aléatoire privée (au moins 32 caractères). Ne jamais mettre ces secrets dans Git ou dans le chat.
6. Valider le Blueprint : les migrations s’exécutent au démarrage et les déploiements se déclenchent automatiquement sur les nouveaux commits de la branche liée.
7. Vérifier `/api/health` : la réponse doit indiquer `status: "ok"` et `database: "connected"`. Tester ensuite création de compte, email de vérification, connexion, publication et consultation d’annonce.

Le service web et la base PostgreSQL utilisent le plan gratuit Render. Le service web se met en veille après 15 minutes sans trafic et son prochain démarrage peut prendre environ une minute; il est aussi soumis au quota mensuel d'heures gratuites du workspace. La base PostgreSQL gratuite est limitée à 1 Go et expire 30 jours après sa création. Après expiration, elle devient inaccessible; Render la supprime après un délai de grâce de 14 jours si elle n'est pas mise à niveau. Ce déploiement est uniquement un pilote temporaire : exportez les données régulièrement et ne l’utilisez pas comme registre durable. L’assistant reste désactivé par défaut.

Pour déclencher manuellement un déploiement depuis GitHub Actions, créer dans les paramètres du service Render un deploy hook, l’enregistrer dans le dépôt GitHub sous **Settings → Secrets and variables → Actions** avec le nom `RENDER_DEPLOY_HOOK`, puis lancer **Actions → Deploy to Render → Run workflow**. Ne jamais publier ni transmettre l’URL du hook.

Les annonces deviennent publiables après configuration du secret d’authentification et du fournisseur SMTP. Les comptes sont email/mot de passe avec vérification obligatoire; les réservations, contacts intégrés et transactions ne sont pas implémentés.

Les migrations sont exécutées au démarrage via `prisma migrate deploy`. Pour une équipe ou une production critique, préférer une étape de release/migration contrôlée et un plan de rollback.

## Variables d'environnement

Voir `.env.example`. Les installations utilisent `--legacy-peer-deps` car Better Auth déclare des peer dependencies optionnelles sur plusieurs frameworks; l’application n’utilise que son intégration Next.js. Ne jamais committer `.env`, clés API, secrets, credentials ou données personnelles.

## Sécurité et limites connues

Avant d’accepter des colis ou de l’argent, implémenter et tester au minimum :

- Vérification d’identité via prestataire approprié, avec consentement et minimisation des données.
- Prise de contact et réservation avec contrôles d’accès serveur sur chaque objet et opération.
- Protection anti-spam supplémentaire et modération des annonces.
- Upload sécurisé et stockage privé des pièces justificatives et photos.
- Paiements via un prestataire autorisé au Sénégal, webhooks signés et idempotence.
- Workflow de litiges, preuves de remise, codes OTP/QR et journal d'audit.
- Politique des marchandises interdites et contrôle opérationnel.
- Conditions générales, politique de confidentialité et analyse juridique locale.
- Sauvegardes, alertes, monitoring, tests de charge et audit de sécurité.

Aucun portefeuille client, séquestre ou paiement n'est implémenté dans cette version.

## Rémunération future de la plateforme

Le modèle envisagé pour rémunérer l’exploitation de Teranga GP est une **commission sur les transports effectivement réalisés**, et non sur les annonces, demandes, mises en relation ou réservations annulées. Aucun frais n’est actuellement calculé, facturé ou versé.

Avant le lancement commercial, définir et afficher clairement :

- le taux de commission et son assiette (prix convenu du transport, hors ou frais inclus) ;
- qui paie la commission : expéditeur, voyageur, ou partage explicite entre les deux ;
- la règle d’arrondi en XOF et le traitement des frais du prestataire de paiement, remboursements et litiges ;
- le bénéficiaire légal des recettes de la plateforme et, séparément, les modalités de rémunération de son créateur.

**Recommandation technique :** figer un instantané de la règle de commission au moment où une réservation est acceptée, puis enregistrer en XOF le montant brut, la commission de la plateforme, la rémunération nette du voyageur, les frais du prestataire et les remboursements. Calculer et comptabiliser la commission de façon idempotente uniquement après confirmation fiable de la livraison et du paiement; mettre le versement en attente pendant un litige et annuler ou rembourser selon une règle publiée. Le créateur ne doit pas recevoir un accès direct aux fonds des clients : son éventuelle rémunération relève d’un versement distinct, documenté et conforme aux obligations juridiques, fiscales et comptables de l’entité qui exploite la plateforme.

L’implémentation nécessitera notamment un parcours de réservation authentifié, une politique de commission versionnée, un registre comptable immuable, un prestataire de paiement et de versement adapté aux pays desservis, des webhooks signés/idempotents, ainsi que des contrôles d’accès et des rapprochements comptables. La commission doit rester désactivée tant que ces choix et contrôles ne sont pas validés. Ce modèle est une préparation produit, pas un avis juridique ni une promesse de revenu.

## Portée internationale et limites actuelles

Les champs `origin` et `destination` acceptent du texte libre (ville et pays) et la recherche compare ces champs sans imposer de liste de villes.

**La prise en charge commerciale internationale n’est pas encore complète :** le modèle et les validations de prix restent structurés en XOF (`pricePerKgXof`, `budgetXof`, `declaredValueXof`). Il faut ajouter une devise ISO 4217 cohérente aux trajets, colis, réservations et paiements avant d’accepter des prix dans d’autres devises. Vérifier aussi les règles douanières, les marchandises autorisées et les obligations de transport propres à chaque pays.

## Comptes et annonces

Chaque annonce est reliée au compte qui l’a publiée. Les inscriptions exigent une adresse email confirmée; les mots de passe et sessions sont gérés par Better Auth, et le rate limiting est stocké dans PostgreSQL. Les anciens profils sans email, s’il en existe, reçoivent une adresse réservée `@no-email.invalid` lors de la migration et ne peuvent pas se connecter sans procédure de récupération distincte. Aucune adresse email n’est exposée dans les annonces publiques.

Le pilote ne vérifie pas l’identité, les itinéraires ou les colis. Il ne comprend aucun mécanisme de mise en relation/contact, de réservation, de paiement, d’assurance ou de livraison. Les annonces servent à rendre visibles de vrais besoins et trajets; elles ne constituent pas une promesse de transport.

## Qualité

La CI exécute génération Prisma, vérification TypeScript, ESLint et tests Vitest. Elle ne remplace pas un test d'intégration avec une base PostgreSQL, un audit de sécurité ou un test de bout en bout en environnement de staging.
