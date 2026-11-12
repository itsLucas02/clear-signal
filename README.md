# ClearSignal

**A little clarity. A better connection.**

A working telecom customer-support workspace built for the **Build for Better Connectivity** challenge — now seeded with a Malaysian demo dataset covering the Klang Valley, Johor, and Penang.

[**Live demo →**](https://clear-signal-two.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?logo=drizzle&logoColor=000000)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)
![Playwright](https://img.shields.io/badge/Tested_with-Playwright-2EAD33?logo=playwright&logoColor=white)

---

## One person. One problem. One useful outcome.

- **Person:** A telecom support agent helping **Sarah Chen (CS-1048)**, whose broadband keeps dropping in Petaling Jaya, Selangor.
- **Problem:** The customer's story is scattered across calls, chats, and internal notes. Without the bigger picture, agents repeat troubleshooting and miss related network incidents.
- **Outcome:** A single, persistent case containing the customer's story, conversation history, area-level network context, completed troubleshooting steps, and a clear next action or downloadable handoff.

## Try the complete story

1. Open **Sarah Chen · CS-1048** from the overview.
2. Open **Conversation** to see the chat report, a phone follow-up, and the internal note together.
3. Follow **View network context** to see the sample Petaling Jaya incident and its related cases.
4. Save troubleshooting progress and add an internal note.
5. Expand **A clearer customer update** to personalise and copy a playbook-based draft. Drafts are never sent automatically.
6. Download **Export handoff**, or select **Mark as resolved** after confirming the customer's outcome.
7. Refresh the page: notes, owners, priorities, checklist progress, and status are stored in PostgreSQL.

## Included workflows

- Search across customers, issues, areas, and case IDs; use **Ctrl/Cmd + K** for global search.
- Create cases with server-side validation.
- Filter, search, and paginate the queue; export filtered cases to CSV.
- Change case owner, priority, and status; reopen resolved cases.
- Add persistent internal notes and review multi-channel conversations.
- Link area-level incident context to related open cases.
- Use six practical troubleshooting playbooks and save favourites.
- Explore customer profiles and their case history.
- Review metrics and reports calculated from stored cases, with 7-day and 30-day views.
- Use the responsive mobile workspace and keyboard-accessible dialogs.

## Malaysian demo dataset

| Data | Coverage |
| --- | --- |
| Customers | 32 fictional cases with Malaysian names and emails |
| Areas | Petaling Jaya, Kuala Lumpur, Subang Jaya, Bangsar, Johor Bahru, Cheras, Shah Alam, Mont Kiara, Cyberjaya, Ampang, Puchong, Klang Valley |
| Network incidents | Petaling Jaya fibre degradation; scheduled Kuala Lumpur maintenance |
| Agents | Aisyah Rahman, Faizal Rosli, Nurul Huda |
| Currency | Malaysian Ringgit (RM) |
| Map | Illustrative Klang Valley coverage map |

## Implementation

| Layer | Choice |
| --- | --- |
| Framework | Next.js App Router + React 19 |
| Language | TypeScript |
| Database | PostgreSQL 17 (Supabase) with Drizzle ORM |
| Styling | Tailwind CSS 4 + component CSS |
| Icons | Lucide React |
| Tests | Playwright end-to-end |
| Hosting | Vercel |

The workspace is server-rendered on first load, then hydrated on the client. Route handlers validate every write. `src/lib/store.ts` seeds demo data once on the first workspace request.

### Data model

| Table | Purpose |
| --- | --- |
| `support_cases` | Customer, issue, priority, status, owner, plan, checklist progress |
| `case_notes` | Multi-channel conversation and internal notes |
| `network_incidents` | Area-level network context linked to cases |
| `workspace_activities` | Recent activity feed |
| `saved_playbooks` | Bookmarked playbooks |

### Connection pooling

Vercel serverless functions open many short-lived connections, so the app uses Supabase's **transaction pooler** (port `6543`) and caps each pool at three clients. Using the session pooler (port `5432`) hits Supabase's 15-client session limit under load.

## Local development

```bash
git clone https://github.com/itsLucas02/clear-signal.git
cd clear-signal
npm install
cp .env.example .env   # set DATABASE_URL
npx drizzle-kit push --dialect postgresql --schema ./src/db/schema.ts --url "$DATABASE_URL"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The demo data is inserted automatically on the first request.

### Environment

```bash
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<region>.pooler.supabase.com:6543/postgres"
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npx playwright test` | End-to-end suite (server must be running) |

## Validation

The project passes Next.js route type generation, TypeScript compilation, a production build, and the Playwright suite. The suite exercises case creation, notes, checklist persistence, reassignment, resolution, exports, bookmarks, network-to-case navigation, mobile layout, and global select-control spacing.

```bash
npm run typecheck && npm run build
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
```

## Demo boundaries

This is an openly accessible, shared demonstration workspace, not a carrier production system. It starts with 32 fictional Malaysian cases, two illustrative network incidents, and sample customer reports. Use sample information only.

Case changes and saved playbooks are real database writes. Network information is seeded, not a live carrier feed. Customer updates are editable templates, not AI diagnoses or sent messages. The map is illustrative. No external telecom account, API key, authentication service, or billing integration is required.

## Topics

`nextjs` · `typescript` · `tailwindcss` · `postgresql` · `drizzle-orm` · `supabase` · `vercel` · `playwright` · `telecom` · `customer-support` · `react` · `demo`

## Credits

Typography uses DM Sans with a system sans-serif fallback. The DM Sans OFL license is included at [`public/fonts/OFL.txt`](public/fonts/OFL.txt).
