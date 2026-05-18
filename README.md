# TeamMind

TeamMind is a zero-backend MVP for a company-specific context agent. It helps an early team turn scattered notes into structured company memory, proposed next actions, executable briefs, and result-driven memory updates.

## MVP Scope

- Project spaces for teams or startup projects.
- Context intake for meeting notes, customer feedback, investor questions, engineering progress, and founder notes.
- Structured memory extraction across customer concerns, investor questions, product decisions, engineering blockers, team constraints, risks, opportunities, and facts.
- Action suggestions with priority, risk level, expected output, and human confirmation.
- Action briefs with goal, known background, strategy, draft, risks, success criteria, and confirmation checklist.
- Result loop: record execution outcome, update memory, and generate new actions.
- Built-in demo data.

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

The current agent engine is deterministic and local. It is designed as a placeholder boundary for a future LLM provider, vector search, and external tool integrations.

## Not Implemented In V1

- Authentication and multi-member permissions
- Real email sending
- GitHub, Notion, Slack, Gmail, Linear/Jira integrations
- Automatic code changes, merges, or external commitments
- Vector database or server-side background jobs
- Production database

All high-risk actions remain draft-only and require manual confirmation.
