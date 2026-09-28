# Vibecoder Prompt Optimizer

Turn a rough idea into a clear, complete prompt that gets the right code on the first try.

> **Status:** Concept / pre-MVP. Commands, file names and endpoints describe the planned design and will change as the project is built.

---

## What It Does

Most vibecoding prompts fail because they are **incomplete**, not because they are badly worded. This app gives you a chat interface that:

1. Finds what your prompt is missing
2. Asks only the few questions that matter (2-4 max)
3. Fills in sensible defaults for everything else
4. Outputs a structured prompt tuned for your coding tool
5. Shows what changed and why, so you get better at prompting
6. Lets you log in (Google or phone number) and **save every prompt you want** to your own library

---

## Table of Contents

1. [Complete Workflow](#complete-workflow)
2. [System Architecture](#system-architecture)
3. [Tech Stack](#tech-stack)
4. [Frontend](#frontend)
5. [Backend](#backend)
6. [Authentication](#authentication)
7. [Database Schema](#database-schema)
8. [API Reference](#api-reference)
9. [Optimized Prompt Format](#optimized-prompt-format)
10. [Task-Type Checklists](#task-type-checklists)
11. [Security and Privacy](#security-and-privacy)
12. [Project Structure](#project-structure)
13. [Getting Started](#getting-started)
14. [Development Workflow](#development-workflow)
15. [Success Metrics](#success-metrics)
16. [Roadmap](#roadmap)
17. [Related Work](#related-work)

---

## Complete Workflow

### User journey (end to end)

```mermaid
flowchart TD
    A[Open app] --> B{Logged in?}
    B -- No --> C[Login: Google or phone OTP]
    C --> D[Chat screen]
    B -- Yes --> D
    D --> E[Paste rough prompt + optional context]
    E --> F[Backend classifies task type]
    F --> G[Gap detection against checklist]
    G --> H{Critical gaps?}
    H -- Yes --> I[Chatbot asks 2-4 questions]
    H -- No --> J[Apply defaults]
    I --> J
    J --> K[Generate structured prompt]
    K --> L[Tune for target tool]
    L --> M[Show optimized prompt + diff]
    M --> N{User action}
    N -- Copy --> O[Paste into coding tool]
    N -- Save --> P[Saved to My Prompts library]
    N -- Refine --> D
    P --> Q[Search, tag, favorite, edit, delete later]
```

### Step-by-step

| # | Stage | Where | What happens |
|---|---|---|---|
| 1 | **Login** | Frontend + backend | User signs in with Google or a phone number OTP |
| 2 | **Intake** | Frontend chat box | User pastes a rough prompt, optionally picks target tool and adds context (stack, files, error text) |
| 3 | **Classify** | Backend | Detect task type: new app, add feature, fix bug, refactor, UI design |
| 4 | **Gap detection** | Backend | Compare prompt to the checklist for that task type |
| 5 | **Clarify** | Chat | Bot asks up to 4 questions, shown as tappable options where possible |
| 6 | **Defaults** | Backend | Fill remaining gaps with sensible defaults; show them so the user can override |
| 7 | **Generate** | Backend | Build the structured prompt; split big requests into ordered steps |
| 8 | **Target tuning** | Backend | Adapt output for Cursor, Claude Code, Lovable, Bolt, v0, ChatGPT, etc. |
| 9 | **Explain** | Frontend | Show a before/after diff with a one-line reason for each change |
| 10 | **Save / copy** | Frontend + backend | Copy to clipboard, or save to the user's library with title and tags |
| 11 | **Library** | Frontend + backend | Search, filter, favorite, edit, re-optimize or delete saved prompts |
| 12 | **Feedback** | Frontend + backend | Optional "worked first try?" rating to improve templates |

### Example

**Input**

```
make me a todo app
```

**Questions asked**

1. Which stack? (React + Vite / Next.js / plain HTML/JS / other)
2. Where should data live? (browser only / database)
3. Design feel? (minimal / colorful / dashboard)

**Output**

```
GOAL:
Build a todo app where a user can add, complete, edit and delete tasks.

CONTEXT:
Single-user personal tool; no login required.

STACK:
React + Vite, plain CSS. No UI libraries.

REQUIREMENTS:
1. Add a task with a title
2. Mark a task complete/incomplete
3. Edit and delete tasks
4. Filter by All / Active / Completed
5. Persist tasks in the browser across reloads

CONSTRAINTS:
- Keep it to a small number of files; no unnecessary abstractions
- Mobile-friendly layout
- Do not add features beyond those listed

OUTPUT FORMAT:
List the files created, then provide the full code for each.

ACCEPTANCE:
App runs with `npm run dev`; all five requirements work with no console errors.
```

**Diff shown to the user**

- Added stack (you did not specify one; models otherwise guess)
- Added persistence requirement (asked, answered "browser only")
- Added constraint against extra features (prevents over-building)
- Added acceptance criteria (defines "done")

---

## System Architecture

```
┌────────────────────────────┐
│          Frontend          │
│  Chat UI · Login · Library │
└─────────────┬──────────────┘
              │ HTTPS (JSON + streaming)
┌─────────────▼──────────────┐        ┌───────────────────────┐
│         Backend API        │───────▶│  LLM provider API     │
│  Auth · Chat · Prompts     │        │  (key stays server    │
│  Rate limiting · Logging   │        │   side only)          │
└───────┬─────────┬──────────┘        └───────────────────────┘
        │         │
        │         └──────────────▶ Google (verify ID token)
        │         └──────────────▶ SMS provider (send OTP)
        ▼
┌────────────────────────────┐
│        PostgreSQL          │
│ users · sessions · prompts │
│ conversations · messages   │
└────────────────────────────┘
        ▲
        │ reads at startup
┌───────┴────────────────────┐
│ templates/ (checklists,    │
│ tool presets)              │
└────────────────────────────┘
```

**Rule:** the browser never talks to the LLM provider directly. All model calls go through the backend so API keys stay secret and usage can be limited per user.

---

## Tech Stack

A suggested stack; swap parts freely.

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Next.js (React) + TypeScript + Tailwind CSS** | Fast to build, good chat UI ecosystem |
| Backend | **Node.js + Express (or Fastify) + TypeScript** | Same language as frontend; easy streaming |
| Database | **PostgreSQL** | Relational data, JSONB for flexible fields, full-text search |
| ORM | **Prisma** | Typed schema and migrations |
| Google login | **Google Identity Services** (frontend) + ID token verification (backend) | Standard OAuth/OIDC flow |
| Phone login | **OTP via an SMS provider** (Twilio Verify, Firebase Auth, or a regional provider) | Avoids building OTP delivery yourself |
| Sessions | **JWT access token + refresh token in httpOnly cookies** | Safer than localStorage |
| LLM calls | Any provider via one internal wrapper | Avoids lock-in |
| Hosting | Vercel/Netlify (frontend), Render/Railway/Fly.io (backend), managed Postgres | Simple deploys |

Alternative: use a managed auth service (Firebase Auth, Supabase Auth, Clerk or Auth0) to get Google and phone login with less custom code.

---

## Frontend

### Screens

| Screen | Purpose |
|---|---|
| **Login** | "Continue with Google" button and phone number field with OTP entry |
| **Chat (main)** | The prompt optimizer chat box |
| **My Prompts** | Library of saved prompts with search, tags, favorites |
| **Prompt detail** | View, edit, copy, re-optimize, see version history, delete |
| **Settings** | Profile, default target tool, linked login methods, delete account |

### Chat screen layout

```
┌──────────────────────────────────────────────────────────┐
│  Sidebar              │  Chat                             │
│  ─────────            │  ─────────────────────────────    │
│  + New chat           │  Target tool: [Cursor ▾]          │
│  Recent chats         │                                   │
│   · todo app          │  You:  make me a todo app         │
│   · fix login bug     │                                   │
│  My Prompts           │  Bot:  Which stack?               │
│  Settings             │        [React+Vite] [Next.js]     │
│                       │        [Plain JS]   [Other]       │
│                       │                                   │
│                       │  Bot:  Optimized prompt ▼         │
│                       │        ┌───────────────────────┐  │
│                       │        │ GOAL: ...             │  │
│                       │        └───────────────────────┘  │
│                       │        [Copy] [Save] [Refine]     │
│                       │        View changes (diff) ▸      │
│                       │  ─────────────────────────────    │
│                       │  [ Type your rough prompt...  ➤ ] │
└──────────────────────────────────────────────────────────┘
```

### Frontend features

- Streaming responses so the optimized prompt appears as it is generated
- Tappable option buttons for clarifying questions, plus a "skip / use defaults" button
- Target-tool selector (Cursor, Claude Code, Lovable, Bolt, v0, ChatGPT)
- Collapsible **diff view** explaining every change
- **Copy** button and **Save** dialog (title, tags, optional notes)
- Prompt library with search, tag filter, favorites, sort by date
- Responsive layout that works on mobile
- Loading, empty and error states on every screen
- Protected routes: unauthenticated users are redirected to Login

### Suggested frontend components

```
ChatWindow · MessageBubble · OptionButtons · PromptCard
DiffViewer · SaveDialog · PromptLibrary · PromptDetail
LoginForm · GoogleButton · PhoneOtpForm · ToolSelector · AuthGuard
```

---

## Backend

### Responsibilities

- **Authentication:** Google sign-in, phone OTP, token refresh, logout
- **Chat orchestration:** classify, detect gaps, ask questions, generate the final prompt and diff (two LLM calls in the MVP)
- **Prompt storage:** save, list, search, update, version and delete a user's prompts
- **Safety:** rate limiting, input validation, per-user authorization on every route
- **Config:** load checklists and tool presets from `templates/`

### Chat orchestration (per message)

```
1. Load conversation history for this session
2. If first message: LLM call 1 -> task type + missing items + questions
3. If answers received: LLM call 2 -> structured prompt + diff
4. Store messages, stream result to the client
```

### Save behavior

Prompts are **only saved when the user clicks Save**. Chat history is kept separately per conversation so users can resume it, and users can delete both at any time.

---

## Authentication

Two login methods, both leading to the same session system. One user account can link both a Google email and a phone number.

### Google login

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant G as Google
    participant B as Backend
    participant D as Database
    U->>F: Click "Continue with Google"
    F->>G: Open Google sign-in
    G-->>F: ID token
    F->>B: POST /auth/google { idToken }
    B->>G: Verify token signature, audience, expiry
    B->>D: Find or create user by google_sub / email
    B-->>F: Set httpOnly cookies (access + refresh)
    F-->>U: Redirect to chat
```

Backend must verify the ID token itself (signature, audience matches your Google client ID, not expired). Never trust user details sent by the client.

### Phone number login (OTP)

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant S as SMS provider
    participant D as Database
    U->>F: Enter phone number
    F->>B: POST /auth/phone/request-otp
    B->>B: Validate E.164 format, rate limit
    B->>D: Store hashed OTP + expiry
    B->>S: Send code by SMS
    U->>F: Enter 6-digit code
    F->>B: POST /auth/phone/verify { phone, code }
    B->>D: Check hash, expiry, attempts
    B->>D: Find or create user by phone
    B-->>F: Set httpOnly cookies (access + refresh)
```

OTP rules:

- 6 digits, expires in about 5 minutes, single use
- Store only a **hash** of the code, never the code itself
- Limit attempts (for example 5) and requests (per phone and per IP)
- Use the same response whether or not the phone is registered, to avoid leaking who has an account
- Some countries require sender ID or template registration for SMS; check this for your target markets

### Sessions

- Short-lived access token (about 15 minutes) and longer refresh token (about 30 days)
- Both stored in **httpOnly, Secure, SameSite cookies**, not localStorage
- Refresh tokens are stored hashed server-side so logout can revoke them
- CSRF protection on state-changing routes

### Account linking

- Same verified email later used with Google -> same account
- A logged-in user can add a phone number (verified by OTP) or link Google from Settings
- Never merge accounts on an unverified email or phone

---

## Database Schema

PostgreSQL. Simplified; add indexes on foreign keys and searched columns.

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE,
  google_sub    TEXT UNIQUE,
  phone         TEXT UNIQUE,            -- E.164, e.g. +14155550123
  display_name  TEXT,
  avatar_url    TEXT,
  default_tool  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE otp_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  attempts    INT  NOT NULL DEFAULT 0,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT,
  task_type   TEXT,
  target_tool TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prompts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id  UUID REFERENCES conversations(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  original_prompt  TEXT NOT NULL,
  optimized_prompt TEXT NOT NULL,
  task_type        TEXT,
  target_tool      TEXT,
  assumptions      JSONB,               -- defaults the tool applied
  diff             JSONB,               -- what changed and why
  tags             TEXT[] NOT NULL DEFAULT '{}',
  notes            TEXT,
  is_favorite      BOOLEAN NOT NULL DEFAULT false,
  worked_first_try BOOLEAN,             -- optional feedback
  version          INT NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prompt_versions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id        UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version          INT NOT NULL,
  optimized_prompt TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (prompt_id, version)
);

-- Search and filtering
CREATE INDEX idx_prompts_user_created ON prompts (user_id, created_at DESC);
CREATE INDEX idx_prompts_tags ON prompts USING GIN (tags);
CREATE INDEX idx_prompts_search ON prompts USING GIN (
  to_tsvector('english', title || ' ' || original_prompt || ' ' || optimized_prompt)
);
```

---

## API Reference

Base path `/api`. All routes except `/auth/*` require a valid session and only ever return the current user's data.

### Auth

| Method | Route | Body | Description |
|---|---|---|---|
| POST | `/auth/google` | `{ idToken }` | Verify Google ID token, create or find user, set cookies |
| POST | `/auth/phone/request-otp` | `{ phone }` | Send a one-time code by SMS |
| POST | `/auth/phone/verify` | `{ phone, code }` | Verify code, create or find user, set cookies |
| POST | `/auth/refresh` | none | Rotate refresh token, issue new access token |
| POST | `/auth/logout` | none | Revoke refresh token, clear cookies |
| GET | `/me` | none | Current user profile |
| PATCH | `/me` | `{ displayName, defaultTool }` | Update profile |
| DELETE | `/me` | none | Delete account and all data |

### Chat

| Method | Route | Description |
|---|---|---|
| POST | `/chat/conversations` | Start a conversation `{ message, targetTool?, context? }` |
| POST | `/chat/conversations/:id/messages` | Send a message or clarifying answers (streams the reply) |
| GET | `/chat/conversations` | List recent conversations |
| GET | `/chat/conversations/:id` | Load a conversation with messages |
| DELETE | `/chat/conversations/:id` | Delete a conversation |

### Saved prompts

| Method | Route | Description |
|---|---|---|
| POST | `/prompts` | Save a prompt `{ title, originalPrompt, optimizedPrompt, tags, ... }` |
| GET | `/prompts` | List with `?q=&tag=&taskType=&favorite=&page=` |
| GET | `/prompts/:id` | Get one prompt |
| PATCH | `/prompts/:id` | Edit title, tags, notes, favorite, or prompt text (creates a new version) |
| GET | `/prompts/:id/versions` | Version history |
| POST | `/prompts/:id/reoptimize` | Run the optimizer again on a saved prompt |
| DELETE | `/prompts/:id` | Delete a prompt |

### Example: save a prompt

```http
POST /api/prompts
Content-Type: application/json

{
  "title": "Todo app (React + Vite)",
  "originalPrompt": "make me a todo app",
  "optimizedPrompt": "GOAL: Build a todo app ...",
  "taskType": "new_app",
  "targetTool": "cursor",
  "tags": ["react", "todo"]
}
```

Response `201`:

```json
{ "id": "3f6c...", "version": 1, "createdAt": "2026-09-28T10:15:00Z" }
```

### Error format

```json
{ "error": { "code": "OTP_INVALID", "message": "Code is incorrect or expired." } }
```

---

## Optimized Prompt Format

```
GOAL:            one-sentence outcome
CONTEXT:         what exists already, who it is for
STACK:           language, framework, versions, libraries
REQUIREMENTS:    numbered, testable items
CONSTRAINTS:     what to avoid, limits, style rules
STEPS:           ordered build plan (for large tasks)
OUTPUT FORMAT:   files expected, how to present changes
ACCEPTANCE:      how we know it is done
```

Plain text/Markdown is used on purpose so any LLM understands it without extra explanation tokens.

---

## Task-Type Checklists

The gap detector checks your prompt against a checklist for its task type.

**New app:** purpose, main user flow, stack, hosting target, core vs. nice-to-have features, design feel, data storage

**Add feature:** existing stack, relevant files, exact behavior, edge cases, what must not break

**Fix bug:** exact error or symptom, reproduction steps, expected vs. actual behavior, code snippet, environment

**Refactor:** goal (readability, speed, structure), files in scope, behavior that must stay identical, tests available

**UI design:** screens and components, style references, colors, responsiveness, accessibility

---

## Security and Privacy

**Authentication and sessions**
- Verify Google ID tokens on the server; never trust client-provided identity
- Hash OTP codes and refresh tokens; never store them in plain text
- Rate limit OTP requests, OTP verification, login and chat endpoints
- httpOnly + Secure + SameSite cookies; CSRF protection on writes

**Authorization**
- Every query filters by the authenticated `user_id`; never fetch a prompt by ID alone
- Add tests that confirm user A cannot read or edit user B's prompts

**Data handling**
- Saved prompts may contain private code or secrets; treat them as sensitive
- Encrypt in transit (HTTPS) and enable database encryption at rest
- Warn users not to paste API keys or passwords into prompts, and consider detecting common secret patterns before saving
- LLM provider keys live only in server environment variables
- Users can export and delete their data; account deletion removes prompts, conversations and tokens
- Ask for explicit consent before using anonymized before/after pairs to improve templates
- Publish a privacy policy covering phone numbers, emails and stored prompts

**Abuse and cost control**
- Per-user daily limits on LLM calls
- Maximum prompt length and request size
- Input validation on every route

---

## Project Structure

```
prompt-optimizer/
├── README.md
├── .env.example
├── frontend/
│   ├── app/                    # routes: login, chat, prompts, settings
│   ├── components/             # ChatWindow, PromptCard, DiffViewer, ...
│   ├── lib/                    # api client, auth helpers
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/             # auth, chat, prompts, me
│   │   ├── services/
│   │   │   ├── auth/           # google.ts, phoneOtp.ts, tokens.ts
│   │   │   ├── optimizer/      # classify, gaps, questions, generate, diff
│   │   │   ├── llm/            # provider wrapper
│   │   │   └── sms/            # SMS provider wrapper
│   │   ├── middleware/         # auth guard, rate limit, validation, errors
│   │   └── db/                 # prisma client
│   ├── prisma/schema.prisma
│   └── package.json
├── templates/
│   ├── checklists/             # one file per task type
│   └── presets/                # one file per target tool
├── evals/
│   ├── cases/                  # rough prompts + expected qualities
│   └── run.ts                  # compares original vs. optimized results
└── docs/
    └── prompt-optimizer-project.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- A Google Cloud OAuth client ID (Web application)
- An SMS provider account (for phone OTP)
- An LLM provider API key

### 1. Clone and install

```bash
git clone <your-repo-url>
cd prompt-optimizer

cd backend  && npm install
cd ../frontend && npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` in both `backend/` and `frontend/`.

**backend/.env**

```
DATABASE_URL=postgresql://user:password@localhost:5432/promptopt
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
COOKIE_DOMAIN=localhost
FRONTEND_ORIGIN=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id

SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=...

LLM_API_KEY=your-llm-provider-key
LLM_MODEL=your-chosen-model
DAILY_LLM_LIMIT_PER_USER=50
```

**frontend/.env**

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Set up Google login

1. Open Google Cloud Console -> APIs & Services -> Credentials
2. Create an OAuth client ID of type **Web application**
3. Add `http://localhost:3000` as an authorized JavaScript origin (and your production domain later)
4. Copy the client ID into both `.env` files

### 4. Set up phone OTP

1. Create an account with your SMS provider and a verification/messaging service
2. Copy the credentials into `backend/.env`
3. In development, use the provider's test mode or log the OTP to the console instead of sending real SMS

### 5. Set up the database

```bash
cd backend
npx prisma migrate dev
```

### 6. Run

```bash
# terminal 1
cd backend  && npm run dev      # http://localhost:4000

# terminal 2
cd frontend && npm run dev      # http://localhost:3000
```

Open http://localhost:3000, sign in, paste a rough prompt, answer the questions, copy or save the result.

---

## Development Workflow

1. **Collect real prompts.** Gather 50-100 rough vibecoding prompts and label their common gaps.
2. **Write checklists.** One per task type; start with new app, add feature, fix bug, UI design.
3. **Build the backend core.** Database, auth (Google first, then phone OTP), prompt CRUD.
4. **Build the optimizer pipeline.** Classify, detect gaps, ask, generate, diff.
5. **Build the frontend.** Login, chat screen, save dialog, library.
6. **Add tool presets.** Start with the one or two tools your users rely on most.
7. **Write tests.** Auth flows, authorization (user isolation), OTP limits, prompt CRUD.
8. **Evaluate.** For each test prompt, run the original and optimized version in a coding tool and record whether it worked on the first try and how many iterations it took.
9. **Iterate on templates** using eval results and feedback.
10. **Deploy.** Frontend and backend separately, managed Postgres, production OAuth origins and SMS sender configuration.

---

## Success Metrics

| Metric | Question it answers |
|---|---|
| First-attempt success rate | Does the optimized prompt produce working code on the first try more often? |
| Iterations to completion | Are there fewer back-and-forth rounds? |
| Question completion rate | Do users finish the clarify step? |
| Save rate | How often do users save the optimized prompt? |
| Login completion | How many users who start login finish it, per method? |
| Prompt length vs. quality | Is the prompt lean, or bloated for little gain? |
| Return usage | Do users come back for a second prompt? |

---

## Roadmap

**Phase 1: Foundation**
- [ ] Collect sample prompts and label gaps
- [ ] Draft checklists for the top task types
- [ ] Database schema and migrations
- [ ] Google login and session handling

**Phase 2: MVP**
- [ ] Phone OTP login
- [ ] Chat UI with streaming and option buttons
- [ ] Optimizer pipeline (classify, gaps, questions, generate, diff)
- [ ] Save prompt, My Prompts library, search and tags

**Phase 3: Quality**
- [ ] Evaluation harness (original vs. optimized)
- [ ] Tool-specific presets
- [ ] Prompt versioning and re-optimize
- [ ] Rate limits, usage caps, secret detection

**Phase 4: Growth**
- [ ] Project memory (store stack and conventions once)
- [ ] Browser extension / IDE plugin
- [ ] Shareable prompt links
- [ ] Optional token-trimming step

---

## Design Principles

- **Interrogate first, rewrite second.** Missing information matters more than better wording.
- **Never over-ask.** Two to four questions, always skippable, with defaults.
- **Stay lean.** A longer prompt is not automatically a better one.
- **Teach, do not just fix.** Always show what changed and why.
- **Measure, do not assume.** Optimization gains vary by task, so test each task type.
- **Keep user data private.** Saved prompts belong to the user and are only visible to them.

---

## Related Work

- **LLMLingua** (Microsoft, EMNLP 2023): prompt compression using a small model to remove unimportant tokens. https://www.microsoft.com/en-us/research/blog/llmlingua-innovating-llm-efficiency-with-prompt-compression/
- **TOON (Token-Oriented Object Notation):** compact format for structured data in prompts. https://www.infoq.com/news/2025/11/toon-reduce-llm-cost-tokens
- **The Prompt Report:** survey of prompting and prompt optimization techniques. https://arxiv.org/pdf/2406.06608
- **DSPy:** framework for algorithmically optimizing prompts; gains vary by task. https://arxiv.org/html/2507.03620v1

---

## Contributing

1. Fork the repo and create a branch
2. Add or improve a checklist, preset, or eval case
3. Include at least one before/after prompt example showing the improvement
4. Open a pull request describing what you changed and why

---

## License

To be decided.
