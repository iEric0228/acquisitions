# Project Reorganization Plan

## Current Issues
1. Root directory is cluttered with documentation, logs, and config files
2. Environment files are scattered in root
3. Mixed documentation files
4. Log files not properly organized

## Proposed Structure

```
acquisitions/
├── README.md                     # Main project documentation
├── package.json
├── package-lock.json
├── .gitignore
├── .prettierrc
├── .prettierignore
│
├── config/                       # Configuration files
│   ├── drizzle.config.js
│   ├── eslint.config.js
│   └── docker/
│       ├── Dockerfile
│       ├── .dockerignore
│       ├── docker-compose.dev.yml
│       └── docker-compose.prod.yml
│
├── environments/                 # Environment files
│   ├── .env.example
│   ├── .env.development
│   ├── .env.production
│   └── .env                     # (local only, gitignored)
│
├── docs/                        # Documentation
│   ├── DOCKER.md
│   ├── WARP.md
│   └── development.md
│
├── scripts/                     # Build and deployment scripts
│   └── dev.sh
│
├── logs/                        # Application logs
│   ├── combined.log
│   └── error.log
│
├── drizzle/                     # Database migrations
│   ├── 0000_flaky_zaladane.sql
│   └── meta/
│
└── src/                         # Source code
    ├── app.js
    ├── index.js
    ├── server.js
    ├── config/
    │   ├── arcjet.js
    │   ├── database.js
    │   └── logger.js
    ├── controllers/             # Renamed from controller (plural)
    │   └── auth.controller.js
    ├── middleware/
    │   └── security.middleware.js
    ├── models/
    │   └── user.model.js
    ├── routes/
    │   └── auth.routes.js
    ├── services/
    │   └── auth.service.js
    ├── utils/
    │   ├── cookie.js
    │   ├── format.js
    │   └── jwt.js
    └── validations/
        └── auth.validation.js
```

## Benefits
- Cleaner root directory
- Grouped related files
- Consistent naming (controllers plural)
- Separated concerns (config, docs, env files)
- Better maintainability
