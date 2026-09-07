# SkillSync — SIH 2026 Problem Statement 44
> **Academia–Industry Collaboration & Skill Intelligence Platform**

SkillSync is an end-to-end intelligent platform bridging academia and industry. It enables students, educational institutions, faculty members (academicians), and industry partners to collaborate seamlessly, assess real-world skills, uncover skill gaps, and match talent with relevant job, internship, project, research, and mentorship opportunities.

---

## 🌟 Key Features

- **Multi-Role RBAC & Portals**: Dedicated workspaces and dashboards for:
  - 🎓 **Students**: Skill assessments, portfolio showcase, job/internship matching, application tracking, skill gap analysis.
  - 🏢 **Industry Partners**: Opportunity posting, candidate search, application pipeline management, institutional collaborations.
  - 👨‍🏫 **Academicians / Faculty**: Research opportunities, curriculum alignment, student mentoring, institutional oversight.
  - 🏛️ **Institutions**: Student enrollment & batch management, placement statistics, department analytics, industry MoUs.
- **Dynamic Skill Intelligence**:
  - 3-tier difficulty quiz assessment engine with automatic scoring.
  - Automated skill gap analysis mapped against real-world target career roles.
- **Smart Opportunity Matching**:
  - Weighted algorithmic scoring (Skills 50%, Career Alignment 20%, Experience 10%, Assessments 10%, Preferences 10%).
- **AI Career Intelligence**:
  - Gemini AI integration for personalized learning roadmaps, role recommendations, and career trajectories.
- **Modern Cloud Architecture**:
  - TypeScript backend with Sequelize ORM & MySQL database.
  - Responsive React + Vite + Tailwind CSS frontend interface.

---

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js (Layered Architecture: Routes $\to$ Controllers $\to$ Services $\to$ Repositories $\to$ Models)
- **Database**: MySQL with Sequelize ORM (36 migrations)
- **Auth & Security**: JWT (Access + Refresh tokens), bcrypt, Helmet, CORS, Rate Limiting
- **Documentation**: OpenAPI 3.0 / Swagger UI (`/api/v1/docs`)

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **State & Routing**: React Router v6, Axios, Context API

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18.x
- MySQL Database (or Railway MySQL instance)

### 1. Clone the Repository
```bash
git branch -M main
git clone https://github.com/nrt9710-source/SIH2026-SkillSync-Ps44.git
cd SIH2026-SkillSync-Ps44
```

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment variables (.env)
cp .env.example .env

# Build & Run database migrations
npm run build
npm run migrate

# Optional: Seed demo dataset
npm run seed:controlled

# Start development server
npm run dev
```
Backend runs at `http://localhost:5000` with Swagger UI at `http://localhost:5000/api/v1/docs`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start development server
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 📜 License
This project is developed for Smart India Hackathon (SIH) 2026 — PS 44.
