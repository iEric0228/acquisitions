# Acquisitions API

A Node.js Express API for managing acquisitions with authentication, built with modern tools and best practices.

## 🚀 Features

- **Authentication**: JWT-based auth with bcrypt password hashing
- **Database**: PostgreSQL with Drizzle ORM migrations
- **Security**: Arcjet middleware for rate limiting and bot protection
- **Validation**: Zod schema validation
- **Logging**: Winston logger with structured logging
- **Docker**: Multi-stage builds with development and production configurations

## 📁 Project Structure

```
├── README.md                     # This file
├── package.json                  # Dependencies and scripts
├── REORGANIZATION_PLAN.md        # Documentation of file structure changes
│
├── config/                       # Configuration files
│   ├── drizzle.config.js        # Database migration configuration
│   ├── eslint.config.js         # Linting configuration
│   └── docker/                   # Docker configurations
│       ├── Dockerfile           # Multi-stage Docker build
│       ├── docker-compose.dev.yml  # Development environment
│       └── docker-compose.prod.yml # Production environment
│
├── environments/                 # Environment configurations
│   ├── .env.example            # Template for environment variables
│   ├── .env.development        # Development environment (gitignored)
│   └── .env.production         # Production environment (gitignored)
│
├── docs/                        # Documentation
│   ├── DOCKER.md              # Docker setup and deployment
│   ├── WARP.md                # Warp-specific configurations
│   └── development.md         # Development guide
│
├── scripts/                     # Build and deployment scripts
│   └── dev.sh                 # Development environment startup
│
├── logs/                        # Application logs
│   └── combined.log            # Structured application logs
│
├── drizzle/                     # Database migrations
│   └── migrations/             # Auto-generated migration files
│
└── src/                         # Source code
    ├── app.js                  # Express app configuration
    ├── index.js               # Application entry point
    ├── server.js              # Server startup
    ├── config/                 # Runtime configuration
    │   ├── arcjet.js          # Security middleware config
    │   ├── database.js        # Database connection
    │   └── logger.js          # Logging configuration
    ├── controllers/            # Request handlers
    │   └── auth.controller.js # Authentication endpoints
    ├── middleware/             # Custom middleware
    │   └── security.middleware.js # Security and rate limiting
    ├── models/                 # Database models
    │   └── user.model.js      # User schema definition
    ├── routes/                 # API routes
    │   └── auth.routes.js     # Authentication routes
    ├── services/              # Business logic
    │   └── auth.service.js    # User authentication service
    ├── utils/                 # Utility functions
    │   ├── cookie.js          # Cookie management
    │   ├── format.js          # Error formatting
    │   └── jwt.js             # JWT token utilities
    └── validations/           # Input validation schemas
        └── auth.validation.js # Authentication validation
```

## 🛠 Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (for production) or use our Docker setup

### Development Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp environments/.env.example environments/.env.development
   # Edit environments/.env.development with your values
   ```

3. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

### Docker Development

```bash
# Start with Docker (includes PostgreSQL)
npm run dev:docker

# Stop containers
docker compose -f config/docker/docker-compose.dev.yml down
```

## 📋 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run dev:docker` - Start full development environment with Docker
- `npm run db:generate` - Generate new migration files
- `npm run db:migrate` - Run pending migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Login user
- `POST /api/auth/sign-out` - Logout user

### Health
- `GET /health` - Health check
- `GET /api` - API status

## 🔧 Configuration

### Environment Variables

See `environments/.env.example` for all available configuration options.

### Database

This project uses Neon PostgreSQL in production and local PostgreSQL for development. Database schema is managed with Drizzle ORM.

### Security

- Arcjet provides rate limiting and bot protection
- Helmet.js for security headers
- JWT tokens for authentication
- bcrypt for password hashing

## 🚀 Deployment

See `docs/DOCKER.md` for detailed deployment instructions.

## 📚 Documentation

Additional documentation is available in the `docs/` directory:
- [Docker Setup](docs/DOCKER.md)
- [Development Guide](docs/development.md)
- [Warp Configuration](docs/WARP.md)
