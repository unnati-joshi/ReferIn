# ReferIn — Pitch Deck (Content Reference)

15 slides, written to be **read** (judges won't see a live presentation). Every slide stands
on its own: a one-line summary plus up to three value bullets. Use `ReferIn-Pitch.html` as the
visual blueprint (open in a browser; **Print → Save as PDF** to export). This file is the copy
your team pastes into Canva/Slides.

**Brand:** warm paper background, petrol ink `#15535f`, teal accent `#0e9384`, clay `#c0552a`
for the "problem" slide. Headings in a serif display (Fraunces / Georgia), body in a clean
grotesk (Hanken Grotesk / Calibri), labels & numbers in mono (JetBrains Mono).
**Tagline:** *Find the person who can refer you in.*

> "Suggested visual" = what to put on the slide. Only a handful are real app screenshots
> (marked 📸 below); the rest are graphics your team designs.

---

### Slide 1 — Hook
**Title:** 80% of Jobs Are Filled Through Referrals
**Summary:** If you don't already know someone inside, you're applying through the slowest door. ReferIn gets you the warm intro.
**Visual:** Full-bleed petrol slide, big serif headline, ReferIn logo + wordmark.
**Bullets:**
- Referred candidates are ~4× more likely to be hired
- Most applicants have no insider to ask
- ReferIn finds the right one in seconds

### Slide 2 — The Problem
**Title:** Cold Applications Disappear
**Summary:** Everyone knows referrals work. Actually getting one is the hard part.
**Visual:** Split image — left: a resume falling into a void with an "Application received" auto-reply; right: a chaotic LinkedIn search with hundreds of unfiltered profiles.
**Bullets:**
- Finding the right insider is manual and slow
- No signal for who actually fits your background
- People burn goodwill messaging the wrong people

### Slide 3 — The Solution
**Title:** Paste a Job, Meet Your Referrer
**Summary:** ReferIn turns any job posting into a ranked shortlist of people who can refer you, with the message already written.
**Visual:** 📸 The hero / match card from the landing page (Match score, Shared skills, Mutual paths).
**Bullets:**
- Ranked insiders in seconds, from a pasted job description
- Scored by real fit, not follower counts
- A tailored intro draft, ready to send

### Slide 4 — Effortless Search
**Title:** Search Is One Paste Away
**Summary:** No boolean filters, no scrolling. Drop in the description and the parsing is done for you.
**Visual:** 📸 Find Referrers page — the large auto-growing job-description box with the parsed role + company + skill chips below it.
**Bullets:**
- Auto-extracts role, company, skills & location
- Works with LinkedIn, Greenhouse, Lever, anywhere
- Jump straight from any job listing into its referrers

### Slide 5 — Smart Fit Scoring (AI logic)
**Title:** Ranked by Real Fit
**Summary:** Every referrer gets a match score from how their background lines up with the role and with you.
**Visual:** 📸 A referrer result card — Match % badge, green shared-skill badges, Alumni / Coworker / Connected tags.
**Bullets:**
- Vector similarity across job ↔ person ↔ your profile
- Shared skills surfaced and highlighted in green
- Alumni, coworker & connection paths boost the score

### Slide 6 — Live Sourcing
**Title:** Real People, Pulled Live
**Summary:** Referrers come from live public data, not a stale hand-built list, with the source labelled on every card.
**Visual:** 📸 The ranked list with source badges ("Live from GitHub" / "AI suggested" / "From database") and GitHub/LinkedIn/email links.
**Bullets:**
- GitHub org members + user search in real time
- AI-suggested profiles fill thin coverage
- Always labelled: GitHub, AI, or database

### Slide 7 — AI Outreach
**Title:** The Message, Already Written
**Summary:** Each referrer comes with a personalised outreach draft built from the job and your profile, fully editable.
**Visual:** 📸 The referral message panel — drafted intro in the editor with Copy and "Send referral request".
**Bullets:**
- Tailored to the role and your background
- Edit inline, copy, or send in one click
- No more blank-page cold messages

### Slide 8 — Contacted Tracking (a differentiator)
**Title:** Never Message the Same Person Twice
**Summary:** ReferIn remembers everyone you've reached out to, protecting relationships and your time.
**Visual:** 📸 The "Already reached out" panel, "Requested" badges on result cards, and the "Hide already contacted" toggle.
**Bullets:**
- Sent requests tracked per person
- "Requested" badges + hide-contacted filter
- Recognises someone even across new searches

### Slide 9 — Auto Resume → Profile
**Title:** Resume In, Profile Done
**Summary:** Upload a PDF or DOCX and ReferIn fills your skills, education and experience automatically; you just confirm.
**Visual:** 📸 Resume upload → the extraction-preview modal → the profile page with avatar and editable fields.
**Bullets:**
- Auto-extracts skills, education & experience
- Review-and-confirm before anything saves
- Editable profile + photo; matches sharpen instantly

### Slide 10 — Built-in Job Search
**Title:** Find the Jobs, Too
**Summary:** Browse live openings by role, company and country, then jump straight to who can refer you.
**Visual:** 📸 The Browse Jobs page — filter chips, result cards with match %, salary and skills, and a "Find referrer" button on each.
**Bullets:**
- Live listings filtered by role, company, country
- Roles auto-suggested from your profile
- Every job links straight into referrer search

### Slide 11 — Experience / Design
**Title:** Built to Feel Effortless
**Summary:** A fast, polished interface with the small details that make a tool genuinely pleasant to use.
**Visual:** 📸 The theme switcher (six swatches) with two or three theme variants of the same screen side by side.
**Bullets:**
- Six light & dark themes, switch in one click
- Auto-growing inputs, live validation, clean empty states
- Editorial design, not your average hackathon UI

### Slide 12 — How It Works (architecture)
**Title:** Simple Stack, Live Data
**Summary:** A lean React + Flask app wired to real APIs and an LLM, with no heavy ML dependencies.
**Visual:** Architecture diagram: Job Description → LLM parse → [GitHub API + AI + Jobs API] → fit-scoring engine → ranked referrers + intro draft. Logos: React, Flask, DeepSeek, GitHub.
**Bullets:**
- React + Vite + Tailwind ↔ Flask + SQLite
- DeepSeek parses & drafts; GitHub + Jobs APIs run live
- Matching in pure Python: synonyms + TF-IDF cosine

### Slide 13 — Key Differentiator
**Title:** Not a Job Board. Not LinkedIn Search.
**Summary:** ReferIn is the only tool that ranks insiders by your fit, writes the intro, and stops you contacting them twice.
**Visual:** A comparison table — ReferIn vs. LinkedIn search vs. cold applying. Rows: Finds the right person · Ranks by your fit · Drafts outreach · Prevents duplicates. ReferIn = every check.
**Bullets:**
- LinkedIn lists everyone; we rank who fits you
- Search + score + draft + track in one flow
- Live public data, zero manual list-building

### Slide 14 — Market, Model & What's Next
**Title:** Big Market, Clear Path Forward
**Summary:** ReferIn serves a worldwide pool of job-seekers and grows into a two-sided referral network.
**Visual:** A market funnel (hundreds of millions of job-seekers; callout on India & new grads) beside a short roadmap timeline (Now → Next → Later).
**Bullets:**
- For students, new grads & switchers without an "in"
- Free now; Pro tier + employer referral tools next
- Later: opt-in referrers, verified alumni paths, response tracking

### Slide 15 — Team & Call to Action
**Title:** Try ReferIn. Get Referred In.
**Summary:** Built end-to-end during the hackathon — live and working today.
**Visual:** Petrol closing slide — logo + wordmark, the live URL / QR code, team initials.
**Bullets:**
- Full-stack team: React, Flask, live APIs + LLM
- Try it live: [your URL / QR code]
- [Add each member's standout credential]

---

## Screenshots (in `presentation/screens/`)
Real captures from the running app — drop these onto the matching slides in Canva.

| File | Use on slide | Shows |
|---|---|---|
| `01-landing.png` | 3 (Solution) | Landing page incl. the hero match card |
| `03-find-referrers.png` | 4, 5, 6, 7 | Full flow: paste box + parsed job, ranked results, "Live from GitHub", match %, and the message panel |
| `02-opportunities-contacted.png` | 8 (Tracking) | "Already reached out" panel + how-it-works |
| `06-resume-extraction.png` | 9 (Auto resume) | DeepSeek extraction-preview modal |
| `05-profile.png` | 9 (Auto resume) | Profile page with avatar + editable fields |
| `07-jobs-filters.png` | 10 (Job search) | Browse Jobs filter panel |
| `08-jobs-results.png` | 10 (Job search) | Live job result cards with Apply / Find referrer |
| `09-theme-dark.png`, `10-theme-violet.png`, `11-theme-sand.png` | 11 (Experience) | Same screen across themes (place beside the light shots) |

## Before you submit
- **Fill the placeholders:** live URL / QR (slides 3–15), and each teammate's credential (slide 15).
- **Keep numbers defensible:** the "80%" / "4×" referral stats are widely cited — soften to "studies suggest" if challenged; the product itself is the proof.

## What's actually built (so claims hold up)
- Paste a JD → DeepSeek parses role/company/skills (regex fallback).
- Referrers pulled live: GitHub org members + search, AI-suggested profiles, seed-DB fallback, each labelled.
- Fit score = cosine similarity of job↔candidate and you↔candidate, plus alumni / coworker / connection bonuses.
- Auto-drafted, editable intro message per referrer.
- Sent-request tracking so the same person isn't contacted twice (badge + hide filter).
- Resume upload → auto-extraction → review/confirm; editable profile with avatar.
- Live job search (role/company/country) via a jobs API, with one-click handoff to referrer search.
- Six themes, live form validation, auto-growing inputs, Terms & Conditions at signup.
- Stack: React + Vite + Tailwind front end; Flask + SQLite back end.
