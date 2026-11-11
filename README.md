# HerShield – AI-Powered Campus Safety Management System

**Daffodil International University · Dept. of Software Engineering**
**SE331 – Software Engineering Design Capstone Project · Assessment 2**

HerShield lets students report emergencies (one-tap SOS or detailed reports) and gives campus security a console to monitor, prioritise, escalate and resolve incidents.

> ⚠️ **Academic prototype.** HerShield never sends real emergency alerts, SMS, emails, WhatsApp messages or calls, never contacts real emergency services, and never exposes student location publicly. All demo identities and locations are fictional. In a real emergency in Bangladesh call **999**.

---

## 1. Quick start

Requirements: **Node.js 18.18+** (20 LTS recommended), npm, and a PostgreSQL database.

```bash
# 1. install dependencies (also generates the Prisma client)
npm install

# 2. copy .env.example to .env and set DATABASE_URL, DIRECT_URL, and AUTH_SECRET

# 3. create the database schema and load local demo data
npm run setup

# 4. start the app
npm run dev
```

Open **http://localhost:3000**.

For local development, set `DATABASE_URL` and `DIRECT_URL` to your PostgreSQL connection string. In Vercel, set `DATABASE_URL` to the pooled connection string and `DIRECT_URL` to the direct connection string. The production build applies the Prisma schema; do not run `npm run setup` in production because it seeds demo data and clears existing rows.

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build && npm start` | Production build & server |
| `npm run setup` | Generate Prisma client, create DB, seed demo data |
| `npm run db:reset` | Wipe the database and re-seed demo data |
| `npm run db:studio` | Browse the database in Prisma Studio |
| `npm run test:classifier` | Verify the priority engine against the assignment scenarios |
| `npm run typecheck` | TypeScript check |

## 2. Demo login credentials

| Role | Email | Password |
|---|---|---|
| **Admin / Campus Security** | `security@diu.edu.bd` | `Admin@123` |
| **Admin / Campus Security** | `admin@diu.edu.bd` | `Admin@123` |
| Student | `ayesha.rahman@diu.edu.bd` | `Student@123` |
| Student | `nusrat.jahan@diu.edu.bd` | `Student@123` |
| Student | `tasnim.akter@diu.edu.bd` | `Student@123` |
| Student | `farhana.islam@diu.edu.bd` | `Student@123` |
| Student | `sadia.hossain@diu.edu.bd` | `Student@123` |
| Student | `maliha.chowdhury@diu.edu.bd` | `Student@123` |
| Student | `raisa.karim@diu.edu.bd` *(no trusted contacts – shows empty state)* | `Student@123` |
| Student | `sumaiya.haque@diu.edu.bd` | `Student@123` |
| Student | `tanjila.sultana@diu.edu.bd` | `Student@123` |
| Student | `mehjabin.noor@diu.edu.bd` | `Student@123` |

Student login: `/login` · Admin login: `/admin/login`. Both login forms have a **"Use demo account"** button.

Seed data: 10 students, 2 admins, 17 trusted contacts, 19 incidents (HS-1001 … HS-1019) across all 8 categories, 4 priorities and 6 statuses, spread over the last 5 months, with status histories and 90+ simulated notifications.

## 3. Suggested demo script (≈ 5 minutes)

1. **Register** a new student at `/register` (validation: DIU student ID `221-35-1234`, university email, BD phone, strong password) → you land on *Trusted Contacts*. Add 2 contacts (add / edit / delete).
2. **Dashboard → SOS** → confirm dialog → choose *Physical Threat*, pick a **mock location** → *Send SOS*. Show the incident ID (HS-10xx), timestamp, status, *Critical* priority, recommended action and the **simulated contact alerts** with delivery status.
3. **Report an Incident** – full form with live **AI priority preview**; submit and view the report detail (progress tracker, classification reasons, map, timeline).
4. **My Reports** – search/filter the history table.
5. Log in as **security@diu.edu.bd** → *Overview* (real-time stats, escalation queue, map, charts).
6. Open the new incident → **update status** (Under Review → Response Dispatched) with a note, and **override priority**.
7. Log back in as the student → status, timeline and notification reflect the change.
8. Show *Live Map*, *Incident Management* board, *Escalation Center* (one-click recommendations + scenario tester for the 3 bonus scenarios), *Analytics*, *Notification History*, *Students* (deactivate account).

## 4. Feature checklist (mapped to the marking scheme)

### Core features (63 marks)

| # | Feature | Marks | Where | Status |
|---|---|---|---|---|
| 1 | Student registration / login | 8 | `/register`, `/login`, `/admin/login`, `/student/profile` – Zod validation, bcrypt hashing, signed httpOnly JWT cookie, role-based middleware, protected routes, logout, profile & password management, account deactivation | ✅ |
| 2 | Add trusted emergency contacts | 7 | `/student/contacts` – add, edit, delete (with confirm), list, primary contact, relationship, max 10 | ✅ |
| 3 | Emergency / SOS reporting | 10 | Red SOS button on dashboard, header and `/student/sos` → confirmation dialog → SOS interface → saved incident with unique **HS-xxxx** ID, timestamp, confirmation screen and status | ✅ |
| 4 | Select emergency category | 5 | 8 categories with icon & colour (Medical, Harassment, Physical Threat, Accident, Theft, Suspicious Activity, Fire, Other) | ✅ |
| 5 | Submit incident details | 7 | `/student/report` – category, title, description, location, date & time, notes, priority level, threat/injury/danger; client + server validation | ✅ |
| 6 | View emergency reports | 7 | `/student/reports` (search, category/priority/status filters, sort, pagination) and `/student/reports/[id]` (ID, time, category, status, progress tracker, timeline) | ✅ |
| 7 | Security / admin dashboard | 10 | `/admin` – Total / Pending / Active / Resolved / High-priority stats from DB, all incidents with search & filters, student info, monitoring map with priority-coloured clickable markers, analytics charts | ✅ |
| 8 | Update incident status | 9 | Incident detail form, management board & escalation center – 6 statuses, saved with timestamp, full status history, student notified and sees latest status | ✅ |

### Advanced features (20 marks)

| Feature | Marks | Implementation | Status |
|---|---|---|---|
| Share location coordinates | 5 | Browser Geolocation **only after a consent dialog**, mock demo locations, click-on-map manual selection; lat/lng stored in `IncidentLocation`, shown on maps and in incident details; `/student/location` updates coordinates for open incidents; visible only to reporter + admins | ✅ |
| Emergency contact notification simulation | 5 | On every report each trusted contact gets a simulated SMS notification (`Emergency Alert: A student has submitted a Medical Emergency report. Incident ID: HS-1001…`) with delivery status & timestamps; history at `/student/notifications` and `/admin/notifications` | ✅ |
| Incident priority classification | 5 | `lib/classifier.ts` – category base score + keyword signals + threat/injury/danger + escalation rules → Critical/High/Medium/Low, reasons, recommended action; automatic on submit, live preview, admin override with reason | ✅ |
| Incident history & statistics | 5 | `/admin/analytics` – stat cards, category / priority / resolved-vs-pending / daily / monthly charts (Recharts, real data), category breakdown, searchable historical records | ✅ |

### Bonus (5 marks) – Emergency escalation workflow ✅

`/admin/escalation` lists every open incident ordered by priority & risk score with the identified **response category**, response team, escalation level, target response time, recommended action and step-by-step workflow, plus one-click *Apply recommendation & dispatch*. A built-in **scenario tester** runs the three assignment scenarios:

| Scenario | Input | System output |
|---|---|---|
| Medical | severe injury | Medical Response · **Critical** · immediate medical assistance |
| Harassment | no immediate threat | Campus Security Review · **Medium** · security review |
| Physical threat | active threat | Security Escalation · **Critical** · immediate security escalation |

Optional AI enhancement: set `AI_API_KEY` (any OpenAI-compatible API) to add an advisory note for admins. The rule engine always decides the priority, so the system works fully offline without a paid API.

## 5. Architecture

```
app/
  (public)/            Landing, About, Safety Guidelines
  (auth)/              Student Login, Registration
  admin/login/         Admin Login
  admin/(panel)/       Overview, incidents, incidents/[id], manage, map, escalation,
                       analytics, notifications, students, settings
  student/             Overview, sos, report, reports, reports/[id], contacts,
                       location, notifications, tips, profile
  api/                 REST route handlers (see below)
components/            UI kit (buttons, forms, dialog, toast), layout shells, incident,
                       map (React-Leaflet/OSM), charts (Recharts), admin & student widgets
lib/
  classifier.ts        Priority classification & escalation engine (pure, shared client/server)
  incidents.ts         Incident service: create, status update, priority override
  stats.ts             Analytics computed from DB records
  auth.ts / session-token.ts   bcrypt + JWT (jose) sessions, RBAC helpers
  validation.ts        Zod schemas shared by forms and APIs
middleware.ts          Route protection & role-based redirects
prisma/schema.prisma   Database schema · prisma/seed.ts demo data
```

### Database (Prisma + PostgreSQL)

`User` 1–1 `StudentProfile` · `User` 1–N `EmergencyContact` · `User` 1–N `Incident` · `IncidentCategory` 1–N `Incident` · `Incident` 1–1 `IncidentLocation` · `Incident` 1–N `IncidentStatusHistory` · `Incident` 1–N `Notification` · `EmergencyContact` 1–N `Notification`.
All tables have primary keys, foreign keys with cascade rules, timestamps and indexes. The production build runs `prisma db push` to apply the schema using `DIRECT_URL`; runtime queries use `DATABASE_URL`.

### API routes

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` · `/api/auth/login` · `/api/auth/logout` | public |
| GET / PUT | `/api/profile` · POST `/api/profile/password` | logged in |
| GET / POST | `/api/contacts` · PUT / DELETE `/api/contacts/[id]` | student (own) |
| GET / POST | `/api/incidents` | GET: student (own) / admin (all) · POST: student |
| GET | `/api/incidents/[id]` | owner or admin |
| PATCH | `/api/incidents/[id]/status` · `/api/incidents/[id]/priority` | admin |
| PUT | `/api/incidents/[id]/location` | student (own, open incident) |
| PATCH | `/api/notifications` (mark read) | student |
| PATCH | `/api/admin/students/[id]` (activate / deactivate) | admin |

## 6. Security & privacy

- Passwords hashed with bcrypt; sessions are signed JWTs in httpOnly, SameSite cookies (8 h).
- Middleware + server checks enforce roles; students can only access their own incidents, contacts and locations (others return 404).
- Location requested only after explicit consent; coordinates never appear on public pages; phone numbers masked in notification views.
- Minimal personal data (no national ID, address, date of birth or medical records).
- Every alert, dispatch and notification is clearly labelled as a simulation.

## 7. Tech stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS (shadcn-style component kit) · Lucide icons · Framer Motion · Prisma ORM · PostgreSQL · jose + bcryptjs · React-Leaflet + OpenStreetMap · Recharts · Zod.

## 8. Troubleshooting

- **"The table does not exist"** → configure `DIRECT_URL` and run `npm run db:push`.
- **Map tiles not loading** → the map needs internet access to OpenStreetMap tile servers.
- **Port in use** → `npm run dev -- -p 3001`.
- **Reset everything** → delete `prisma/dev.db` and run `npm run setup`.
