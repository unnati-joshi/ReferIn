import { useState } from "react";
import { getJobRecommendations } from "../services/api";

const ROLES = [
  // Full-time
  "Software Engineer",
  "Backend Engineer",
  "Frontend Engineer",
  "Full Stack Engineer",
  "Data Engineer",
  "Data Scientist",
  "ML Engineer",
  "DevOps Engineer",
  "SRE",
  "Android Developer",
  "iOS Developer",
  "Product Manager",
  "Product Analyst",
  "Security Engineer",
  "QA Engineer",
  // Internships
  "Software Engineering Intern",
  "Data Science Intern",
  "ML Intern",
  "Frontend Intern",
  "Backend Intern",
  "Product Intern",
  "DevOps Intern",
  "Research Intern",
];

const COMPANIES = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Stripe",
  "Airbnb", "Uber", "Lyft", "LinkedIn", "Salesforce", "Adobe",
  "Atlassian", "Dropbox", "Shopify", "Spotify", "Slack", "Zoom",
  "Flipkart", "Swiggy", "Zomato", "Razorpay", "CRED", "Meesho", "Groww",
  "Zepto", "PhonePe", "Paytm", "Ola", "Freshworks", "Zoho",
  "Infosys", "Wipro", "TCS", "HCL", "Cognizant",
];

const COUNTRIES = [
  { code: "in", label: "India" },
  { code: "us", label: "USA" },
  { code: "gb", label: "UK" },
  { code: "au", label: "Australia" },
  { code: "ca", label: "Canada" },
  { code: "sg", label: "Singapore" },
  { code: "de", label: "Germany" },
];

// Skill keyword → roles it strongly signals
const SKILL_TO_ROLES = {
  python:                ["Backend Engineer", "Data Engineer", "ML Engineer"],
  fastapi:               ["Backend Engineer"],
  django:                ["Backend Engineer"],
  flask:                 ["Backend Engineer"],
  go:                    ["Backend Engineer"],
  golang:                ["Backend Engineer"],
  rust:                  ["Backend Engineer"],
  java:                  ["Backend Engineer"],
  "spring boot":         ["Backend Engineer"],
  spring:                ["Backend Engineer"],
  "c#":                  ["Backend Engineer"],
  ".net":                ["Backend Engineer"],
  "c++":                 ["Backend Engineer"],
  "node.js":             ["Backend Engineer", "Full Stack Engineer"],
  nodejs:                ["Backend Engineer"],
  react:                 ["Frontend Engineer", "Full Stack Engineer"],
  "next.js":             ["Frontend Engineer", "Full Stack Engineer"],
  nextjs:                ["Frontend Engineer", "Full Stack Engineer"],
  vue:                   ["Frontend Engineer"],
  angular:               ["Frontend Engineer"],
  typescript:            ["Frontend Engineer", "Full Stack Engineer"],
  javascript:            ["Frontend Engineer", "Full Stack Engineer"],
  css:                   ["Frontend Engineer"],
  "web performance":     ["Frontend Engineer"],
  tensorflow:            ["ML Engineer"],
  pytorch:               ["ML Engineer"],
  "machine learning":    ["ML Engineer", "Data Scientist"],
  "deep learning":       ["ML Engineer"],
  pandas:                ["Data Scientist", "Data Engineer"],
  spark:                 ["Data Engineer"],
  airflow:               ["Data Engineer"],
  redshift:              ["Data Engineer"],
  kafka:                 ["Data Engineer", "Backend Engineer"],
  cassandra:             ["Data Engineer", "Backend Engineer"],
  sql:                   ["Data Engineer", "Data Scientist", "Product Analyst"],
  tableau:               ["Data Scientist", "Product Analyst"],
  "a/b testing":         ["Product Analyst", "Data Scientist"],
  analytics:             ["Product Analyst", "Data Scientist"],
  docker:                ["DevOps Engineer", "Backend Engineer"],
  kubernetes:            ["DevOps Engineer", "SRE"],
  aws:                   ["DevOps Engineer"],
  terraform:             ["DevOps Engineer"],
  "ci/cd":               ["DevOps Engineer"],
  android:               ["Android Developer"],
  kotlin:                ["Android Developer"],
  "react native":        ["Android Developer", "iOS Developer"],
  firebase:              ["Android Developer"],
  swift:                 ["iOS Developer"],
  ios:                   ["iOS Developer"],
  postgresql:            ["Backend Engineer"],
  mysql:                 ["Backend Engineer", "Data Engineer"],
  redis:                 ["Backend Engineer"],
  mongodb:               ["Backend Engineer"],
  "distributed systems": ["Backend Engineer"],
  "rest api":            ["Backend Engineer"],
};

const deriveRolesFromSkills = (skills = []) => {
  const scores = {};
  for (const skill of skills) {
    const s = skill.toLowerCase();
    for (const [key, roles] of Object.entries(SKILL_TO_ROLES)) {
      if (s.includes(key) || key.includes(s)) {
        for (const role of roles) {
          scores[role] = (scores[role] || 0) + 1;
        }
      }
    }
  }
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([role]) => role);
  return sorted.length > 0 ? sorted : ["Software Engineer"];
};

// Build (role, company, country) call pairs, capped at 6
const buildPairs = (rolesToSearch, companiesList, countriesList) => {
  const pairs = [];
  const cap = 6;
  if (companiesList.length > 0) {
    // Company mode: vary company and role, use first country
    const country = countriesList[0] || "in";
    outer1: for (const company of companiesList) {
      for (const role of rolesToSearch) {
        pairs.push({ role, company, country });
        if (pairs.length >= cap) break outer1;
      }
    }
  } else {
    // Broad mode: vary role and country
    outer2: for (const role of rolesToSearch) {
      for (const country of countriesList) {
        pairs.push({ role, company: "", country });
        if (pairs.length >= cap) break outer2;
      }
    }
  }
  return pairs;
};

const Chip = ({ label, selected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
      selected
        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
        : "border-app bg-[var(--surface-soft)] text-muted hover:border-[var(--primary)] hover:text-main"
    }`}
  >
    {label}
  </button>
);

const Jobs = ({ user, onFindReferrer }) => {
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [countries, setCountries] = useState(["in"]);
  const [datePosted, setDatePosted] = useState("month");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [autoRoles, setAutoRoles] = useState([]);

  const userSkillsLower = new Set((user?.skills || []).map((s) => s.toLowerCase()));

  const jobMatchPct = (skills) => {
    if (!skills?.length || !userSkillsLower.size) return null;
    const matched = skills.filter((s) => userSkillsLower.has(s.toLowerCase())).length;
    return Math.round((matched / skills.length) * 100);
  };

  const allRolesSelected = roles.length === ROLES.length;

  const toggleRole = (r) => {
    if (r === "All") {
      setRoles(allRolesSelected ? [] : [...ROLES]);
      return;
    }
    setRoles((p) => p.includes(r) ? p.filter((x) => x !== r) : [...p, r]);
  };
  const toggleCompany = (c) => setCompanies((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);
  const toggleCountry = (c) => setCountries((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);

  const searchJobs = async () => {
    const effectiveCountries = countries.length > 0 ? countries : ["in"];

    let rolesToSearch = roles;
    if (roles.length === 0) {
      const derived = deriveRolesFromSkills(user?.skills || []);
      rolesToSearch = derived;
      setRoles(derived); // highlight auto-derived chips so user sees what was searched
      setAutoRoles(derived);
    } else {
      setAutoRoles([]);
    }

    setLoading(true);
    setSearched(false);

    const pairs = buildPairs(rolesToSearch, companies, effectiveCountries);

    try {
      const results = await Promise.all(
        pairs.map(({ role, company, country }) =>
          getJobRecommendations({ userId: user?.id, country, datePosted, remoteOnly, role, company })
        )
      );
      const seen = new Set();
      const allJobs = [];
      for (const r of results) {
        for (const j of r.jobs || []) {
          if (!seen.has(j.job_id)) {
            seen.add(j.job_id);
            allJobs.push(j);
          }
        }
      }
      setJobs(allJobs);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <p className="eyebrow">Live listings</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-main md:text-5xl">Browse jobs.</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Pick roles, companies, and countries, then hit Search. Leave roles empty to auto-select from your profile.
        </p>
      </div>

      {/* Filter panel */}
      <div className="surface-flat mb-6 space-y-6 p-5">

        {/* Role chips */}
        <div>
          <p className="mb-2 text-xs font-black text-muted">
            Role
            {allRolesSelected ? " · all" : roles.length > 0 ? ` · ${roles.length} selected` : " · auto from profile"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip label="All" selected={allRolesSelected} onToggle={() => toggleRole("All")} />
            {ROLES.map((r) => (
              <Chip key={r} label={r} selected={roles.includes(r)} onToggle={() => toggleRole(r)} />
            ))}
          </div>
        </div>

        {/* Company chips */}
        <div>
          <p className="mb-2 text-xs font-black text-muted">
            Company
            {companies.length > 0 ? ` · ${companies.length} selected` : " · any (well-known)"}
          </p>
          <div className="flex flex-wrap gap-2">
            {COMPANIES.map((c) => (
              <Chip key={c} label={c} selected={companies.includes(c)} onToggle={() => toggleCompany(c)} />
            ))}
          </div>
        </div>

        {/* Country chips */}
        <div>
          <p className="mb-2 text-xs font-black text-muted">Country</p>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map(({ code, label }) => (
              <Chip key={code} label={label} selected={countries.includes(code)} onToggle={() => toggleCountry(code)} />
            ))}
          </div>
        </div>

        {/* Bottom row: date + remote + search */}
        <div className="flex flex-wrap items-end gap-3 border-t border-app pt-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-muted">Posted</label>
            <select
              className="field py-2 text-sm"
              value={datePosted}
              onChange={(e) => setDatePosted(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="3days">Last 3 days</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-black text-muted">Work type</label>
            <select
              className="field py-2 text-sm"
              value={remoteOnly ? "remote" : "any"}
              onChange={(e) => setRemoteOnly(e.target.value === "remote")}
            >
              <option value="any">Any</option>
              <option value="remote">Remote only</option>
            </select>
          </div>

          <button onClick={searchJobs} disabled={loading} className="btn-primary px-6 py-2.5 text-sm">
            {loading ? "Searching…" : "Search jobs"}
          </button>
        </div>
      </div>

      {/* Auto-role notice */}
      {!loading && searched && autoRoles.length > 0 && (
        <p className="mb-4 text-xs text-muted">
          Roles were auto-selected from your profile. Deselect or add more, then search again.
        </p>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface-flat space-y-3 p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded bg-[var(--surface-soft)] animate-pulse-soft" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-[var(--surface-soft)] animate-pulse-soft" />
                  <div className="h-2.5 w-1/2 rounded bg-[var(--surface-soft)] animate-pulse-soft" />
                </div>
              </div>
              <div className="h-2.5 w-full rounded bg-[var(--surface-soft)] animate-pulse-soft" />
              <div className="h-2.5 w-2/3 rounded bg-[var(--surface-soft)] animate-pulse-soft" />
            </div>
          ))}
        </div>
      ) : !searched ? (
        <div className="surface-flat overflow-hidden">
          <div className="border-b border-app px-5 py-4">
            <p className="text-sm font-bold text-main">Find roles worth a referral</p>
            <p className="mt-0.5 text-xs text-muted">Pick filters above, then send the best ones to Find Referrers.</p>
          </div>
          <div className="grid gap-1 p-3 sm:grid-cols-3">
            {[
              ["Pick or skip roles", "Choose roles and companies, or leave roles empty to auto-match from your profile."],
              ["Search live jobs", "We pull current openings across the countries you select."],
              ["Jump to referrers", "Hit Find referrer on any result to rank employees who can refer you in."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-[var(--radius-sm)] p-3">
                <p className="text-sm font-bold text-main">{title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="surface-flat empty-state">
          <div className="text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 font-bold text-main">No jobs found</p>
            <p className="mt-1 max-w-sm text-sm text-muted">Try a broader date range, more countries, or fewer company filters.</p>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs font-bold text-muted">{jobs.length} result{jobs.length !== 1 ? "s" : ""}</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {jobs.map((rec) => {
              const pct = jobMatchPct(rec.skills);
              return (
                <div key={rec.job_id} className="surface-flat flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      {rec.company_logo ? (
                        <img src={rec.company_logo} alt={rec.company} className="h-9 w-9 shrink-0 rounded object-contain" />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[var(--surface-soft)] text-xs font-black text-muted">
                          {rec.company?.[0] || "?"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-main">{rec.title}</p>
                        <p className="truncate text-xs text-muted">{rec.company}</p>
                      </div>
                    </div>
                    {pct !== null && (
                      <div className="shrink-0 rounded-lg bg-[rgb(from_var(--primary)_r_g_b_/_0.1)] px-2.5 py-1.5 text-center">
                        <p className="text-[10px] font-bold text-[var(--primary)]">Match</p>
                        <p className="stat-num text-lg leading-none text-[var(--primary-strong)]">{pct}%</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-xs text-muted">
                    {rec.location && <span>📍 {rec.location}</span>}
                    {rec.work_arrangement && <span className="capitalize">· {rec.work_arrangement}</span>}
                    {rec.seniority && <span className="capitalize">· {rec.seniority}</span>}
                  </div>

                  {(rec.min_salary || rec.max_salary) && (
                    <p className="text-xs font-bold text-emerald-600">
                      ${rec.min_salary?.toLocaleString()} to ${rec.max_salary?.toLocaleString()}
                      {rec.salary_period === "YEAR" ? "/yr" : ""}
                    </p>
                  )}

                  {rec.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rec.skills.slice(0, 5).map((s) => (
                        <span key={s} className="rounded bg-[var(--surface-soft)] px-2 py-0.5 text-xs text-muted">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex gap-2">
                    <a
                      href={rec.apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex-1 py-2 text-center text-xs"
                    >
                      Apply
                    </a>
                    <button
                      className="btn-secondary px-3 py-2 text-xs"
                      onClick={() => onFindReferrer(`${rec.title} at ${rec.company}\n\n${rec.description}`)}
                    >
                      Find referrer
                    </button>
                  </div>
                  {rec.posted_at && <p className="text-[10px] text-muted">Posted {rec.posted_at}</p>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Jobs;
