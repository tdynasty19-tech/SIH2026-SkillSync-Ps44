# SIH PS 44 — Backend API & Skill Intelligence Engine

Production-grade REST API and intelligence service for the **Smart India Hackathon Problem Statement 44: Academia–Industry Collaboration & Skill Intelligence Platform**.

---

## 1. Tech Stack & Architecture

- **Runtime & Language**: Node.js (>= 18.x) + TypeScript (strict mode)
- **Framework**: Express.js with layered architecture:
  $$\text{Route} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Repository} \longrightarrow \text{Sequelize Model} \longrightarrow \text{MySQL (Railway)}$$
- **Database & ORM**: MySQL with Sequelize ORM (31 schema migrations, indexes, constraints)
- **Security & Auth**: JWT (Access + Refresh tokens), bcrypt hashing, Helmet, CORS, Rate Limiting, RBAC middleware
- **Validation & Logging**: Zod schema validation, structured Winston logger
- **API Spec**: OpenAPI 3.0 / Swagger UI at `/api/v1/docs`

---

## 2. Implemented Core Systems

| Module | Features & Capabilities |
| :--- | :--- |
| **Authentication & RBAC** | Multi-role registration & login (`student`, `industry`, `academician`, `institution_admin`), token refresh, password hashing. |
| **Skill Intelligence** | Verified skill profiles, 3-tier difficulty quiz assessment engine, automated skill gap identification against target career paths. |
| **Opportunity Matching** | Weighted scoring algorithm: **Skills 50%**, **Career Alignment 20%**, **Experience 10%**, **Assessments 10%**, **Preferences 10%**. |
| **Application Pipeline** | Full lifecycle: applied $\to$ under review $\to$ shortlisted $\to$ accepted $\to$ placed. |
| **AI Career Intelligence** | Hybrid AI engine (Gemini API with deterministic rule-based fallback) for course, role, and learning roadmaps. |
| **Dashboards & Notifications** | Live DB-aggregated statistics for all 4 roles, real-time unread/read notification pipeline. |

---

## 3. Quick Start & Execution

### Prerequisites
- Node.js 18+ / 20+ / 24+
- `.env` configured with Railway MySQL connection and JWT secrets.

### Commands
```bash
# Install dependencies
npm install

# Build TypeScript to dist/
npm run build

# Start Production Server (Port 5000)
node dist/server.js
# or: npm start

# Start Development Server (auto-reload)
npm run dev

# Run Integration & E2E Validation Tests
npx ts-node src/scripts/test-phase4-e2e.ts
```

---

## 4. Live Demo Accounts (R5 Dataset)

All accounts share password: `DemoPassword123!`

| Role | Email | Profile Name / Entity |
| :--- | :--- | :--- |
| **Student** | `demo.student@sih.gov.in` | Aarav Sharma (B.Tech CSE, 6th Sem, IIT Bombay) |
| **Academician** | `demo.academician@sih.gov.in` | Dr. S. Ramanujan (Prof & Head, NITK Surathkal) |
| **Industry** | `demo.industry@sih.gov.in` | Priya Nair (Talent Lead, Tata Consultancy Services) |
| **Institution Admin** | `admin@sih.gov.in` | System Administrator (SIH Central Authority) |

---

## 5. Primary API Routes (Base: `/api/v1`)

- `GET /health` — Health check status
- `/docs` — Swagger UI API explorer
- `/auth` — Register, Login, Refresh, Logout, Profile
- `/skills` — Skill categories, master list, student skill endorsements
- `/assessments` — Quiz generation, submit attempts, scoring
- `/opportunities` — Internships/Jobs listing, filter, match score calculation
- `/applications` — Apply, withdraw, status tracking, employer review
- `/ai` — Skill gap analysis, course & career path recommendations
- `/dashboards` — Role-tailored metrics & performance analytics
- `/notifications` — User notification feed, mark-as-read
