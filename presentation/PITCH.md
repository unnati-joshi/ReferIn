# ReferIn Pitch Deck (Content Reference)

**Project:** ReferIn · **Team:** Ori
**Members:** Breeti Bandyopadhyay, Unnati Joshi, Aishwarya Mol, Mishti Kinker, Mohana

16 slides, written to be **read** (judges won't see a live presentation). Every slide stands
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
- Referred candidates are about 4x more likely to get an offer
- Most applicants have no insider to ask
- ReferIn finds the right one in seconds
**Footnote (on slide):** Sources: 85% of roles filled via networking, Lou Adler, LinkedIn (2016); referred candidates about 4x more likely to get an offer, Jobvite. (Full links in the References section below.)

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

### Slide 6 — Relationship Sourcing
**Title:** The People Who Can Actually Vouch
**Summary:** We rank insiders by the warm paths that get referrals accepted: a shared employer or a shared campus, surfaced on every card and labelled by source.
**Visual:** 📸 The ranked list from the database fallback, showing the green "Coworker · Company" and amber "Alumni · College" badges, match scores, and the "From database" source label.
**Bullets:**
- Coworker and Alumni paths, the signals that actually convert
- Every card labelled by source, here a curated profile database
- Proof of concept now; an official LinkedIn or ATS API makes it production grade
**Note:** GitHub exposes public repos and bios but not the shared-employer / shared-campus graph that the matching ranks on, so the demo runs on a curated database. The scoring engine does not change when the data source does.

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
**Title:** Simple Stack, Swappable Data
**Summary:** A lean React + Flask app wired to a language model and a relationship graph, with no heavy ML dependencies.
**Visual:** Architecture diagram: Job Description → LLM parse (DeepSeek) → Relationship DB (curated, LinkedIn ready) → fit + relationship scoring engine → ranked referrers + intro draft. Logos: React, Flask, DeepSeek.
**Bullets:**
- React, Vite and Tailwind talking to Flask and SQLite
- DeepSeek parses the posting and drafts the intro message
- Matching in pure Python: TF-IDF cosine plus shared employer and campus scoring; swap the data source for a LinkedIn API and the engine is unchanged

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

### Slide 15 — Good for Referrers, Too (two-sided network)
**Title:** Good for Referrers, Too
**Summary:** ReferIn is not only for job seekers. The employees who refer win as well, and that is what makes the network grow.
**Visual:** Two cards side by side. Left "For candidates", right "For referrers".
**For candidates:**
- A warm intro instead of the application void
- Ranked by real fit and real relationships
- A tailored message, already written
- Never the same person contacted twice
**For referrers:**
- Pre-qualified, high-fit candidates land in their inbox
- Companies already pay a referral bonus, often a thousand dollars or more, per successful hire
- Less time wasted and less reputation risk on a weak referral
- They earn it with one click, so they keep coming back
**Bottom line:** Every accepted referral pays the employee and opens a door for a candidate. Both sides compound.

### Slide 16 — Team & Call to Action
**Title:** Try ReferIn. Get Referred In.
**Summary:** Built end to end during the hackathon by Team Ori. Live and working today.
**Visual:** Petrol closing slide, logo + wordmark, the live URL / QR code, and the five team members as name chips.
**Team Ori:**
- Breeti Bandyopadhyay
- Unnati Joshi
- Aishwarya Mol
- Mishti Kinker
- Mohana
**Call to action:** Try it live, add your deployment URL or a QR code.

---

## Screenshots (in `presentation/screens/`)
Real captures from the running app — drop these onto the matching slides in Canva.

| File | Use on slide | Shows |
|---|---|---|
| `01-landing.png` | 3 (Solution) | Landing page incl. the hero match card |
| `03-find-search.png` | 4 (Search) | The "Find the right referrer" hero with the pasted job description and the parsed job pill |
| `03-find-referrers.png` | 5, 6, 7 | Database-fallback flow: ranked results with match %, green shared skills, "Coworker · Company" and "Alumni · College" badges, the "From database" label, and the drafted message panel |
| `02-opportunities-contacted.png` | 8 (Tracking) | "Already reached out" panel + how-it-works |
| `06-resume-extraction.png` | 9 (Auto resume) | DeepSeek extraction-preview modal |
| `05-profile.png` | 9 (Auto resume) | Profile page with avatar + editable fields |
| `07-jobs-filters.png` | 10 (Job search) | Browse Jobs filter panel |
| `08-jobs-results.png` | 10 (Job search) | Live job result cards with Apply / Find referrer |
| `09-theme-dark.png`, `10-theme-violet.png`, `11-theme-sand.png` | 11 (Experience) | Same screen across themes (place beside the light shots) |

## References (for the stats on slide 1)
- **85% of jobs filled via networking** — Lou Adler, "New Survey Reveals 85% of All Jobs are Filled Via Networking," LinkedIn (2016): https://www.linkedin.com/pulse/new-survey-reveals-85-all-jobs-filled-via-networking-lou-adler
  - Note: this came from a single non scientific LinkedIn poll, so frame it as "widely cited" rather than peer reviewed.
- **Referred candidates about 4x more likely to get an offer; referrals make up roughly 40% of hires from about 7% of applicants** — Jobvite: https://www.jobvite.com/blog/4-reasons-to-invest-in-employee-referrals/
  - Aggregated overview: Zippia, "Employee Referral Statistics": https://www.zippia.com/advice/employee-referral-statistics/
- **Employee referral bonuses (slide 15)** — most companies pay employees a cash bonus for a successful referral hire, commonly around a thousand dollars or more. Overview: Zippia / SHRM employee referral data (same Zippia link above). Frame the dollar figure as "often" rather than a fixed number.

Both stat citations are embedded as live hyperlinks in the .pptx (slide 1 footnote: "LinkedIn (2016)" and "Jobvite").

## Before you submit
- **Fill the placeholders:** live URL / QR code (slide 16, closing). Team Ori and all five members are already on the closing slide.
- **Keep numbers defensible:** the "80%" headline is the popular shorthand; the sourced figure is 85% via networking (Adler, above). If challenged, lean on the citation and the product itself as the proof.

## What's actually built (so claims hold up)
- Paste a JD → DeepSeek parses role/company/skills (regex fallback).
- Referrers served from a curated profile database (proof of concept). GitHub live sourcing exists in the code but is intentionally disabled: a public API cannot see the shared-employer / shared-campus graph the matching ranks on. Same engine runs on a LinkedIn or ATS API in production.
- Fit score = cosine similarity of job vs candidate and you vs candidate, plus alumni / coworker / connection bonuses (coworker and alumni paths weighted to surface warm intros).
- Auto-drafted, editable intro message per referrer.
- Sent-request tracking so the same person isn't contacted twice (badge + hide filter).
- Resume upload → auto-extraction → review/confirm; editable profile with avatar.
- Live job search (role/company/country) via a jobs API, with one-click handoff to referrer search.
- Six themes, live form validation, auto-growing inputs, Terms & Conditions at signup.
- Stack: React + Vite + Tailwind front end; Flask + SQLite back end.
