<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key Next.js 16 facts for this repo:
- `params`, `searchParams`, `cookies()`, `headers()` are ALL async — always `await` them.
- `next lint` is removed. Use `npm run lint` (ESLint CLI) and `npm run typecheck`.
- Turbopack is the default for `dev` and `build`.
- `middleware` was renamed to `proxy` (nodejs runtime only) — not used here.
- Page props: use `PageProps<'/route/[x]'>` or `await props.params`.
- `next build` no longer runs linting; run `npm run check` separately.

Conventions for this project:
- Local data layer lives in `src/lib/db` (SQLite file at `data/db.sqlite`, seeded on boot).
- Server-only modules import from `@/lib/db/store`. Client code never imports db — use `/api/*` route handlers.
- Auth uses signed cookie sessions via `src/lib/secret.ts` + `src/lib/auth.ts`. Roles: admin, trainer, receptionist, member.
- All forms validate on the server; client components keep validation mirrors for UX.
- Files in `src/app/(site)` are public marketing pages; `src/app/portal/*` are authenticated dashboards; `src/app/(auth)` is login/register.
<!-- END:nextjs-agent-rules -->
