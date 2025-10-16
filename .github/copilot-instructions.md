# Copilot Instructions for BrickVault

Ce document guide les agents IA pour être immédiatement productifs sur le projet BrickVault.

## Vue d'ensemble

- **Nom du projet** : BrickVault
- **Auteur** : Lucas Guerrier [CrokNoks]
- **Licence** : Apache-2.0
- **Description** : Monorepo BrickVault : gestion de collections LEGO® et similaire, inventaire, sets, pièces. Backend NestJS, mobile React Native, librairies partagées.
- **Architecture monorepo** : Plusieurs apps (`apps/`) et librairies (`libs/`).
- **Backend principal** : `apps/server` utilise NestJS (TypeScript) pour l'API. Modules métier dans `src/modules/`.
- **Mobile** : Application React Native dans `apps/mobile/`.
- **Librairies partagées** : Types, DTOs, utilitaires, clients API dans `libs/`.
- **Scripts** : Automatisation et déploiement dans `scripts/`.

## Conventions et patterns

- **Organisation des modules** : Chaque domaine (`pieces`, `sets`, `inventory`, etc.) a son propre dossier avec `controller`, `service`, `module` et tests e2e dans `__tests__`.
- **DTOs et schémas** : Définitions de données dans `common/dto/` et `common/entities/`.
- **Tests** : e2e dans `test/` et `src/modules/*/__tests__/`.
- **TypeScript strict** : Typage fort, validation via DTOs, documentation API Swagger.

## Workflows critiques

- **Installation** :
  ```bash
  npm install
  ```
- **Démarrage backend** :
  ```bash
  npm run start
  ```
- **Tests e2e** :
  ```bash
  npm run test:e2e
  ```
- **Générer la couverture** :
  ```bash
  npm run test:cov
  ```
- **Lint** :
  ```bash
  npm run lint
  ```
- **Scripts personnalisés** : Voir `scripts/README.md` pour migrations et déploiements.
- **Documentation Swagger** :
  Swagger généré automatiquement au démarrage du backend NestJS, accessible sur `/api/docs` (voir configuration dans `main.ts`).
  Pour activer Swagger :
  ```bash
  npm install @nestjs/swagger swagger-ui-express
  ```
  (Optionnel pour le typage) :
  ```bash
  npm install --save-dev @types/swagger-ui-express
  ```

## Points d'intégration

- **Docker** : Orchestration possible via `docker-compose.yml`.
- **API externe** : Clients et intégrations centralisés dans `libs/`.

## Exemples de patterns

- **Service NestJS** :
  - Fichier : `src/modules/pieces/pieces.service.ts`
  - Structure typique : méthodes CRUD, injection de repository, validation via DTOs.
- **Test e2e** :
  - Fichier : `src/modules/pieces/__tests__/comments.e2e-spec.ts`
  - Jest et Supertest pour tester les endpoints API.

## Références clés

- `apps/server/README.md` : Setup backend
- `docs/README.md` : Documentation technique
- `libs/README.md` : Librairies partagées
- `scripts/README.md` : Scripts d'automatisation
- `LICENSE` : Licence Apache-2.0
- `NOTICE` : Attributions et mentions légales

---

> **Remarque** : Respectez la structure modulaire, la licence Apache-2.0 et les conventions de nommage pour garantir la cohérence du code.

Merci de signaler toute section incomplète ou peu claire pour itération.
