# Project Details and Instructions for AI Agents

Welcome! If you are an AI assistant working on this project, please adhere to the following rules and understand the tech stack and architectural decisions in place.

## 1. Code Style

**MANDATORY:** You must strictly follow the rules defined in `UNIVERSAL-CODE-STYLE-RULES.md`.
Core concepts from the style guide:
- **Explicit over implicit**: Avoid one-liners and compressed logic. All control structures must use braces `{}`, even if they only contain a single line.
- **Fail Fast & Early Return**: Avoid `else` blocks whenever possible. Use guard clauses at the top of functions.
- **Block Scope**: Use `const` and `let`. Never use `var`.
- **Vertical Formatting**: Keep functions small and insert blank lines between logical sections (declarations, conditions, execution).
- **Error Handling**: Never ignore errors. Use `try/catch` for all async operations.

## 2. Tech Stack

- **Framework:** Nuxt 4 (API-only backend)
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** JWT (JSON Web Tokens) or opaque tokens with standard Bearer strategy
- **Language:** TypeScript (strict mode)

## 3. Project Structure (Nuxt 4 Conventions)

Nuxt 4 enforces a slightly different directory structure compared to Nuxt 3:
- **Frontend Code:** All frontend-specific directories (`components`, `pages`, `assets`, `plugins`, `layouts`, `utils` for frontend) are located inside the `app/` directory.
- **Backend Code:** All server routes, API endpoints, backend utils, and database schema/seeders are under the `server/` directory.
  - API Routes: `server/api/`
  - Drizzle specific: `server/drizzle/`
  - Backend Utils/Middleware: `server/utils/` and `server/middleware/`
- **Shared Code:** Global TS types used by both frontend and backend are in the root `types/` folder.

## 4. Specific Backend Rules
- Do not use `@` for error suppression.
- Return structured error responses for APIs: `{ error: string, code?: string }`.
- Drizzle schema types should be exported and reused. No raw SQL strings.
- Validation should occur at the API boundary, returning HTTP 400 Bad Request if invalid.
- API is protected by server middleware that checks for the presence and validity of a JWT token, except for the login route.

By conforming to these rules, we ensure a highly maintainable, readable, and robust codebase.

## 5. Documentation
- You must keep the documentation in the `docs/` folder up to date whenever you make structural changes, add new endpoints, or change the database schema.
- The `docs/README.md` file serves as the index for all API documentation.
