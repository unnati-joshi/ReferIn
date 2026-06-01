import { useMemo, useState } from "react";
import Logo from "../components/common/Logo";
import Terms from "./Terms";
import { authLogin, authSignup, startPhoneAuth } from "../services/api";
import {
  PASSWORD_RULES,
  STRENGTH_COLORS,
  STRENGTH_LABELS,
  evaluatePassword,
  isValidEmail,
} from "../utils/validation";

const SIDE_POINTS = [
  { k: "01", t: "Ranked referrers", d: "We score employees at your target company by how closely their background fits the role." },
  { k: "02", t: "Proof over cold DMs", d: "Outreach drafts are built from your verified skills and the job description." },
  { k: "03", t: "Track every request", d: "Follow responses end-to-end and earn rewards when a referral converts." },
];

const Auth = ({ mode, onSubmit, onBack, theme, onToggleTheme }) => {
  const [authMode, setAuthMode] = useState(mode);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", otp: "", role: "employee", linkedin_url: "",
  });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const isSignup = authMode === "signup";

  const emailValid = useMemo(() => isValidEmail(form.email), [form.email]);
  const pw = useMemo(() => evaluatePassword(form.password), [form.password]);
  const showEmailError = touched.email && form.email.length > 0 && !emailValid;
  const showPasswordPanel = isSignup && (passwordFocused || form.password.length > 0);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(""); setStatus("");
    if (!form.email.trim()) { setError("Email address is required."); return; }
    if (!emailValid) { setError("Enter a valid email address, like name@example.com."); return; }
    if (!form.password) { setError("Password is required."); return; }
    if (isSignup && !pw.meetsMinimum) { setError("Password must be at least 8 characters."); return; }
    if (isSignup && !form.name.trim()) { setError("Full name is required."); return; }
    if (isSignup && !form.phone.trim()) { setError("Phone number is required. We use it to verify your identity."); return; }
    if (isSignup && !agreedToTerms) { setError("Please accept the Terms and Conditions to continue."); return; }
    setLoading(true);
    try {
      const response = isSignup ? await authSignup(form) : await authLogin(form);
      onSubmit(response.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setError(""); setStatus("");
    try {
      const response = await startPhoneAuth({ phone: form.phone });
      setStatus(response.message || "OTP sent.");
    } catch (err) {
      setError(err.message);
    }
  };

  const switchMode = () => {
    setError(""); setStatus("");
    setTouched({ email: false, password: false });
    setAuthMode(isSignup ? "login" : "signup");
  };

  const strengthPct = `${(pw.score / PASSWORD_RULES.length) * 100}%`;

  return (
    <div className="page-bg flex min-h-screen flex-col">
      {showTerms && (
        <Terms
          onClose={() => setShowTerms(false)}
          onAgree={() => { setAgreedToTerms(true); setShowTerms(false); }}
        />
      )}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <button onClick={onBack} className="group">
          <Logo size={40} wordClassName="text-xl" className="group-hover:[&_span:first-child]:-rotate-6 [&_span:first-child]:transition-transform" />
        </button>
        <button onClick={onToggleTheme} className="btn-secondary px-3.5 py-2 text-sm">
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-8">
        <div className="grid w-full max-w-5xl overflow-hidden surface animate-slide-in-up lg:grid-cols-[0.95fr_1.05fr]">
          {/* ─── Editorial side panel ─── */}
          <aside className="relative hidden overflow-hidden border-r border-app p-10 lg:flex lg:flex-col lg:justify-between"
                 style={{ background: "linear-gradient(160deg, rgb(from var(--primary) r g b / 0.10), rgb(from var(--accent) r g b / 0.04))" }}>
            <div>
              <p className="eyebrow">Referrals · reimagined</p>
              <h1 className="mt-5 font-display text-[2.6rem] font-semibold leading-[1.05] text-main">
                Referrals that begin with <span className="italic text-[var(--primary-strong)]">proof</span>, not cold messages.
              </h1>
            </div>
            <div className="mt-10 space-y-5">
              {SIDE_POINTS.map((p) => (
                <div key={p.k} className="flex gap-4">
                  <span className="font-mono text-sm font-medium text-[var(--primary)]">{p.k}</span>
                  <div>
                    <p className="font-semibold text-main">{p.t}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* ─── Form ─── */}
          <form onSubmit={handleSubmit} className="p-6 md:p-10">
            <div className="segment mb-7">
              <button type="button" data-active={!isSignup} onClick={() => !isSignup || switchMode()}>Log in</button>
              <button type="button" data-active={isSignup} onClick={() => isSignup || switchMode()}>Sign up</button>
            </div>

            <h2 className="font-display text-3xl font-semibold text-main">
              {isSignup ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {isSignup ? "A minute to set up. Proof-based referrals from there." : "Log in to pick up where you left off."}
            </p>

            <div className="mt-7 space-y-4">
              {isSignup && (
                <Field label="Full name">
                  <input className="field" value={form.name} placeholder="Ada Lovelace" onChange={set("name")} />
                </Field>
              )}

              <Field label="Email" required hint={showEmailError ? "That email doesn't look right." : ""}
                     valid={touched.email && emailValid && form.email.length > 0}>
                <div className="relative">
                  <input
                    className={`field pr-10 ${showEmailError ? "field-invalid" : touched.email && emailValid ? "field-valid" : ""}`}
                    type="email"
                    value={form.email}
                    placeholder="you@example.com"
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    onChange={set("email")}
                  />
                  {form.email.length > 0 && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                      {emailValid ? <Check className="text-[var(--accent)]" /> : <span className="text-[#dc2626]">✕</span>}
                    </span>
                  )}
                </div>
              </Field>

              <Field label="Password" required>
                <div className="relative">
                  <input
                    className="field pr-16"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    placeholder={isSignup ? "Create a strong password" : "Enter your password"}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => { setPasswordFocused(false); setTouched((t) => ({ ...t, password: true })); }}
                    onChange={set("password")}
                  />
                  <button type="button" onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wide text-muted hover:text-main">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {showPasswordPanel && (
                  <div className="mt-3 rounded-[var(--radius-sm)] border border-app soft p-3.5 animate-fade-in">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="strength-track flex-1">
                        <div className="strength-fill" style={{ width: strengthPct, background: STRENGTH_COLORS[pw.score] }} />
                      </div>
                      <span className="w-20 text-right font-mono text-xs font-medium" style={{ color: STRENGTH_COLORS[pw.score] }}>
                        {STRENGTH_LABELS[pw.score]}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {PASSWORD_RULES.map((rule) => {
                        const ok = pw.passed.includes(rule.id);
                        return (
                          <div key={rule.id} className={`check-item ${ok ? "ok" : ""}`}>
                            <span className="check-dot">{ok ? "✓" : ""}</span>
                            {rule.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Field>

              {isSignup && (
                <>
                  <Field label="LinkedIn profile">
                    <input className="field" value={form.linkedin_url} placeholder="linkedin.com/in/your-profile" onChange={set("linkedin_url")} />
                  </Field>

                  <Field label="Phone number" required>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input className="field" value={form.phone} placeholder="+919876543210" onChange={set("phone")} />
                      <button type="button" onClick={sendOtp} className="btn-secondary shrink-0 px-4 py-3 text-sm">Send OTP</button>
                    </div>
                  </Field>

                  <Field label="Phone OTP">
                    <input className="field" value={form.otp} placeholder="6-digit code" onChange={set("otp")} />
                  </Field>

                  <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] border border-app soft p-3.5">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                    />
                    <span className="text-sm leading-6 text-muted">
                      I agree to ReferIn's{" "}
                      <button type="button" onClick={() => setShowTerms(true)} className="font-bold text-[var(--primary)] underline-offset-2 hover:underline">
                        Terms and Conditions
                      </button>
                      .
                    </span>
                  </label>
                </>
              )}
            </div>

            {error && <p className="mt-5 rounded-[var(--radius-sm)] border border-rose-300/60 bg-rose-500/10 p-3 text-sm font-semibold text-rose-600">{error}</p>}
            {status && <p className="mt-5 rounded-[var(--radius-sm)] border border-emerald-300/60 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-600">{status}</p>}

            <button disabled={loading} className="btn-primary mt-6 w-full px-5 py-4 text-[0.95rem]">
              {loading ? "Just a moment…" : isSignup ? "Create account" : "Log in"}
            </button>

            <p className="mt-6 text-center text-sm text-muted">
              {isSignup ? "Already have an account?" : "New to ReferIn?"}{" "}
              <button type="button" onClick={switchMode} className="font-bold text-[var(--primary)] hover:underline">
                {isSignup ? "Log in" : "Create one"}
              </button>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

const Field = ({ label, required, hint, valid, children }) => (
  <label className="block">
    <span className="mb-2 flex items-center justify-between text-sm font-semibold text-main">
      <span>{label} {required && <span className="text-[#dc2626]">*</span>}</span>
      {hint && <span className="text-xs font-medium text-[#dc2626]">{hint}</span>}
      {valid && !hint && <span className="text-xs font-medium text-[var(--accent)]">Looks good</span>}
    </span>
    {children}
  </label>
);

const Check = ({ className = "" }) => (
  <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default Auth;
