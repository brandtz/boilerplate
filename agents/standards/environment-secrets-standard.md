# Standard: Environment and Secrets Management

## Purpose
Prevent agents from hardcoding secrets, ensure environment variables are documented, and establish review checkpoints for secret leaks.

## Rules

### R1: No hardcoded secrets
All secrets, API keys, tokens, and credentials MUST be referenced via environment variables. Never hardcode secret values in source code, configuration files, or documentation.

### R2: `.env.example` required
Every project MUST maintain a `.env.example` file documenting all required environment variables with placeholder values. Real secrets MUST NOT appear in this file.

Placeholder format:
```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
STRIPE_SECRET_KEY=sk_test_your_key_here
AUTH_SECRET=generate-a-random-string
```

### R3: `.env` in `.gitignore`
All `.env` files (`.env`, `.env.local`, `.env.production`, `.env.*.local`) MUST be listed in `.gitignore`. This MUST be validated during project setup.

### R4: DevSecOps review
The DevSecOps role MUST review every implementation handoff for:
- Hardcoded secrets in source code or config
- `.gitignore` excludes `.env` files
- New environment variables are documented in `.env.example`

### R5: Deployment configuration in integrations.md
Each external service's required environment variables MUST be documented in `agents/context/integrations.md` under the Configuration field.

### R6: Local development reproducibility
Local development setup MUST be reproducible from `.env.example` alone. A developer should be able to copy `.env.example` to `.env`, fill in real values, and start the application.

### R7: Secrets audit in close-out
Every implementation handoff close-out checklist MUST include a secrets audit step:
- Verify no secrets committed in source
- Verify new env vars added to `.env.example`
- Verify `.gitignore` covers `.env` files

## Naming conventions
- Use `SCREAMING_SNAKE_CASE` for environment variable names
- Prefix service-specific variables with the service name (e.g., `STRIPE_SECRET_KEY`, `AUTH0_CLIENT_ID`)
- Use `_URL` suffix for connection strings, `_KEY` or `_SECRET` for credentials

## Scope
Applies to all implementation prompts and all agents producing source code or configuration.
