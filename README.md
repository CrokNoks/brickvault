# BrickVault

[![codecov](https://codecov.io/gh/CrokNoks/brickvault/branch/main/graph/badge.svg)](https://codecov.io/gh/CrokNoks/brickvault)

BrickVault is an open-source platform for managing, tracking, and sharing collections of LEGO®-compatible sets and parts.

## Main Features

- **Set Management**: Add, edit, delete, search, and filter by theme, year, manufacturer, etc.
- **Parts Management**: Detailed inventory, colors, references, pagination, and sorting.
- **Manufacturers**: CRUD, uniqueness, population of related sets.
- **Instructions**: Add and view building instructions.
- **Marketplace**: External offer links, sorting, pagination, URL validation.
- **Comments**: Feedback and discussion system for sets.
- **Inventory**: Track parts owned by each user.
- **RESTful API**: Automatically generated Swagger documentation.
- **e2e Tests**: Full coverage, error case and edge case validation.
- **CI/CD**: Continuous integration with Codecov coverage badge.

## Architecture

- **Monorepo**: Organized into apps (`apps/`) and libraries (`libs/`).
- **Backend**: NestJS + Mongoose, business modules in `apps/server/src/modules/`.
- **Mobile**: React Native app in `apps/mobile/`.
- **Shared Libraries**: Types, DTOs, validators in `libs/`.
- **Docker**: Orchestration possible via `docker-compose.yml`.

## Quick Start

```bash
# Install dependencies
npm install

# Start backend
npm run start

# Run e2e tests
npm run test:e2e

# Generate coverage
npm run test:cov
```

## Documentation

- **Swagger**: `/api/docs` (backend running)
- **Architecture & conventions**: See `.github/copilot-instructions.md`
- **Custom scripts**: See `scripts/README.md`

## Contributing

PRs are welcome! Please respect the modular structure, naming conventions, and add tests for any new features.

## License

Apache-2.0

---

> This project is not affiliated with The LEGO Group. LEGO® is a registered trademark.
