# AI Assistant Build Prompt: Maatram Volunteer Pass

Paste everything below this line into your AI coding assistant.

---

## 1. Your role

You are a senior full-stack engineer helping a student team build a working hackathon prototype called **Maatram Volunteer Pass** for the Maatram HackForge 2026–27 competition (Problem Statement **MH26-02**). Build the project step by step. After each step, show me what you created, tell me how to run and test it, and wait for me to say "continue" before moving on. Keep code clean, commented where logic is non-obvious, and easy for a student team to explain to judges.

## 2. Problem statement (official definition)

**ID and title:** MH26-02 · Volunteering Gamification Portal for the Maatram Community
**Track:** Software
**Theme:** Maatram Community

**Background:** Maatram Foundation depends on volunteers: students, alumni and other supporters who help with school visits, the admissions process, background verification (BGV), mock interviews and admission panel interviews. Today it is hard to see who is helping, how much, and who is drifting away.

**The challenge:** Build a portal where Maatram students, alumni and volunteers can sign up, find opportunities and have their contribution recognised. It should:
- List volunteering opportunities with Maatram, such as school visits, admissions support, BGV, mock interviews and admission panel interviews, online or offline.
- Let volunteers register and subscribe to opportunities.
- Let the office team and admin super users review and approve sign-ups.
- Quantify the effort spent, in hours and events.
- Automatically send a thank-you note by email and offer a ready-to-share LinkedIn post.
- Volunteers must agree before any post or contact happens, and personal data should be collected only for this purpose.

**Expected solution:**
- A working portal with sign-up, opportunity listing, approval workflow and hour tracking.
- A leaderboard for recognition.
- Reports that show volunteering by students and alumni, how consistent alumni are, and who is going quiet, and which panel and mock-interview volunteers are available to call and who should not be contacted.
- A summary of hours contributed by volunteers from each employer organisation, which can be shared with that organisation.

**Hard rule:** use only dummy volunteer data while building. Never use real personal data.

## 3. Product vision

Every volunteer carries a **Maatram Pass**. It opens opportunities, records every hour and earns recognition. Tagline: *Scan in. Give back. Get recognised.*

The portal should let Maatram finally see who is helping, who is drifting away, and who to call, while every volunteer stays in control of their own data.

## 4. Tech stack (fixed)

- **Frontend:** React (Vite is fine), React Router, a simple component library or Tailwind CSS
- **Backend:** Node.js with Express (REST API)
- **ORM and database:** Prisma ORM with PostgreSQL
- **Auth:** JWT (access token; hash passwords with bcrypt), role-based middleware
- **Email:** Nodemailer (use a test SMTP such as Ethereal or Mailtrap for development)
- **Scheduled jobs:** node-cron
- **QR scanning:** a browser QR scanner library (for example `html5-qrcode`); QR generation with `qrcode`
- **Seeding:** `@faker-js/faker` inside a Prisma seed script
- **Optional, later only if needed:** Redis for caching leaderboard and reports. Do not build it now, but keep report queries in their own service functions so caching can be added later.

## 5. Roles and access

| Role | Can do |
|---|---|
| **Volunteer** | Sign up, edit profile and consents, browse opportunities, apply or mark "interested", confirm or decline selection, withdraw, view own hours, badges, rank and Maatram Pass QR |
| **Office team** | Everything about running events: approve volunteer sign-ups, create and edit opportunities, view applicants, select volunteers, run QR and manual check-in/out, view reports and leaderboard |
| **Admin** | Everything the office team can do, plus approve office-team sign-ups, manage accounts and roles, view the activity log, edit settings (segment thresholds) and manage employers |

Rules:
- Volunteer sign-ups are approved by the office team or an admin.
- Office-team sign-ups are approved **only by an admin**.
- Unapproved users can log in only to see a "pending approval" screen.
- Every protected API route must check the role in middleware.

## 6. Phase 1 scope (build this)

### 6.1 Auth and approvals
- Sign up and sign in for all three roles.
- Sign-up form fields: name, email, password, volunteer type (`student` or `alumni`), optional employer, optional skills, and the consent checkboxes in 6.7.
- Account status: `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`.
- Approval queue screens for office team (volunteers) and admin (office team and volunteers).

### 6.2 Admin area
- Accounts and roles list, with the ability to approve, reject or suspend.
- Activity log: who did what and when (approvals, opportunity changes, selections, manual attendance edits).
- Click through to any volunteer's profile.

### 6.3 Opportunity creation (office team and admin)
Fields: title, description, event category, online or offline, location or meeting link, start date/time, end date/time, application deadline, required volunteer count (capacity), required skills or experience, eligibility requirements, status.

- **Categories (fixed list):** School Visit, Admissions Support, BGV, Mock Interview, Panel Interview.
- **Status:** `DRAFT`, `OPEN`, `CLOSED`, `LIVE`, `COMPLETED`, `CANCELLED`.
- Applications are not allowed after the deadline or when the opportunity is not open.

### 6.4 Opportunity listing and application flow
- Volunteers see a list of open opportunities, can open the details and **Apply** or mark **I'm interested**.
- Application lifecycle:
  `APPLIED` → `SELECTED` → `CONFIRMED` or `DECLINED`; also `WITHDRAWN`, `WAITLISTED`, `REJECTED`, `ATTENDED`, `NO_SHOW`.
- Office team selects volunteers. If capacity is full, extra applicants are `WAITLISTED` (ordered by application time).
- Selected volunteers must confirm or decline. They can withdraw at any time before the event.
- When someone declines or withdraws, the office team sees the waitlist and can promote the next person with one click. *(Stretch goal: automatic promotion of the earliest waitlisted volunteer.)*
- **Selection email** is sent when a volunteer is selected: event name, date, time, place and exact location (or meeting link).

### 6.5 Opportunity views for the office team and admin
- **Upcoming:** list of registered/interested volunteers, with filters (type, skills, employer, status), registration time, and click-through to the volunteer profile.
- **Live:** real-time attendance list that updates as people check in and out.
- **Completed:** volunteers who attended, with check-in and check-out times and hours.

### 6.6 Hours tracking
- Every volunteer has a **Maatram Pass** page showing their ID and a **QR code** (encode a unique volunteer ID).
- Office team or admin opens a scanner screen: scanning a QR for an event marks check-in; scanning again marks check-out; duration is calculated and stored.
- **Manual fallback:** a search box and Check-in / Check-out buttons for volunteers without a QR.
- Edge cases: block double check-in; flag a missing check-out; a nightly job auto-closes open sessions at the event's end time and marks them `NEEDS_REVIEW` so the office team can correct them.
- Only users who are `CONFIRMED` for that opportunity can be checked in (office team can override with a note, which is logged).

### 6.7 Consent and privacy (must be real, not decorative)
Store consents in a separate table with a timestamp and never overwrite; insert a new row when a choice changes.

Three separate consents at sign-up, none pre-ticked:
1. `DATA_USE` (required): "Maatram may store my details for volunteer management."
2. `INTERVIEW_CONTACT` (optional): "Maatram may contact me for mock and panel interviews."
3. `LINKEDIN_SHARE` (optional): "Maatram may offer me a ready-to-share LinkedIn post about my contribution."

Rules:
- A Privacy tab in the volunteer profile lets them change consents any time.
- A `doNotContact` flag exists on every volunteer.
- **One shared backend helper** (for example `getContactableVolunteers()`) is the only way any "who to contact" list is produced. It returns only volunteers with `INTERVIEW_CONTACT = true` and `doNotContact = false`.
- The LinkedIn button and post text appear only if `LINKEDIN_SHARE = true`.
- Transactional emails (selected, thank-you) are allowed without extra consent. Marketing or outreach emails are not.
- Collect only: name, email, password hash, type (student/alumni), employer, skills. Show a "why we collect this" hint under fields.
- Employer reports show **aggregates only**. Individual names appear only for volunteers who consented to be listed.

### 6.8 Thank-you email and LinkedIn post
- When an opportunity is marked `COMPLETED`, send each attendee a thank-you email with their hours for that event and their running total.
- If the volunteer has `LINKEDIN_SHARE` consent, include a "Share on LinkedIn" section and show the same on their dashboard.
- Post template with placeholders, for example:
  `Proud to have volunteered {hours} hours at Maatram's {eventCategory} on {date}. #Maatram #Volunteering`
- UI: an **editable textarea** pre-filled with the template, a **Copy text** button, and a **Share on LinkedIn** button that opens
  `https://www.linkedin.com/sharing/share-offsite/?url=<public contribution card URL>`
- Create a small public "contribution card" page (volunteer first name, hours, event) with Open Graph meta tags so LinkedIn shows a preview. Nothing is ever posted automatically, and the edited text is not stored.
- Keep an `EmailLog` table (recipient, template, status, sent time).

### 6.9 Leaderboard
- **Monthly leaderboard:** rank volunteers by number of events attended in the month, with total hours as the tie-breaker.
- Show a month selector. Also show an all-time view.

### 6.10 Badges (gamification)
- **Event badges:** 1st event, 5th event, 10th event.
- **Hours badges:** 10 hours, 25 hours, 50 hours.
- **Monthly leaderboard badges:** "Nov 2026 – Top 1 / Top 2 / Top 3".
- Event and hours badges are awarded right after each check-out when totals are recalculated.
- Monthly badges are awarded by a cron job on the 1st of each month for the previous month. The job must be idempotent (never awards twice for the same month). Ties for a rank are all awarded; document this rule.
- Use a unique constraint on (volunteer, badge, month) to prevent duplicates.
- Volunteer dashboard: total hours, total events, current rank, badges earned, and a progress bar to the next badge.

### 6.11 Volunteer engagement report
Segments are computed over a configurable window, default the **last 4 months**:

| Segment | Rule (defaults, admin-editable) |
|---|---|
| Frequent | 3 or more events in the window |
| Occasional | 1 or 2 events in the window |
| Quiet | Has volunteering history, but none in the window |
| No volunteering history | Never volunteered |

- Store `windowMonths` and `frequentMinEvents` in a settings table; admin can edit them.
- Show the period on the report ("10 Jul 2026 – 10 Nov 2026 (last 4 months)").
- Show a chart of the four segments, a table per segment with hours and events, a **"drifting away"** list (was Frequent or Occasional earlier, now Quiet), and a student vs alumni split.
- Include an **alumni consistency score:** active months in the last 12 divided by 12.
- **Who to call for mock and panel interviews:** two lists side by side. "Available to contact" (from the consent helper) and "Do not contact / no consent" with the reason. Support filters by segment, skills and type.

### 6.12 Employer-wise contribution report
- Search by employer name (autocomplete), choose a start date and end date, click **Generate report**.
- Output: total volunteers, total hours, total events, number of unique events, and the employer name.
- Export as **CSV** and as a clean print-friendly page for **Save as PDF**.
- **Employer name consistency:**
  - `Employer` table (name, status `APPROVED` or `PENDING`) and `EmployerAlias` table (TCS, Tata Consultancy Services, and so on).
  - Volunteers **pick** their employer from an autocomplete that searches names and aliases. They cannot free-type duplicates.
  - If their company is missing, they can add it as `PENDING`; an admin reviews and can **merge** duplicates (the old name becomes an alias and all volunteers are re-pointed).
  - Optional "Did you mean...?" suggestions using PostgreSQL `pg_trgm` through `prisma.$queryRaw`. If time is short, plain autocomplete plus aliases is acceptable.
  - Seed common employers (TCS, Infosys, Zoho, Cognizant, Wipro, HCL, Accenture, Freshworks and so on).
- The report groups by `employerId`, never by free text.

## 7. Out of scope for Phase 1 (do NOT build, but do not block)

- **One permanent identity across student and alumni with preserved history.** For now each volunteer has a `type` field (`STUDENT` or `ALUMNI`). Keep the schema simple so this can be added later (for example a `StatusHistory` table with `becameAlumniOn`).
- Employer history over time (hours credited to the employer at the time).
- Redis caching.
- Automatic waitlist promotion, unless time allows.
- Real payment, SMS, or any real personal data.

## 8. Suggested data model (Prisma)

Create at least these models and adjust as needed: `User` (role, status, name, email, passwordHash, type, employerId, doNotContact, skills), `Consent` (userId, type, granted, createdAt), `Employer`, `EmployerAlias`, `Opportunity`, `Application` (status, appliedAt), `Attendance` (checkIn, checkOut, hours, method `QR`/`MANUAL`, needsReview), `Badge`, `UserBadge` (unique on user + badge + month), `EmailLog`, `AuditLog`, `Setting` (key, value).

Add indexes on foreign keys, attendance times and application status.

## 9. Backend rules and quality

- Validate all input (zod or express-validator).
- Consistent error responses and HTTP status codes.
- Environment variables in `.env` with a `.env.example`.
- Hash passwords with bcrypt; JWT secret from env; token expiry set.
- Role-based middleware on every protected route.
- Put business logic in service files (hours, segments, badges, leaderboard, consent helper), not inside route handlers, so it is testable and explainable.
- Write unit tests for: segment classification, badge awarding, leaderboard ranking and the consent helper.
- Add a short README: setup, environment variables, how to seed, user roles and demo logins.

## 10. Seed data (dummy only)

Create a Prisma seed script that generates:
- 1 admin, 3 office-team users, about 60 volunteers (mix of students and alumni, across the four segments).
- About 15 opportunities across all five categories in the past, live and upcoming.
- Applications in every status, attendance records with check-in/out times, employers with aliases, and varied consents (some with `doNotContact` or no interview consent).
- Known demo logins listed in the README (for example admin@demo.test / office@demo.test / volunteer@demo.test).

## 11. UI expectations

- Clean, professional, responsive layout with the Maatram Pass branding and the tagline *Scan in. Give back. Get recognised.*
- Role-based navigation.
- Volunteer **Maatram Pass** page that looks like a digital ID: name, type, total hours, badges, QR code.
- Charts for the engagement report (a simple chart library such as Recharts).
- Loading, empty and error states on every screen.

## 12. Expected result (acceptance criteria)

The project is done when this end-to-end demo works with seeded data:

1. A new volunteer signs up with consents and sees "pending approval".
2. The office team approves them. An office-team sign-up can only be approved by an admin.
3. The office team creates an opportunity with all required fields.
4. The volunteer sees it in the listing, opens details and applies.
5. The office team selects the volunteer and a **selection email** is logged with date, time and location. The volunteer confirms.
6. On the event day, the office team scans the volunteer's QR (or uses manual check-in), then checks them out. Hours are calculated and stored.
7. The opportunity is marked completed and a **thank-you email** is sent. A volunteer with LinkedIn consent sees an editable post, a Copy button and a Share on LinkedIn link. A volunteer without that consent sees none of it.
8. Badges and the monthly leaderboard update correctly.
9. The engagement report shows the four segments for the configured window, a drifting-away list, a student vs alumni split and the consistency score.
10. The "who to call" screen lists only consenting volunteers and clearly shows who must not be contacted, with reasons.
11. The employer report returns volunteers, hours, events and unique events for a chosen employer and date range, matches aliases correctly (typing "TCS" finds the same employer as the full name), and exports to CSV and print/PDF.
12. The admin can see the activity log, accounts and roles, and edit segment thresholds.

## 13. How to work with me

1. First, reply with a short **plan**: folder structure, Prisma schema outline and the order in which you will build things. Wait for my "continue".
2. Build in this order, one step at a time: project setup, Prisma schema and seed, auth and roles, approvals, opportunities, applications and waitlist, attendance and QR, consent and email, badges and leaderboard, engagement report, employer report, polish and README.
3. At each step, list the files you created or changed, the commands to run and how I can test it.
4. If a requirement is unclear or conflicts with another, ask me one short question instead of guessing.
5. Do not add features outside Phase 1 scope without asking.
