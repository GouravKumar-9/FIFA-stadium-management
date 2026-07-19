# SECURITY.md — StadiumSense AI Security Architecture

StadiumSense AI implements multiple layers of defensive security to safeguard both system resource budgets and user experiences during the FIFA World Cup 2026.

## 1. Input Validation & Sanitization Schema

We run strict validation checks before user data reaches database queries or Groq GenAI models:
- **Zod Schemas**: Every incoming API payload is validated against a pre-defined schema inside [security.ts](file:///d:/FIFA2/backend/src/middleware/security.ts) before it is processed. Malformed or oversized payloads are immediately rejected with `400 Bad Request`.
- **Text Scrubbing**: User inputs in the AI Concierge and Incident intake are processed using `sanitizeInput` to strip out HTML tag structures (`<` and `>`), and replace known prompt injection command triggers (e.g., "ignore previous instructions").
- **Payload Limits**: Messages are capped at `1000` characters to prevent buffer issues or cost exhaustion attacks.

## 2. Prompt-Injection Hardening (System Prompts)

To prevent users from hijacking the Groq API for non-stadium tasks:
- **Structural Separation**: User input is wrapped inside explicit `<user_message>` XML tags when constructed in the API payload.
- **Negative Guidance**: The system prompt instructs the model to treat everything inside the `<user_message>` block strictly as raw content, ignoring any instruction, command, or role-play override attempt.
- **Factual Grounding**: The system prompt strictly limits responses to the vetted context database and returns "I don't have that information" if the answer is missing, preventing hallucinated security policies.

## 3. Rate Limiting Strategy

To prevent DDoS and cost-draining:
- **Global API Limiter**: Enforces a per-IP threshold of `100` requests per 15 minutes.
- **GenAI Limiter**: Restricts public LLM endpoints (`/api/chat` and `/api/navigation/route`) to a maximum of `15` requests per minute per IP, protecting the model from brute-force spamming.

## 4. Role-Based Access Control (RBAC) Boundary

We establish a clear boundary between fan-facing operations (read-only) and staff operations (write/command):
- **Mock Token Authentication**: restricted endpoints inspect the request's `Authorization: Bearer <token>` header.
  - `admin-token` translates to `organizer` role.
  - `volunteer-token` translates to `volunteer` role.
  - Public / empty requests default to `fan` role.
- **Route Authorization**: Endpoint middleware rejects requests with `403 Forbidden` if the user's role does not match the permission list. For example, `GET /api/incidents` is blocked for fans.

## 5. Secret Protection & Environment Isolation

- **Zero Client Secrets**: All API keys, including `GROQ_API_KEY`, are kept strictly on the Node.js backend. The frontend makes relative proxy calls and never touches API keys directly.
- **Git Hygiene**: `.env` is listed in the backend `.gitignore` file, and only a template `.env.example` is checked into the source tree.

## 6. Safe Logging & Error Masking

- **Least-Privilege Logging**: The backend logging interceptor logs request metadata (path, method, IP) but *never* logs raw user prompts or PII, preventing logs from containing sensitive data.
- **Error Interception**: The Express error handler captures exceptions, logs trace details internally, and returns a generic sanitized error payload to the client. Real stack traces, database schema leaks, or API credentials are never exposed.
