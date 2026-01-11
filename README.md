# Authentiq

An open professional platform Proof-of-Concept with an AI-powered recruiting agent. Think LinkedIn alternative inspired by [atproto](https://atproto.com)/[Bluesky](https://bsky.app), but with smarter talent discovery (This version doesn't implement atproto features).

> > [!NOTE]
> **Status:** not ready yet, things might break

## What it does

- **Profiles** — Users create professional profiles and upload resumes
- **Resume Parsing** — LLM extracts structured data from PDF resumes
- **Semantic Embeddings** — Profiles are embedded for vector similarity search
- **AI Recruiting Agent** — Recruiters describe candidates in natural language, agent finds and ranks matches

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16, React 19, TypeScript |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth |
| AI | Mistral AI + Vercel AI SDK |
| UI | Tailwind CSS, Radix UI |

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, Signup
│   ├── api/
│   │   ├── chat/         # AI Agent endpoint
│   │   └── parse-resume/ # Resume parsing
│   ├── chat/             # Agent interface
│   └── profile/          # Profile pages
├── components/
│   ├── tools/            # Agent tools (extract, find, reason)
│   └── chat/             # Candidate cards
└── lib/
    ├── interfaces/       # TypeScript types
    └── supabase/         # DB client
```

## Agent Flow

```
Recruiter Input → extractQueryTool → findCandidatesTool → addReasoningTool → Candidate Cards
                  (parse JD)         (semantic search)    (explain matches)
```

## Setup

```bash
# Install deps
pnpm install

# Set env vars
cp .env.example .env.local
# Setup your env vars (for Webhook secret, see /generate-embeddings route)

# Run dev server
pnpm dev
```

## License

MIT
