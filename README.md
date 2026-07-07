# TeamMind

TeamMind is a local-first AI context agent for turning scattered team context into structured memory, proposed actions, executable briefs, and result-driven updates.

The project explores a practical question: how can an AI system operate inside a long-running workflow instead of only answering isolated prompts?

## Core Loop

```text
source
-> signal
-> memory / action
-> action brief
-> result
-> memory update / follow-up
```

## What It Does

- Ingests team context such as meeting notes, customer feedback, investor questions, engineering progress, and founder notes.
- Extracts structured signals from raw sources.
- Converts signals into durable company memory and proposed next actions.
- Generates action briefs with goals, background, strategy, draft output, risks, success criteria, and confirmation checklist.
- Records execution outcomes and feeds results back into memory and follow-up actions.
- Ships with demo data so the workflow can be inspected locally.

## Why This Project Matters

TeamMind is a systems prototype for AI agents in persistent organizational workflows. It focuses on context intake, memory governance, action suggestion, and result feedback rather than one-off chat interactions.

This makes it useful evidence for:

- AI agent workflow design
- context engineering
- long-running memory/action loops
- product-oriented AI system prototyping
- local-first interaction design

## MVP Scope

- Project spaces for teams or startup projects.
- Context intake for meeting notes, customer feedback, investor questions, engineering progress, and founder notes.
- Structured memory extraction across customer concerns, investor questions, product decisions, engineering blockers, team constraints, risks, opportunities, and facts.
- Action suggestions with priority, risk level, expected output, and human confirmation.
- Action briefs with goal, known background, strategy, draft, risks, success criteria, and confirmation checklist.
- Result loop: record execution outcome, update memory, and generate new actions.
- Built-in demo data.

## Architecture

```text
src/
  main.js                 App state and event wiring
  styles.css              Interface styles
  data/demo.js            Demo workspace
  domain/agentEngine.js   Replaceable local agent engine
  domain/types.js         Shared constants and labels
  services/store.js       Local persistence
  ui/render.js            HTML rendering helpers
```

The current agent engine is deterministic and local. It is designed as a clean boundary for future LLM providers, vector search, and external tool integrations.

## Product Docs

- [最终产品形态.md](./最终产品形态.md)
- [AI_HANDOFF.md](./AI_HANDOFF.md)
- [当前系统状态.md](./当前系统状态.md)
- [PRD.md](./PRD.md)
- [PROJECT_FUNCTION_STRUCTURE.md](./PROJECT_FUNCTION_STRUCTURE.md)
- [DATA_MODEL.md](./DATA_MODEL.md)
- [docs/AI_DEVELOPMENT_GUIDE.md](./docs/AI_DEVELOPMENT_GUIDE.md)
- [docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md](./docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md)
- [docs/TEAM_DEV_LOG.md](./docs/TEAM_DEV_LOG.md)
- [docs/FILE_FUNCTION_NOTES.md](./docs/FILE_FUNCTION_NOTES.md)
- [docs/issues/README.md](./docs/issues/README.md)

## Run Locally

```bash
npm run dev
```

Then open:

```text
http://localhost:4173
```

On Windows PowerShell, if `npm.ps1` is blocked by execution policy, run the server directly:

```bash
python -m http.server 4173
```

This MVP is a static app, so it can also be hosted on GitHub Pages, Netlify, Vercel, Cloudflare Pages, or any static file server.

## Not Implemented In V1

- Authentication and multi-member permissions
- Real email sending
- GitHub, Notion, Slack, Gmail, Linear/Jira integrations
- Automatic code changes, merges, or external commitments
- Vector database or server-side background jobs
- Production database

All high-risk actions remain draft-only and require manual confirmation.
