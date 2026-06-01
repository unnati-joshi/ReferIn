import { useRef, useState } from "react";
import AutocompleteInput from "../components/AutocompleteInput";
import ExtractionPreview from "../components/ExtractionPreview";
import TagInput from "../components/TagInput";
import Avatar from "../components/common/Avatar";
import { BRANCHES, COLLEGES, COMPANIES, DEGREES, INTERESTS, ROLES, SKILLS } from "../data/suggestions";
import { updateProfile, uploadResume } from "../services/api";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const GRAD_YEARS = Array.from({ length: 51 }, (_, i) => new Date().getFullYear() + 5 - i);

const EMPTY_EDU = { college: "", degree: "", branch: "", graduation_year: "" };
const EMPTY_EXP = { company: "", role: "", duration: "", description: "" };

const eduKey = (e) =>
  `${(e.college || "").toLowerCase().trim()}|${(e.degree || "").toLowerCase().trim()}`;

const expKey = (e) =>
  `${(e.company || "").toLowerCase().trim()}|${(e.role || "").toLowerCase().trim()}`;

const mergeEducation = (existing, incoming) => {
  const keys = new Set(existing.map(eduKey));
  return [...existing, ...incoming.filter((e) => !keys.has(eduKey(e)))];
};

const mergeExperience = (existing, incoming) => {
  const keys = new Set(existing.map(expKey));
  return [...existing, ...incoming.filter((e) => !keys.has(expKey(e)))];
};

const Profile = ({ user, onUserUpdate }) => {
  const [skills, setSkills] = useState(user?.skills || []);
  const [interests, setInterests] = useState(user?.interests || []);
  const [targetCompanies, setTargetCompanies] = useState(user?.target_companies || []);
  const [currentRole, setCurrentRole] = useState(user?.current_role || "");
  const [targetRole, setTargetRole] = useState(user?.target_role || "");
  const [education, setEducation] = useState(user?.education || []);
  const [experience, setExperience] = useState(user?.experience || []);

  // Identity fields
  const [name, setName] = useState(user?.name || "");
  const [location, setLocation] = useState(user?.location || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || "");
  const [summary, setSummary] = useState(user?.summary || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [avatarError, setAvatarError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [extraction, setExtraction] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  const fileRef = useRef(null);
  const avatarRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarError("");
    if (!file.type.startsWith("image/")) { setAvatarError("Please choose an image file."); return; }
    if (file.size > MAX_AVATAR_BYTES) { setAvatarError("Image must be under 2 MB."); return; }
    try {
      setAvatar(await readFileAsDataURL(file));
    } catch {
      setAvatarError("Could not read that image.");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const result = await uploadResume(file);
      setExtraction(result);  // result has { extracted, provider, preview_text }
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleConfirmExtraction = async (confirmed) => {
    setExtraction(null);
    const confirmedSkills = confirmed.skills || [];
    const confirmedInterests = confirmed.interests || [];
    const confirmedEducation = confirmed.education || [];
    const confirmedExperience = confirmed.experience || [];

    // Merge confirmed data into local state, capturing merged values as variables
    // so the API call below uses the same values (avoids stale-state race).
    const newSkills = [...new Set([...skills, ...confirmedSkills].map((s) => s.toLowerCase()))].map(
      (s) => confirmedSkills.find((cs) => cs.toLowerCase() === s) || skills.find((es) => es.toLowerCase() === s) || s
    );
    const newInterests = [...new Set([...interests, ...confirmedInterests])];
    const newCurrentRole = confirmed.current_role || currentRole;
    const mergedEdu = mergeEducation(education, confirmedEducation);
    const mergedExp = mergeExperience(experience, confirmedExperience);

    setSkills(newSkills);
    setInterests(newInterests);
    if (confirmed.current_role && !currentRole) setCurrentRole(newCurrentRole);
    setEducation(mergedEdu);
    setExperience(mergedExp);

    // Save to backend
    setSaving(true);
    setError("");
    try {
      const newSummary = confirmed.summary || summary;
      if (confirmed.summary && !summary) setSummary(newSummary);
      const result = await updateProfile({
        userId: user.id,
        skills: newSkills,
        education: mergedEdu,
        experience: mergedExp,
        interests: newInterests,
        targetCompanies,
        currentRole: newCurrentRole,
        targetRole,
        summary: newSummary,
        name, location, linkedinUrl, avatar,
      });
      onUserUpdate(result.user);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaveSuccess(false);
    try {
      const result = await updateProfile({
        userId: user.id,
        skills,
        education,
        experience,
        interests,
        targetCompanies,
        currentRole,
        targetRole,
        summary,
        name, location, linkedinUrl, avatar,
      });
      onUserUpdate(result.user);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      {extraction && (
        <ExtractionPreview
          extracted={extraction.extracted}
          provider={extraction.provider}
          onConfirm={handleConfirmExtraction}
          onCancel={() => setExtraction(null)}
        />
      )}

      <div className="mb-6 reveal">
        <p className="eyebrow">Your account</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-main">Profile</h2>
        <p className="mt-2 max-w-2xl text-base leading-7 text-muted">
          Your photo, skills, interests, and target companies shape every referral match. Upload a resume to fill the details in automatically.
        </p>
      </div>

      {/* Identity */}
      <section className="surface mb-6 overflow-hidden reveal reveal-1">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center"
             style={{ background: "linear-gradient(140deg, rgb(from var(--primary) r g b / 0.08), transparent 70%)" }}>
          <div className="relative shrink-0">
            <Avatar src={avatar} name={name || user?.name} size={88} />
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              title="Change photo"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-[var(--shadow)] ring-2 ring-[var(--surface)] transition-transform hover:scale-110"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-2xl font-semibold text-main">{name || user?.name || "Your name"}</h3>
            <p className="mt-0.5 truncate text-sm text-muted">{user?.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {avatar
                ? <button type="button" onClick={() => setAvatar("")} className="btn-ghost px-3 py-1.5 text-xs">Remove photo</button>
                : <span className="text-xs text-faint">JPG or PNG · under 2 MB</span>}
              {avatarError && <span className="text-xs font-semibold text-rose-600">{avatarError}</span>}
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-app p-6 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-main">Full name</span>
            <input className="field" value={name} placeholder="Your name" onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-main">Location</span>
            <input className="field" value={location} placeholder="e.g. Bengaluru, India" onChange={(e) => setLocation(e.target.value)} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-main">LinkedIn</span>
            <input className="field" value={linkedinUrl} placeholder="linkedin.com/in/your-profile" onChange={(e) => setLinkedinUrl(e.target.value)} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-main">Headline / summary</span>
            <textarea className="field resize-none" rows={3} value={summary}
                      placeholder="One or two lines about what you build and where you're headed."
                      onChange={(e) => setSummary(e.target.value)} />
          </label>
        </div>
      </section>

      {/* Resume upload */}
      <section className="surface-flat mb-6 p-6 reveal reveal-2">
        <p className="text-sm font-black uppercase tracking-wide text-muted">Resume</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Upload a PDF or DOCX. Skills, education, experience, and interests are extracted automatically and added to your profile. Nothing you've already added gets overwritten.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-primary px-5 py-3 text-sm disabled:opacity-50"
          >
            {uploading ? "Reading resume…" : "Upload resume"}
          </button>
          <span className="text-xs text-muted">PDF or DOCX · max 10 MB</span>
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
        {uploadError && <p className="mt-3 text-sm font-bold text-rose-600">{uploadError}</p>}
      </section>

      {/* Skills */}
      <section className="surface-flat mb-6 p-6">
        <p className="text-sm font-black uppercase tracking-wide text-muted">Skills</p>
        <p className="mt-1 mb-4 text-sm text-muted">Technical skills, tools, and frameworks.</p>
        <TagInput
          tags={skills}
          onChange={setSkills}
          placeholder="e.g. Python, React, PostgreSQL"
          suggestions={SKILLS}
        />
      </section>

      {/* Interests */}
      <section className="surface-flat mb-6 p-6">
        <p className="text-sm font-black uppercase tracking-wide text-muted">Interests</p>
        <p className="mt-1 mb-4 text-sm text-muted">Domains and areas you want to work in. These help improve your match score.</p>
        <TagInput
          tags={interests}
          onChange={setInterests}
          placeholder="e.g. machine learning, fintech, open source"
          suggestions={INTERESTS}
        />
      </section>

      {/* Target companies */}
      <section className="surface-flat mb-6 p-6">
        <p className="text-sm font-black uppercase tracking-wide text-muted">Target companies</p>
        <p className="mt-1 mb-4 text-sm text-muted">Companies you're actively interested in. Employees at these companies get a score boost.</p>
        <TagInput
          tags={targetCompanies}
          onChange={setTargetCompanies}
          placeholder="e.g. Google, Stripe, Flipkart"
          suggestions={COMPANIES}
        />
      </section>

      {/* Role */}
      <section className="surface-flat mb-6 p-6">
        <p className="mb-4 text-sm font-black uppercase tracking-wide text-muted">Role info</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-main">Current role</span>
            <AutocompleteInput
              value={currentRole}
              onChange={setCurrentRole}
              suggestions={ROLES}
              placeholder="e.g. SWE Intern at Flipkart"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-main">Target role</span>
            <AutocompleteInput
              value={targetRole}
              onChange={setTargetRole}
              suggestions={ROLES}
              placeholder="e.g. Backend Engineer"
            />
          </label>
        </div>
      </section>

      {/* Education */}
      <section className="surface-flat mb-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-black uppercase tracking-wide text-muted">Education</p>
          <button
            type="button"
            onClick={() => setEducation((prev) => [...prev, { ...EMPTY_EDU }])}
            className="text-xs font-bold text-accent hover:underline"
          >
            + Add
          </button>
        </div>
        {education.length === 0 && (
          <p className="text-sm text-muted">No education added yet. Upload a resume or click + Add.</p>
        )}
        {education.map((edu, i) => (
          <div key={i} className="mb-3 rounded-lg border border-app p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">College / University</span>
                <AutocompleteInput
                  value={edu.college || ""}
                  onChange={(v) => setEducation((prev) => prev.map((r, j) => j === i ? { ...r, college: v } : r))}
                  suggestions={COLLEGES}
                  placeholder="e.g. IIT Delhi"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">Degree</span>
                <AutocompleteInput
                  value={edu.degree || ""}
                  onChange={(v) => setEducation((prev) => prev.map((r, j) => j === i ? { ...r, degree: v } : r))}
                  suggestions={DEGREES}
                  placeholder="e.g. B.Tech"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">Branch / Major</span>
                <AutocompleteInput
                  value={edu.branch || ""}
                  onChange={(v) => setEducation((prev) => prev.map((r, j) => j === i ? { ...r, branch: v } : r))}
                  suggestions={BRANCHES}
                  placeholder="e.g. Computer Science"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">Graduation year</span>
                <select
                  className="field"
                  value={edu.graduation_year || ""}
                  onChange={(e) => setEducation((prev) => prev.map((r, j) => j === i ? { ...r, graduation_year: e.target.value ? parseInt(e.target.value) : "" } : r))}
                >
                  <option value="">Select year</option>
                  {GRAD_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={() => setEducation((prev) => prev.filter((_, j) => j !== i))}
              className="mt-3 text-xs font-bold text-rose-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      {/* Experience */}
      <section className="surface-flat mb-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-black uppercase tracking-wide text-muted">Experience</p>
          <button
            type="button"
            onClick={() => setExperience((prev) => [...prev, { ...EMPTY_EXP }])}
            className="text-xs font-bold text-accent hover:underline"
          >
            + Add
          </button>
        </div>
        {experience.length === 0 && (
          <p className="text-sm text-muted">No experience added yet. Upload a resume or click + Add.</p>
        )}
        {experience.map((exp, i) => (
          <div key={i} className="mb-3 rounded-lg border border-app p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">Company</span>
                <AutocompleteInput
                  value={exp.company || ""}
                  onChange={(v) => setExperience((prev) => prev.map((r, j) => j === i ? { ...r, company: v } : r))}
                  suggestions={COMPANIES}
                  placeholder="e.g. Google"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">Role</span>
                <AutocompleteInput
                  value={exp.role || ""}
                  onChange={(v) => setExperience((prev) => prev.map((r, j) => j === i ? { ...r, role: v } : r))}
                  suggestions={ROLES}
                  placeholder="e.g. Software Engineer"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">Duration</span>
                <input
                  className="field"
                  value={exp.duration || ""}
                  onChange={(e) => setExperience((prev) => prev.map((r, j) => j === i ? { ...r, duration: e.target.value } : r))}
                  placeholder="e.g. Jun 2023 to Aug 2023"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-bold text-muted">Description</span>
                <textarea
                  className="field resize-none"
                  rows={2}
                  value={exp.description || ""}
                  onChange={(e) => setExperience((prev) => prev.map((r, j) => j === i ? { ...r, description: e.target.value } : r))}
                  placeholder="Brief description of your work"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => setExperience((prev) => prev.filter((_, j) => j !== i))}
              className="mt-3 text-xs font-bold text-rose-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      {error && <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}
      {saveSuccess && <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Profile updated.</p>}

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-4 text-sm disabled:opacity-50">
        {saving ? "Saving…" : "Save profile"}
      </button>
    </div>
  );
};

export default Profile;
