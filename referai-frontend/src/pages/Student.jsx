import { useEffect, useMemo, useState } from "react";
import AutoGrowTextarea from "../components/AutoGrowTextarea";
import {
  createReferralRequest,
  generateMessage,
  getMatches,
  getSentReferrals,
  parseJob,
} from "../services/api";

const nameToHue = (name) =>
  [...(name || "")].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

const Avatar = ({ name, size = "md" }) => {
  const hue = nameToHue(name);
  const sz = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <div
      className={`${sz} shrink-0 rounded-xl font-display font-semibold text-white flex items-center justify-center`}
      style={{ background: `linear-gradient(140deg, hsl(${hue} 55% 46%), hsl(${(hue + 38) % 360} 60% 38%))` }}
    >
      {(name || "?")[0]}
    </div>
  );
};

const SkeletonLine = ({ w = "full" }) => (
  <div className={`h-3 w-${w} rounded bg-[var(--surface-soft)] animate-pulse-soft`} />
);

// Stable key so a referrer is recognised as "already contacted" even when the
// transient match id changes between searches (AI-sourced ids regenerate; name +
// company is stable for the same person).
const contactKey = (name, company) =>
  `${(name || "").toLowerCase().trim()}|${(company || "").toLowerCase().trim()}`;

const relativeDate = (iso) => {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const Student = ({ user, pendingJobDesc, onClearPendingJobDesc }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [job, setJob] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [requestResult, setRequestResult] = useState(null);
  const [jobConfidence, setJobConfidence] = useState(null);
  const [matchSource, setMatchSource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [copied, setCopied] = useState(false);

  // Already-contacted tracking
  const [sentRequests, setSentRequests] = useState([]);
  const [hideContacted, setHideContacted] = useState(false);
  const [showContactedPanel, setShowContactedPanel] = useState(false);

  const loadSentRequests = async () => {
    if (!user?.id) return;
    try {
      const res = await getSentReferrals(user.id);
      setSentRequests(res.requests || []);
    } catch {
      /* non-fatal; tracking is best-effort */
    }
  };

  useEffect(() => { loadSentRequests(); }, [user?.id]);

  useEffect(() => {
    if (pendingJobDesc) {
      setJobDescription(pendingJobDesc);
      onClearPendingJobDesc?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pendingJobDesc]);

  // Build fast lookups of who has already been contacted.
  const { contactedById, contactedByKey, contactedList } = useMemo(() => {
    const byId = new Map();
    const byKey = new Map();
    const list = [];
    for (const r of sentRequests) {
      const name = r.employee?.name || "";
      const company = r.employee?.company || r.job?.company || "";
      const meta = {
        id: r.employee_id,
        name: name || "A referrer",
        role: r.employee?.role || "",
        company,
        jobRole: r.job?.role || "",
        status: r.status,
        date: r.created_at,
      };
      byId.set(r.employee_id, meta);
      if (name) byKey.set(contactKey(name, company), meta);
      list.push(meta);
    }
    return { contactedById: byId, contactedByKey: byKey, contactedList: list };
  }, [sentRequests]);

  const contactMeta = (emp) =>
    contactedById.get(emp.id) || contactedByKey.get(contactKey(emp.name, emp.company)) || null;
  const isContacted = (emp) => !!contactMeta(emp);

  const currentYear = new Date().getFullYear();
  const userSkillsLower = new Set((user?.skills || []).map((s) => s.toLowerCase()));

  const visibleMatches = hideContacted ? matches.filter((m) => !isContacted(m)) : matches;
  const contactedInResults = matches.filter(isContacted).length;

  const analyzeOpportunity = async () => {
    if (!jobDescription.trim()) { setError("Paste a job description to find referrers."); return; }
    setLoading(true);
    setError("");
    setRequestResult(null);
    try {
      const parsed = await parseJob(jobDescription);
      const ranked = await getMatches({ jobId: parsed.job.id, job: parsed.job, userId: user?.id });
      setJob(parsed.job);
      setJobConfidence(parsed.confidence);
      setMatches(ranked.matches || []);
      setMatchSource(ranked.source || null);
      setExpandedId(null);
      const first = ranked.matches?.[0] || null;
      setSelected(first);
      if (first) loadEmployeeDetails(first, parsed.job);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeDetails = async (employee, currentJob) => {
    const targetJob = currentJob || job;
    setDetailLoading(true);
    setMessage("");
    try {
      const intro = await generateMessage({
        userId: user?.id,
        employeeId: employee.id,
        jobId: targetJob.id,
        job: targetJob,
      });
      setMessage(intro.message);
    } catch {
      setMessage(buildFallbackMessage(targetJob, employee, user));
    } finally {
      setDetailLoading(false);
    }
  };

  const selectEmployee = async (employee) => {
    setSelected(employee);
    setRequestResult(null);
    await loadEmployeeDetails(employee, job);
  };

  const requestReferral = async () => {
    if (!selected || !job) return;
    try {
      const response = await createReferralRequest({
        userId: user?.id,
        employeeId: selected.id,
        jobId: job.id,
        job,
        message,
      });
      setRequestResult(response.request);
      loadSentRequests(); // refresh contacted tracking
    } catch (err) {
      setError(err.message);
    }
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const buildFallbackMessage = (liveJob, employee, account) => {
    const firstName = employee?.name?.split(" ")[0] || "there";
    const myName = account?.name?.split(" ")[0] || "";
    const skills = (account?.skills || []).slice(0, 3).join(", ") || "relevant technologies";
    return `Hi ${firstName},

I hope this message finds you well. I came across your profile while researching the ${liveJob?.role || "role"} opening at ${liveJob?.company || "your company"}, and I was genuinely impressed by your work in ${employee?.department || "engineering"}.

I am currently applying for this position and believe my background aligns closely with the team's focus. My core skills include ${skills}, and I am especially excited about the work ${liveJob?.company || "the company"} is doing.

Would you be open to a quick 10-minute chat about your experience there, or to passing along my profile to the hiring team? I would be incredibly grateful for any guidance or support.

Thank you so much for your time!

${account?.name || myName}`;
  };

  const selectedContact = selected ? contactMeta(selected) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">

      {/* Header + input */}
      <section className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(400px,0.7fr)]">
        <div className="flex flex-col justify-center reveal">
          <p className="eyebrow">Opportunities</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-main md:text-5xl">
            Find the right<br />referrer.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted">
            Paste any job description and we'll rank employees at that company by how well they can refer you in.
          </p>
        </div>

        <div className="surface-flat overflow-hidden reveal reveal-1">
          <div className="border-b border-app px-5 py-4">
            <label className="text-sm font-bold text-main" htmlFor="job-desc">Job description</label>
            <p className="mt-0.5 text-xs text-muted">LinkedIn, Greenhouse, Lever. Paste the full posting.</p>
          </div>
          <div className="p-5">
            <AutoGrowTextarea
              id="job-desc"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="field text-sm leading-6"
              minHeight={170}
              maxHeight={560}
              placeholder="Paste the full job description here. The box grows as you type…"
            />
            <button
              onClick={analyzeOpportunity}
              disabled={loading}
              className="btn-primary mt-3 w-full py-3 text-sm"
            >
              {loading ? "Analysing…" : "Find referrers →"}
            </button>
            {error && <p className="mt-3 text-xs font-bold text-rose-500">{error}</p>}
          </div>
        </div>
      </section>

      {/* Already-contacted panel */}
      {contactedList.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-[var(--radius)] border border-app bg-[var(--surface)] shadow-[var(--shadow)]">
          <button
            type="button"
            onClick={() => setShowContactedPanel((s) => !s)}
            className="flex w-full items-center justify-between px-5 py-3.5 text-left"
          >
            <span className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(from_var(--accent)_r_g_b_/_0.14)] text-[var(--accent)]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </span>
              <span>
                <span className="text-sm font-bold text-main">Already reached out</span>
                <span className="ml-2 font-mono text-xs text-muted">{contactedList.length} {contactedList.length === 1 ? "referrer" : "referrers"}</span>
              </span>
            </span>
            <span className="text-faint">{showContactedPanel ? "▲" : "▼"}</span>
          </button>
          {showContactedPanel && (
            <div className="grid gap-2 border-t border-app p-4 sm:grid-cols-2">
              {contactedList.map((c, i) => (
                <div key={`${c.id}-${i}`} className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-app soft px-3 py-2.5">
                  <Avatar name={c.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-main">{c.name}</p>
                    <p className="truncate text-xs text-muted">
                      {[c.company, c.jobRole && `for ${c.jobRole}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-faint">{relativeDate(c.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Parsed job pill */}
      {job && (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-[var(--radius)] border border-app bg-[var(--surface-soft)] px-5 py-4">
          <div>
            <p className="font-bold text-main">{job.role} <span className="font-normal text-muted">at</span> {job.company}</p>
            <p className="mt-0.5 text-xs text-muted">
              {[job.location, job.level !== "Not specified" && job.level].filter(Boolean).join(" · ")}
              {jobConfidence && <span className="ml-2 opacity-60">· {Math.round(jobConfidence * 100)}% extraction confidence</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((skill) => (
              <span key={skill} className="badge badge-blue">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Results grid */}
      <section className={`grid gap-6 ${matches.length ? "xl:grid-cols-[1fr_420px]" : ""}`}>

        {/* Left: match list */}
        <div className="space-y-3">
          {matches.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-muted">
                <span>{visibleMatches.length} result{visibleMatches.length !== 1 ? "s" : ""}</span>
                {matchSource && <span>·</span>}
                {matchSource === "github" && (
                  <span className="flex items-center gap-1 text-[var(--primary)]">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                    Live from GitHub
                  </span>
                )}
                {(matchSource === "snippet" || matchSource === "ai" || matchSource === "github+ai") && (
                  <span className="text-[var(--warning)]">AI suggested</span>
                )}
                {matchSource === "seed" && <span className="text-[var(--warning)]">From database</span>}
              </div>
              {contactedInResults > 0 && (
                <button
                  type="button"
                  onClick={() => setHideContacted((h) => !h)}
                  className="flex items-center gap-1.5 rounded-full border border-app bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-muted transition hover:text-main"
                >
                  <span className={`h-3 w-3 rounded-full border ${hideContacted ? "border-[var(--primary)] bg-[var(--primary)]" : "border-faint"}`} />
                  Hide {contactedInResults} already contacted
                </button>
              )}
            </div>
          )}

          {visibleMatches.map((emp) => {
            const isStudent = (emp.education || []).some(
              (e) => e.graduation_year && parseInt(e.graduation_year) > currentYear
            );
            const commonSkills = (emp.skills || []).filter((s) => userSkillsLower.has(s.toLowerCase()));
            const isExpanded = expandedId === emp.id;
            const isSelected = selected?.id === emp.id;
            const contacted = isContacted(emp);

            return (
              <div
                key={emp.id}
                className={`surface-flat transition-all hover:-translate-y-0.5 ${
                  isSelected ? "ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-[var(--bg)]" : ""
                } ${contacted ? "opacity-75" : ""}`}
              >
                <button className="w-full p-4 text-left" onClick={() => selectEmployee(emp)}>
                  <div className="flex items-start gap-3">
                    <Avatar name={emp.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="flex items-center gap-2 font-bold text-main">
                            {emp.name}
                            {contacted && (
                              <span className="badge badge-green">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                Requested
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">{emp.role}{emp.department ? ` · ${emp.department}` : ""}</p>
                          <p className="mt-0.5 text-[10px] font-bold text-faint">
                            {isStudent ? "Student" : emp.seniority}
                          </p>
                        </div>
                        <div className="shrink-0 rounded-lg bg-[rgb(from_var(--primary)_r_g_b_/_0.1)] px-2.5 py-1.5 text-center">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--primary)]">Match</p>
                          <p className="stat-num text-xl leading-tight text-[var(--primary-strong)]">{emp.match_score}%</p>
                        </div>
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {(emp.skills || []).slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className={`badge ${userSkillsLower.has(skill.toLowerCase()) ? "badge-green" : "badge-blue"}`}
                          >
                            {skill}
                          </span>
                        ))}
                        {isStudent && <span className="badge badge-blue">Student</span>}
                        {emp.is_connected && <span className="badge badge-green">Connected</span>}
                        {emp.is_alumni && <span className="badge badge-amber">Alumni</span>}
                      </div>
                    </div>
                  </div>
                </button>

                {commonSkills.length > 0 && (
                  <div className="border-t border-app px-4">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-2.5 text-xs font-bold text-muted hover:text-main"
                      onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : emp.id); }}
                    >
                      <span>{commonSkills.length} shared skill{commonSkills.length !== 1 ? "s" : ""}</span>
                      <span className="text-[var(--faint)]">{isExpanded ? "▲" : "▼"}</span>
                    </button>
                    {isExpanded && (
                      <div className="pb-3 flex flex-wrap gap-1.5">
                        {commonSkills.map((s) => (
                          <span key={s} className="badge badge-green">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(emp.github_url || emp.linkedin_url || emp.email) && (
                  <div className="flex flex-wrap gap-1.5 border-t border-app px-4 py-2.5">
                    {emp.github_url && (
                      <a href={emp.github_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                         className="flex items-center gap-1 rounded-md bg-[var(--surface-soft)] px-2 py-1 text-xs font-bold text-muted hover:text-main">
                        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                        GitHub
                      </a>
                    )}
                    {emp.linkedin_url && (
                      <a href={emp.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                         className="flex items-center gap-1 rounded-md bg-[var(--surface-soft)] px-2 py-1 text-xs font-bold text-muted hover:text-main">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn
                      </a>
                    )}
                    {emp.email && (
                      <a href={`mailto:${emp.email}`} onClick={(e) => e.stopPropagation()}
                         className="flex items-center gap-1 rounded-md bg-[var(--surface-soft)] px-2 py-1 text-xs font-bold text-muted hover:text-main">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        Email
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {matches.length > 0 && visibleMatches.length === 0 && (
            <div className="surface-flat empty-state">
              <div className="text-center">
                <p className="font-bold text-main">You've contacted everyone here</p>
                <p className="mt-1 text-sm text-muted">All matches are already in your sent list. Turn off the filter to see them.</p>
                <button onClick={() => setHideContacted(false)} className="btn-secondary mt-4 px-4 py-2 text-sm">Show all</button>
              </div>
            </div>
          )}
        </div>

        {/* Right: referrer detail + message */}
        {selected ? (
          <div className="space-y-4">
            {/* Referrer card */}
            <div className="surface-flat overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={selected.name} size="md" />
                    <div>
                      <p className="font-bold text-main">{selected.name}</p>
                      <p className="mt-0.5 text-xs text-muted">{selected.role} · {selected.company}</p>
                      {selected.bio && <p className="mt-2 text-xs leading-5 text-muted max-w-xs">{selected.bio}</p>}
                    </div>
                  </div>
                  <div className="shrink-0 rounded-xl border border-app px-3 py-2 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-muted">Match</p>
                    <p className="stat-num text-2xl text-[var(--primary-strong)]">{selected.match_score}%</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedContact && <span className="badge badge-green">Requested {relativeDate(selectedContact.date)}</span>}
                  {selected.is_connected && <span className="badge badge-green">Connected</span>}
                  {selected.is_alumni && <span className="badge badge-amber">Alumni · {selected.shared_college}</span>}
                  {selected.is_coworker && <span className="badge badge-purple">Coworker · {selected.shared_company}</span>}
                </div>

                {(Array.isArray(selected.skills) && selected.skills.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selected.skills.map((skill) => (
                      <span key={skill} className="badge badge-blue">{skill}</span>
                    ))}
                  </div>
                )}
              </div>

              {(selected.linkedin_url || selected.github_url || selected.email) && (
                <div className="flex gap-2 border-t border-app px-5 py-3">
                  {selected.linkedin_url && (
                    <a href={selected.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-1.5 text-xs">LinkedIn</a>
                  )}
                  {selected.github_url && (
                    <a href={selected.github_url} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-1.5 text-xs">GitHub</a>
                  )}
                  {selected.email && (
                    <a href={`mailto:${selected.email}`} className="btn-secondary px-3 py-1.5 text-xs">Email</a>
                  )}
                </div>
              )}
            </div>

            {/* Message draft */}
            <div className="surface-flat overflow-hidden">
              <div className="flex items-center justify-between border-b border-app px-5 py-3">
                <div>
                  <p className="text-sm font-bold text-main">Referral message</p>
                  <p className="text-[10px] text-muted mt-0.5">To {selected.name} · {selected.company}</p>
                </div>
                <button
                  onClick={copyMessage}
                  disabled={!message || detailLoading}
                  className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>

              {detailLoading ? (
                <div className="space-y-2.5 p-5">
                  <SkeletonLine w="3/4" />
                  <SkeletonLine w="full" />
                  <SkeletonLine w="5/6" />
                  <SkeletonLine w="full" />
                  <SkeletonLine w="2/3" />
                  <div className="pt-1" />
                  <SkeletonLine w="full" />
                  <SkeletonLine w="4/5" />
                </div>
              ) : (
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full resize-none border-0 bg-transparent px-5 py-4 text-sm leading-7 text-main outline-none"
                  rows={12}
                  placeholder="Message will appear here…"
                />
              )}

              <div className="border-t border-app px-5 py-4">
                {selectedContact && !requestResult ? (
                  <>
                    <button disabled className="btn-secondary px-5 py-2.5 text-sm opacity-70" title="You've already requested a referral from this person">
                      Already requested ✓
                    </button>
                    <p className="mt-2 text-xs text-muted">
                      You reached out {relativeDate(selectedContact.date)}{selectedContact.jobRole ? ` for ${selectedContact.jobRole}` : ""}. Avoid sending a duplicate.
                    </p>
                  </>
                ) : (
                  <>
                    <button
                      onClick={requestReferral}
                      disabled={!message || detailLoading || !!requestResult}
                      className="btn-primary px-5 py-2.5 text-sm"
                    >
                      {requestResult ? "Request sent ✓" : "Send referral request"}
                    </button>
                    {requestResult && (
                      <p className="mt-2 text-xs font-bold text-[var(--accent)]">
                        Request sent to {requestResult.employee?.name || selected.name}. Added to your contacted list.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : !matches.length && job ? (
          <div className="surface-flat empty-state">
            <div className="text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-3 font-bold text-main">No employees found</p>
              <p className="mt-1 max-w-xs text-sm text-muted">No employees found at this company in the database.</p>
            </div>
          </div>
        ) : !job ? (
          <div className="surface-flat overflow-hidden">
            <div className="border-b border-app px-5 py-4">
              <p className="text-sm font-bold text-main">How it works</p>
              <p className="mt-0.5 text-xs text-muted">Three steps from a posting to a warm intro.</p>
            </div>
            <div className="space-y-1 p-3">
              {[
                ["01", "Paste a job description", "We extract the role, company, and key skills."],
                ["02", "Review ranked referrers", "Sorted by fit, with your shared skills highlighted."],
                ["03", "Send a tailored intro", "We track it so you don't contact anyone twice."],
              ].map(([num, title, body]) => (
                <div key={num} className="flex gap-3 rounded-[var(--radius-sm)] p-3 transition hover:bg-[var(--surface-soft)]">
                  <span className="font-mono text-sm font-medium text-[var(--primary)]">{num}</span>
                  <div>
                    <p className="text-sm font-bold text-main">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted">{body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-app px-5 py-4">
              {contactedList.length > 0 ? (
                <p className="text-xs text-muted">
                  You've reached out to{" "}
                  <span className="font-bold text-main">{contactedList.length}</span>{" "}
                  {contactedList.length === 1 ? "referrer" : "referrers"} so far. Open the panel above to review them.
                </p>
              ) : (
                <p className="text-xs text-muted">
                  Tip: a complete <span className="font-bold text-main">profile</span> with your skills produces sharper matches.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default Student;
