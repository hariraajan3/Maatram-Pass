# Maatram Volunteer Pass

> **Tagline:** *Scan in. Give back. Get recognised.*  
> **Problem Statement:** MH26-02 · Volunteering Gamification Portal for the Maatram Community  
> **Theme:** Maatram Community · Software Track

---

## 🌟 Overview

The **Maatram Volunteer Pass** is a full-stack platform built for the Maatram Foundation to empower and recognize volunteers—students, alumni, and corporate professionals—who support school visits, admissions, background verification (BGV), mock interviews, and admission panel interviews.

Every volunteer carries a digital **Maatram Pass** with a unique QR code that tracks hours, unlocks recognition badges, and generates ready-to-share LinkedIn contribution posts while keeping volunteers in strict control of their data.

---

## 🏗️ Architecture (MVC Pattern in JavaScript)

Both backend and frontend follow the exact MVC organization from the **Maatram-KK** project:

### Backend Structure (`backend/`)
```
backend/
├── server.js                     # Root Express server & cron job initializer
├── package.json                  # Scripts & dependencies
├── prisma/
│   ├── schema.prisma             # PostgreSQL schema (Prisma v7 with @prisma/adapter-pg)
│   └── seed.js                   # Seed script with demo data
└── src/
    ├── config/
    │   ├── auth.js               # JWT secret, signToken & verifyToken helpers
    │   ├── cron.js               # Nightly auto-checkout & monthly badge scheduler
    │   ├── db.js                 # PrismaClient + pg.Pool database adapter
    │   └── email.js              # Nodemailer transporter configuration
    ├── middlewares/
    │   ├── auth.js               # authenticate, requireRole, requireApproved
    │   └── errorHandler.js       # Central error handling middleware
    ├── controllers/
    │   ├── adminController.js     # User management, audit logs, thresholds
    │   ├── attendanceController.js# QR / manual check-in & check-out, badge triggers
    │   ├── authController.js      # Sign-up (with consents), sign-in, /me
    │   ├── dashboardController.js # Volunteer stats, progress, leaderboard
    │   ├── employerController.js  # Employer autocomplete, suggest & merge
    │   ├── onboardingController.js# Consent versioning (never overwritten), profile
    │   ├── passController.js      # Public contribution card & QR generation
    │   ├── reportController.js    # 4 engagement segments, drifting, who-to-call, CSV
    │   ├── scheduleController.js  # Opportunity CRUD, status lifecycle, thank-you notes
    │   └── selectionController.js # Apply, waitlist promotion, confirm/decline
    ├── routes/
    │   ├── adminRoutes.js
    │   ├── attendance.js
    │   ├── authRoutes.js
    │   ├── dashboard.js
    │   ├── employerRoutes.js
    │   ├── indexRoutes.js         # Central route aggregator mounted at /api
    │   ├── onboarding.js
    │   ├── passRoutes.js
    │   ├── reportRoutes.js
    │   ├── schedule.js
    │   ├── selectionRoutes.js
    │   └── userRoutes.js
    └── utils/
        ├── auditLogger.js         # Tamper-evident AuditLog helper
        ├── notifications.js       # Selection & thank-you emails with LinkedIn drafts
        └── security.js            # bcrypt password hashing & validation
```

### Frontend Structure (`frontend/`)
```
frontend/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                   # Role-based protected routes
    ├── api/                      # Axios API clients
    ├── components/
    │   ├── Navbar.jsx            # Dynamic role-based navigation
    │   ├── OpportunityCard.jsx   # Event cards with category badges
    │   ├── BadgeDisplay.jsx      # Recognition badges
    │   ├── EmployerAutocomplete.jsx # Instant company search + aliases
    │   ├── LoadingSpinner.jsx
    │   ├── EmptyState.jsx
    │   └── ErrorState.jsx
    ├── context/
    │   └── AuthContext.jsx       # Auth state, token & user profile
    └── pages/
        ├── LoginPage.jsx
        ├── RegisterPage.jsx       # 3 independent consents + "why we collect this" hints
        ├── PendingApprovalPage.jsx# Held screen for unapproved accounts
        ├── VolunteerDashboard.jsx # Hours, badges, rank, next milestone, LinkedIn share
        ├── MaatramPassPage.jsx    # Digital ID card with QR code & privacy toggles
        ├── OpportunitiesPage.jsx  # Browse & filter events
        ├── OpportunityDetailPage.jsx # Full event details, apply, confirm/decline
        ├── LeaderboardPage.jsx    # Monthly & all-time recognition rankings
        ├── OfficeHomePage.jsx     # Staff dashboard with quick actions
        ├── CreateOpportunityPage.jsx # Event creation (categories, dates, capacity)
        ├── ManageOpportunityPage.jsx # Upcoming, Live attendance, Completed sessions
        ├── QRScannerPage.jsx      # Camera QR scanner + manual fallback
        ├── ApprovalQueuePage.jsx  # Approve volunteers & staff sign-ups
        ├── EngagementReportPage.jsx # 4 segments, drifting list, who-to-call
        ├── EmployerReportPage.jsx # Corporate CSR impact summary + CSV export
        ├── AdminHomePage.jsx      # Superuser admin center
        ├── UserManagementPage.jsx # Suspend / approve / role management
        ├── AuditLogPage.jsx       # Security audit trail with pagination
        ├── SettingsPage.jsx       # Configurable engagement window & thresholds
        ├── PublicPassPage.jsx     # Shareable contribution card
        └── NotFoundPage.jsx
```

---

## 👥 Demo Logins

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@demo.test` | `Admin@123` | Full superuser access, user roles, audit log, approve office team |
| **Office Team** | `office1@demo.test` | `Office@123` | Create events, approve volunteers, run QR scanner, view reports |
| **Volunteer** | `volunteer@demo.test` | `Volunteer@123` | Digital Pass QR, apply to opportunities, badges, LinkedIn share |

---

## 🚀 How to Run

### 1. Backend Setup
```bash
cd backend

# Install dependencies (already prepared)
npm install

# Run database migrations (or push schema to Neon DB)
npm run db:push

# Seed database with demo accounts, employers, opportunities & badges
npm run seed

# Start Express server (runs on http://localhost:3001)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies (already prepared)
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

---

## 🎯 Key Features & Requirements Verified

1. **JWT Auth & Role-Based Middleware:**
   - 3 Roles: `VOLUNTEER`, `OFFICE_TEAM`, `ADMIN`.
   - `requireApproved` middleware ensures pending accounts see the Pending Approval screen until approved.
   - Office-team sign-ups are approved **only by an admin**.

2. **Opportunity Lifecycle:**
   - Categories: *School Visit, Admissions Support, BGV, Mock Interview, Panel Interview*.
   - Lifecycle: `APPLIED` → `SELECTED` → `CONFIRMED` / `DECLINED` / `WITHDRAWN` / `WAITLISTED` / `ATTENDED`.
   - Selection emails sent upon selection. Capacity management with automatic waitlist.

3. **Hours Tracking & QR Scanner:**
   - Every volunteer has a digital ID card with their unique QR code.
   - Office team scans QR to check in; scanning again calculates elapsed duration and checks them out.
   - Manual search fallback with staff override notes.

4. **Real Privacy & Consent (Audit-Trail):**
   - 3 separate consents (`DATA_USE`, `INTERVIEW_CONTACT`, `LINKEDIN_SHARE`).
   - Consents are stored with timestamps in a separate table and **never overwritten** (new version inserted on change).
   - Single shared backend helper `getContactableVolunteers()` for interview outreach.

5. **Gamification & Badges:**
   - Milestone badges: 1st event, 5th event, 10th event, 10 hours, 25 hours, 50 hours.
   - Monthly leaderboard badges: Gold (Top 1), Silver (Top 2), Bronze (Top 3) via idempotent monthly cron job.

6. **Engagement Analytics & Corporate Reports:**
   - 4 segments: Frequent, Occasional, Quiet (Drifting), and No History.
   - Alumni consistency score: active volunteering months in last 12 divided by 12.
   - Corporate contribution summary with alias matching (e.g. TCS finds Tata Consultancy Services) and CSV export.
