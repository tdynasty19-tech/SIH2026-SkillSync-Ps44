# SIH PS 44 — Frontend Client Application

High-performance, modern React web application for the **Smart India Hackathon Problem Statement 44: Academia–Industry Collaboration & Skill Intelligence Platform**.

---

## 1. Tech Stack & Architecture

- **Core**: React 18 + TypeScript (strict mode) + Vite bundler
- **Styling**: Tailwind CSS + Lucide React icon suite
- **Data Visualization**: Recharts (skill radar, readiness distributions, analytics)
- **API Client**: Axios instance (`apiClient.ts`) configured with:
  - Base URL: `https://sih2026-skillsync-ps0044-production.up.railway.app/api/v1`
  - Automatic JWT token attachment
  - Transparent 401 interceptor with queued refresh token rotation
- **Routing & RBAC**: React Router v6 with `ProtectedRoute` and `RoleBasedRoute` across 4 authenticated roles.

---

## 2. Multi-Role Portal Architecture

### A. Public & Authentication
- `/` — Landing page with live hero stats & platform features
- `/opportunities` — Public search and explore internships/jobs
- `/login` — Unified login for all roles with role-based dashboard redirection
- `/register/:role` — Role-tailored registration (`student`, `industry`, `academician`, `institution_admin`)
- `/role-selection` — Interactive role onboarding guide

### B. Student Portal (`/student/*`)
- `/dashboard` — Live skill progress, matched opportunities, and real-time alerts
- `/skills` — Verified skill profile, endorsements, and category management
- `/skill-gap` — Target role gap analysis with priority skill recommendations
- `/career` — Career pathways, salary ranges, and required competencies
- `/assessments` — 3-tier difficulty skill quizzes with automatic grading
- `/jobs` — Opportunity search with 50/20/10/10/10 match score indicators
- `/applications` — Lifecycle tracker (Applied $\to$ Shortlisted $\to$ Placed)
- `/portfolio` — Shareable digital skill portfolio & verifiable achievements

### C. Industry Portal (`/industry/*`)
- `/dashboard` — Active postings, applicants, and shortlisting metrics
- `/post-opportunity` — Multi-step internship/job posting wizard with required skills
- `/candidates` — Candidate discovery with filterable skill match scores
- `/applications` — Applicant review pipeline with 1-click status transitions

### D. Academician Portal (`/academician/*`)
- `/dashboard` — Student skill distribution, department readiness, and mentorship alerts
- `/internships` — Faculty industry training, sabbatical & immersion records
- `/research` — Joint academia-industry R&D collaboration initiatives

### E. Institution Portal (`/institution/*`)
- `/dashboard` — College-wide placement velocity, skill health, and partner stats
- `/skill-intelligence` — Departmental competency breakdown and curriculum alignment
- `/placements` — Placement rates, top recruiting sectors, and package analytics
- `/reports` — Exportable accreditation-ready reports (NIRF / NAAC / AICTE)

---

## 3. Getting Started

### Prerequisites
- Node.js 18+ / 20+ / 24+
- Backend running on `http://localhost:5000`

### Commands
```bash
# Install dependencies
npm install

# Start Vite Development Server (Port 5173)
npm run dev

# Build for Production
npm run build

# Preview Production Bundle
npm run preview
```

---

## 4. Environment Variables (`.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
```
